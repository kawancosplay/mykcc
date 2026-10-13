import {
  signInWithPopup,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth, popupRedirectResolver, isMainAdminUser } from './firebase';
import { MAIN_ACCOUNT_EMAIL } from './idGenerator';
import { translate } from '../i18n';

/**
 * Least-privilege scope of the admin Google Sheets sync. The sync only READS spreadsheet metadata (tab names)
 * and cell values (sheetsService: spreadsheets.get + spreadsheets.values.get), so it needs no write access
 * and no Drive scope. `https://www.googleapis.com/auth/drive` is a RESTRICTED scope that Google verification
 * rejected and that was removed from the OAuth consent screen: never add a Drive scope back.
 */
export const SHEETS_READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export const SCOPES = [SHEETS_READONLY_SCOPE];

/**
 * Provider of the admin "Connect Google Sheets" flow ONLY (googleSignIn). Member logins
 * (authService.loginWithGoogleOAuth) use a basic-scope provider and never request Sheets or Drive scopes.
 * - include_granted_scopes: incremental authorization (the Sheets scope is added to the account's earlier grants).
 * - login_hint: pre-selects the signed-in admin's Google account for the re-authentication popup.
 * - select_account: only when nobody is signed in, so the admin can pick the right account.
 * (No access_type 'offline': popup sign-in never hands the web client a refresh token.)
 */
function createSheetsProvider(loginHint: string | null): GoogleAuthProvider {
  const sheetsProvider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => sheetsProvider.addScope(scope));
  const params: Record<string, string> = { include_granted_scopes: 'true' };
  if (loginHint) {
    params.login_hint = loginHint;
  } else {
    params.prompt = 'select_account';
  }
  sheetsProvider.setCustomParameters(params);
  return sheetsProvider;
}

const POPUP_CANCEL_CODES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];

function getAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

/**
 * True when the user closed/cancelled the Google sign-in popup (not a real failure).
 */
export function isPopupCancelledError(error: unknown): boolean {
  const code = getAuthErrorCode(error);
  return code !== null && POPUP_CANCEL_CODES.includes(code);
}

/**
 * True when the browser blocked the Google popup (the user has to allow popups for this site).
 */
export function isPopupBlockedError(error: unknown): boolean {
  return getAuthErrorCode(error) === 'auth/popup-blocked';
}

/**
 * True when, during the Sheets re-authentication, the admin picked a different Google account than the
 * signed-in Firebase user (the signed-in user is left unchanged).
 */
export function isUserMismatchError(error: unknown): boolean {
  return getAuthErrorCode(error) === 'auth/user-mismatch';
}

// ---------------------------------------------------------------------------------------------
// Sheets access token: kept in memory and in sessionStorage (survives a reload of this tab only),
// scoped to the Firebase uid that obtained it and expiring before Google's 1-hour token lifetime.
// ---------------------------------------------------------------------------------------------

const TOKEN_STORAGE_KEY = 'kcc_google_access_token';
const TOKEN_TTL_MS = 55 * 60 * 1000;

interface StoredAccessToken {
  token: string;
  uid: string | null;
  expiresAt: number;
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    // Storage blocked (privacy mode / sandboxed iframe)
    return null;
  }
}

function removeStoredToken(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function writeStoredToken(value: StoredAccessToken): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota exceeded / storage blocked: the in-memory token still works for this page
  }
}

function readStoredToken(): StoredAccessToken | null {
  const storage = getSessionStorage();
  if (!storage) return null;
  let raw: string | null = null;
  try {
    raw = storage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAccessToken> | null;
    if (
      parsed &&
      typeof parsed.token === 'string' &&
      parsed.token.length > 0 &&
      typeof parsed.expiresAt === 'number' &&
      parsed.expiresAt > Date.now() &&
      (parsed.uid === null || typeof parsed.uid === 'string')
    ) {
      return { token: parsed.token, uid: parsed.uid, expiresAt: parsed.expiresAt };
    }
  } catch {
    // Not JSON (e.g. a plain token stored by an older build)
  }
  // Invalid, legacy or expired value: drop it
  removeStoredToken();
  return null;
}

