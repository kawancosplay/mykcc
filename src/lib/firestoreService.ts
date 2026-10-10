import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocsFromServer,
  limit,
  runTransaction,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, isMainAdminUser, checkIsAdminUser } from './firebase';
import type {
  Member,
  MemberCard,
  SyncLog,
  BulkImportResult,
  MemberIdReassignment,
  MemberRepairReport,
} from '../types';
import {
  generateChronologicalUserId16,
  generate16DigitUserId,
  generateUniqueChronologicalUserId16,
  findDuplicateMember,
  isValidUserId16,
  isReservedUserId16,
  MAIN_ACCOUNT_UID,
} from './idGenerator';

export const MEMBERS_COLLECTION = 'members';
// Public, non-private projection used by the KCC ID card lookup (doc id == userId16)
export const MEMBER_CARDS_COLLECTION = 'memberCards';
const SYNC_LOGS_COLLECTION = 'sync_logs';

// Field limits identical to firestore.rules isValidMember(). customRole is the UI input cap so that
// `Lainnya / Others (${custom})` stays within primaryRole's 120 characters.
export const MEMBER_FIELD_LIMITS = {
  name: 80,
  cosplayName: 80,
  fullName: 100,
  email: 120,
  phone: 30,
  discordUsername: 60,
  country: 80,
  province: 80,
  city: 80,
  age: 50,
  ageCategory: 50,
  birthday: 30,
  primaryRole: 120,
  customRole: 100,
  fandom: 80,
  experience: 50,
  socialMedia: 120,
  portfolioUrl: 300,
  reason: 500,
  avatarUrl: 1000000,
  memberNumber: 30,
} as const;

// Fields a member may change on their own profile (firestore.rules memberOwnerEditableKeys()).
// userId16, authUid, email, source, status, createdAt and memberNumber stay locked for non-admins.
export const MEMBER_OWNER_EDITABLE_FIELDS: readonly string[] = [
  'name',
  'cosplayName',
  'fullName',
  'phone',
  'discordUsername',
  'country',
  'province',
  'city',
  'age',
  'ageCategory',
  'birthday',
  'primaryRole',
  'fandom',
  'experience',
  'socialMedia',
  'portfolioUrl',
  'avatarUrl',
  'reason',
];

// Rules allow at most 20 exists()/get() calls per batched write, and an admin identified through
// admins/{uid} costs one exists() per operation, so admin batches (repair, purge) stay at 15 ops.
const ADMIN_BATCH_SIZE = 15;
const WRITE_TIMEOUT_MS = 10000;
const WRITE_TIMEOUT_MESSAGE = 'Write timeout';

const MEMBER_SOURCES: readonly string[] = ['web_form', 'google_form_sync', 'spreadsheet_import'];
const MEMBER_STATUSES: readonly string[] = ['pending', 'verified', 'active'];
const CARD_AVATAR_MAX_LENGTH = 400000;
const CREATED_AT_MAX_LENGTH = 40;

const OPTIONAL_MEMBER_STRING_FIELDS = [
  'fullName',
  'province',
  'phone',
  'discordUsername',
  'age',
  'ageCategory',
  'birthday',
  'experience',
  'socialMedia',
  'portfolioUrl',
  'reason',
  'memberNumber',
] as const;

// Fields the Google Sheets import may refresh on an already matched member
const IMPORT_COMPARE_FIELDS = [
  'name',
  'cosplayName',
  'fullName',
  'email',
  'phone',
  'discordUsername',
  'country',
  'province',
  'city',
  'ageCategory',
  'age',
  'primaryRole',
  'fandom',
  'experience',
  'socialMedia',
  'portfolioUrl',
  'reason',
] as const;

function isFakePlaceholderEmail(email?: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  return lower.endsWith('@kawancosplay.id') || /^member\d*@/i.test(lower);
}

