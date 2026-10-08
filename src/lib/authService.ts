import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  User,
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
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
    return { user, member: existingMember };
  } else {
    // Create new Member profile arranged by submission timestamp
    const now = new Date();
    const userId16 = resolveMemberUserId16(email, now);

    const newMemberPayload: Omit<Member, 'id'> = {
      userId16,
      authUid: user.uid,
      fullName: fullName || 'New Member',
      cosplayName: cosplayName || fullName || 'Cosplayer',
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
    return { user, member: createdMember };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; member: Member | null }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const member = await findMemberByEmail(email);
  return { user, member };
}

export async function loginWithGoogleOAuth(): Promise<{ user: User; member: Member | null; accessToken: string }> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken || '';
  const user = result.user;

  let member = await findMemberByEmail(user.email || '');
  if (!member && user.email) {
    // Automatically create a member profile arranged by submission timestamp
    const now = new Date();
    const userId16 = resolveMemberUserId16(user.email, now);
    const newMemberPayload: Omit<Member, 'id'> = {
      userId16,
      authUid: user.uid,
      fullName: user.displayName || 'Google Member',
      cosplayName: user.displayName?.split(' ')[0] || 'Cosplayer',
      email: user.email.toLowerCase(),
      avatarUrl: user.photoURL || undefined,
      city: 'Worldwide',
      country: 'Worldwide',
      primaryRole: 'Cosplayer',
      fandom: 'Anime & Games',
      source: 'web_form',
      status: 'verified',
      createdAt: now.toISOString(),
    };
    const id = await addMemberToFirestore(newMemberPayload);
    member = { id, ...newMemberPayload };
  } else if (member) {
    const targetUserId16 = resolveMemberUserId16(member.email, member.createdAt) || member.userId16;
    if (!member.userId16 || member.userId16 !== targetUserId16 || !member.authUid) {
      await updateDoc(doc(db, 'members', member.id), { userId16: targetUserId16, authUid: user.uid });
      member.userId16 = targetUserId16;
      member.authUid = user.uid;
    }
  }

  return { user, member, accessToken };
}

export async function loginWithAppleOAuth(): Promise<{ user: User; member: Member | null }> {
  const appleProvider = new OAuthProvider('apple.com');
  const result = await signInWithPopup(auth, appleProvider);
  const user = result.user;
  let member = await findMemberByEmail(user.email || '');
  return { user, member };
}

export async function loginWithMicrosoftOAuth(): Promise<{ user: User; member: Member | null }> {
  const msProvider = new OAuthProvider('microsoft.com');
  const result = await signInWithPopup(auth, msProvider);
  const user = result.user;
  let member = await findMemberByEmail(user.email || '');
  return { user, member };
}

export async function findMemberByEmail(email: string): Promise<Member | null> {
  if (!email) return null;
  try {
    const q = query(collection(db, 'members'), where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data() as Omit<Member, 'id'>;
      const isFounder = email.toLowerCase().trim() === 'cosplaysehat@gmail.com';
      const userId16 = isFounder ? '0000000000000000' : (data.userId16 || generateChronologicalUserId16(data.createdAt));
      if (isFounder && data.userId16 !== '0000000000000000') {
        updateDoc(doc(db, 'members', docSnap.id), { userId16: '0000000000000000' }).catch(console.warn);
      }
      return { id: docSnap.id, ...data, userId16 };
    }
  } catch (e) {
    console.warn('findMemberByEmail note:', e);
  }
  return null;
}

export async function updateMemberProfileData(memberId: string, fields: Partial<Member>): Promise<void> {
  const memberDocRef = doc(db, 'members', memberId);
  const cleanFields = { ...fields };
  delete (cleanFields as Record<string, unknown>).id;
  await updateDoc(memberDocRef, cleanFields as Record<string, unknown>);
}
