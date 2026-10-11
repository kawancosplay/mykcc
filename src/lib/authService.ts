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
import { auth, db, handleFirestoreError, OperationType, isMainAdminUser, checkIsAdminUser } from './firebase';
import type { Member, RegistrationResult } from '../types';
import { MAIN_ACCOUNT_UID, isValidUserId16, findDuplicateMember, extractAllPhones } from './idGenerator';
import {
  MEMBERS_COLLECTION,
  MEMBER_FIELD_LIMITS,
  normalizeMember,
  createMemberIfAbsent,
  assignNewUserId16,
  sanitizeMemberProfileUpdate,
  buildMemberCard,
  upsertMemberCard,
  registerMember,
  buildMemberMergeUpdate,
  updateMemberWithCard,
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
 * A signed-in user may own the auto-created members/{uid} profile AND registrations they submitted
 * through the public form while signed in. Order (the first one is "the" profile):
 * 1. for the verified main account, the doc that stores 0000 0000 0000 0000 (admin test registrations
 *    never replace it);
 * 2. real registrations (id !== uid), earliest createdAt first, ties by doc id (they hold the form data
 *    and the KCC ID shown on the success screen), so the profile does not flip between docs;
 * 3. the members/{uid} sign-in profile.
 */
function orderOwnedMembers(members: Member[], user: User): Member[] {
  const isMain = isMainAdminUser(user);
  const rank = (m: Member) => (isMain && m.userId16 === MAIN_ACCOUNT_UID ? 0 : m.id !== user.uid ? 1 : 2);
  return [...members].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    const aAt = String(a.createdAt || '');
    const bAt = String(b.createdAt || '');
    if (aAt !== bAt) return aAt < bAt ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

// Owner-scoped read (firestore.rules: list where authUid == auth.uid). Errors are thrown.
async function getOwnedMembers(user: User): Promise<Member[]> {
  const snap = await getDocsFromServer(
    query(collection(db, MEMBERS_COLLECTION), where('authUid', '==', user.uid), limit(10))
  );
  return orderOwnedMembers(
    snap.docs.map((d) => normalizeMember(d.id, d.data() as Partial<Omit<Member, 'id'>>)),
    user
  );
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

  const owned = await getOwnedMembers(user);
  if (owned.length > 0) {
    const member = owned[0];
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
  // Basic scopes only: never stored as the Sheets token (that comes from googleAuth.googleSignIn)
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

/**
 * Public registration form submission. "Each member holds a single KCC ID": a person who fills the form
 * again keeps their existing registration (and KCC ID), which is updated with the new data and phone
 * numbers. Matching never reads other members' personal data for non-admins:
 * - admin: matched against the admin's own member list (options.adminExistingMembers);
 * - signed-in member: matched against the registrations owned by this account only (authUid query),
 *   or fills the never-completed members/{uid} sign-in profile;
 * - anonymous visitor: no reads at all; a new registration is created (the admin merges duplicates
 *   later via findDuplicateRegistrationGroups / mergeDuplicateRegistration).
 * Errors are rethrown.
 */
export async function submitRegistration(
  member: Omit<Member, 'id' | 'userId16'>,
  options?: { adminExistingMembers?: Member[] }
): Promise<RegistrationResult> {
  const user = auth.currentUser;
  const isAdmin = user ? await checkIsAdminUser(user) : false;

  if (user) {
    const candidate = {
      email: member.email,
      phone: member.phone,
      phone2: member.phone2,
      additionalPhones: member.additionalPhones,
      discordUsername: member.discordUsername,
      name: member.name,
      cosplayName: member.cosplayName,
      socialMedia: member.socialMedia,
    };

    let target: Member | null;
    if (isAdmin) {
      target = findDuplicateMember(options?.adminExistingMembers || [], candidate);
    } else {
      const owned = await getOwnedMembers(user);
      target =
        findDuplicateMember(owned, candidate) ||
        owned.find((m) => m.id === user.uid && extractAllPhones(m).length === 0) ||
        null;
    }

    if (target) {
      // Completing the bare sign-in profile (members/{uid}, no WhatsApp number yet) is a first
      // registration from the user's point of view, not a re-submission
      const fillsSignInProfile =
        !!target.authUid && target.id === target.authUid && extractAllPhones(target).length === 0;
      const updated = await updateMemberWithCard(
        target,
        buildMemberMergeUpdate(target, member, { allowEmail: isAdmin })
      );
      invalidateMemberCache(user.uid);
      return { member: updated, reusedExisting: !fillsSignInProfile };
    }
  }

  // A signed-in member's new registration is linked to their account; an admin registering someone
  // else is not (the admin must not own, or become, that member)
  const created = await registerMember(member, { linkToCurrentUser: !isAdmin });
  if (user) invalidateMemberCache(user.uid);
  return { member: created, reusedExisting: false };
}
