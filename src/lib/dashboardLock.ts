import { doc, getDocFromServer, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db, getTokenEmail, isMainAdminUser, isPermissionDeniedError } from './firebase';
import { buildAdminLog } from './adminLogService';
import { getLastMainReauthAt, MAIN_REAUTH_VALID_MS, reauthenticateMainAccount } from './googleAuth';
import type { DashboardLockRecord } from '../types';
import { translate } from '../i18n';

// Shared dashboard lock password (requirements #4). A CONVENIENCE lock for unattended devices: every admin
// can read the hash and an admin with devtools can bypass the screen. firestore.rules stay the real
// protection. Only the PBKDF2-SHA256 hash + salt + iterations are stored (adminSettings/dashboardLock,
// admin get, main-account write); the password never leaves the browser and nothing ships in the bundle.

export const DASHBOARD_LOCK_ITERATIONS = 310_000;
export const DASHBOARD_LOCK_IDLE_MS = 15 * 60 * 1000;
export const DASHBOARD_LOCK_MIN_LENGTH = 8;

export const ADMIN_SETTINGS_COLLECTION = 'adminSettings';
export const DASHBOARD_LOCK_DOC_ID = 'dashboardLock';
const LOCK_ALGORITHM = 'PBKDF2-SHA256' as const;
const SALT_BYTES = 16;
const HASH_BITS = 256;
// Same bounds as firestore.rules isValidDashboardLock
const MIN_ITERATIONS = 100_000;
const MAX_ITERATIONS = 2_000_000;

const UNLOCK_STORAGE_KEY = 'kcc_dash_unlock';
const ACTIVITY_THROTTLE_MS = 30 * 1000;

export { reauthenticateMainAccount };

type DashboardLockState = { state: 'none' } | { state: 'set'; record: DashboardLockRecord } | { state: 'rules-missing' };

function lockRef() {
  return doc(db, ADMIN_SETTINGS_COLLECTION, DASHBOARD_LOCK_DOC_ID);
}

function timestampToIso(value: unknown): string | null {
  if (value && typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      const date = (value as { toDate: () => Date }).toDate();
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  }
  return typeof value === 'string' && value ? value : null;
}

/**
 * Admin: adminSettings/dashboardLock from the server.
 * 'none' = no password set (the dashboard works as today); 'set' = ask for the password when
 * isDashboardUnlocked() is false; 'rules-missing' = permission-denied (the sprint-2 rules are still
 * published, so no record can exist). Other errors (offline) are thrown: the UI stays LOCKED with a retry.
 */
export async function getDashboardLock(): Promise<DashboardLockState> {
  let snap;
  try {
    snap = await getDocFromServer(lockRef());
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn('Dashboard lock unavailable (permission denied; publish the sprint-3 rules):', error);
      return { state: 'rules-missing' };
    }
    throw error;
  }
  if (!snap.exists()) return { state: 'none' };

  const data = snap.data() as Record<string, unknown>;
  const record: DashboardLockRecord = {
    algorithm: LOCK_ALGORITHM,
    hash: typeof data.hash === 'string' ? data.hash : '',
    salt: typeof data.salt === 'string' ? data.salt : '',
    iterations: typeof data.iterations === 'number' ? data.iterations : DASHBOARD_LOCK_ITERATIONS,
    updatedAt: timestampToIso(data.updatedAt),
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : '',
  };
  return { state: 'set', record };
}

// ---------------------------------------------------------------------------------------------
// PBKDF2 (WebCrypto)
// ---------------------------------------------------------------------------------------------

function getSubtle(): SubtleCrypto {
  const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;
  if (!subtle || typeof crypto.getRandomValues !== 'function') {
    throw new Error(translate('errors.lockCryptoUnavailable'));
  }
  return subtle;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function clampIterations(iterations: number | undefined): number {
  const value = Math.floor(Number(iterations) || DASHBOARD_LOCK_ITERATIONS);
  return Math.max(MIN_ITERATIONS, Math.min(MAX_ITERATIONS, value));
}

/**
 * PBKDF2-SHA256 (crypto.subtle.deriveBits, 32-byte key) of the password (NFC-normalized, so the same
 * password typed on different keyboards matches). A new random 16-byte salt when none is given.
 * Returns standard base64: hash 44 chars, salt 24 chars (the shapes firestore.rules expect).
 */
export async function hashDashboardPassword(
  password: string,
  saltB64?: string,
  iterations?: number
): Promise<{ hash: string; salt: string; iterations: number }> {
  const subtle = getSubtle();
  const rounds = clampIterations(iterations);
  const salt = saltB64 ? base64ToBytes(saltB64) : crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(String(password ?? '').normalize('NFC')),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: rounds },
    key,
    HASH_BITS
  );
  return { hash: bytesToBase64(new Uint8Array(bits)), salt: bytesToBase64(salt), iterations: rounds };
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** Recomputes with the record's salt + iterations; constant-time byte comparison. False for a broken record. */
export async function verifyDashboardPassword(password: string, record: DashboardLockRecord): Promise<boolean> {
  if (!record || !record.hash || !record.salt) return false;
  let expected: Uint8Array;
  try {
    expected = base64ToBytes(record.hash);
  } catch {
    return false;
  }
  const { hash } = await hashDashboardPassword(password, record.salt, record.iterations);
  return constantTimeEqual(base64ToBytes(hash), expected);
}

// ---------------------------------------------------------------------------------------------
// Set / change / clear (main account only)
// ---------------------------------------------------------------------------------------------

function requireMainAccount() {
  const user = auth.currentUser;
  if (!user || !isMainAdminUser(user)) {
    throw new Error(translate('errors.lockMainOnly'));
  }
  return user;
}