function clampString(value: unknown, maxLength: number): string {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function pickSource(value: unknown): Member['source'] {
  return typeof value === 'string' && MEMBER_SOURCES.includes(value) ? (value as Member['source']) : 'web_form';
}

function pickStatus(value: unknown): Member['status'] {
  return typeof value === 'string' && MEMBER_STATUSES.includes(value) ? (value as Member['status']) : 'verified';
}

function timestampLikeToDate(value: unknown): Date | null {
  if (value && typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      const date = (value as { toDate: () => Date }).toDate();
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }
  return null;
}

// createdAt must be a string of at most 40 characters (rules); ISO strings are kept as they are.
function normalizeCreatedAt(value: unknown): string {
  if (typeof value === 'string' && value.length > 0 && value.length <= CREATED_AT_MAX_LENGTH) return value;
  const fromTimestamp = timestampLikeToDate(value);
  if (fromTimestamp) return fromTimestamp.toISOString();
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function createdAtMs(value: unknown): number {
  if (typeof value === 'string' && value) {
    const ms = Date.parse(value);
    if (!isNaN(ms)) return ms;
  }
  const fromTimestamp = timestampLikeToDate(value);
  if (fromTimestamp) return fromTimestamp.getTime();
  return Number.MAX_SAFE_INTEGER;
}

// Earliest createdAt first; ties (and missing dates) broken by doc id ascending
function compareByCreatedAtThenId(aId: string, aCreatedAt: unknown, bId: string, bCreatedAt: unknown): number {
  const diff = createdAtMs(aCreatedAt) - createdAtMs(bCreatedAt);
  if (diff !== 0) return diff;
  return aId < bId ? -1 : aId > bId ? 1 : 0;
}

function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

/**
 * Waits for a write, but stops waiting after 10 s: the write stays queued in the SDK and syncs once
 * the connection recovers. Every other error (e.g. permission-denied) is rethrown.
 */
async function commitWithTimeout(p: Promise<void>): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(WRITE_TIMEOUT_MESSAGE)), WRITE_TIMEOUT_MS);
  });
  try {
    await Promise.race([p, timeout]);
  } catch (error) {
    if (error instanceof Error && error.message === WRITE_TIMEOUT_MESSAGE) {
      console.warn('Firestore write is still pending after 10 s; it stays queued and syncs when the connection recovers.');
      p.catch((lateError) => console.error('Queued Firestore write failed:', lateError));
      return;
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Normalizes a raw member document for the UI: name fallback, placeholder-email cleanup and a
 * computed userId16 for legacy docs that never stored one.
 */
export function normalizeMember(id: string, raw: Partial<Omit<Member, 'id'>>): Member {
  const data = (raw || {}) as Partial<Omit<Member, 'id'>>;
  const memberName = data.name || data.cosplayName || data.fullName || 'Member';
  const cleanedEmail = isFakePlaceholderEmail(data.email) ? '' : (data.email || '');
  const userId16 = data.userId16 || generateChronologicalUserId16(data.createdAt);

  return {
    ...data,
    id,
    name: memberName,
    cosplayName: memberName,
    email: cleanedEmail,
    userId16,
  } as Member;
}

export function subscribeToMembers(
  onUpdate: (members: Member[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, MEMBERS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const members: Member[] = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data() as Partial<Omit<Member, 'id'>>;

        // Auto-heal (this listener only runs for the admin): clear legacy placeholder emails
        // like memberxxx@kawancosplay.id and fill a missing `name` from legacy cosplayName
        const updates: Record<string, unknown> = {};
        if (isFakePlaceholderEmail(raw.email)) {
          updates.email = '';
        }
        if (!raw.name && raw.cosplayName) {
          updates.name = clampString(raw.cosplayName, MEMBER_FIELD_LIMITS.name);
        }
        if (Object.keys(updates).length > 0) {
          updateDoc(doc(db, MEMBERS_COLLECTION, docSnap.id), updates).catch(console.warn);
        }

        return normalizeMember(docSnap.id, raw);
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

export function subscribeToSyncLogs(
  onUpdate: (logs: SyncLog[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
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

/**
 * Builds a rules-valid member document: values clamped to MEMBER_FIELD_LIMITS, no undefined or empty
 * optional fields, enum-safe source/status, never an `id` key.
 */
export function buildMemberPayload(member: Omit<Member, 'id'>): Record<string, unknown> {
  const L = MEMBER_FIELD_LIMITS;
  const memberName = clampString(member.name || member.cosplayName || member.fullName, L.name) || 'Member';
  const email = clampString(member.email, L.email).toLowerCase();

  const payload: Record<string, unknown> = {
    userId16: isValidUserId16(member.userId16) ? member.userId16 : generate16DigitUserId(member.createdAt),
    name: memberName,
    cosplayName: memberName,
    email: isFakePlaceholderEmail(email) ? '' : email,
    city: clampString(member.city, L.city) || 'Worldwide',
    country: clampString(member.country, L.country) || 'Worldwide',
    primaryRole: clampString(member.primaryRole, L.primaryRole) || 'Cosplay Enthusiast',
    fandom: clampString(member.fandom, L.fandom) || 'Anime & Pop Culture',
    source: pickSource(member.source),
    status: pickStatus(member.status),
    createdAt: normalizeCreatedAt(member.createdAt),
  };

  const authUid = clampString(member.authUid, 128);
  if (authUid) payload.authUid = authUid;

  for (const field of OPTIONAL_MEMBER_STRING_FIELDS) {
    const value = clampString(member[field], L[field]);
    if (value) payload[field] = value;
  }

  // A truncated data URL is useless, so an oversized avatar is dropped instead of clamped
  if (typeof member.avatarUrl === 'string' && member.avatarUrl && member.avatarUrl.length <= L.avatarUrl) {
    payload.avatarUrl = member.avatarUrl;
  }

  return payload;
}

/**
 * Whitelists and clamps the fields a member may edit on their own profile.
 */
export function sanitizeMemberProfileUpdate(fields: Partial<Member>): Record<string, unknown> {
  const source = (fields || {}) as Record<string, unknown>;
  const clean: Record<string, unknown> = {};

  for (const key of MEMBER_OWNER_EDITABLE_FIELDS) {
    if (!(key in source) || source[key] === undefined) continue;
    const value = source[key];

    if (key === 'avatarUrl') {
      const avatar = typeof value === 'string' ? value : '';
      if (avatar.length > MEMBER_FIELD_LIMITS.avatarUrl) {
        throw new Error('Ukuran foto profil terlalu besar. Silakan pilih foto lain. / Profile photo is too large.');
      }
      clean.avatarUrl = avatar;
      continue;
    }

    const maxLength = MEMBER_FIELD_LIMITS[key as keyof typeof MEMBER_FIELD_LIMITS] ?? 500;
    clean[key] = clampString(value, maxLength);
  }

  // name and cosplayName always mirror each other
  if ('name' in clean || 'cosplayName' in clean) {
    const resolvedName = 'name' in clean ? String(clean.name || '') : String(clean.cosplayName || '');
    if (!resolvedName) {
      throw new Error('Nama wajib diisi. / Name is required.');
    }
    clean.name = resolvedName;
    clean.cosplayName = resolvedName;
  }

  if ('city' in clean && !clean.city) {
    clean.city = 'Worldwide';
  }

  return clean;
}

/**
 * Public card projection of a member (no phone, email, age, birthday, discord or reason).
 */
export function buildMemberCard(member: Member | Omit<Member, 'id'>): MemberCard {
  const cosplayName =
    String(member.name || member.cosplayName || member.fullName || 'Member')
      .trim()
      .slice(0, MEMBER_FIELD_LIMITS.cosplayName) || 'Member';

  const card: MemberCard = {
    userId16: member.userId16,
    cosplayName,
    primaryRole: String(member.primaryRole || 'Cosplayer').slice(0, MEMBER_FIELD_LIMITS.primaryRole),
    city: String(member.city || 'Worldwide').slice(0, MEMBER_FIELD_LIMITS.city),
    country: String(member.country || '').slice(0, MEMBER_FIELD_LIMITS.country),
    status: pickStatus(member.status),
    createdAt: normalizeCreatedAt(member.createdAt),
  };

  if (typeof member.avatarUrl === 'string' && member.avatarUrl && member.avatarUrl.length <= CARD_AVATAR_MAX_LENGTH) {
    card.avatarUrl = member.avatarUrl;
  }
  if (typeof member.authUid === 'string' && member.authUid) {
    card.ownerUid = member.authUid.slice(0, 128);
  }

  return card;
}

// Only the keys allowed by firestore.rules memberCardKeys()
function memberCardPayload(card: MemberCard): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    userId16: card.userId16,
    cosplayName: card.cosplayName,
    primaryRole: card.primaryRole,
    city: card.city,
    country: card.country,
    status: card.status,
    createdAt: card.createdAt,
  };
  if (card.avatarUrl) payload.avatarUrl = card.avatarUrl;
  if (card.ownerUid) payload.ownerUid = card.ownerUid;
  return payload;
}

/**
 * Writes memberCards/{userId16} (full replace, no merge). Throws on an invalid ID or a failed write.
 */
export async function upsertMemberCard(card: MemberCard): Promise<void> {
  if (!card || !isValidUserId16(card.userId16)) {
    throw new Error(`KCC ID tidak valid untuk kartu anggota. / Invalid KCC ID for member card: ${card?.userId16 ?? ''}`);
  }
  await setDoc(doc(db, MEMBER_CARDS_COLLECTION, card.userId16), memberCardPayload(card));
}

/**
 * Public lookup by exact 16-digit KCC ID. Returns null for an invalid ID or a missing card;
 * other errors (network, permissions) are thrown.
 */
export async function getMemberCard(userId16: string): Promise<MemberCard | null> {
  const cleanId = String(userId16 ?? '').replace(/\D/g, '');
  if (!isValidUserId16(cleanId)) return null;

  const snap = await getDoc(doc(db, MEMBER_CARDS_COLLECTION, cleanId));
  if (!snap.exists()) return null;

  const data = snap.data() as Partial<MemberCard>;
  const card: MemberCard = {
    userId16: cleanId,
    cosplayName: data.cosplayName || 'Member',
    primaryRole: data.primaryRole || '',
    city: data.city || '',
    country: data.country || '',
    status: pickStatus(data.status),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
  };
  if (data.avatarUrl) card.avatarUrl = data.avatarUrl;
  if (data.ownerUid) card.ownerUid = data.ownerUid;
  return card;
}

export function memberCardToMember(card: MemberCard): Member {
  return {
    id: `card_${card.userId16}`,
    userId16: card.userId16,
    name: card.cosplayName,
    cosplayName: card.cosplayName,
    primaryRole: card.primaryRole,
    city: card.city,
    country: card.country,
    fandom: '',
    avatarUrl: card.avatarUrl,
    source: 'web_form',
    status: card.status,
    createdAt: card.createdAt,
  };
}

/**
 * KCC ID for a new registration. Never derived from form input or the client-side member list:
 * - main account (0000 0000 0000 0000) only for the AUTHENTICATED, verified cosplaysehat@gmail.com
 *   user, and only while that ID has no card yet (later registrations by the main account, e.g.
 *   admin tests, get a regular ID instead of overwriting the main card);
 * - everyone else: chronological ID (generate16DigitUserId) whose memberCards doc does not exist.
 */
export async function assignNewUserId16(): Promise<string> {
  if (isMainAdminUser(auth.currentUser)) {
    const mainCard = await getDoc(doc(db, MEMBER_CARDS_COLLECTION, MAIN_ACCOUNT_UID));
    if (!mainCard.exists()) return MAIN_ACCOUNT_UID;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generate16DigitUserId(new Date());
    if (!isValidUserId16(candidate) || isReservedUserId16(candidate)) continue;
    const existingCard = await getDoc(doc(db, MEMBER_CARDS_COLLECTION, candidate));
    if (!existingCard.exists()) return candidate;
  }

  throw new Error('Gagal membuat KCC ID unik. Silakan coba lagi. / Could not create a unique KCC ID. Please try again.');
}

/**
 * Public registration: writes members/{kc_...} and its public memberCards/{userId16} in one batch.
 * The KCC ID is always assigned here (never taken from form input). Errors are rethrown, except the
 * 10 s write timeout (the write stays queued).
 */
export async function registerMember(member: Omit<Member, 'id' | 'userId16'>): Promise<Member> {
  const userId16 = await assignNewUserId16();
  const currentUid = auth.currentUser?.uid;
  const id = `kc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const payload = buildMemberPayload({
    ...member,
    userId16,
    authUid: currentUid || undefined,
  });
  const card = buildMemberCard(payload as unknown as Omit<Member, 'id'>);

  const batch = writeBatch(db);
  batch.set(doc(db, MEMBERS_COLLECTION, id), payload);
  batch.set(doc(db, MEMBER_CARDS_COLLECTION, userId16), memberCardPayload(card));
  await commitWithTimeout(batch.commit());

  return normalizeMember(id, payload as Partial<Omit<Member, 'id'>>);
}

/**
 * Admin / bulk create: member doc + card in one batch (no merge). Keeps a valid userId16, otherwise
 * generates one from createdAt. Timeout-tolerant; every other error is rethrown.
 */
export async function addMemberToFirestore(member: Omit<Member, 'id'>, customId?: string): Promise<string> {
  const id = customId || `kc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const userId16 = isValidUserId16(member.userId16) ? member.userId16 : generate16DigitUserId(member.createdAt);

  const payload = buildMemberPayload({ ...member, userId16 });
  const card = buildMemberCard(payload as unknown as Omit<Member, 'id'>);

  const batch = writeBatch(db);
  batch.set(doc(db, MEMBERS_COLLECTION, id), payload);
  batch.set(doc(db, MEMBER_CARDS_COLLECTION, userId16), memberCardPayload(card));
  await commitWithTimeout(batch.commit());

  return id;
}

/**
 * Creates members/{docId} (+ card) only if it does not exist yet, inside a transaction.
 * An existing document is returned untouched (its userId16/createdAt are never rewritten).
 */
export async function createMemberIfAbsent(
  docId: string,
  member: Omit<Member, 'id'>
): Promise<{ member: Member; created: boolean }> {
  const memberRef = doc(db, MEMBERS_COLLECTION, docId);
  const userId16 = isValidUserId16(member.userId16) ? member.userId16 : generate16DigitUserId(member.createdAt);
  const payload = buildMemberPayload({ ...member, userId16 });
  const card = buildMemberCard(payload as unknown as Omit<Member, 'id'>);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(memberRef);
    if (snap.exists()) {
      return {
        member: normalizeMember(snap.id, snap.data() as Partial<Omit<Member, 'id'>>),
        created: false,
      };
    }
    tx.set(memberRef, payload);
    tx.set(doc(db, MEMBER_CARDS_COLLECTION, userId16), memberCardPayload(card));
    return {
      member: normalizeMember(docId, payload as Partial<Omit<Member, 'id'>>),
      created: true,
    };
  });
}

export async function bulkImportMembers(
  newMembers: Omit<Member, 'id'>[],
  onProgress?: (completed: number, total: number) => void
): Promise<BulkImportResult> {
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  // Existing members (raw docs) to detect double filled forms / similar data. A failed read aborts
  // the import: continuing with an empty list would insert every row again as a new member.
  const existingSnap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  const existingList: Member[] = existingSnap.docs.map((docSnap) => {
    const raw = docSnap.data() as Omit<Member, 'id'>;
    return { ...raw, id: docSnap.id };
  });

  const usedIds = new Set<string>();
  existingList.forEach((m) => {
    if (isValidUserId16(m.userId16)) usedIds.add(m.userId16);
  });

  for (let i = 0; i < newMembers.length; i++) {
    const m = newMembers[i];
    const mName = m.name || m.cosplayName || 'Member';

    // Check if double filled form with same/similar data exists
    const matched = findDuplicateMember(existingList, {
      phone: m.phone,
      discordUsername: m.discordUsername,
      name: mName,
      cosplayName: mName,
      email: m.email,
      socialMedia: m.socialMedia,
    });

    if (matched) {
      // "double filled form with the same/similar data shares the same user ID": only changed,
      // non-empty fields are written; userId16/createdAt/source/status/authUid are never touched
      const changes: Record<string, unknown> = {};
      for (const field of IMPORT_COMPARE_FIELDS) {
        let incoming = clampString(m[field], MEMBER_FIELD_LIMITS[field]);
        if (!incoming) continue;
        if (field === 'email') incoming = incoming.toLowerCase();
        const current = matched[field] === undefined || matched[field] === null ? '' : String(matched[field]);
        if (incoming !== current) changes[field] = incoming;
      }

      if (Object.keys(changes).length === 0) {
        unchanged++;
      } else {
        try {
          await updateDoc(doc(db, MEMBERS_COLLECTION, matched.id), changes);
          updated++;
          Object.assign(matched, changes);
          if (isValidUserId16(matched.userId16)) {
            try {
              await upsertMemberCard(buildMemberCard(matched));
            } catch (cardError) {
              console.warn(`Could not refresh the member card of ${mName}:`, cardError);
            }
          }
        } catch (err) {
          console.error(`Failed updating duplicate member ${mName}:`, err);
          skipped++;
        }
      }
    } else {
      let userId16 = m.userId16;
      if (!isValidUserId16(userId16) || isReservedUserId16(userId16) || usedIds.has(userId16)) {
        userId16 = generateUniqueChronologicalUserId16(m.createdAt, usedIds);
      }
      usedIds.add(userId16);

      try {
        const id = await addMemberToFirestore({ ...m, userId16 });
        existingList.push({ ...m, userId16, id });
        added++;
      } catch (err) {
        console.error(`Failed importing member ${mName}:`, err);
        skipped++;
      }
    }

    if (onProgress) {
      onProgress(i + 1, newMembers.length);
    }
  }

  return { added, updated, unchanged, skipped };
}

export async function updateMemberStatus(
  memberId: string,
  status: 'pending' | 'verified' | 'active',
  userId16?: string
): Promise<void> {
  const memberDocRef = doc(db, MEMBERS_COLLECTION, memberId);
  try {
    await updateDoc(memberDocRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${memberId}`);
  }

  // Best effort: keep the public card's status in sync
  if (userId16 && isValidUserId16(userId16)) {
    try {
      await updateDoc(doc(db, MEMBER_CARDS_COLLECTION, userId16), { status });
    } catch (error) {
      console.warn(`Could not update the status of member card ${userId16}:`, error);
    }
  }
}

export async function deleteMember(memberId: string, userId16?: string): Promise<void> {
  const memberDocRef = doc(db, MEMBERS_COLLECTION, memberId);
  try {
    await deleteDoc(memberDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MEMBERS_COLLECTION}/${memberId}`);
  }

  // Best effort: remove the public card unless another member still holds this KCC ID
  if (userId16 && isValidUserId16(userId16)) {
    try {
      const holders = await getDocsFromServer(
        query(collection(db, MEMBERS_COLLECTION), where('userId16', '==', userId16), limit(1))
      );
      if (holders.empty) {
        await deleteDoc(doc(db, MEMBER_CARDS_COLLECTION, userId16));
      }
    } catch (error) {
      console.warn(`Could not clean up member card ${userId16}:`, error);
    }
  }
}

async function deleteRefsInBatches(refs: DocumentReference[]): Promise<void> {
  for (let i = 0; i < refs.length; i += ADMIN_BATCH_SIZE) {
    const batch = writeBatch(db);
    refs.slice(i, i + ADMIN_BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

/**
 * Purges all member documents and the member cards of their KCC IDs (admin only)
 */
export async function purgeAllMembersFromFirestore(): Promise<number> {
  const snap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  if (snap.empty) return 0;

  const cardIds = new Set<string>();
  snap.docs.forEach((d) => {
    const storedId = d.data().userId16;
    if (isValidUserId16(storedId)) cardIds.add(storedId);
  });

  const memberRefs: DocumentReference[] = snap.docs.map((d) => doc(db, MEMBERS_COLLECTION, d.id));
  const cardRefs: DocumentReference[] = Array.from(cardIds).map((id) => doc(db, MEMBER_CARDS_COLLECTION, id));

  await deleteRefsInBatches(memberRefs);
  await deleteRefsInBatches(cardRefs);
  return memberRefs.length;
}

export async function recordSyncLog(log: Omit<SyncLog, 'id'>): Promise<string> {
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const logDocRef = doc(db, SYNC_LOGS_COLLECTION, id);

  // Shape and limits identical to firestore.rules isValidSyncLog()
  const payload: Record<string, unknown> = {
    spreadsheetId: String(log.spreadsheetId || '').slice(0, 300),
    importedCount: Math.max(0, Math.floor(Number(log.importedCount) || 0)),
    source: String(log.source || '').slice(0, 80),
    syncedAt:
      typeof log.syncedAt === 'string' && log.syncedAt ? log.syncedAt.slice(0, 40) : new Date().toISOString(),
  };
  if (log.details) payload.details = String(log.details).slice(0, 1000);

  try {
    await setDoc(logDocRef, payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SYNC_LOGS_COLLECTION}/${id}`);
  }
}

/**
 * Members holding a reserved KCC ID (main account 0000 or admin range 0001-0100), except the main
 * account's own doc (userId16 0000... linked to mainAdminUid). Sorted by createdAt ascending.
 */
export function listReservedIdHolders(members: Member[], mainAdminUid: string | null): Member[] {
  return members
    .filter((m) => isReservedUserId16(m.userId16))
    .filter((m) => !(mainAdminUid && m.userId16 === MAIN_ACCOUNT_UID && m.authUid === mainAdminUid))
    .sort((a, b) => compareByCreatedAtThenId(a.id, a.createdAt, b.id, b.createdAt));
}

/**
 * Admin one-click: gives a member a new unique chronological KCC ID (from their createdAt), writes
 * the new card, and removes (or rebuilds for the remaining holder) the card of the old ID.
 */
export async function reassignMemberUserId16(member: Member, allMembers: Member[]): Promise<string> {
  const usedIds = new Set<string>();
  allMembers.forEach((m) => {
    if (isValidUserId16(m.userId16)) usedIds.add(m.userId16);
  });

  const oldId = member.userId16;
  const newId = generateUniqueChronologicalUserId16(member.createdAt, usedIds);

  const batch = writeBatch(db);
  batch.update(doc(db, MEMBERS_COLLECTION, member.id), { userId16: newId });
  batch.set(
    doc(db, MEMBER_CARDS_COLLECTION, newId),
    memberCardPayload(buildMemberCard({ ...member, userId16: newId }))
  );
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${member.id}`);
  }

  if (isValidUserId16(oldId) && oldId !== newId) {
    try {
      const holders = await getDocsFromServer(
        query(collection(db, MEMBERS_COLLECTION), where('userId16', '==', oldId), limit(1))
      );
      if (holders.empty) {
        await deleteDoc(doc(db, MEMBER_CARDS_COLLECTION, oldId));
      } else {
        // The old card may still show this member's data: rebuild it for the remaining holder
        const holder = holders.docs[0];
        await upsertMemberCard(
          buildMemberCard(normalizeMember(holder.id, holder.data() as Partial<Omit<Member, 'id'>>))
        );
      }
    } catch (error) {
      console.warn(`Could not clean up the old member card ${oldId}:`, error);
    }
  }

  return newId;
}

interface RepairRow {
  id: string;
  data: Partial<Omit<Member, 'id'>>;
  storedId: string | null; // stored userId16 when it is a valid 16-digit ID
  target: string | null;
  finalId: string;
}

/**
 * Admin-only, idempotent repair:
 * (1) the main account doc gets 0000 0000 0000 0000, (2) members sharing a KCC ID keep it only for the
 * earliest registration, the rest get unique chronological IDs, (3) members without a valid ID get
 * one, (4) memberCards are rebuilt for every member and cards of IDs nobody holds any more are
 * deleted. A second run reassigns nothing and rewrites identical cards.
 */
export async function repairMemberIdsAndCards(
  onProgress?: (done: number, total: number) => void
): Promise<MemberRepairReport> {
  const currentUser = auth.currentUser;
  if (!(await checkIsAdminUser(currentUser))) {
    throw new Error('Hanya admin yang dapat menjalankan perbaikan. / Admin only.');
  }

  const report: MemberRepairReport = {
    scanned: 0,
    duplicateGroups: 0,
    reassigned: [],
    cardsWritten: 0,
    cardsDeleted: 0,
    reservedHolders: [],
    errors: [],
  };

  // Raw member docs straight from the server
  const snap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  const rows: RepairRow[] = snap.docs.map((d) => {
    const data = d.data() as Partial<Omit<Member, 'id'>>;
    const storedId = isValidUserId16(data.userId16) ? (data.userId16 as string) : null;
    return { id: d.id, data, storedId, target: storedId, finalId: '' };
  });
  report.scanned = rows.length;

  const byCreatedAt = (a: RepairRow, b: RepairRow) =>
    compareByCreatedAtThenId(a.id, a.data.createdAt, b.id, b.data.createdAt);
  const rowName = (r: RepairRow) => String(r.data.name || r.data.cosplayName || r.data.fullName || 'Member');
  const rawStoredId = (r: RepairRow): string | null =>
    typeof r.data.userId16 === 'string' && r.data.userId16 ? r.data.userId16 : null;

  // Main account: the doc linked to the signed-in main admin that already stores 0000 0000 0000 0000
  // (the one its sign-in profile uses), otherwise the earliest doc linked to the main admin
  const mainUid = currentUser && isMainAdminUser(currentUser) ? currentUser.uid : null;
  const mainLinkedRows = mainUid ? rows.filter((r) => r.data.authUid === mainUid).sort(byCreatedAt) : [];
  const founderRow: RepairRow | null =
    mainLinkedRows.find((r) => r.storedId === MAIN_ACCOUNT_UID) || mainLinkedRows[0] || null;
  if (founderRow) founderRow.target = MAIN_ACCOUNT_UID;

  const usedIds = new Set<string>();
  rows.forEach((r) => {
    if (r.target) usedIds.add(r.target);
  });

  const reassign = (r: RepairRow, reason: MemberIdReassignment['reason']) => {
    const newId = generateUniqueChronologicalUserId16(r.data.createdAt, usedIds);
    usedIds.add(newId);
    r.finalId = newId;
    report.reassigned.push({
      memberId: r.id,
      name: rowName(r),
      fromUserId16: rawStoredId(r),
      toUserId16: newId,
      reason,
    });
  };

  // Duplicated KCC IDs: keep the founder (for 0000) or the earliest registration, reassign the rest
  const groups = new Map<string, RepairRow[]>();
  rows.forEach((r) => {
    if (!r.target) return;
    const group = groups.get(r.target);
    if (group) group.push(r);
    else groups.set(r.target, [r]);
  });
  groups.forEach((groupRows, targetId) => {
    if (groupRows.length === 1) {
      groupRows[0].finalId = targetId;
      return;
    }
    report.duplicateGroups++;
    const sorted = [...groupRows].sort(byCreatedAt);
    const keeper =
      targetId === MAIN_ACCOUNT_UID && founderRow && groupRows.includes(founderRow) ? founderRow : sorted[0];
    keeper.finalId = targetId;
    sorted.forEach((r) => {
      if (r !== keeper) reassign(r, 'duplicate');
    });
  });

  if (founderRow && founderRow.finalId === MAIN_ACCOUNT_UID && founderRow.storedId !== MAIN_ACCOUNT_UID) {
    report.reassigned.push({
      memberId: founderRow.id,
      name: rowName(founderRow),
      fromUserId16: rawStoredId(founderRow),
      toUserId16: MAIN_ACCOUNT_UID,
      reason: 'main_account',
    });
  }

  // Members without a valid stored KCC ID
  rows
    .filter((r) => !r.target)
    .sort(byCreatedAt)
    .forEach((r) => reassign(r, 'missing'));

  const changedRows = rows.filter((r) => r.finalId !== r.data.userId16);
  const plannedStaleIds = new Set(
    rows.filter((r) => r.storedId && r.storedId !== r.finalId).map((r) => r.storedId as string)
  );
  const total = changedRows.length + rows.length + plannedStaleIds.size;
  let done = 0;
  const failedRowIds = new Set<string>();

  // Persist the new KCC IDs
  for (let i = 0; i < changedRows.length; i += ADMIN_BATCH_SIZE) {
    const chunk = changedRows.slice(i, i + ADMIN_BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((r) => batch.update(doc(db, MEMBERS_COLLECTION, r.id), { userId16: r.finalId }));
    try {
      await batch.commit();
    } catch (error) {
      chunk.forEach((r) => failedRowIds.add(r.id));
      report.errors.push(`KCC ID update failed (${chunk.map((r) => r.id).join(', ')}): ${errorText(error)}`);
    }
    done += chunk.length;
    if (onProgress) onProgress(done, total);
  }

  // (Re)build the public card of every member whose ID is now persisted (ownerUid = authUid)
  const cardRows = rows.filter((r) => !failedRowIds.has(r.id));
  for (let i = 0; i < cardRows.length; i += ADMIN_BATCH_SIZE) {
    const chunk = cardRows.slice(i, i + ADMIN_BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((r) =>
      batch.set(
        doc(db, MEMBER_CARDS_COLLECTION, r.finalId),
        memberCardPayload(buildMemberCard({ ...r.data, userId16: r.finalId } as Omit<Member, 'id'>))
      )
    );
    try {
      await batch.commit();
      report.cardsWritten += chunk.length;
    } catch (error) {
      report.errors.push(`Member card write failed (${chunk.map((r) => r.finalId).join(', ')}): ${errorText(error)}`);
    }
    done += chunk.length;
    if (onProgress) onProgress(done, total);
  }

  // Delete cards of old IDs that no member holds any more
  const heldIds = new Set<string>();
  rows.forEach((r) => {
    if (failedRowIds.has(r.id)) {
      if (r.storedId) heldIds.add(r.storedId);
    } else {
      heldIds.add(r.finalId);
    }
  });
  const staleIds = Array.from(
    new Set(
      rows
        .filter((r) => !failedRowIds.has(r.id) && r.storedId && r.storedId !== r.finalId)
        .map((r) => r.storedId as string)
    )
  ).filter((id) => !heldIds.has(id));
  for (let i = 0; i < staleIds.length; i += ADMIN_BATCH_SIZE) {
    const chunk = staleIds.slice(i, i + ADMIN_BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((id) => batch.delete(doc(db, MEMBER_CARDS_COLLECTION, id)));
    try {
      await batch.commit();
      report.cardsDeleted += chunk.length;
    } catch (error) {
      report.errors.push(`Member card delete failed (${chunk.join(', ')}): ${errorText(error)}`);
    }
    done += chunk.length;
    if (onProgress) onProgress(done, total);
  }

  report.reassigned = report.reassigned.filter((entry) => !failedRowIds.has(entry.memberId));
  const finalMembers = rows.map((r) =>
    normalizeMember(r.id, { ...r.data, userId16: failedRowIds.has(r.id) ? r.data.userId16 : r.finalId })
  );
  report.reservedHolders = listReservedIdHolders(finalMembers, mainUid);

  if (onProgress) onProgress(total, total);
  return report;
}
