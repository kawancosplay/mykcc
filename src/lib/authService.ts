import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Member } from '../types';
import {
  generate16DigitUserId,
  generateChronologicalUserId16,
  resolveMemberUserId16,
  FOUNDER_ADMIN_EMAIL,
  FOUNDER_USER_ID,
} from './idGenerator';
import { addMemberToFirestore } from './firestoreService';

const googleProvider = new GoogleAuthProvider();

// Fast in-memory cache to prevent repeated cold Firestore queries and speed up login
const memberEmailCache = new Map<string, { member: Member | null; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateMemberCache(email?: string) {
  if (email) {
    memberEmailCache.delete(email.toLowerCase().trim());
  } else {
    memberEmailCache.clear();
  }
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signUpWithEmail(email: string, password: string, fullName: string, cosplayName: string): Promise<{ user: User; member: Member }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (fullName || cosplayName) {
    await updateProfile(user, {
      displayName: cosplayName || fullName,
    });
  }

  // Check if member already exists with this email (e.g. from Google Form import)
  let existingMember = await findMemberByEmail(email);

  if (existingMember) {
    // Update authUid and ensure 16-digit User ID exists
    const userId16 = resolveMemberUserId16(email, existingMember.createdAt);
    const memberDocRef = doc(db, 'members', existingMember.id);
    await updateDoc(memberDocRef, {
      authUid: user.uid,
      userId16,
    });
    existingMember = { ...existingMember, authUid: user.uid, userId16 };
    invalidateMemberCache(email);
    return { user, member: existingMember };
  } else {
    // Create new Member profile arranged by submission timestamp
    const now = new Date();
    const userId16 = resolveMemberUserId16(email, now);
    const resolvedName = cosplayName || fullName || 'Cosplayer';

    const newMemberPayload: Omit<Member, 'id'> = {
      userId16,
      authUid: user.uid,
      fullName: fullName || 'New Member',
      name: resolvedName,
      cosplayName: resolvedName,
      email: email.toLowerCase(),
      city: 'Worldwide',
      country: 'Worldwide',
      primaryRole: 'Cosplayer',
      fandom: 'Anime & Games',
      source: 'web_form',
      status: 'verified',
      createdAt: now.toISOString(),
    };

    const docId = await addMemberToFirestore(newMemberPayload);
    const createdMember: Member = {
      id: docId,
      ...newMemberPayload,
    };
    invalidateMemberCache(email);
    return { user, member: createdMember };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; member: Member | null }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  let member = await findMemberByUidOrEmail(user.uid, email);

  if (!member && email) {
    const now = new Date();
    const isFounder = email.toLowerCase().trim() === 'cosplaysehat@gmail.com';
    const userId16 = isFounder ? '0000000000000000' : resolveMemberUserId16(email, now);
    const resolvedName = user.displayName || email.split('@')[0] || 'Cosplayer';
    const newMemberPayload: Omit<Member, 'id'> = {
      userId16,
      authUid: user.uid,
      fullName: resolvedName,
      name: resolvedName,
      cosplayName: resolvedName,
      email: email.toLowerCase().trim(),
      city: 'Worldwide',
      country: 'Indonesia',
      primaryRole: isFounder ? 'KCC Founder & Core Organizer' : 'Cosplayer',
      fandom: 'Anime & Games',
      source: 'web_form',
      status: 'verified',
      createdAt: now.toISOString(),
    };
    const id = await addMemberToFirestore(newMemberPayload);
    member = { id, ...newMemberPayload };
    invalidateMemberCache(email);
  }

  return { user, member };
}

export async function loginWithGoogleOAuth(): Promise<{ user: User; member: Member | null; accessToken: string }> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken || '';
  const user = result.user;

  let member = await findMemberByUidOrEmail(user.uid, user.email || '');
  if (!member && user.email) {
    // Automatically create a member profile arranged by submission timestamp
    const now = new Date();
    const isFounder = user.email.toLowerCase().trim() === 'cosplaysehat@gmail.com';
    const userId16 = isFounder ? '0000000000000000' : resolveMemberUserId16(user.email, now);
    const resolvedName = user.displayName?.split(' ')[0] || user.displayName || 'Cosplayer';
    const newMemberPayload: Omit<Member, 'id'> = {
      userId16,
      authUid: user.uid,
      fullName: user.displayName || 'Google Member',
      name: resolvedName,
      cosplayName: resolvedName,
      email: user.email.toLowerCase(),
      avatarUrl: user.photoURL || undefined,
      city: 'Worldwide',
      country: 'Indonesia',
      primaryRole: isFounder ? 'KCC Founder & Core Organizer' : 'Cosplayer',
      fandom: 'Anime & Games',
      source: 'web_form',
      status: 'verified',
      createdAt: now.toISOString(),
    };
    const id = await addMemberToFirestore(newMemberPayload);
    member = { id, ...newMemberPayload };
    invalidateMemberCache(user.email);
  } else if (member) {
    const isFounder = (user.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com') || (member.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com');
    const targetUserId16 = isFounder ? '0000000000000000' : (resolveMemberUserId16(member.email, member.createdAt) || member.userId16);
    if (!member.userId16 || member.userId16 !== targetUserId16 || !member.authUid) {
      await updateDoc(doc(db, 'members', member.id), { userId16: targetUserId16, authUid: user.uid });
      member.userId16 = targetUserId16;
      member.authUid = user.uid;
      invalidateMemberCache(user.email || '');
    }
  }

  return { user, member, accessToken };
}