async function assertChangeAllowed(
  current: DashboardLockState,
  options?: { currentPassword?: string; reauthenticated?: boolean }
): Promise<void> {
  if (current.state !== 'set') return;
  if (options?.reauthenticated) {
    // Proof = a reauthenticateMainAccount() in this page within the last few minutes
    const at = getLastMainReauthAt();
    if (at > 0 && Date.now() - at <= MAIN_REAUTH_VALID_MS) return;
    throw new Error(translate('errors.lockReauthWrongAccount'));
  }
  const ok = await verifyDashboardPassword(options?.currentPassword ?? '', current.record);
  if (!ok) throw new Error(translate('errors.lockWrongPassword'));
}

/**
 * MAIN ACCOUNT only. Sets the dashboard password (no record yet) or changes it: when a record exists,
 * `currentPassword` must verify (errors.lockWrongPassword) unless `reauthenticated` is true right after
 * reauthenticateMainAccount() (forgot password). One batch: the record + the dashboard_lock_set log.
 * Every admin's unlocked session ends (the record stamp changes).
 */
export async function setDashboardPassword(
  newPassword: string,
  options?: { currentPassword?: string; reauthenticated?: boolean }
): Promise<void> {
  const user = requireMainAccount();
  if (typeof newPassword !== 'string' || newPassword.length < DASHBOARD_LOCK_MIN_LENGTH) {
    throw new Error(translate('errors.lockPasswordTooShort', { min: DASHBOARD_LOCK_MIN_LENGTH }));
  }
  const current = await getDashboardLock();
  await assertChangeAllowed(current, options);

  const { hash, salt, iterations } = await hashDashboardPassword(newPassword);
  await getTokenEmail(user);
  const log = buildAdminLog({
    action: 'dashboard_lock_set',
    targetType: 'settings',
    targetId: DASHBOARD_LOCK_DOC_ID,
    details: current.state === 'set' ? (options?.reauthenticated ? 'reset after re-authentication' : 'changed') : 'set',
  });
  const batch = writeBatch(db);
  batch.set(lockRef(), {
    algorithm: LOCK_ALGORITHM,
    hash,
    salt,
    iterations,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  });
  batch.set(log.ref, log.data);
  await batch.commit();
}

/** MAIN ACCOUNT only: removes the lock (same proof as a change). No record = nothing to do. */
export async function clearDashboardPassword(options: {
  currentPassword?: string;
  reauthenticated?: boolean;
}): Promise<void> {
  const user = requireMainAccount();
  const current = await getDashboardLock();
  if (current.state !== 'set') return;
  await assertChangeAllowed(current, options);

  await getTokenEmail(user);
  const log = buildAdminLog({ action: 'dashboard_lock_cleared', targetType: 'settings', targetId: DASHBOARD_LOCK_DOC_ID });
  const batch = writeBatch(db);
  batch.delete(lockRef());
  batch.set(log.ref, log.data);
  await batch.commit();
  lockDashboardNow();
}

// ---------------------------------------------------------------------------------------------
// Session state (client only, sessionStorage per tab; nothing secret is stored)
// ---------------------------------------------------------------------------------------------

interface UnlockState {
  uid: string;
  recordStamp: string;
  lastActivity: number;
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function recordStamp(record: DashboardLockRecord): string {
  // A new password always has a new salt, so the stamp changes even if updatedAt were missing
  return `${record.updatedAt ?? ''}|${record.salt}`;
}

function readUnlockState(): UnlockState | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(UNLOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UnlockState> | null;
    if (
      parsed &&
      typeof parsed.uid === 'string' &&
      typeof parsed.recordStamp === 'string' &&
      typeof parsed.lastActivity === 'number'
    ) {
      return { uid: parsed.uid, recordStamp: parsed.recordStamp, lastActivity: parsed.lastActivity };
    }
  } catch {
    // Blocked storage or invalid JSON: locked
  }
  return null;
}

function writeUnlockState(state: UnlockState): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked / full: the session simply stays locked on the next check
  }
}

/**
 * True when no lock record exists, or this tab was unlocked by the same uid for the same record and the
 * last activity was less than 15 minutes ago. Missing/blocked storage = locked.
 */
export function isDashboardUnlocked(uid: string, record: DashboardLockRecord | null): boolean {
  if (!record) return true;
  const state = readUnlockState();
  if (!state) return false;
  return (
    state.uid === uid &&
    state.recordStamp === recordStamp(record) &&
    Date.now() - state.lastActivity < DASHBOARD_LOCK_IDLE_MS
  );
}

/** After a correct password: this tab counts as unlocked for `uid` and this record. */
export function markDashboardUnlocked(uid: string, record: DashboardLockRecord): void {
  lastTouch = Date.now();
  writeUnlockState({ uid, recordStamp: recordStamp(record), lastActivity: lastTouch });
}

let lastTouch = 0;

/** Activity ping (throttled to once per 30 s). Never revives a session that already timed out. */
export function touchDashboardActivity(): void {
  const now = Date.now();
  if (now - lastTouch < ACTIVITY_THROTTLE_MS) return;
  const state = readUnlockState();
  if (!state || now - state.lastActivity >= DASHBOARD_LOCK_IDLE_MS) return;
  lastTouch = now;
  writeUnlockState({ ...state, lastActivity: now });
}

/** "Lock now": forgets this tab's unlocked state. */
export function lockDashboardNow(): void {
  lastTouch = 0;
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(UNLOCK_STORAGE_KEY);
  } catch {
    // ignore
  }
}
