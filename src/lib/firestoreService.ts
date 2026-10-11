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
  getDocFromServer,
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
  DuplicateRegistrationGroup,
} from '../types';
import {
  generateChronologicalUserId16,
  generate16DigitUserId,
  generateUniqueChronologicalUserId16,
  findDuplicateMember,
  extractAllPhones,
  isValidUserId16,
  isReservedUserId16,
  mergeMemberPhones,
  MAX_ADDITIONAL_PHONES,
  MAIN_ACCOUNT_UID,
} from './idGenerator';
import { translate } from '../i18n';

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
  phone2: 30,
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
  'phone2',
  'additionalPhones',
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

// Phone numbers (phone, phone2, additionalPhones) are handled by mergeMemberPhones instead
const OPTIONAL_MEMBER_STRING_FIELDS = [
  'fullName',
  'province',
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

// Fields the Google Sheets import may refresh on an already matched member (phone numbers are merged
// separately through mergeMemberPhones)
const IMPORT_COMPARE_FIELDS = [
  'name',
  'cosplayName',
  'fullName',
  'email',
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

  // Phone numbers: trimmed, clamped to 30, de-duplicated; phone2 and up to 3 additionalPhones
  const phones = mergeMemberPhones(null, member);
  if (phones.phone) payload.phone = phones.phone;
  if (phones.phone2) payload.phone2 = phones.phone2;
  if (phones.additionalPhones?.length) payload.additionalPhones = phones.additionalPhones;

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
        throw new Error(translate('errors.profilePhotoTooLarge'));
      }
      clean.avatarUrl = avatar;
      continue;
    }

    if (key === 'additionalPhones') {
      // A list (never clamped as a string): up to 3 non-empty strings of at most 30 characters
      clean.additionalPhones = Array.isArray(value)
        ? value
            .filter((p): p is string => typeof p === 'string')
            .map((p) => p.trim().slice(0, MEMBER_FIELD_LIMITS.phone))
            .filter((p) => p.length > 0)
            .slice(0, MAX_ADDITIONAL_PHONES)
        : [];
      continue;
    }

    const maxLength = MEMBER_FIELD_LIMITS[key as keyof typeof MEMBER_FIELD_LIMITS] ?? 500;
    clean[key] = clampString(value, maxLength);
  }

  // name and cosplayName always mirror each other
  if ('name' in clean || 'cosplayName' in clean) {
    const resolvedName = 'name' in clean ? String(clean.name || '') : String(clean.cosplayName || '');
    if (!resolvedName) {
      throw new Error(translate('errors.nameRequired'));
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
    throw new Error(translate('errors.invalidCardId', { id: card?.userId16 ?? '' }));
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
 * `allowMainAccount: false` (a registration the main account creates for SOMEONE ELSE, not linked to
 * it) never receives the main account ID.
 */
export async function assignNewUserId16(options?: { allowMainAccount?: boolean }): Promise<string> {
  if (options?.allowMainAccount !== false && isMainAdminUser(auth.currentUser)) {
    const mainCard = await getDoc(doc(db, MEMBER_CARDS_COLLECTION, MAIN_ACCOUNT_UID));
    if (!mainCard.exists()) return MAIN_ACCOUNT_UID;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generate16DigitUserId(new Date());
    if (!isValidUserId16(candidate) || isReservedUserId16(candidate)) continue;
    const existingCard = await getDoc(doc(db, MEMBER_CARDS_COLLECTION, candidate));
    if (!existingCard.exists()) return candidate;
  }

  throw new Error(translate('errors.uniqueIdFailed'));
}

/**
 * Public registration: writes members/{kc_...} and its public memberCards/{userId16} in one batch.
 * The KCC ID is always assigned here (never taken from form input). Errors are rethrown, except the
 * 10 s write timeout (the write stays queued).
 * The new doc is linked (authUid) to the signed-in user unless `options.linkToCurrentUser` is false
 * (an admin registering someone else must not own that registration).
 */
export async function registerMember(
  member: Omit<Member, 'id' | 'userId16'>,
  options?: { linkToCurrentUser?: boolean }
): Promise<Member> {
  const linkToCurrentUser = options?.linkToCurrentUser !== false;
  // Only a registration linked to the main account may receive its 0000 ID
  const userId16 = await assignNewUserId16({ allowMainAccount: linkToCurrentUser });
  const currentUid = linkToCurrentUser ? auth.currentUser?.uid : undefined;
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

    // Check if double filled form with same/similar data exists (member fills form > 1x)
    const matched = findDuplicateMember(existingList, {
      phone: m.phone,
      phone2: m.phone2,
      additionalPhones: m.additionalPhones,
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

      // Phone numbers are merged, not replaced: the existing primary stays primary and a new number
      // from the sheet is kept as phone2 / additionalPhones
      const phones = mergeMemberPhones(matched, m);
      if ((phones.phone || '') !== (matched.phone || '')) changes.phone = phones.phone || '';
      if ((phones.phone2 || '') !== (matched.phone2 || '')) changes.phone2 = phones.phone2 || '';
      const extra = phones.additionalPhones || [];
      if (
        JSON.stringify(extra) !==
        JSON.stringify(Array.isArray(matched.additionalPhones) ? matched.additionalPhones : [])
      ) {
        changes.additionalPhones = extra;
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
    await releaseMemberCard(oldId);
  }

  return newId;
}

/**
 * Best effort (admin), after a member stopped holding `oldId`: deletes memberCards/{oldId} when no member
 * holds that KCC ID any more, otherwise rebuilds the card for the remaining holder (the old card may
 * still show the previous member's data). Failures are only logged.
 */
async function releaseMemberCard(oldId: string): Promise<void> {
  if (!isValidUserId16(oldId)) return;
  try {
    const holders = await getDocsFromServer(
      query(collection(db, MEMBERS_COLLECTION), where('userId16', '==', oldId), limit(1))
    );
    if (holders.empty) {
      await deleteDoc(doc(db, MEMBER_CARDS_COLLECTION, oldId));
    } else {
      const holder = holders.docs[0];
      await upsertMemberCard(
        buildMemberCard(normalizeMember(holder.id, holder.data() as Partial<Omit<Member, 'id'>>))
      );
    }
  } catch (error) {
    console.warn(`Could not clean up the old member card ${oldId}:`, error);
  }
}

// Text fields a re-submission (or an admin merge) may refresh on an existing registration
const MERGE_TEXT_FIELDS = [
  'fullName',
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
  'reason',
] as const;

function storedText(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * Update for an existing registration from a newer submission of the same person: only CHANGED,
 * NON-EMPTY, clamped values, the incoming value wins. Phone numbers are merged (existing first, new
 * numbers become phone2 / additionalPhones). The email is only added (allowEmail) when the existing
 * record has none. Never includes userId16, authUid, createdAt, source, status, memberNumber or id, so
 * an owner's update stays within firestore.rules memberOwnerEditableKeys().
 * `fillOnly`: existing non-empty values are kept (only empty fields are filled, phones still merged).
 */
export function buildMemberMergeUpdate(
  existing: Member,
  incoming: Partial<Member>,
  options?: { allowEmail?: boolean; fillOnly?: boolean }
): Record<string, unknown> {
  const L = MEMBER_FIELD_LIMITS;
  const fillOnly = !!options?.fillOnly;
  const src = (incoming || {}) as Record<string, unknown>;
  const current = (existing || {}) as unknown as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  // name and cosplayName always mirror each other
  const name = clampString(incoming?.name || incoming?.cosplayName, L.name);
  if (name) {
    const currentName = storedText(current.name);
    const currentCosname = storedText(current.cosplayName);
    const hasName = !!(currentName || currentCosname);
    if ((!fillOnly || !hasName) && (name !== currentName || name !== currentCosname)) {
      updates.name = name;
      updates.cosplayName = name;
    }
  }

  for (const field of MERGE_TEXT_FIELDS) {
    const value = clampString(src[field], L[field]);
    if (!value) continue;
    const before = storedText(current[field]);
    if (fillOnly && before) continue;
    if (value !== before) updates[field] = value;
  }

  // A truncated data URL is useless, so an oversized avatar is ignored instead of clamped
  const avatar = src.avatarUrl;
  if (typeof avatar === 'string' && avatar.length > 0 && avatar.length <= L.avatarUrl) {
    const before = storedText(current.avatarUrl);
    if (avatar !== before && !(fillOnly && before)) updates.avatarUrl = avatar;
  }

  const phones = mergeMemberPhones(existing, incoming);
  if (phones.phone && phones.phone !== storedText(current.phone)) updates.phone = phones.phone;
  if (phones.phone2 && phones.phone2 !== storedText(current.phone2)) updates.phone2 = phones.phone2;
  const extra = phones.additionalPhones || [];
  const currentExtra = Array.isArray(current.additionalPhones) ? current.additionalPhones : [];
  // [] is only written to drop extra numbers that are now duplicates of phone / phone2
  if ((extra.length > 0 || currentExtra.length > 0) && JSON.stringify(extra) !== JSON.stringify(currentExtra)) {
    updates.additionalPhones = extra;
  }

  if (options?.allowEmail && !storedText(current.email).trim()) {
    const email = clampString(incoming?.email, L.email).toLowerCase();
    if (email && !isFakePlaceholderEmail(email)) updates.email = email;
  }

  return updates;
}

/**
 * Writes `updates` to members/{member.id} (errors rethrown, except the 10 s timeout: the write stays
 * queued), then refreshes the public card (best effort). Returns the updated member.
 */
export async function updateMemberWithCard(member: Member, updates: Record<string, unknown>): Promise<Member> {
  if (!updates || Object.keys(updates).length === 0) return member;

  try {
    await commitWithTimeout(updateDoc(doc(db, MEMBERS_COLLECTION, member.id), updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${member.id}`);
  }

  const updated = { ...member, ...(updates as Partial<Member>) } as Member;
  if (isValidUserId16(updated.userId16)) {
    try {
      await upsertMemberCard(buildMemberCard(updated));
    } catch (error) {
      console.warn('Registration saved, but the public member card could not be refreshed:', error);
    }
  }
  return updated;
}

// Keeper preference: the main account's doc, then real registrations, then sign-in placeholders
// (members/{uid} auto-created at sign-in, which hold no form data)
function duplicateKeeperRank(m: Member): number {
  if (m.userId16 === MAIN_ACCOUNT_UID && m.authUid) return 0;
  if (m.authUid && m.id === m.authUid) return 2;
  return 1;
}

/**
 * Admin UI (on demand, O(n^2)): groups registrations that belong to the same person (shared WhatsApp
 * number, Discord, email, social media handle or non-generic name, see findDuplicateMember). The
 * keeper of each group is the main account doc or else the earliest registration; records linked to
 * two different sign-in accounts are never grouped. Only groups with duplicates are returned, sorted
 * by the keeper's createdAt.
 */
export function findDuplicateRegistrationGroups(members: Member[]): DuplicateRegistrationGroup[] {
  const ordered = [...(members || [])].sort(
    (a, b) =>
      duplicateKeeperRank(a) - duplicateKeeperRank(b) || compareByCreatedAtThenId(a.id, a.createdAt, b.id, b.createdAt)
  );

  const keepers: Member[] = [];
  const groups = new Map<string, DuplicateRegistrationGroup>();

  for (const m of ordered) {
    const match = findDuplicateMember(keepers, {
      email: m.email,
      phone: m.phone,
      phone2: m.phone2,
      additionalPhones: m.additionalPhones,
      discordUsername: m.discordUsername,
      name: m.name || m.cosplayName,
      cosplayName: m.cosplayName,
      socialMedia: m.socialMedia,
    });

    if (match && !(match.authUid && m.authUid && match.authUid !== m.authUid)) {
      let group = groups.get(match.id);
      if (!group) {
        group = { keeper: match, duplicates: [] };
        groups.set(match.id, group);
      }
      group.duplicates.push(m);
    } else {
      keepers.push(m);
    }
  }

  return Array.from(groups.values())
    .filter((g) => g.duplicates.length > 0)
    .sort((a, b) => compareByCreatedAtThenId(a.keeper.id, a.keeper.createdAt, b.keeper.id, b.keeper.createdAt));
}

// Records of one person created at most this far apart count as one double submission / double import
export const EXACT_DUPLICATE_WINDOW_MS = 60 * 1000;

/**
 * Admin bulk merge ("identical" mode): true when every record of the group (keeper + duplicates) has
 * the same cosname (case- and whitespace-insensitive), the same primary WhatsApp number (normalized
 * digits, at least 8) and a createdAt within EXACT_DUPLICATE_WINDOW_MS of each other, i.e. exact
 * copies such as a sheet imported twice. Records without a usable name, primary number or createdAt
 * never qualify.
 */
export function isExactDuplicateGroup(
  group: DuplicateRegistrationGroup,
  windowMs: number = EXACT_DUPLICATE_WINDOW_MS
): boolean {
  if (!group || !group.keeper || !Array.isArray(group.duplicates) || group.duplicates.length === 0) return false;

  const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
  const cosnameKey = (m: Member): string =>
    (text(m.name) || text(m.cosplayName)).normalize('NFKC').replace(/\s+/g, ' ').toLowerCase();
  const primaryPhoneKey = (m: Member): string => {
    const phone = text(m.phone);
    return phone ? extractAllPhones({ phone })[0] || '' : '';
  };

  const keeperCosname = cosnameKey(group.keeper);
  const keeperPhone = primaryPhoneKey(group.keeper);
  if (!keeperCosname || !keeperPhone) return false;

  let earliest = Number.POSITIVE_INFINITY;
  let latest = Number.NEGATIVE_INFINITY;
  for (const m of [group.keeper, ...group.duplicates]) {
    if (!m || cosnameKey(m) !== keeperCosname || primaryPhoneKey(m) !== keeperPhone) return false;
    const ms = createdAtMs(m.createdAt);
    if (ms === Number.MAX_SAFE_INTEGER) return false; // missing / unparseable createdAt
    earliest = Math.min(earliest, ms);
    latest = Math.max(latest, ms);
  }
  return latest - earliest <= windowMs;
}

/**
 * Admin: merges a duplicate registration into the keeper. The keeper keeps its KCC ID and receives the
 * newer data and every WhatsApp number (plus the duplicate's sign-in link when it has none); then the
 * duplicate doc is deleted and its card released. Both docs are re-read from the server first.
 * Returns the merged keeper.
 */
export async function mergeDuplicateRegistration(keeper: Member, duplicate: Member): Promise<Member> {
  if (!(await checkIsAdminUser(auth.currentUser))) {
    throw new Error(translate('errors.mergeAdminOnly'));
  }
  if (!keeper || !duplicate || keeper.id === duplicate.id) {
    throw new Error(translate('errors.mergeSameRecord'));
  }

  const keeperRef = doc(db, MEMBERS_COLLECTION, keeper.id);
  const duplicateRef = doc(db, MEMBERS_COLLECTION, duplicate.id);

  const [keeperSnap, duplicateSnap] = await Promise.all([
    getDocFromServer(keeperRef),
    getDocFromServer(duplicateRef),
  ]).catch((error: unknown) => handleFirestoreError(error, OperationType.GET, `${MEMBERS_COLLECTION}/${duplicate.id}`));
  if (!keeperSnap.exists() || !duplicateSnap.exists()) {
    throw new Error(translate('errors.memberRecordMissing'));
  }

  const keeperRaw = keeperSnap.data() as Partial<Omit<Member, 'id'>>;
  const duplicateRaw = duplicateSnap.data() as Partial<Omit<Member, 'id'>>;
  const keeperAuthUid = typeof keeperRaw.authUid === 'string' ? keeperRaw.authUid : '';
  const duplicateAuthUid = typeof duplicateRaw.authUid === 'string' ? duplicateRaw.authUid : '';
  if (keeperAuthUid && duplicateAuthUid && keeperAuthUid !== duplicateAuthUid) {
    throw new Error(translate('errors.mergeDifferentAccounts'));
  }

  const keeperFresh = normalizeMember(keeper.id, keeperRaw);
  // The duplicate's stored values (normalized, but without normalizeMember's 'Member' name fallback,
  // which must never overwrite the keeper's name)
  const duplicateFresh: Partial<Member> = {
    ...duplicateRaw,
    email: normalizeMember(duplicate.id, duplicateRaw).email,
  };

  // The newer submission's data wins. A duplicate that is older than the keeper (e.g. the main
  // account doc is kept) or a bare sign-in placeholder only fills empty fields.
  const duplicateIsNewer =
    compareByCreatedAtThenId(keeper.id, keeperRaw.createdAt, duplicate.id, duplicateRaw.createdAt) < 0;
  const duplicateIsPlaceholder = !!duplicateAuthUid && duplicate.id === duplicateAuthUid;
  const updates = buildMemberMergeUpdate(keeperFresh, duplicateFresh, {
    allowEmail: true,
    fillOnly: !duplicateIsNewer || duplicateIsPlaceholder,
  });
  if (!keeperAuthUid && duplicateAuthUid) {
    updates.authUid = duplicateAuthUid.slice(0, 128);
  }

  const keeperStoredId =
    typeof keeperRaw.userId16 === 'string' && isValidUserId16(keeperRaw.userId16) ? keeperRaw.userId16 : null;
  const duplicateStoredId =
    typeof duplicateRaw.userId16 === 'string' && isValidUserId16(duplicateRaw.userId16) ? duplicateRaw.userId16 : null;
  const merged = normalizeMember(keeper.id, { ...keeperRaw, ...(updates as Partial<Omit<Member, 'id'>>) });

  // <= 3 operations (admin batches stay far below the rules' 20 exists() calls)
  const batch = writeBatch(db);
  if (Object.keys(updates).length > 0) {
    batch.update(keeperRef, updates);
  }
  if (keeperStoredId) {
    batch.set(
      doc(db, MEMBER_CARDS_COLLECTION, keeperStoredId),
      memberCardPayload(buildMemberCard({ ...merged, userId16: keeperStoredId }))
    );
  }
  batch.delete(duplicateRef);
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MEMBERS_COLLECTION}/${keeper.id}`);
  }

  if (duplicateStoredId && duplicateStoredId !== keeperStoredId) {
    await releaseMemberCard(duplicateStoredId);
  }

  return merged;
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
    throw new Error(translate('errors.repairAdminOnly'));
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
      report.errors.push(
        translate('errors.repairIdUpdateFailed', { ids: chunk.map((r) => r.id).join(', '), detail: errorText(error) })
      );
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
      report.errors.push(
        translate('errors.repairCardWriteFailed', {
          ids: chunk.map((r) => r.finalId).join(', '),
          detail: errorText(error),
        })
      );
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
      report.errors.push(translate('errors.repairCardDeleteFailed', { ids: chunk.join(', '), detail: errorText(error) }));
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