export async function loginWithAppleOAuth(): Promise<{ user: User; member: Member | null }> {
  const appleProvider = new OAuthProvider('apple.com');
  const result = await signInWithPopup(auth, appleProvider);
  const user = result.user;
  let member = await findMemberByUidOrEmail(user.uid, user.email || '');
  return { user, member };
}

export async function loginWithMicrosoftOAuth(): Promise<{ user: User; member: Member | null }> {
  const msProvider = new OAuthProvider('microsoft.com');
  const result = await signInWithPopup(auth, msProvider);
  const user = result.user;
  let member = await findMemberByUidOrEmail(user.uid, user.email || '');
  return { user, member };
}

export async function findMemberByUserId16(userId16: string): Promise<Member | null> {
  if (!userId16) return null;
  try {
    const q = query(collection(db, 'members'), where('userId16', '==', userId16.trim()), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data() as Omit<Member, 'id'>;
      const memberName = data.name || data.cosplayName || data.fullName || 'Member';
      return { id: docSnap.id, ...data, name: memberName, cosplayName: memberName, userId16 };
    }
  } catch (e) {
    console.warn('findMemberByUserId16 note:', e);
  }
  return null;
}

export async function findMemberByUidOrEmail(uid?: string, email?: string): Promise<Member | null> {
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  if (cleanEmail) {
    const cached = memberEmailCache.get(cleanEmail);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.member) {
      return cached.member;
    }
  }

  // 1. Try by authUid first (fastest and directly matches Firebase Auth account)
  if (uid) {
    try {
      const qUid = query(collection(db, 'members'), where('authUid', '==', uid), limit(1));
      const snapUid = await Promise.race([
        getDocs(qUid),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 1500))
      ]);
      if (snapUid && !snapUid.empty) {
        const docSnap = snapUid.docs[0];
        const data = docSnap.data() as Omit<Member, 'id'>;
        const isFounder = (cleanEmail === 'cosplaysehat@gmail.com') || (data.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com');
        const userId16 = isFounder ? '0000000000000000' : (data.userId16 || generateChronologicalUserId16(data.createdAt));
        const memberName = data.name || data.cosplayName || data.fullName || 'Member';
        const resolvedMember: Member = {
          id: docSnap.id,
          ...data,
          name: memberName,
          cosplayName: memberName,
          userId16,
        };
        if (cleanEmail) memberEmailCache.set(cleanEmail, { member: resolvedMember, timestamp: Date.now() });
        return resolvedMember;
      }
    } catch (e) {
      console.warn('findMemberByUid query note:', e);
    }
  }

  // 2. Try by email
  if (cleanEmail) {
    try {
      const qEmail = query(collection(db, 'members'), where('email', '==', cleanEmail), limit(1));
      const snap = await Promise.race([
        getDocs(qEmail),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 1500))
      ]);
      if (snap && !snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data() as Omit<Member, 'id'>;
        const isFounder = cleanEmail === 'cosplaysehat@gmail.com';
        const userId16 = isFounder ? '0000000000000000' : (data.userId16 || generateChronologicalUserId16(data.createdAt));
        if (isFounder && data.userId16 !== '0000000000000000') {
          updateDoc(doc(db, 'members', docSnap.id), { userId16: '0000000000000000' }).catch(console.warn);
        }
        if (uid && (!data.authUid || data.authUid !== uid)) {
          updateDoc(doc(db, 'members', docSnap.id), { authUid: uid }).catch(console.warn);
        }
        const memberName = data.name || data.cosplayName || data.fullName || 'Member';
        const resolvedMember: Member = {
          id: docSnap.id,
          ...data,
          name: memberName,
          cosplayName: memberName,
          userId16,
          authUid: uid || data.authUid,
        };
        memberEmailCache.set(cleanEmail, { member: resolvedMember, timestamp: Date.now() });
        return resolvedMember;
      } else {
        memberEmailCache.set(cleanEmail, { member: null, timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('findMemberByEmail note:', e);
    }
  }

  return null;
}

export async function findMemberByEmail(email: string): Promise<Member | null> {
  return findMemberByUidOrEmail(undefined, email);
}

export async function updateMemberProfileData(memberId: string, fields: Partial<Member>): Promise<void> {
  const memberDocRef = doc(db, 'members', memberId);
  const cleanFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key !== 'id' && value !== undefined) {
      cleanFields[key] = value;
    }
  }
  await updateDoc(memberDocRef, cleanFields);
  invalidateMemberCache(fields.email);
}
