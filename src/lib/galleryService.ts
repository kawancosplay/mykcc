import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Photo } from '../types';

const PHOTOS_COLLECTION = 'photos';

// Field limits identical to firestore.rules isValidPhoto()
export const PHOTO_FIELD_LIMITS = {
  authorName: 100,
  authorCosname: 80,
  authorNameAlias: 80,
  authorAvatar: 2048,
  title: 120,
  character: 100,
  series: 100,
  event: 120,
  photographer: 100,
  caption: 1000,
  photoUrl: 1000000,
} as const;

// A photo write still pending after this long is treated as queued (it syncs when the connection
// recovers), so the upload spinner never hangs and the user does not retry into a duplicate.
const PHOTO_WRITE_TIMEOUT_MS = 15000;

export function subscribeToPhotos(
  onUpdate: (photos: Photo[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const photos: Photo[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Photo, 'id'>),
      }));
      onUpdate(photos);
    },
    (error) => {
      console.error('Subscription error on photos collection:', error);
      if (onError) onError(error as Error);
      try {
        handleFirestoreError(error, OperationType.LIST, PHOTOS_COLLECTION);
      } catch (e) {
        // Handled
      }
    }
  );
}

function clip(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export async function addPhotoToFirestore(photo: Omit<Photo, 'id'>): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    const authError = new Error('Silakan login terlebih dahulu untuk mengunggah foto.') as Error & { code?: string };
    authError.code = 'unauthenticated';
    throw authError;
  }

  const photoUrl = typeof photo.photoUrl === 'string' ? photo.photoUrl : '';
  if (photoUrl.length > PHOTO_FIELD_LIMITS.photoUrl) {
    throw new Error('Ukuran foto terlalu besar. Silakan pilih foto lain. / Photo is too large.');
  }

  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const photoDocRef = doc(db, PHOTOS_COLLECTION, id);

  // Only the keys allowed by firestore.rules, clamped to the rule limits. Optional keys are added only
  // when non-empty, so the payload never carries undefined values.
  const payload: Record<string, unknown> = {
    authorUid: currentUser.uid,
    authorName: clip(photo.authorName, PHOTO_FIELD_LIMITS.authorName) || 'Member',
    photoUrl,
    title: clip(photo.title, PHOTO_FIELD_LIMITS.title) || 'Cosplay Photo',
    character: clip(photo.character, PHOTO_FIELD_LIMITS.character) || 'Original',
    series: clip(photo.series, PHOTO_FIELD_LIMITS.series) || 'Cosplay',
    event: clip(photo.event, PHOTO_FIELD_LIMITS.event) || 'Gathering',
    likesCount: 0,
    createdAt:
      typeof photo.createdAt === 'string' && photo.createdAt ? photo.createdAt.slice(0, 40) : new Date().toISOString(),
  };

  const memberId = clip(photo.memberId, 128);
  if (memberId) payload.memberId = memberId;
  const userId16 = clip(photo.userId16, 24);
  if (userId16) payload.userId16 = userId16;
  const authorCosname = clip(photo.authorCosname, PHOTO_FIELD_LIMITS.authorCosname);
  if (authorCosname) payload.authorCosname = authorCosname;
  const authorNameAlias = clip(photo.authorNameAlias, PHOTO_FIELD_LIMITS.authorNameAlias);
  if (authorNameAlias) payload.authorNameAlias = authorNameAlias;
  if (
    typeof photo.authorAvatar === 'string' &&
    photo.authorAvatar &&
    photo.authorAvatar.length <= PHOTO_FIELD_LIMITS.authorAvatar
  ) {
    payload.authorAvatar = photo.authorAvatar;
  }
  const photographer = clip(photo.photographer, PHOTO_FIELD_LIMITS.photographer);
  if (photographer) payload.photographer = photographer;
  const caption = clip(photo.caption, PHOTO_FIELD_LIMITS.caption);
  if (caption) payload.caption = caption;

  const write = setDoc(photoDocRef, payload);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), PHOTO_WRITE_TIMEOUT_MS);
  });

  try {
    const outcome = await Promise.race([write.then(() => 'written' as const), timeout]);
    if (outcome === 'timeout') {
      console.warn('Photo upload still pending after 15 s; it stays queued and syncs when the connection recovers.');
      write.catch(console.error);
    }
    return id;
  } catch (error) {
    // Real failures (e.g. permission-denied) keep their FirebaseError.code
    return handleFirestoreError(error, OperationType.WRITE, `${PHOTOS_COLLECTION}/${id}`);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Adds exactly one like (rules only allow likesCount + 1 for non-admins). Rejects on error.
export async function toggleLikePhoto(photoId: string, _currentLikes?: number): Promise<void> {
  const photoDocRef = doc(db, PHOTOS_COLLECTION, photoId);
  try {
    await updateDoc(photoDocRef, {
      likesCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PHOTOS_COLLECTION}/${photoId}`);
  }
}

export async function deletePhotoFromFirestore(photoId: string) {
  const photoDocRef = doc(db, PHOTOS_COLLECTION, photoId);
  try {
    await deleteDoc(photoDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PHOTOS_COLLECTION}/${photoId}`);
  }
}
