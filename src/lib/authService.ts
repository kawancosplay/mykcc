import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { collection, query, where, limit, getDocsFromServer, doc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, isMainAdminUser } from './firebase';
import type { Member } from '../types';
import { MAIN_ACCOUNT_UID, isValidUserId16 } from './idGenerator';
import {
  MEMBERS_COLLECTION,
  MEMBER_FIELD_LIMITS,
  normalizeMember,
  createMemberIfAbsent,
  assignNewUserId16,
  sanitizeMemberProfileUpdate,
  buildMemberCard,
  upsertMemberCard,
} from './firestoreService';

// Plain provider (openid/email/profile). Its access token is NOT used for Google Sheets:
// the admin Sheets connection goes through googleAuth.googleSignIn (Drive + Sheets scopes).
const googleProvider = new GoogleAuthProvider();
// Always show the account chooser, so a user signed in with another Google account can switch
// (e.g. to the admin account from the Admin Portal lock screen)
googleProvider.setCustomParameters({ prompt: 'select_account' });

// In-memory cache of found member profiles keyed by Firebase uid. Only positive results are
// cached, so a "not found" never sticks.
const memberCache = new Map<string, { member: Member; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function cacheMember(uid: string, member: Member) {
  memberCache.set(uid, { member, timestamp: Date.now() });
}

export function invalidateMemberCache(uid?: string): void {
  if (uid) {
    memberCache.delete(uid);
  } else {
    memberCache.clear();
  }
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Finds the member profile of a signed-in user: by authUid first, then (only for a VERIFIED email)
 * by email. Both queries match firestore.rules list constraints. Returns null only when both
 * queries definitively came back empty; any error (offline, permission) is thrown.
 */
export async function findMemberForUser(user: User): Promise<Member | null> {
  const cached = memberCache.get(user.uid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.member;
  }

  const byUid = await getDocsFromServer(
    query(collection(db, MEMBERS_COLLECTION), where('authUid', '==', user.uid), limit(10))
  );
  if (!byUid.empty) {
    // A signed-in user may own the auto-created members/{uid} profile AND a registration they submitted
    // through the public form while signed in. Prefer the earliest real registration (it holds the form
    // data and the KCC ID shown on the success screen), so the profile does not flip between them.
    // The verified main account keeps the doc that stores 0000 0000 0000 0000 (its admin test
    // registrations never replace it).
    const mainAccountDoc = isMainAdminUser(user)
      ? byUid.docs.find((d) => d.data().userId16 === MAIN_ACCOUNT_UID)
      : undefined;
    const registrations = byUid.docs
      .filter((d) => d.id !== user.uid)
      .sort((a, b) => {
        const aAt = String(a.data().createdAt || '');
        const bAt = String(b.data().createdAt || '');
        return aAt < bAt ? -1 : aAt > bAt ? 1 : 0;
      });
    const docSnap = mainAccountDoc || registrations[0] || byUid.docs[0];
    const member = normalizeMember(docSnap.id, docSnap.data() as Partial<Omit<Member, 'id'>>);
    cacheMember(user.uid, member);
    return member;
  }

  // The rules compare the query value with the token email exactly; stored emails are lowercase,
  // so the email lookup only runs for a verified, already-lowercase token email.
  const rawEmail = (user.email || '').trim();
  const email = rawEmail.toLowerCase();
  if (user.emailVerified && email && rawEmail === email) {
    const byEmail = await getDocsFromServer(
      query(collection(db, MEMBERS_COLLECTION), where('email', '==', email), limit(1))
    );
    if (!byEmail.empty) {
      const docSnap = byEmail.docs[0];
      const member = normalizeMember(docSnap.id, docSnap.data() as Partial<Omit<Member, 'id'>>);
      cacheMember(user.uid, member);
      return member;
    }
  }

  return null;
}

/**
 * Returns the member profile of a signed-in user, linking (authUid only) or creating it if needed.
 * New profiles are created at members/{uid} inside a transaction, so retries never duplicate them,
 * and an existing doc's userId16/createdAt are never rewritten. Throws on failure.
 */
export async function ensureMemberForUser(
  user: User,
  overrides?: { name?: string; fullName?: string }
): Promise<Member> {
  let member = await findMemberForUser(user);

  if (member) {
    if (member.authUid !== user.uid) {
      try {
        await updateDoc(doc(db, MEMBERS_COLLECTION, member.id), { authUid: user.uid });
        member = { ...member, authUid: user.uid };
        cacheMember(user.uid, member);
      } catch (error) {
        console.warn('Could not link the member profile to this account (authUid):', error);
      }
    }
    return member;
  }

  const isMain = isMainAdminUser(user);
  const userId16 = isMain ? MAIN_ACCOUNT_UID : await assignNewUserId16();
  const name =
    (overrides?.name || user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Cosplayer')
      .trim()
      .slice(0, MEMBER_FIELD_LIMITS.name) || 'Cosplayer';
  const fullName =
    (overrides?.fullName || user.displayName || name).trim().slice(0, MEMBER_FIELD_LIMITS.fullName) || name;

  const payload: Omit<Member, 'id'> = {
    userId16,
    authUid: user.uid,
    name,
    cosplayName: name,
    fullName,
    email: (user.email || '').toLowerCase().trim(),
    avatarUrl: user.photoURL || undefined,
    city: 'Worldwide',
    country: 'Indonesia',
    primaryRole: isMain ? 'KCC Founder & Core Organizer' : 'Cosplayer',
    fandom: 'Anime & Games',
    source: 'web_form',
    status: 'verified',
    createdAt: new Date().toISOString(),
  };

  const result = await createMemberIfAbsent(user.uid, payload);
  cacheMember(user.uid, result.member);
  return result.member;
}

async function ensureMemberSafely(
  user: User,
  context: string,
  overrides?: { name?: string; fullName?: string }
): Promise<Member | null> {
  try {
    return await ensureMemberForUser(user, overrides);
  } catch (error) {
    console.warn(`Member profile lookup after ${context} failed:`, error);
    return null;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  cosplayName: string
): Promise<{ user: User; member: Member | null }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (fullName || cosplayName) {
    await updateProfile(user, {
      displayName: cosplayName || fullName,
    });
  }

  // The new email is not verified yet, so this never links to an existing doc by email
  const member = await ensureMemberSafely(user, 'sign-up', { name: cosplayName || fullName, fullName });
  return { user, member };
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; member: Member | null }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const member = await ensureMemberSafely(user, 'email sign-in');
  return { user, member };
}

export async function loginWithGoogleOAuth(): Promise<{ user: User; member: Member | null; accessToken: string }> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken || '';
  const user = result.user;
  const member = await ensureMemberSafely(user, 'Google sign-in');
  return { user, member, accessToken };
}

export async function loginWithAppleOAuth(): Promise<{ user: User; member: Member | null }> {
  const appleProvider = new OAuthProvider('apple.com');
  const result = await signInWithPopup(auth, appleProvider);
  const user = result.user;
  const member = await ensureMemberSafely(user, 'Apple sign-in');
  return { user, member };
}

export async function loginWithMicrosoftOAuth(): Promise<{ user: User; member: Member | null }> {
  const msProvider = new OAuthProvider('microsoft.com');
  const result = await signInWithPopup(auth, msProvider);
  const user = result.user;
  const member = await ensureMemberSafely(user, 'Microsoft sign-in');
  return { user, member };
}

/**
 * Saves the owner's profile edits (whitelisted + clamped fields only) and then refreshes the public
 * member card (best effort). Errors of the profile write are rethrown.
 */
export async function updateMemberProfileData(member: Member, fields: Partial<Member>): Promise<Member> {
  const clean = sanitizeMemberProfileUpdate(fields);
  if (Object.keys(clean).length === 0) return member;

  try {
    await updateDoc(doc(db, MEMBERS_COLLECTION, member.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${member.id}`);
  }

  const updated: Member = { ...member, ...(clean as Partial<Member>) };
  const currentUid = auth.currentUser?.uid;
  if (currentUid) invalidateMemberCache(currentUid);

  if (isValidUserId16(updated.userId16)) {
    try {
      await upsertMemberCard(buildMemberCard(updated));
    } catch (error) {
      console.warn('Profile saved, but the public member card could not be refreshed:', error);
    }
  }

  return updated;
}
