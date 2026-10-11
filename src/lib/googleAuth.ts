import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

// Drive + Sheets provider, used ONLY by googleSignIn (the admin's "Connect Google Sheets" flow).
// Member logins (authService.loginWithGoogleOAuth) use a plain provider with basic scopes.
// - select_account: lets an admin switch to the right Google account.
// - consent: forces Google to show the Drive/Sheets grant again, so a token with missing scopes is replaced.
// (No access_type 'offline': popup sign-in never hands the web client a refresh token.)
const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account consent' });

const POPUP_CANCEL_CODES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];

/**
 * True when the user closed/cancelled the Google sign-in popup (not a real failure).
 */
export function isPopupCancelledError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) return false;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && POPUP_CANCEL_CODES.includes(code);
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
 * Interactive Google sign-in with Drive + Sheets scopes (admin Sheets connection).
 * Stores the token for the signed-in uid. Rethrows every error, including a cancelled popup
 * (callers check isPopupCancelledError).
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign in');
    }

    setAccessToken(credential.accessToken, result.user.uid);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: unknown) {
    if (!isPopupCancelledError(error)) {
      console.error('Google Sign-in error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    setAccessToken(null);
  }
};
