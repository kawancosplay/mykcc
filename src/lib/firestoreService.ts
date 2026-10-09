import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Member, SyncLog } from '../types';
import {
  generateChronologicalUserId16,
  resolveMemberUserId16,
  findDuplicateMember,
  MAIN_ACCOUNT_UID,
  MAIN_ACCOUNT_EMAIL,
} from './idGenerator';

const MEMBERS_COLLECTION = 'members';
const SYNC_LOGS_COLLECTION = 'sync_logs';

function isFakePlaceholderEmail(email?: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return lower.endsWith('@kawancosplay.id') || /^member\d*@/i.test(lower);
}

export function subscribeToMembers(
  onUpdate: (members: Member[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, MEMBERS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const members: Member[] = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data() as Omit<Member, 'id'>;
        const isFounder = raw.email && raw.email.toLowerCase().trim() === MAIN_ACCOUNT_EMAIL;
        const userId16 = isFounder ? MAIN_ACCOUNT_UID : (raw.userId16 || generateChronologicalUserId16(raw.createdAt));

        // Clean up any legacy generated placeholder emails like memberxxx@kawancosplay.id
        const hasPlaceholderEmail = isFakePlaceholderEmail(raw.email);
        const cleanedEmail = hasPlaceholderEmail ? '' : (raw.email || '');

        // Auto-heal / fix database document immediately in Firestore if needed
        const updates: Record<string, unknown> = {};
        if (isFounder && raw.userId16 !== MAIN_ACCOUNT_UID) {
          updates.userId16 = MAIN_ACCOUNT_UID;
        }
        if (hasPlaceholderEmail) {
          updates.email = '';
        }
        if (Object.keys(updates).length > 0) {
          updateDoc(doc(db, MEMBERS_COLLECTION, docSnap.id), updates).catch(console.warn);
        }

        return {
          id: docSnap.id,
          ...raw,
          email: cleanedEmail,
          userId16,
        };
      });
      onUpdate(members);
    },
    (error) => {
      console.error('Subscription error on members collection:', error);
      if (onError) onError(error as Error);
      try {
        handleFirestoreError(error, OperationType.LIST, MEMBERS_COLLECTION);
      } catch (e) {
        // Handled
      }
    }
  );
}

export async function repairFounderIdInFirestore(): Promise<void> {
  try {
    const q = query(collection(db, MEMBERS_COLLECTION));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data();
      const isFounder = data.email && typeof data.email === 'string' && data.email.toLowerCase().trim() === MAIN_ACCOUNT_EMAIL;
      const hasFakeEmail = typeof data.email === 'string' && isFakePlaceholderEmail(data.email);
      const updates: Record<string, unknown> = {};
      if (isFounder && data.userId16 !== MAIN_ACCOUNT_UID) {
        updates.userId16 = MAIN_ACCOUNT_UID;
      }
      if (hasFakeEmail) {
        updates.email = '';
      }
      if (Object.keys(updates).length > 0) {
        updateDoc(doc(db, MEMBERS_COLLECTION, d.id), updates).catch(console.warn);
      }
    });
  } catch (err) {
    console.warn('repairFounderIdInFirestore note:', err);
  }
}

export function subscribeToSyncLogs(
  onUpdate: (logs: SyncLog[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, SYNC_LOGS_COLLECTION), orderBy('syncedAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: SyncLog[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<SyncLog, 'id'>),
      }));
      onUpdate(logs);
    },
    (error) => {
      console.error('Subscription error on sync_logs collection:', error);
      if (onError) onError(error as Error);
      try {
        handleFirestoreError(error, OperationType.LIST, SYNC_LOGS_COLLECTION);
      } catch (e) {
        // Handled
      }
    }
  );
}

export async function addMemberToFirestore(member: Omit<Member, 'id'>, customId?: string): Promise<string> {
  const id = customId || `kc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const memberDocRef = doc(db, MEMBERS_COLLECTION, id);

  const resolvedUserId16 =
    member.userId16 ||
    resolveMemberUserId16({
      email: member.email,
      role: member.primaryRole,
      dateInput: member.createdAt,
    });

  // Clean data object without undefined values; empty email supported as requested
  const payload: Record<string, unknown> = {
    userId16: resolvedUserId16,
    name: member.name,
    email: member.email || '',
    city: member.city || 'Worldwide',
    country: member.country || 'Worldwide',
    primaryRole: member.primaryRole || 'Cosplay Enthusiast',
    fandom: member.fandom || 'Anime & Pop Culture',
    source: member.source,
    status: member.status,
    createdAt: member.createdAt,
  };

  if (member.fullName) payload.fullName = member.fullName;
  if (member.authUid) payload.authUid = member.authUid;
  if (member.province) payload.province = member.province;
  if (member.phone) payload.phone = member.phone;
  if (member.discordUsername) payload.discordUsername = member.discordUsername;
  if (member.age) payload.age = member.age;
  if (member.ageCategory) payload.ageCategory = member.ageCategory;
  if (member.birthday) payload.birthday = member.birthday;
  if (member.experience) payload.experience = member.experience;
  if (member.socialMedia) payload.socialMedia = member.socialMedia;
  if (member.portfolioUrl) payload.portfolioUrl = member.portfolioUrl;
  if (member.avatarUrl) payload.avatarUrl = member.avatarUrl;
  if (member.reason) payload.reason = member.reason;

  try {
    await setDoc(memberDocRef, payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MEMBERS_COLLECTION}/${id}`);
    throw error;
  }
}

