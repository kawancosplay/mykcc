import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  getRedirectResult,
  type Auth,
  type User,
} from 'firebase/auth';
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
import { translate } from '../i18n';
import type { TranslationKey } from '../i18n';

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

// Auth WITHOUT a popupRedirectResolver at start-up: getAuth() would load the auth iframe + gapi on every
// page load. Every popup call passes browserPopupRedirectResolver itself (authService, googleAuth), and
// warmAuthPopup() loads it ahead of a sign-in tap. Same persistence order as getAuth() in browsers.
function createAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
    });
  } catch (error) {
    // Already initialized (e.g. Vite HMR re-ran this module): reuse the existing instance.
    console.warn('Auth already initialized, reusing instance:', error);
    return getAuth(app);
  }
}

export const auth = createAuth();

/** Popup resolver for signInWithPopup / reauthenticateWithPopup (auth is created without one). */
export const popupRedirectResolver = browserPopupRedirectResolver;

let authPopupWarmed = false;

/** Loads the popup resolver (auth iframe + gapi) ahead of a sign-in tap; safe to call repeatedly. */
export function warmAuthPopup(): void {
  if (authPopupWarmed || typeof window === 'undefined') return;
  authPopupWarmed = true;
  void getRedirectResult(auth, browserPopupRedirectResolver).catch(() => {
    // Nothing to do: a failed warm-up only means the first popup loads the resolver itself
    authPopupWarmed = false;
  });
}

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
 * Admin = main account OR an admins/{uid} document (same check as firestore.rules isAdmin()).
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

// The ID token's `email` claim per uid (getIdTokenResult). firestore.rules compare admins.addedByEmail and
// adminLogs.actorEmail with request.auth.token.email byte for byte, so those fields are taken from here,
// never from form input or member data.
const tokenEmailCache = new Map<string, string | null>();

/** The signed-in user's ID-token email claim (cached per uid for the session); null when absent/unreadable. */
export async function getTokenEmail(user: User | null | undefined): Promise<string | null> {
  if (!user) return null;
  if (tokenEmailCache.has(user.uid)) return tokenEmailCache.get(user.uid) ?? null;
  try {
    const result = await user.getIdTokenResult();
    const email = typeof result.claims.email === 'string' && result.claims.email ? result.claims.email : null;
    tokenEmailCache.set(user.uid, email);
    return email;
  } catch (error) {
    console.warn('Could not read the ID token email claim:', error);
    return null;
  }
}

/** Cached token email (see getTokenEmail); undefined when it was not loaded yet for this uid. */
export function getCachedTokenEmail(uid: string): string | null | undefined {
  return tokenEmailCache.has(uid) ? (tokenEmailCache.get(uid) ?? null) : undefined;
}

/**
 * Throws a translated error unless the signed-in user is an admin (main account or admins/{uid}).
 * Also loads the token email claim, so buildAdminLog / admin entries can use it synchronously.
 */
export async function requireAdminUser(errorKey: TranslationKey = 'errors.adminOnly'): Promise<User> {
  const user = auth.currentUser;
  if (!user || !(await checkIsAdminUser(user))) {
    throw new Error(translate(errorKey));
  }
  await getTokenEmail(user);
  return user;
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
 * Friendly message for a failed Firestore read/write, in the language selected in the I18nProvider.
 * `_isId` is ignored; it is kept so existing callers still compile.
 */
export function describeFirestoreError(error: unknown, _isId?: boolean): string {
  const code = getFirestoreErrorCode(error);
  if (code === 'permission-denied') {
    return translate('errors.firestorePermissionDenied');
  }
  if (code === 'unauthenticated') {
    return translate('errors.signInRequired');
  }
  if (classifyFirestoreError(error) === 'unavailable') {
    return translate('errors.databaseUnavailable');
  }
  if (error instanceof Error && error.message && !error.message.trim().startsWith('{')) {
    return error.message;
  }
  return translate('errors.saveFailed');
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
