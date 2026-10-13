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
  startAfter,
  getDocs,
  getDocsFromServer,
  writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, requireAdminUser } from './firebase';
import { buildAdminLog } from './adminLogService';
import { isValidKccId } from './idGenerator';
import type { Photo, PhotoPage, PhotoPageCursor } from '../types';
import { translate } from '../i18n';

export const PHOTOS_COLLECTION = 'photos';

/** Public gallery page size (12 + "load more"). */
export const PUBLIC_GALLERY_PAGE_SIZE = 12;
/** Admin Gallery tab page size. */
export const ADMIN_GALLERY_PAGE_SIZE = 24;
// firestore.rules: photos list only with limit <= 100, and a page asks for pageSize + 1 docs
const MAX_PHOTO_PAGE_SIZE = 99;

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

/**
 * @deprecated Live listener of the newest 100 photos (~320 KB on every page load). Use fetchPhotosPage
 * when the gallery is opened; kept until the last caller is removed.
 */
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

/**
 * One-shot page of photos, newest first: orderBy('createdAt','desc') [+ startAfter(cursor)] +
 * limit(pageSize + 1). pageSize is clamped to 1..99 (rules: limit <= 100); hasMore = more than pageSize
 * docs came back. Ties on createdAt are handled by startAfter(docSnapshot) (Firestore adds the doc id to
 * the order). source 'server' (admin) reads from the server; default lets the SDK use its cache rules.
 * Read errors are thrown.
 */
export async function fetchPhotosPage(options: {
  pageSize: number;
  cursor?: PhotoPageCursor | null;
  source?: 'default' | 'server';
}): Promise<PhotoPage> {
  const pageSize = Math.max(1, Math.min(MAX_PHOTO_PAGE_SIZE, Math.floor(Number(options?.pageSize) || PUBLIC_GALLERY_PAGE_SIZE)));
  const cursorSnap = (options?.cursor ?? null) as unknown as QueryDocumentSnapshot | null;
  const q = cursorSnap
    ? query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'), startAfter(cursorSnap), limit(pageSize + 1))
    : query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'), limit(pageSize + 1));

  let snap;
  try {
    snap = options?.source === 'server' ? await getDocsFromServer(q) : await getDocs(q);
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, PHOTOS_COLLECTION);
  }

  const docs = snap.docs.slice(0, pageSize);
  const last = docs.length > 0 ? docs[docs.length - 1] : null;
  return {
    photos: docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Photo, 'id'>) })),
    cursor: last ? (last as unknown as PhotoPageCursor) : (options?.cursor ?? null),
    hasMore: snap.docs.length > pageSize,
  };
}

/**
 * Admin: deletes a photo together with its photo_deleted audit log entry (one batch, 2 ops).
 * targetLabel = title / character, details = uploader name. Errors are thrown.
 */
export async function deletePhotoAsAdmin(photo: Photo): Promise<void> {
  await requireAdminUser();
  if (!photo?.id) return;
  const uploader = clip(photo.authorCosname, PHOTO_FIELD_LIMITS.authorCosname) || clip(photo.authorName, PHOTO_FIELD_LIMITS.authorName);
  const log = buildAdminLog({
    action: 'photo_deleted',
    targetType: 'photo',
    targetId: photo.id,
    targetLabel: clip(photo.title, 120) || clip(photo.character, 120) || undefined,
    details: uploader ? `uploader: ${uploader}` : undefined,
  });
  const batch = writeBatch(db);
  batch.delete(doc(db, PHOTOS_COLLECTION, photo.id));
  batch.set(log.ref, log.data);
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PHOTOS_COLLECTION}/${photo.id}`);
  }
}

function clip(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export async function addPhotoToFirestore(photo: Omit<Photo, 'id'>): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    const authError = new Error(translate('errors.photoSignInRequired')) as Error & { code?: string };
    authError.code = 'unauthenticated';
    throw authError;
  }

  const photoUrl = typeof photo.photoUrl === 'string' ? photo.photoUrl : '';
  if (photoUrl.length > PHOTO_FIELD_LIMITS.photoUrl) {
    throw new Error(translate('errors.photoTooLarge'));
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
  // The uploader's current KCC ID (8 digits after the switch, 16 before); display only
  const userId16 = typeof photo.userId16 === 'string' ? photo.userId16.replace(/[\s-]/g, '') : '';
  if (isValidKccId(userId16)) payload.userId16 = userId16;
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