export async function bulkImportMembers(
  newMembers: Omit<Member, 'id'>[],
  onProgress?: (completed: number, total: number) => void
): Promise<{ added: number; updated: number; skipped: number }> {
  let added = 0;
  let updated = 0;
  let skipped = 0;

  // Retrieve existing members to detect double filled forms / similar data
  const existingList: Member[] = [];
  try {
    const existingSnap = await getDocs(collection(db, MEMBERS_COLLECTION));
    existingSnap.forEach((docSnap) => {
      existingList.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Member, 'id'>),
      });
    });
  } catch (e) {
    console.warn('Could not read existing members for duplicate check:', e);
  }

  for (let i = 0; i < newMembers.length; i++) {
    const m = newMembers[i];

    // Check if double filled form with same/similar data exists
    const matched = findDuplicateMember(existingList, {
      phone: m.phone,
      discordUsername: m.discordUsername,
      cosplayName: m.cosplayName,
      email: m.email,
      socialMedia: m.socialMedia,
    });

    if (matched) {
      // "double filled form with the same/similar data shares the same user ID"
      try {
        await addMemberToFirestore(
          {
            ...m,
            userId16: matched.userId16, // Reuse identical 16-digit User ID
          },
          matched.id
        );
        updated++;
      } catch (err) {
        console.error(`Failed updating duplicate member ${m.cosplayName}:`, err);
        skipped++;
      }
    } else {
      try {
        const id = await addMemberToFirestore(m);
        existingList.push({ id, ...m });
        added++;
      } catch (err) {
        console.error(`Failed importing member ${m.cosplayName}:`, err);
        skipped++;
      }
    }

    if (onProgress) {
      onProgress(i + 1, newMembers.length);
    }
  }

  return { added, updated, skipped };
}

export async function updateMemberStatus(memberId: string, status: 'pending' | 'verified' | 'active') {
  const memberDocRef = doc(db, MEMBERS_COLLECTION, memberId);
  try {
    await updateDoc(memberDocRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${memberId}`);
  }
}

export async function deleteMember(memberId: string) {
  const memberDocRef = doc(db, MEMBERS_COLLECTION, memberId);
  try {
    await deleteDoc(memberDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MEMBERS_COLLECTION}/${memberId}`);
  }
}

/**
 * Purges all member documents from Firestore collection in high-speed batches
 */
export async function purgeAllMembersFromFirestore(): Promise<number> {
  const snap = await getDocs(collection(db, MEMBERS_COLLECTION));
  if (snap.empty) return 0;

  const docs = snap.docs;
  const chunkSize = 400;
  let deleted = 0;

  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const d of chunk) {
      batch.delete(doc(db, MEMBERS_COLLECTION, d.id));
    }
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

