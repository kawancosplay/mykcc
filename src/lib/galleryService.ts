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
  authorName: 60,
  authorCosname: 80,
  authorNameAlias: 80,
  authorAvatar: 2048,
  title: 120,
  character: 80,
  series: 80,
  event: 100,
  photographer: 80,
  caption: 500,
  photoUrl: 1000000,
} as const;

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

  // Only the keys allowed by firestore.rules, clamped to the rule limits
  const payload: Record<string, unknown> = {
    authorUid: currentUser.uid,
    authorName: clip(photo.authorName, PHOTO_FIELD_LIMITS.authorName) || 'Member',
    photoUrl,
    title: clip(photo.title, PHOTO_FIELD_LIMITS.title),
    character: clip(photo.character, PHOTO_FIELD_LIMITS.character),
    series: clip(photo.series, PHOTO_FIELD_LIMITS.series),
    event: clip(photo.event, PHOTO_FIELD_LIMITS.event),
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

  try {
    await setDoc(photoDocRef, payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PHOTOS_COLLECTION}/${id}`);
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