let isSigningIn = false;
let cachedToken: StoredAccessToken | null = readStoredToken();

/**
 * Returns the Sheets access token (sync). Null when there is none, when it expired, or when `uid` is
 * given and the token was obtained by a different account.
 */
export const getAccessToken = (uid?: string | null): string | null => {
  if (!cachedToken) return null;
  if (cachedToken.expiresAt <= Date.now()) {
    setAccessToken(null);
    return null;
  }
  if (uid && cachedToken.uid !== uid) return null;
  return cachedToken.token;
};

/**
 * Stores (memory + sessionStorage) or clears (null) the Sheets access token.
 * `uid` defaults to the currently signed-in Firebase user.
 */
export const setAccessToken = (token: string | null, uid?: string | null): void => {
  if (!token) {
    cachedToken = null;
    removeStoredToken();
    return;
  }
  cachedToken = {
    token,
    uid: uid ?? auth.currentUser?.uid ?? null,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  writeStoredToken(cachedToken);
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const token = getAccessToken(user.uid);
      // A token obtained by another account (account switch without sign-out) is discarded
      if (!token && cachedToken) setAccessToken(null);
      if (onAuthSuccess) {
        onAuthSuccess(user, token);
      }
    } else {
      setAccessToken(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Admin "Connect Google Sheets": on-demand (incremental) authorization of the read-only Sheets scope.
 * - Someone is signed in: reauthenticateWithPopup for the SAME account (login_hint = their email). The
 *   Firebase user never changes; picking another Google account rejects with auth/user-mismatch
 *   (isUserMismatchError).
 * - Nobody is signed in: falls back to signInWithPopup (signs in and grants the Sheets scope at once).
 * Stores the token for the uid that obtained it (memory + sessionStorage, TTL below Google's 1 hour).
 * Resolves null when a Sheets authorization popup is already open. Rethrows every error, including a
 * cancelled popup (callers check isPopupCancelledError).
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  isSigningIn = true;
  try {
    const currentUser = auth.currentUser;
    // auth is created without a popup resolver (firebase.ts), so every popup call passes it
    const result = currentUser
      ? await reauthenticateWithPopup(currentUser, createSheetsProvider(currentUser.email), popupRedirectResolver)
      : await signInWithPopup(auth, createSheetsProvider(null), popupRedirectResolver);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(translate('errors.googleAccessTokenMissing'));
    }

    setAccessToken(credential.accessToken, result.user.uid);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: unknown) {
    if (!isPopupCancelledError(error)) {
      console.error('Google Sheets authorization error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// ---------------------------------------------------------------------------------------------
// Dashboard lock "forgot password": Google re-authentication of the main account
// ---------------------------------------------------------------------------------------------

/** Re-authentication proof is accepted by dashboardLock.setDashboardPassword for this long. */
export const MAIN_REAUTH_VALID_MS = 10 * 60 * 1000;
let lastMainReauthAt = 0;

/** Time (ms) of the last successful reauthenticateMainAccount in this page; 0 = never. */
export function getLastMainReauthAt(): number {
  return lastMainReauthAt;
}

/**
 * Dashboard lock "forgot password": re-authenticates the signed-in MAIN account with a Google popup
 * (basic scopes only, login_hint = the main account's email). The signed-in user never changes; picking
 * another Google account fails with errors.lockReauthWrongAccount. A closed popup rethrows the original
 * error (check isPopupCancelledError). Throws errors.lockMainOnly for any other signed-in user.
 */
export async function reauthenticateMainAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !isMainAdminUser(user)) {
    throw new Error(translate('errors.lockMainOnly'));
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ login_hint: MAIN_ACCOUNT_EMAIL, prompt: 'select_account' });
  try {
    const result = await reauthenticateWithPopup(user, provider, popupRedirectResolver);
    if (!isMainAdminUser(result.user)) {
      throw new Error(translate('errors.lockReauthWrongAccount'));
    }
    lastMainReauthAt = Date.now();
  } catch (error: unknown) {
    if (isUserMismatchError(error)) {
      throw new Error(translate('errors.lockReauthWrongAccount'));
    }
    throw error;
  }
}

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    setAccessToken(null);
  }
};