export async function recordSyncLog(log: Omit<SyncLog, 'id'>): Promise<string> {
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const logDocRef = doc(db, SYNC_LOGS_COLLECTION, id);

  const payload = {
    spreadsheetId: log.spreadsheetId,
    importedCount: log.importedCount,
    source: log.source,
    syncedAt: log.syncedAt,
    ...(log.details ? { details: log.details } : {}),
  };

  try {
    await setDoc(logDocRef, payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SYNC_LOGS_COLLECTION}/${id}`);
    throw error;
  }
}

// Initial Community Seeds:
// - UID 0000 0000 0000 0000 is assigned for KCC main account
// - UID 0000 0000 0000 0001 to 0000 0000 0000 0100 is assigned to KCC admin
// - Regular members have User IDs arranged strictly based on timestamp
export const SEED_MEMBERS: Omit<Member, 'id'>[] = [
  {
    userId16: '0000000000000000', // KCC Main Account
    fullName: 'Rian Pratama',
    name: 'Rian_Cos / Ken',
    email: 'cosplaysehat@gmail.com', // KCC Main Account email
    phone: '081298765432',
    discordUsername: 'rian_cos#0001',
    country: 'Indonesia',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    age: '24',
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    primaryRole: 'KCC Main Account & Community Leader',
    fandom: 'Genshin Impact & Honkai: Star Rail',
    experience: '> 3 tahun',
    socialMedia: '@rian_cosplays',
    portfolioUrl: 'https://instagram.com/rian_cosplays',
    reason: 'Mendirikan KawanCosplay untuk wadah silaturahmi teman-teman cosplay sehat, suportif, dan ramah pemula internasional.',
    source: 'web_form',
    status: 'verified',
    createdAt: new Date('2026-01-10T10:00:00Z').toISOString(),
  },
  {
    userId16: '0000000000000001', // KCC Admin Slot 0001 (UID 0000 0000 0000 0001 to 0000 0000 0000 0100)
    fullName: 'Alya Putri Salsabila',
    name: 'AlyaChan',
    email: '',
    phone: '085712345678',
    discordUsername: 'alyachan_cos',
    country: 'Indonesia',
    province: 'Jawa Barat',
    city: 'Kota Bandung',
    age: '22',
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    primaryRole: 'KCC Admin & Community Coordinator',
    fandom: 'Frieren: Beyond Journey\'s End & Bocchi The Rock',
    experience: '1 - 3 tahun',
    socialMedia: '@alyacos.id',
    portfolioUrl: 'https://instagram.com/alyacos.id',
    reason: 'Admin KawanCosplay Regional Jawa Barat.',
    source: 'google_form_sync',
    status: 'verified',
    createdAt: new Date('2026-01-15T14:30:00Z').toISOString(),
  },
  {
    userId16: '2026012009150003', // Arranged based on timestamp: 2026-01-20 09:15:00
    fullName: 'Dimas Ardiansyah',
    name: 'DimCraft Props',
    email: '',
    phone: '081399887766',
    discordUsername: 'dimcraft_3d',
    country: 'Indonesia',
    province: 'Jawa Timur',
    city: 'Kota Surabaya',
    age: '26',
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    primaryRole: 'Prop Maker / Crafter',
    fandom: 'Kamen Rider, Tokusatsu & Monster Hunter',
    experience: 'Veteran',
    socialMedia: '@dimas.propstudio',
    portfolioUrl: 'https://tiktok.com/@dimascrafts',
    reason: 'Suka membuat senjata EVA foam 3D dan ingin berbagi ilmu crafting gratis ke member KawanCosplay.',
    source: 'spreadsheet_import',
    status: 'verified',
    createdAt: new Date('2026-01-20T09:15:00Z').toISOString(),
  },
  {
    userId16: '2026020116000004', // Arranged based on timestamp: 2026-02-01 16:00:00
    fullName: 'Cindy Claudia',
    name: 'CinnyLens',
    email: '',
    phone: '082155443322',
    discordUsername: 'cinnylens',
    country: 'Indonesia',
    province: 'D.I. Yogyakarta',
    city: 'Kota Yogyakarta',
    age: '23',
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    primaryRole: 'Cosplay Photographer / Videographer',
    fandom: 'Hololive, Nijisanji & VTuber',
    experience: '1 - 3 tahun',
    socialMedia: '@cinnylens.art',
    portfolioUrl: 'https://drive.google.com/drive/folders/cosplay-shots',
    reason: 'Mencari partner cosplayer untuk hunting outdoor di Jogja dan sharing teknik lighting photoshoot.',
    source: 'google_form_sync',
    status: 'verified',
    createdAt: new Date('2026-02-01T16:00:00Z').toISOString(),
  },
  {
    userId16: '2026021411200005', // Arranged based on timestamp: 2026-02-14 11:20:00
    fullName: 'Farhan Naufal',
    name: 'Kitsune_Naufal',
    email: '',
    phone: '087811223344',
    discordUsername: 'kitsune_naufal',
    country: 'Indonesia',
    province: 'Jawa Tengah',
    city: 'Kota Semarang',
    age: '20',
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    primaryRole: 'Cosplay Supporter / Crew',
    fandom: 'Jujutsu Kaisen & Demon Slayer',
    experience: 'Pemula (< 1 tahun)',
    socialMedia: '@farhannaufal.99',
    reason: 'Baru pertama kali masuk dunia jejepangan, ingin punya banyak kawan sehobi yang seru dan asik.',
    source: 'web_form',
    status: 'verified',
    createdAt: new Date('2026-02-14T11:20:00Z').toISOString(),
  },
];

/**
 * Disabled automatic re-seeding to guarantee purged database stays clean
 */
export async function checkAndSeedCommunityIfEmpty(): Promise<boolean> {
  return false;
}

/**
 * Allows admin to manually seed initial demo members if desired
 */
export async function seedCommunityMembersManually(): Promise<number> {
  for (const member of SEED_MEMBERS) {
    await addMemberToFirestore(member);
  }
  return SEED_MEMBERS.length;
}
