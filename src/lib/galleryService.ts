import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Photo } from '../types';

const PHOTOS_COLLECTION = 'photos';

export const SEED_PHOTOS: Omit<Photo, 'id'>[] = [
  {
    authorName: 'Rian_Cos / Ken',
    userId16: '8344104185329901',
    authorAvatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    title: 'Raiden Shogun - Musou no Hitotachi',
    character: 'Raiden Shogun (Ei)',
    series: 'Genshin Impact',
    event: 'Comic Frontier 18 (Comifuro ICE BSD)',
    photographer: 'CinnyLens Art',
    caption: 'Photoshoot panggung utama Comifuro 18 bersama rekan-rekan KawanCosplay. Lighting natural sore hari.',
    likesCount: 142,
    createdAt: new Date('2026-02-15T13:00:00Z').toISOString(),
  },
  {
    authorName: 'AlyaChan',
    userId16: '1026849251903847',
    authorAvatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    title: 'Frieren - Beyond Journey\'s End Peaceful Field',
    character: 'Frieren',
    series: 'Sousou no Frieren',
    event: 'Anime Festival Asia (AFA ID)',
    photographer: 'Dimas Lens Studio',
    caption: 'Cosplay perdana Frieren di AFA! Tongkat sihir buatan kak DimCraft dari KawanCosplay.',
    likesCount: 218,
    createdAt: new Date('2026-02-20T10:30:00Z').toISOString(),
  },
  {
    authorName: 'DimCraft Props',
    userId16: '4920158439021847',
    authorAvatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    title: 'Kamen Rider Geats Magnum Boost Armor Full EVA',
    character: 'Kamen Rider Geats',
    series: 'Kamen Rider Series',
    event: 'Indonesia Comic Con (ICC JCC Senayan)',
    photographer: 'Rian Studio',
    caption: 'Armor armor crafting 100% EVA foam 3D dengan finishing automotive paint candy red.',
    likesCount: 305,
    createdAt: new Date('2026-02-25T15:45:00Z').toISOString(),
  },
  {
    authorName: 'Kitsune_Naufal',
    userId16: '7201948301928475',
    authorAvatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    title: 'Furina - All Eyes On Me Fontaine Court',
    character: 'Furina de Fontaine',
    series: 'Genshin Impact',
    event: 'KawanCosplay Bandung Gathering 2026',
    photographer: 'Alya Photography',
    caption: 'Gathering bulanan KawanCosplay di Kiara Artha Park Bandung. Suasananya sejuk dan seru banget!',
    likesCount: 189,
    createdAt: new Date('2026-03-01T11:20:00Z').toISOString(),
  },
  {
    authorName: 'CinnyLens',
    userId16: '3819204958291048',
    authorAvatar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    title: 'Gojo Satoru - Domain Expansion Infinite Void',
    character: 'Gojo Satoru',
    series: 'Jujutsu Kaisen',
    event: 'Jakarta Cosplay Parade Monas',
    photographer: 'CinnyLens Art',
    caption: 'Photoshoot malam dengan smoke effect & blue gel flash di Jakarta Cosplay Parade.',
    likesCount: 264,
    createdAt: new Date('2026-03-05T19:15:00Z').toISOString(),
  },
];

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

function sanitizeFirestorePayload(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = sanitizeFirestorePayload(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export async function addPhotoToFirestore(photo: Omit<Photo, 'id'>): Promise<string> {
  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const photoDocRef = doc(db, PHOTOS_COLLECTION, id);

  const authorName = (photo.authorName || 'Member').trim().substring(0, 100);

  const rawPayload: Record<string, any> = {
    authorName,
    photoUrl: photo.photoUrl,
    title: (photo.title || 'Cosplay Photo').trim().substring(0, 120),
    character: (photo.character || 'Original').trim().substring(0, 100),
    series: (photo.series || 'Cosplay').trim().substring(0, 100),
    event: (photo.event || 'Gathering').trim().substring(0, 120),
    likesCount: typeof photo.likesCount === 'number' ? photo.likesCount : 0,
    createdAt: photo.createdAt || new Date().toISOString(),
  };

  if (photo.memberId) rawPayload.memberId = photo.memberId;
  if (photo.userId16) rawPayload.userId16 = photo.userId16;
  if (photo.authorCosname) rawPayload.authorCosname = photo.authorCosname;
  if (photo.authorNameAlias) rawPayload.authorNameAlias = photo.authorNameAlias;
  if (photo.authorAvatar) rawPayload.authorAvatar = photo.authorAvatar;
  if (photo.photographer && photo.photographer.trim()) {
    rawPayload.photographer = photo.photographer.trim().substring(0, 100);
  }
  if (photo.caption && photo.caption.trim()) {
    rawPayload.caption = photo.caption.trim().substring(0, 1000);
  }

  const cleanPayload = sanitizeFirestorePayload(rawPayload);

  try {
    await Promise.race([
      setDoc(photoDocRef, cleanPayload),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Write photo timeout')), 8000)),
    ]);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PHOTOS_COLLECTION}/${id}`);
  }
}

export async function toggleLikePhoto(photoId: string, currentLikes: number = 0) {
  const photoDocRef = doc(db, PHOTOS_COLLECTION, photoId);
  try {
    await updateDoc(photoDocRef, {
      likesCount: currentLikes + 1,
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

export async function checkAndSeedPhotosIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(query(collection(db, PHOTOS_COLLECTION), limit(1)));
    if (snap.empty) {
      console.log('Seeding initial community cosplay photos...');
      for (const p of SEED_PHOTOS) {
        await addPhotoToFirestore(p);
      }
      return true;
    }
  } catch (err) {
    console.warn('Photo seed check note:', err);
  }
  return false;
}
