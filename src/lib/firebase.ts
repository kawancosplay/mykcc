import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type User } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MAIN_ACCOUNT_EMAIL } from './idGenerator';
import type { SubscriptionErrorKind } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const customDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;

// ignoreUndefinedProperties: optional fields left undefined (e.g. photographer, caption, avatar)
// are dropped instead of making setDoc()/updateDoc() throw "Unsupported field value: undefined".
function createFirestore(): Firestore {
  const settings = { ignoreUndefinedProperties: true };
  try {
    return customDbId ? initializeFirestore(app, settings, customDbId) : initializeFirestore(app, settings);
  } catch (error) {
    // Already initialized (e.g. Vite HMR re-ran this module): reuse the existing instance.
    console.warn('Firestore already initialized, reusing instance:', error);
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
}

export const db = createFirestore();
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Rethrow the original error so callers keep FirebaseError.code (e.g. 'permission-denied')
  throw error instanceof Error ? error : new Error(String(error));
}

/**
 * Main KCC account: Firebase user with a VERIFIED cosplaysehat@gmail.com email (matches firestore.rules).
 */
export function isMainAdminUser(user: User | null | undefined): boolean {
  if (!user || user.emailVerified !== true || !user.email) return false;
  return user.email.toLowerCase().trim() === MAIN_ACCOUNT_EMAIL;
}

/**
 * Admin = main account OR a console-created admins/{uid} document (same check as firestore.rules isAdmin()).
 */
export async function checkIsAdminUser(user: User | null | undefined): Promise<boolean> {
  if (!user) return false;
  if (isMainAdminUser(user)) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (error) {
    console.warn('Admin check (admins/{uid}) failed:', error);
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || '';
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return '';
}

/**
 * Returns the Firestore/Firebase error code without the 'firestore/' prefix, e.g. 'permission-denied'.
 */
export function getFirestoreErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && code) {
      return code.replace(/^firestore\//, '');
    }
  }
  if (getErrorMessage(error).includes('Missing or insufficient permissions')) {
    return 'permission-denied';
  }
  return null;
}

export function isPermissionDeniedError(error: unknown): boolean {
  return getFirestoreErrorCode(error) === 'permission-denied';
}

export function classifyFirestoreError(error: unknown): SubscriptionErrorKind {
  const code = getFirestoreErrorCode(error);
  if (code === 'permission-denied') return 'permission-denied';
  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    getErrorMessage(error).toLowerCase().includes('offline')
  ) {
    return 'unavailable';
  }
  return 'unknown';
}

/**
 * Friendly bilingual (ID / EN) message for a failed Firestore read/write.
 */
export function describeFirestoreError(error: unknown, isId: boolean = true): string {
  const code = getFirestoreErrorCode(error);
  if (code === 'permission-denied') {
    return isId
      ? 'Akses ditolak oleh database (permission denied). Data belum tersimpan. Pastikan semua isian tidak melebihi batas karakter, atau masuk dengan akun yang berwenang, lalu coba lagi.'
      : 'Access denied by the database (permission denied). Nothing was saved. Make sure every field is within its character limit, or sign in with an authorized account, then try again.';
  }
  if (code === 'unauthenticated') {
    return isId ? 'Silakan login terlebih dahulu untuk melanjutkan.' : 'Please sign in first to continue.';
  }
  if (classifyFirestoreError(error) === 'unavailable') {
    return isId
      ? 'Koneksi ke database terputus. Periksa internet Anda lalu coba lagi.'
      : 'Could not reach the database. Check your internet connection and try again.';
  }
  if (error instanceof Error && error.message && !error.message.trim().startsWith('{')) {
    return error.message;
  }
  return isId
    ? 'Terjadi kendala saat menyimpan data. Silakan coba lagi.'
    : 'Something went wrong while saving. Please try again.';
}

// Test connection on startup as mandated by security skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Verify network connection.');
      return false;
    }
    // Document might not exist which is fine for connection check
    return true;
  }
}

testConnection().catch((err) => console.warn('Connection check note:', err));
