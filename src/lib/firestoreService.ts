import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  deleteField,
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
  startAfter,
  type DocumentReference,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Query,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
  isMainAdminUser,
  checkIsAdminUser,
  isPermissionDeniedError,
  requireAdminUser,
} from './firebase';
import type {
  Member,
  MemberCard,
  SyncLog,
  BulkImportResult,
  MemberIdReassignment,
  MemberRepairReport,
  DuplicateRegistrationGroup,
  KccCounter,
  KccLookupSource,
  KccIdMigrationPlan,
  KccIdMigrationReport,
  KccIdMigrationRow,
  RegistrationDateFixPlan,
  RegistrationDateFixReport,
  RegistrationDateFixRow,
  ColumnMapping,
  SheetTimeContext,
} from '../types';
import {
  generate16DigitUserId,
  generateUniqueChronologicalUserId16,
  findDuplicateMember,
  extractAllPhones,
  isValidKccId,
  isKccId8,
  isLegacyKccId16,
  isReservedKccId,
  isMainAccountKccId,
  legacyReservedToKcc8,
  paddedLegacyToKcc8,
  kccIdFromNumber,
  kccNumber,
  normalizePhoneDigits,
  mergeMemberPhones,
  MAX_ADDITIONAL_PHONES,
  MAX_KCC_NUMBER,
  MAIN_ACCOUNT_KCC_ID,
  MAIN_ACCOUNT_UID,
} from './idGenerator';
import {
  MEMBER_FIELD_LIMITS,
  MEMBER_OWNER_EDITABLE_FIELDS,
  MEMBER_ADMIN_EDITABLE_FIELDS,
  isFakePlaceholderEmail,
  isMemberStatus,
  clampString,
  pickSource,
  pickStatus,
  normalizeCreatedAt,
  createdAtMs,
  compareByCreatedAtThenId,
  memberDisplayName,
} from './memberRules';
import {
  planKccIdMigration,
  buildMigrationBatches,
  kccIdMigrationCsv,
  buildSheetDateRows,
  matchSheetRowsToMembers,
  type PlannerMemberRow,
} from './adminPlanning';
import { buildAdminLog, writeAdminLog } from './adminLogService';
import { translate } from '../i18n';

// Re-exported so existing imports from firestoreService keep working (the rules live in memberRules.ts)
export { MEMBER_FIELD_LIMITS, MEMBER_OWNER_EDITABLE_FIELDS, MEMBER_ADMIN_EDITABLE_FIELDS };
export { kccIdMigrationCsv, planKccIdMigration, matchSheetRowsToMembers };
export type { KccLookupSource };

export const MEMBERS_COLLECTION = 'members';
// Public, non-private projection used by the KCC ID card lookup (doc id == userId16 == KCC ID)
export const MEMBER_CARDS_COLLECTION = 'memberCards';
const SYNC_LOGS_COLLECTION = 'sync_logs';
/** counters/kccId: exists = the 8-digit switch has started (firestore.rules). */
export const COUNTERS_COLLECTION = 'counters';
export const KCC_COUNTER_ID = 'kccId';
/** memberCardAliases/{old16} -> { kccId }: legacy 16-digit IDs keep working in the public lookup. */
export const MEMBER_CARD_ALIASES_COLLECTION = 'memberCardAliases';
const PHOTOS_COLLECTION = 'photos';

// Rules allow at most 20 exists()/get() calls per batched write, and an admin identified through
// admins/{uid} costs one exists() per operation, so admin batches stay at <= 15 ops (an audit log entry
// in the same batch counts as one of them).
const ADMIN_BATCH_SIZE = 15;
// Date fix: 7 members x (member update + card set) = 14 ops
const DATE_FIX_MEMBERS_PER_BATCH = 7;
// Import claim: 1 counter update + 7 x (member + card) = 15 ops
const IMPORT_CLAIM_CHUNK = 7;
const PHOTO_PAGE_FOR_MIGRATION = 50;
const WRITE_TIMEOUT_MS = 10000;
const WRITE_TIMEOUT_MESSAGE = 'Write timeout';

const CARD_AVATAR_MAX_LENGTH = 400000;

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
 * Normalizes a raw member document for the UI: name fallback and placeholder-email cleanup. A doc
 * without a stored KCC ID gets userId16 '' (shown as the '---- ----' placeholder; the repair or the
 * 8-digit switch assigns a real ID). An ID is never invented here.
 */
export function normalizeMember(id: string, raw: Partial<Omit<Member, 'id'>>): Member {
  const data = (raw || {}) as Partial<Omit<Member, 'id'>>;
  const memberName = data.name || data.cosplayName || data.fullName || 'Member';
  const cleanedEmail = isFakePlaceholderEmail(data.email) ? '' : (data.email || '');
  const userId16 = typeof data.userId16 === 'string' ? data.userId16 : '';

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
 * optional fields, enum-safe source/status, never an `id` key and never `legacyUserId16` (written only by
 * the 8-digit migration). `member.userId16` must already be an assigned KCC ID (8 or 16 digits): IDs come
 * from the counter claim / legacy assignment, never from here (throws errors.invalidKccId otherwise).
 */
export function buildMemberPayload(member: Omit<Member, 'id'>): Record<string, unknown> {
  const L = MEMBER_FIELD_LIMITS;
  const memberName = clampString(member.name || member.cosplayName || member.fullName, L.name) || 'Member';
  const email = clampString(member.email, L.email).toLowerCase();
  if (!isValidKccId(member.userId16)) {
    throw new Error(translate('errors.invalidKccId', { id: String(member.userId16 ?? '') }));
  }

  const payload: Record<string, unknown> = {
    userId16: member.userId16,
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

function memberRef(id: string): DocumentReference {
  return doc(db, MEMBERS_COLLECTION, id);
}

function cardRef(kccId: string): DocumentReference {
  return doc(db, MEMBER_CARDS_COLLECTION, kccId);
}

function aliasRef(legacyId: string): DocumentReference {
  return doc(db, MEMBER_CARD_ALIASES_COLLECTION, legacyId);
}

function counterRef(): DocumentReference {
  return doc(db, COUNTERS_COLLECTION, KCC_COUNTER_ID);
}

function newRegistrationDocId(): string {
  return `kc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Writes memberCards/{kccId} (full replace, no merge). Throws on an invalid ID (8 or 16 digits required)
 * or a failed write.
 */
export async function upsertMemberCard(card: MemberCard): Promise<void> {
  if (!card || !isValidKccId(card.userId16)) {
    throw new Error(translate('errors.invalidCardId', { id: card?.userId16 ?? '' }));
  }
  await setDoc(cardRef(card.userId16), memberCardPayload(card));
}

function cardFromData(id: string, raw: unknown): MemberCard {
  const data = (raw || {}) as Partial<MemberCard>;
  const card: MemberCard = {
    userId16: id,
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

/**
 * Exact get of memberCards/{id} for an 8- or 16-digit KCC ID (non-digits are stripped). Returns null for
 * an invalid ID or a missing card; other errors (network, permissions) are thrown.
 */
export async function getMemberCard(id: string): Promise<MemberCard | null> {
  const cleanId = String(id ?? '').replace(/\D/g, '');
  if (!isValidKccId(cleanId)) return null;
  const snap = await getDoc(cardRef(cleanId));
  if (!snap.exists()) return null;
  return cardFromData(cleanId, snap.data());
}

/**
 * Public KCC ID lookup. Input: any text; non-digits are stripped. Returns null for "not found" and for
 * input that is neither 8 nor 16 digits (the UI checks parseKccIdInput first).
 * 8 digits  -> memberCards/{id}.
 * 16 digits -> (1) memberCardAliases/{id} -> memberCards/{alias.kccId} (a dangling alias -> null)
 *              (2) id starts with '00000000' -> memberCards/{last 8}
 *              (3) memberCards/{id} (legacy card, before the switch)
 * (1) and (3) are fetched in parallel; precedence (1) > (2) > (3). Network/permission errors are thrown,
 * except permission-denied on the alias read, which counts as "no alias" (sprint-2 rules deny it).
 */
export async function lookupMemberCard(
  input: string
): Promise<{ card: MemberCard; resolvedFrom: KccLookupSource; requestedId: string } | null> {
  const requestedId = String(input ?? '').replace(/\D/g, '');
  if (isKccId8(requestedId)) {
    const card = await getMemberCard(requestedId);
    return card ? { card, resolvedFrom: 'kcc8', requestedId } : null;
  }
  if (!isLegacyKccId16(requestedId)) return null;

  const aliasPromise = getDoc(aliasRef(requestedId)).then(
    (snap) => (snap.exists() ? (snap.data() as { kccId?: unknown }) : null),
    (error: unknown) => {
      if (isPermissionDeniedError(error)) return null;
      throw error;
    }
  );
  const legacyPromise = getMemberCard(requestedId);
  // The legacy read may be unused (alias / padded hit); never leave its rejection unhandled
  legacyPromise.catch(() => undefined);

  const alias = await aliasPromise;
  if (alias) {
    const target = typeof alias.kccId === 'string' ? alias.kccId : '';
    const card = isKccId8(target) ? await getMemberCard(target) : null;
    return card ? { card, resolvedFrom: 'alias', requestedId } : null;
  }

  const padded = paddedLegacyToKcc8(requestedId);
  if (padded) {
    const card = await getMemberCard(padded);
    if (card) return { card, resolvedFrom: 'padded16', requestedId };
  }

  const legacy = await legacyPromise;
  return legacy ? { card: legacy, resolvedFrom: 'legacy16', requestedId } : null;
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

// ---------------------------------------------------------------------------------------------
// KCC ID counter (counters/kccId). Absent = before the 8-digit switch (legacy 16-digit IDs);
// present = every new member number is claimed through it, in the same write as the card + member.
// ---------------------------------------------------------------------------------------------

function parseCounter(raw: unknown): KccCounter {
  const data = (raw || {}) as Record<string, unknown>;
  const last = typeof data.last === 'number' ? data.last : NaN;
  if (!Number.isInteger(last) || last < 0 || last > MAX_KCC_NUMBER) {
    throw new Error(translate('errors.kccCounterBlocked'));
  }
  const counter: KccCounter = {
    last,
    lastId: typeof data.lastId === 'string' && isKccId8(data.lastId) ? data.lastId : kccIdFromNumber(last),
  };
  if (typeof data.planEnd === 'number' && Number.isInteger(data.planEnd)) counter.planEnd = data.planEnd;
  if (typeof data.updatedAt === 'string') counter.updatedAt = data.updatedAt;
  return counter;
}

/**
 * counters/kccId from the server; null = the 8-digit switch has not started. Read errors are thrown,
 * EXCEPT permission-denied, which counts as null (+ console.warn): that only happens while the sprint-2
 * rules are still published (no counter can exist then) and keeps registration working.
 */
export async function getKccCounter(): Promise<KccCounter | null> {
  let snap: DocumentSnapshot;
  try {
    snap = await getDocFromServer(counterRef());
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn('KCC ID counter not readable (sprint-2 rules?); using the legacy 16-digit path:', error);
      return null;
    }
    throw error;
  }
  return snap.exists() ? parseCounter(snap.data()) : null;
}

/** The main account's own KCC ID in the current format: '00000000' when the counter exists, else 16 zeros. */
export async function mainAccountKccId(): Promise<string> {
  return (await getKccCounter()) ? MAIN_ACCOUNT_KCC_ID : MAIN_ACCOUNT_UID;
}

/** A reserved ID (main / admin slot) in the format of the current era (8 digits after the switch). */
function reservedIdInCurrentFormat(id: string, counter: KccCounter | null): string {
  if (counter) return isKccId8(id) ? id : (legacyReservedToKcc8(id) ?? id);
  return isLegacyKccId16(id) ? id : `00000000${id}`;
}

type ClaimOutcome =
  | { kind: 'no-counter' }
  | { kind: 'existing'; member: Member }
  | { kind: 'created'; member: Member; kccId: string };

// Two claims at the same moment: the rules evaluate the loser's write against the counter as it is NOW
// (already moved by the winner), so it is DENIED (permission-denied) instead of failing the version check,
// and the SDK only retries version conflicts (verified in the emulator). Such a denial is retried here
// while the counter keeps moving; any other denial (counter unchanged) is rethrown.
const CLAIM_CONTENTION_ATTEMPTS = 6;

async function withClaimContentionRetry<T>(run: (seen: { last: number | null }) => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const seen: { last: number | null } = { last: null };
    try {
      return await run(seen);
    } catch (error) {
      if (attempt >= CLAIM_CONTENTION_ATTEMPTS || seen.last === null || !isPermissionDeniedError(error)) throw error;
      let current: KccCounter | null;
      try {
        current = await getKccCounter();
      } catch {
        throw error;
      }
      if (!current || current.last === seen.last) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50 + Math.floor(Math.random() * 250)));
    }
  }
}

/**
 * Claim transaction (reads before writes): counter -> (onlyIfAbsent: member) -> memberCards/{last+1};
 * writes counter +1 (last, lastId, updatedAt only; planEnd stays), the new card and the member with
 * userId16 = the claimed ID. 'no-counter' = no writes (the caller takes the legacy path). Throws
 * errors.kccCounterBlocked when the next card already exists and errors.kccIdsExhausted after 99,999,999.
 * Two visitors at once: the SDK retries the loser, which re-reads the counter and takes the next number.
 * Transactions need the server: offline -> 'unavailable' error (never a fake success).
 */
async function claimKccIdAndCreate(
  targetRef: DocumentReference,
  buildPayload: (kccId: string) => Record<string, unknown>,
  options?: { onlyIfAbsent?: boolean }
): Promise<ClaimOutcome> {
  return withClaimContentionRetry((seen) => runTransaction(db, async (tx): Promise<ClaimOutcome> => {
    const counterSnap = await tx.get(counterRef());
    if (!counterSnap.exists()) return { kind: 'no-counter' };
    if (options?.onlyIfAbsent) {
      const existing = await tx.get(targetRef);
      if (existing.exists()) {
        return { kind: 'existing', member: normalizeMember(existing.id, existing.data() as Partial<Omit<Member, 'id'>>) };
      }
    }
    const counter = parseCounter(counterSnap.data());
    seen.last = counter.last;
    const next = counter.last + 1;
    if (next > MAX_KCC_NUMBER) throw new Error(translate('errors.kccIdsExhausted'));
    const kccId = kccIdFromNumber(next);
    const cardSnap = await tx.get(cardRef(kccId));
    if (cardSnap.exists()) throw new Error(translate('errors.kccCounterBlocked'));

    const payload = buildPayload(kccId);
    tx.update(counterRef(), { last: next, lastId: kccId, updatedAt: new Date().toISOString() });
    tx.set(cardRef(kccId), memberCardPayload(buildMemberCard(payload as unknown as Omit<Member, 'id'>)));
    tx.set(targetRef, payload);
    return { kind: 'created', member: normalizeMember(targetRef.id, payload as Partial<Omit<Member, 'id'>>), kccId };
  }));
}

/**
 * After the switch the rules deny creating a NEW 16-digit card, while existing 16-digit cards may still be
 * rewritten. True when memberCards/{kccId} may be written now (8 digits always; 16 digits before the switch
 * or when that card exists). Pass a known counter to save a read.
 */
async function isCardWritable(kccId: unknown, counter?: KccCounter | null): Promise<boolean> {
  if (isKccId8(kccId)) return true;
  if (!isLegacyKccId16(kccId)) return false;
  const current = counter === undefined ? await getKccCounter() : counter;
  if (!current) return true;
  return (await getDocFromServer(cardRef(kccId))).exists();
}

/** Member + its card in one batch (timeout-tolerant: a write pending after 10 s stays queued). */
async function writeMemberAndCard(targetRef: DocumentReference, payload: Record<string, unknown>): Promise<void> {
  const kccId = String(payload.userId16 || '');
  const batch = writeBatch(db);
  batch.set(targetRef, payload);
  batch.set(cardRef(kccId), memberCardPayload(buildMemberCard(payload as unknown as Omit<Member, 'id'>)));
  await commitWithTimeout(batch.commit());
}

/**
 * Legacy fallback only (before the 8-digit switch; never used when the counter exists): a chronological
 * 16-digit ID whose card does not exist yet. The main account's 16-zero ID only for the authenticated
 * main account while that card does not exist (`allowMainAccount: false` never returns it).
 */
export async function assignLegacyUserId16(options?: { allowMainAccount?: boolean }): Promise<string> {
  if (options?.allowMainAccount !== false && isMainAdminUser(auth.currentUser)) {
    const mainCard = await getDoc(cardRef(MAIN_ACCOUNT_UID));
    if (!mainCard.exists()) return MAIN_ACCOUNT_UID;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generate16DigitUserId(new Date());
    if (!isLegacyKccId16(candidate) || isReservedKccId(candidate) || candidate.startsWith('00000000')) continue;
    const existingCard = await getDoc(cardRef(candidate));
    if (!existingCard.exists()) return candidate;
  }

  throw new Error(translate('errors.uniqueIdFailed'));
}

/** @deprecated Renamed to assignLegacyUserId16 (pre-switch fallback only). */
export const assignNewUserId16 = assignLegacyUserId16;

/**
 * Public registration (anonymous allowed): members/{kc_...} + memberCards/{id}. The KCC ID is always
 * assigned here (never taken from form input):
 * - the main account registering ITSELF while its main card does not exist: the main ID (admin batch);
 * - counter exists: claim transaction (next running number);
 * - counter missing: legacy 16-digit path; if that batch is denied (the switch started in between),
 *   retried ONCE through the claim transaction.
 * The new doc is linked (authUid) to the signed-in user unless `linkToCurrentUser` is false (an admin
 * registering someone else must not own that registration). Errors are rethrown.
 */
export async function registerMember(
  member: Omit<Member, 'id' | 'userId16'>,
  options?: { linkToCurrentUser?: boolean }
): Promise<Member> {
  const linkToCurrentUser = options?.linkToCurrentUser !== false;
  const user = auth.currentUser;
  const currentUid = linkToCurrentUser ? user?.uid : undefined;
  const id = newRegistrationDocId();
  const targetRef = memberRef(id);
  const buildPayload = (kccId: string) =>
    buildMemberPayload({ ...member, userId16: kccId, authUid: currentUid || undefined } as Omit<Member, 'id'>);

  const counter = await getKccCounter();

  // Only a registration linked to the main account may receive its main ID
  if (linkToCurrentUser && isMainAdminUser(user)) {
    const mainId = counter ? MAIN_ACCOUNT_KCC_ID : MAIN_ACCOUNT_UID;
    const mainCard = await getDoc(cardRef(mainId));
    if (!mainCard.exists()) {
      const payload = buildPayload(mainId);
      await writeMemberAndCard(targetRef, payload);
      return normalizeMember(id, payload as Partial<Omit<Member, 'id'>>);
    }
  }

  if (counter) {
    const outcome = await claimKccIdAndCreate(targetRef, buildPayload);
    if (outcome.kind !== 'no-counter') return outcome.member;
  }

  const legacyId = await assignLegacyUserId16({ allowMainAccount: false });
  const payload = buildPayload(legacyId);
  try {
    await writeMemberAndCard(targetRef, payload);
  } catch (error) {
    if (!isPermissionDeniedError(error)) throw error;
    // The rules deny new 16-digit IDs once the counter exists: the switch may have started meanwhile
    let outcome: ClaimOutcome;
    try {
      outcome = await claimKccIdAndCreate(targetRef, buildPayload);
    } catch (claimError) {
      throw isPermissionDeniedError(claimError) ? error : claimError;
    }
    if (outcome.kind === 'created') return outcome.member;
    throw error;
  }
  return normalizeMember(id, payload as Partial<Omit<Member, 'id'>>);
}

/**
 * Admin add: keeps a valid RESERVED id the admin chose (main / admin slot, converted to the current
 * format) and, before the switch only, a given non-reserved 16-digit ID (the legacy Sheets import passes
 * unique chronological ones). Otherwise the ID is claimed like registerMember (counter) or generated on
 * the legacy path. Timeout-tolerant batch for fixed IDs; every other error is rethrown.
 */
export async function addMemberToFirestore(member: Omit<Member, 'id'>, customId?: string): Promise<string> {
  const id = customId || newRegistrationDocId();
  const targetRef = memberRef(id);
  const given = typeof member.userId16 === 'string' ? member.userId16.replace(/\D/g, '') : '';
  const buildPayload = (kccId: string) => buildMemberPayload({ ...member, userId16: kccId });
  const counter = await getKccCounter();

  let fixedId: string | null = null;
  if (isReservedKccId(given)) fixedId = reservedIdInCurrentFormat(given, counter);
  else if (!counter && isLegacyKccId16(given) && !given.startsWith('00000000')) fixedId = given;

  if (fixedId) {
    await writeMemberAndCard(targetRef, buildPayload(fixedId));
    return id;
  }
  if (counter) {
    const outcome = await claimKccIdAndCreate(targetRef, buildPayload);
    if (outcome.kind === 'created') return id;
  }
  await writeMemberAndCard(targetRef, buildPayload(await assignLegacyUserId16({ allowMainAccount: false })));
  return id;
}

/** Legacy path of createMemberIfAbsent (no counter): check-then-create in one transaction. */
async function createLegacyMemberIfAbsent(
  targetRef: DocumentReference,
  buildPayload: (kccId: string) => Record<string, unknown>
): Promise<{ member: Member; created: boolean }> {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(targetRef);
    if (snap.exists()) {
      return { member: normalizeMember(snap.id, snap.data() as Partial<Omit<Member, 'id'>>), created: false };
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generate16DigitUserId(new Date());
      if (!isLegacyKccId16(candidate) || isReservedKccId(candidate) || candidate.startsWith('00000000')) continue;
      const existingCard = await tx.get(cardRef(candidate));
      if (existingCard.exists()) continue;
      const payload = buildPayload(candidate);
      tx.set(targetRef, payload);
      tx.set(cardRef(candidate), memberCardPayload(buildMemberCard(payload as unknown as Omit<Member, 'id'>)));
      return { member: normalizeMember(targetRef.id, payload as Partial<Omit<Member, 'id'>>), created: true };
    }
    throw new Error(translate('errors.uniqueIdFailed'));
  });
}

/**
 * members/{docId} (+ card) only if absent (sign-in profile, docId = uid), inside a transaction. An existing
 * doc is returned untouched (its userId16/createdAt are never rewritten). `member.userId16` is honoured
 * only for the main account (its own main ID, current format) or an admin (reserved slot), and only while
 * that card does not exist; otherwise the ID is claimed (counter) or, without counter, generated on the
 * legacy path inside the same transaction.
 */
export async function createMemberIfAbsent(
  docId: string,
  member: Omit<Member, 'id' | 'userId16'> & { userId16?: string }
): Promise<{ member: Member; created: boolean }> {
  const targetRef = memberRef(docId);
  const { userId16: requestedRaw, ...rest } = member;
  const requested = typeof requestedRaw === 'string' ? requestedRaw.replace(/\D/g, '') : '';
  const user = auth.currentUser;
  const buildPayload = (kccId: string) => buildMemberPayload({ ...rest, userId16: kccId } as Omit<Member, 'id'>);
  const counter = await getKccCounter();

  let fixedId: string | null = null;
  if (requested && isReservedKccId(requested)) {
    if (isMainAccountKccId(requested)) {
      if (isMainAdminUser(user)) fixedId = reservedIdInCurrentFormat(requested, counter);
    } else if (await checkIsAdminUser(user)) {
      fixedId = reservedIdInCurrentFormat(requested, counter);
    }
  }

  if (fixedId) {
    const reservedId = fixedId;
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(targetRef);
      if (snap.exists()) {
        return { member: normalizeMember(snap.id, snap.data() as Partial<Omit<Member, 'id'>>), created: false };
      }
      const existingCard = await tx.get(cardRef(reservedId));
      if (existingCard.exists()) return null; // slot already held: take a regular number below
      const payload = buildPayload(reservedId);
      tx.set(targetRef, payload);
      tx.set(cardRef(reservedId), memberCardPayload(buildMemberCard(payload as unknown as Omit<Member, 'id'>)));
      return { member: normalizeMember(docId, payload as Partial<Omit<Member, 'id'>>), created: true };
    });
    if (result) return result;
  }

  if (counter) {
    const outcome = await claimKccIdAndCreate(targetRef, buildPayload, { onlyIfAbsent: true });
    if (outcome.kind === 'existing') return { member: outcome.member, created: false };
    if (outcome.kind === 'created') return { member: outcome.member, created: true };
  }

  try {
    return await createLegacyMemberIfAbsent(targetRef, buildPayload);
  } catch (error) {
    if (!isPermissionDeniedError(error)) throw error;
    let outcome: ClaimOutcome;
    try {
      outcome = await claimKccIdAndCreate(targetRef, buildPayload, { onlyIfAbsent: true });
    } catch (claimError) {
      throw isPermissionDeniedError(claimError) ? error : claimError;
    }
    if (outcome.kind === 'existing') return { member: outcome.member, created: false };
    if (outcome.kind === 'created') return { member: outcome.member, created: true };
    throw error;
  }
}

/** Reads memberCards/{last+1..last+5}; returns the IDs that already exist (they block public claims). */
export async function checkKccCounter(): Promise<{ counter: KccCounter | null; blockedIds: string[] }> {
  const counter = await getKccCounter();
  if (!counter) return { counter: null, blockedIds: [] };
  const ids: string[] = [];
  for (let n = counter.last + 1; n <= Math.min(MAX_KCC_NUMBER, counter.last + 5); n++) ids.push(kccIdFromNumber(n));
  const snaps = await Promise.all(ids.map((id) => getDocFromServer(cardRef(id))));
  return { counter, blockedIds: ids.filter((_, i) => snaps[i].exists()) };
}

/**
 * Admin: moves the counter forward so that `id` (8 digits) counts as issued (never backwards). Logs
 * 'kcc_id_repair'. Throws errors.kccCounterMissing before the switch.
 */
export async function advanceKccCounterTo(id: string): Promise<KccCounter> {
  await requireAdminUser();
  const target = kccNumber(String(id ?? '').replace(/\D/g, ''));
  if (target === null) throw new Error(translate('errors.invalidKccId', { id: String(id ?? '') }));

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef());
    if (!snap.exists()) throw new Error(translate('errors.kccCounterMissing'));
    const counter = parseCounter(snap.data());
    if (target <= counter.last) return { counter, moved: false };
    const next: KccCounter = { ...counter, last: target, lastId: kccIdFromNumber(target), updatedAt: new Date().toISOString() };
    tx.update(counterRef(), { last: next.last, lastId: next.lastId, updatedAt: next.updatedAt });
    return { counter: next, moved: true };
  });

  if (result.moved) {
    await writeAdminLog({
      action: 'kcc_id_repair',
      targetType: 'settings',
      targetId: `${COUNTERS_COLLECTION}/${KCC_COUNTER_ID}`,
      details: `counter advanced to ${result.counter.lastId}`,
    });
  }
  return result.counter;
}

// Optional text fields an import duplicate may fill on an earlier NEW row of the same sheet
const IMPORT_FILL_FIELDS = [...IMPORT_COMPARE_FIELDS, 'birthday'] as const;

/**
 * Changes a sheet row brings to an already existing member: only changed, non-empty, clamped fields;
 * phone numbers merged (the existing primary stays primary). Never userId16, createdAt, source, status,
 * authUid.
 */
function buildImportUpdate(matched: Member, m: Omit<Member, 'id'>): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  for (const field of IMPORT_COMPARE_FIELDS) {
    let incoming = clampString(m[field], MEMBER_FIELD_LIMITS[field]);
    if (!incoming) continue;
    if (field === 'email') incoming = incoming.toLowerCase();
    const current = matched[field] === undefined || matched[field] === null ? '' : String(matched[field]);
    if (incoming !== current) changes[field] = incoming;
  }
  const phones = mergeMemberPhones(matched, m);
  if ((phones.phone || '') !== (matched.phone || '')) changes.phone = phones.phone || '';
  if ((phones.phone2 || '') !== (matched.phone2 || '')) changes.phone2 = phones.phone2 || '';
  const extra = phones.additionalPhones || [];
  if (JSON.stringify(extra) !== JSON.stringify(Array.isArray(matched.additionalPhones) ? matched.additionalPhones : [])) {
    changes.additionalPhones = extra;
  }
  return changes;
}

/** Folds a duplicate sheet row into an earlier NEW row: phones merged, empty fields filled, earliest createdAt. */
function mergeIntoNewRow(target: Omit<Member, 'id'>, incoming: Omit<Member, 'id'>): boolean {
  let changed = false;
  const phones = mergeMemberPhones(target, incoming);
  const before = JSON.stringify([target.phone || '', target.phone2 || '', target.additionalPhones || []]);
  target.phone = phones.phone;
  target.phone2 = phones.phone2;
  target.additionalPhones = phones.additionalPhones;
  if (JSON.stringify([target.phone || '', target.phone2 || '', target.additionalPhones || []]) !== before) changed = true;

  const t = target as unknown as Record<string, unknown>;
  const src = incoming as unknown as Record<string, unknown>;
  for (const field of IMPORT_FILL_FIELDS) {
    const value = src[field];
    if ((t[field] === undefined || t[field] === null || t[field] === '') && typeof value === 'string' && value.trim()) {
      t[field] = value;
      changed = true;
    }
  }
  if (createdAtMs(incoming.createdAt) < createdAtMs(target.createdAt)) {
    target.createdAt = incoming.createdAt;
    changed = true;
  }
  return changed;
}

/**
 * Admin claim of k consecutive numbers for k new members (k <= 7): reads the counter and
 * memberCards/{last+1..last+k} (any exists -> errors.kccCounterBlocked), writes counter.last += k and
 * k x (member + card) = 1 + 2k <= 15 ops. Returns the issued IDs in order.
 */
async function claimKccIdsForNewMembers(
  entries: Array<{ docId: string; member: Omit<Member, 'id'> }>
): Promise<string[]> {
  return withClaimContentionRetry((seen) => runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef());
    if (!snap.exists()) throw new Error(translate('errors.kccCounterMissing'));
    const counter = parseCounter(snap.data());
    seen.last = counter.last;
    if (counter.last + entries.length > MAX_KCC_NUMBER) throw new Error(translate('errors.kccIdsExhausted'));
    const ids = entries.map((_, k) => kccIdFromNumber(counter.last + 1 + k));
    const cards = await Promise.all(ids.map((id) => tx.get(cardRef(id))));
    if (cards.some((c) => c.exists())) throw new Error(translate('errors.kccCounterBlocked'));

    tx.update(counterRef(), {
      last: counter.last + entries.length,
      lastId: ids[ids.length - 1],
      updatedAt: new Date().toISOString(),
    });
    entries.forEach((entry, k) => {
      const payload = buildMemberPayload({ ...entry.member, userId16: ids[k] });
      tx.set(memberRef(entry.docId), payload);
      tx.set(cardRef(ids[k]), memberCardPayload(buildMemberCard(payload as unknown as Omit<Member, 'id'>)));
    });
    return ids;
  }));
}

/**
 * Google Sheets import (admin):
 * 1. reads the existing members from the server (a failed read aborts: continuing would insert every row
 *    again);
 * 2. pass 1 in sheet order: a row matching an existing member becomes an update (never userId16, createdAt,
 *    source, status, authUid); a row matching an earlier NEW row is folded into it; otherwise a create;
 * 3. updates are written (member update + card refresh);
 * 4. creates, sorted by createdAt then sheet order, get KCC IDs: after the switch in admin claim chunks of 7
 *    (running numbers; a failed chunk counts as skipped and the import continues), before it on the legacy
 *    path (unique chronological 16-digit IDs).
 * The manual import (rows with source 'spreadsheet_import', or `options.log`) writes a sheets_import log;
 * the auto-sync poller does not (it already writes sync_logs).
 */
export async function bulkImportMembers(
  newMembers: Omit<Member, 'id'>[],
  onProgress?: (completed: number, total: number) => void,
  options?: { log?: boolean }
): Promise<BulkImportResult> {
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;
  const issuedIds: string[] = [];

  const existingSnap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  const existingList: Member[] = existingSnap.docs.map((docSnap) => {
    const raw = docSnap.data() as Omit<Member, 'id'>;
    return { ...raw, id: docSnap.id };
  });

  // Pass 1 (in memory)
  const pendingUpdates = new Map<string, { member: Member; changes: Record<string, unknown> }>();
  const creates: Array<{ member: Omit<Member, 'id'>; order: number }> = [];
  (newMembers || []).forEach((row, index) => {
    if (!row) return;
    const m: Omit<Member, 'id'> = { ...row };
    const mName = m.name || m.cosplayName || 'Member';
    const candidate = {
      phone: m.phone,
      phone2: m.phone2,
      additionalPhones: m.additionalPhones,
      discordUsername: m.discordUsername,
      name: mName,
      cosplayName: mName,
      email: m.email,
      socialMedia: m.socialMedia,
    };

    const matched = findDuplicateMember(existingList, candidate);
    if (matched) {
      const changes = buildImportUpdate(matched, m);
      if (Object.keys(changes).length === 0) {
        unchanged++;
        return;
      }
      Object.assign(matched, changes);
      const entry = pendingUpdates.get(matched.id) || { member: matched, changes: {} };
      Object.assign(entry.changes, changes);
      pendingUpdates.set(matched.id, entry);
      return;
    }

    const earlier = findDuplicateMember(creates.map((c) => c.member as Member), candidate);
    const earlierEntry = earlier ? creates.find((c) => c.member === (earlier as unknown)) : undefined;
    if (earlierEntry) {
      if (mergeIntoNewRow(earlierEntry.member, m)) updated++;
      else unchanged++;
      return;
    }

    const sheetRow = (row as { sheetRow?: unknown }).sheetRow;
    creates.push({ member: m, order: typeof sheetRow === 'number' ? sheetRow : index });
  });

  const total = pendingUpdates.size + creates.length;
  let done = 0;
  const report = (step: number) => {
    done += step;
    if (onProgress && total > 0) onProgress(Math.min(done, total), total);
  };

  // Updates of existing members
  for (const { member, changes } of pendingUpdates.values()) {
    const mName = member.name || member.cosplayName || 'Member';
    try {
      await updateDoc(memberRef(member.id), changes);
      updated++;
      if (isValidKccId(member.userId16)) {
        try {
          await upsertMemberCard(buildMemberCard(member));
        } catch (cardError) {
          console.warn(`Could not refresh the member card of ${mName}:`, cardError);
        }
      }
    } catch (err) {
      console.error(`Failed updating duplicate member ${mName}:`, err);
      skipped++;
    }
    report(1);
  }

  // Creates: running numbers in order of registration time
  creates.sort((a, b) => createdAtMs(a.member.createdAt) - createdAtMs(b.member.createdAt) || a.order - b.order);
  const counter = creates.length > 0 ? await getKccCounter() : null;
  if (counter) {
    for (let i = 0; i < creates.length; i += IMPORT_CLAIM_CHUNK) {
      const chunk = creates.slice(i, i + IMPORT_CLAIM_CHUNK);
      const stamp = Date.now();
      const entries = chunk.map((c, k) => ({
        docId: `kc_${stamp}_${k}_${Math.random().toString(36).substring(2, 8)}`,
        member: c.member,
      }));
      try {
        const ids = await claimKccIdsForNewMembers(entries);
        added += ids.length;
        issuedIds.push(...ids);
      } catch (err) {
        console.error(`Failed importing ${chunk.length} new members:`, err);
        skipped += chunk.length;
      }
      report(chunk.length);
    }
  } else {
    const usedIds = new Set<string>();
    existingList.forEach((m) => {
      if (isValidKccId(m.userId16)) usedIds.add(m.userId16);
    });
    for (const { member } of creates) {
      const userId16 = generateUniqueChronologicalUserId16(member.createdAt, usedIds);
      usedIds.add(userId16);
      try {
        await writeMemberAndCard(memberRef(newRegistrationDocId()), buildMemberPayload({ ...member, userId16 }));
        added++;
        issuedIds.push(userId16);
      } catch (err) {
        console.error(`Failed importing member ${member.name || member.cosplayName || 'Member'}:`, err);
        skipped++;
      }
      report(1);
    }
  }

  const shouldLog = options?.log ?? (newMembers || []).some((m) => m?.source === 'spreadsheet_import');
  if (shouldLog) {
    await writeAdminLog({
      action: 'sheets_import',
      targetType: 'bulk',
      count: added,
      details: `added ${added}, updated ${updated}, unchanged ${unchanged}, skipped ${skipped}`,
    });
  }

  return { added, updated, unchanged, skipped, issuedIds };
}

/**
 * Admin: member status (+ the public card's status, best effort). Logs member_status_changed (best effort).
 */
export async function updateMemberStatus(
  memberId: string,
  status: 'pending' | 'verified' | 'active',
  userId16?: string
): Promise<void> {
  try {
    await updateDoc(memberRef(memberId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${memberId}`);
  }

  if (userId16 && isValidKccId(userId16)) {
    try {
      await updateDoc(cardRef(userId16), { status });
    } catch (error) {
      console.warn(`Could not update the status of member card ${userId16}:`, error);
    }
  }

  await writeAdminLog({
    action: 'member_status_changed',
    targetType: 'member',
    targetId: memberId,
    details: `status: ${status}`,
  });
}

/**
 * Admin: deletes the member together with its member_deleted log (one batch), then removes the public card
 * (best effort) unless another member still holds this KCC ID. `options.name` = label for the log.
 */
export async function deleteMember(memberId: string, userId16?: string, options?: { name?: string }): Promise<void> {
  await requireAdminUser();
  const log = buildAdminLog({
    action: 'member_deleted',
    targetType: 'member',
    targetId: memberId,
    targetLabel: options?.name ? clampString(options.name, 120) : undefined,
  });
  const batch = writeBatch(db);
  batch.delete(memberRef(memberId));
  batch.set(log.ref, log.data);
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MEMBERS_COLLECTION}/${memberId}`);
  }

  if (userId16 && isValidKccId(userId16)) {
    try {
      const holders = await getDocsFromServer(
        query(collection(db, MEMBERS_COLLECTION), where('userId16', '==', userId16), limit(1))
      );
      if (holders.empty) {
        await deleteDoc(cardRef(userId16));
      }
    } catch (error) {
      console.warn(`Could not clean up member card ${userId16}:`, error);
    }
  }
}

function phoneKey(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  return digits.length >= 8 ? digits : phone.trim().toLowerCase();
}

/**
 * Like sanitizeMemberProfileUpdate (owner fields: clamped, name/cosname mirrored and required, city '' ->
 * 'Worldwide', phones <= 30, additionalPhones <= 3 x 30 non-empty), plus email (trim, lowercase, <= 120,
 * placeholder emails -> '') and status (enum, invalid values ignored). Phone numbers that duplicate an
 * earlier one (normalized digits) are dropped: phone2 -> '', extra numbers removed. Never emits userId16,
 * legacyUserId16, authUid, source, createdAt or memberNumber. Throws translated errors for an empty name or
 * an oversized avatar.
 */
export function sanitizeMemberAdminUpdate(fields: Partial<Member>): Record<string, unknown> {
  const src = (fields || {}) as Record<string, unknown>;
  const ownerPart: Record<string, unknown> = {};
  for (const key of MEMBER_OWNER_EDITABLE_FIELDS) {
    if (key in src && src[key] !== undefined) ownerPart[key] = src[key];
  }
  const clean = sanitizeMemberProfileUpdate(ownerPart as Partial<Member>);

  if ('email' in src && src.email !== undefined) {
    const email = clampString(src.email, MEMBER_FIELD_LIMITS.email).toLowerCase();
    clean.email = isFakePlaceholderEmail(email) ? '' : email;
  }
  if ('status' in src && isMemberStatus(src.status)) {
    clean.status = src.status;
  }

  const seen = new Set<string>();
  if (typeof clean.phone === 'string' && clean.phone) seen.add(phoneKey(clean.phone));
  if (typeof clean.phone2 === 'string' && clean.phone2) {
    const key = phoneKey(clean.phone2);
    if (seen.has(key)) clean.phone2 = '';
    else seen.add(key);
  }
  if (Array.isArray(clean.additionalPhones)) {
    clean.additionalPhones = (clean.additionalPhones as string[]).filter((p) => {
      const key = phoneKey(p);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return clean;
}

function sameStoredValue(next: unknown, before: unknown): boolean {
  if (Array.isArray(next)) return JSON.stringify(next) === JSON.stringify(Array.isArray(before) ? before : []);
  const a = next === undefined || next === null ? '' : String(next);
  const b = before === undefined || before === null ? '' : String(before);
  return a === b;
}

/**
 * Admin "Edit details": re-reads the member, writes only the CHANGED sanitized fields
 * (MEMBER_ADMIN_EDITABLE_FIELDS) + refreshes the card + member_edited log (changed field NAMES only) in one
 * batch (3 ops). A changed stored email does not change the member's login email. Returns the updated member
 * (the unchanged member when nothing changed).
 */
export async function adminUpdateMember(member: Member, fields: Partial<Member>): Promise<Member> {
  await requireAdminUser();
  const snap = await getDocFromServer(memberRef(member.id));
  if (!snap.exists()) throw new Error(translate('errors.memberRecordMissing'));
  const raw = snap.data() as Record<string, unknown>;

  // Stored phones are included so a new number can be compared with the existing ones
  const clean = sanitizeMemberAdminUpdate({
    phone: raw.phone as string | undefined,
    phone2: raw.phone2 as string | undefined,
    additionalPhones: raw.additionalPhones as string[] | undefined,
    ...fields,
  });
  const changes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(clean)) {
    if (!sameStoredValue(value, raw[key])) changes[key] = value;
  }
  const merged = { ...raw, ...changes } as Partial<Omit<Member, 'id'>>;
  if (Object.keys(changes).length === 0) return normalizeMember(member.id, raw as Partial<Omit<Member, 'id'>>);

  const log = buildAdminLog({
    action: 'member_edited',
    targetType: 'member',
    targetId: member.id,
    targetLabel: memberDisplayName(merged),
    details: `fields: ${Object.keys(changes).join(', ')}`,
  });
  const writeCard = await isCardWritable(merged.userId16);
  const batch = writeBatch(db);
  batch.update(memberRef(member.id), changes);
  if (writeCard) {
    batch.set(cardRef(merged.userId16 as string), memberCardPayload(buildMemberCard(merged as Omit<Member, 'id'>)));
  }
  batch.set(log.ref, log.data);
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${member.id}`);
  }
  return normalizeMember(member.id, merged);
}

/**
 * Admin: removes authUid from the member (and ownerUid from its card) so the person can link again
 * (next sign-in through the verified-email path when the stored email equals their login email). One batch
 * with the member_unlinked log. Throws errors.memberNotLinked / errors.cannotUnlinkSignInProfile (a
 * members/{uid} sign-in profile: the doc id IS the login; merge or delete it instead).
 */
export async function unlinkMemberLogin(member: Member): Promise<Member> {
  await requireAdminUser();
  const snap = await getDocFromServer(memberRef(member.id));
  if (!snap.exists()) throw new Error(translate('errors.memberRecordMissing'));
  const raw = snap.data() as Record<string, unknown>;
  const authUid = typeof raw.authUid === 'string' ? raw.authUid : '';
  if (!authUid) throw new Error(translate('errors.memberNotLinked'));
  if (member.id === authUid) throw new Error(translate('errors.cannotUnlinkSignInProfile'));
  if (isMainAccountKccId(String(raw.userId16 ?? '')) || (isMainAdminUser(auth.currentUser) && authUid === auth.currentUser?.uid))
    throw new Error(translate('errors.adminIsMainAccount'));

  const { authUid: _removed, ...rest } = raw;
  const unlinked = rest as Partial<Omit<Member, 'id'>>;
  const log = buildAdminLog({
    action: 'member_unlinked',
    targetType: 'member',
    targetId: member.id,
    targetLabel: memberDisplayName(unlinked),
  });
  const writeCard = await isCardWritable(unlinked.userId16);
  const batch = writeBatch(db);
  batch.update(memberRef(member.id), { authUid: deleteField() });
  if (writeCard) {
    batch.set(cardRef(unlinked.userId16 as string), memberCardPayload(buildMemberCard(unlinked as Omit<Member, 'id'>)));
  }
  batch.set(log.ref, log.data);
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${member.id}`);
  }
  return normalizeMember(member.id, unlinked);
}

async function deleteRefsInBatches(refs: DocumentReference[]): Promise<void> {
  for (let i = 0; i < refs.length; i += ADMIN_BATCH_SIZE) {
    const batch = writeBatch(db);
    refs.slice(i, i + ADMIN_BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

/**
 * Purges all member documents and the member cards of their KCC IDs (admin only). Logs member_deleted
 * (bulk, best effort), also when it stops part-way.
 */
export async function purgeAllMembersFromFirestore(): Promise<number> {
  const snap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  if (snap.empty) return 0;

  const cardIds = new Set<string>();
  snap.docs.forEach((d) => {
    const storedId = d.data().userId16;
    if (isValidKccId(storedId)) cardIds.add(storedId);
  });

  const memberRefs: DocumentReference[] = snap.docs.map((d) => doc(db, MEMBERS_COLLECTION, d.id));
  const cardRefs: DocumentReference[] = Array.from(cardIds).map((id) => doc(db, MEMBER_CARDS_COLLECTION, id));

  let complete = false;
  try {
    await deleteRefsInBatches(memberRefs);
    await deleteRefsInBatches(cardRefs);
    complete = true;
  } finally {
    // The most destructive admin action must not be missing from the audit log
    await writeAdminLog({
      action: 'member_deleted',
      targetType: 'bulk',
      count: memberRefs.length,
      details: `purge: all ${memberRefs.length} members and ${cardRefs.length} cards${complete ? '' : ' (stopped part-way)'}`,
    });
  }
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
 * Members holding a reserved KCC ID (main account or admin range, 8 or 16 digits), except the main
 * account's own doc (main ID linked to mainAdminUid). Sorted by createdAt ascending.
 */
export function listReservedIdHolders(members: Member[], mainAdminUid: string | null): Member[] {
  return members
    .filter((m) => isReservedKccId(m.userId16))
    .filter((m) => !(mainAdminUid && isMainAccountKccId(m.userId16) && m.authUid === mainAdminUid))
    .sort((a, b) => compareByCreatedAtThenId(a.id, a.createdAt, b.id, b.createdAt));
}

interface ExistingMemberClaim {
  kccId: string;
  oldId: string | null;
  name: string;
  aliasWritten: boolean;
  oldCardDeleted: boolean;
}

/**
 * Admin claim transaction for an EXISTING member (after the switch): reads the counter, the member (and,
 * with `writeAlias`, the alias of its old 16-digit ID) and memberCards/{last+1}; writes counter +1, the
 * member's new userId16 (+ legacyUserId16 with `setLegacyId`), the new card, the alias when none exists yet
 * and, with `deleteOldCard`, the old card (<= 5 ops). A member that already moved to an 8-digit ID keeps its
 * old 16-digit ID working: the alias of its `legacyUserId16` is re-pointed to the new ID when it still points
 * to the ID being replaced (otherwise the old ID would resolve to nothing, or to whoever keeps that 8-digit
 * card). Returns null when the member no longer exists or (`skipIfKcc8`) already holds an 8-digit ID (two
 * admins at once).
 */
async function claimKccIdForExistingMember(
  memberId: string,
  options: { skipIfKcc8?: boolean; setLegacyId?: boolean; writeAlias?: boolean; deleteOldCard?: boolean }
): Promise<ExistingMemberClaim | null> {
  return withClaimContentionRetry((seen) => runTransaction(db, async (tx): Promise<ExistingMemberClaim | null> => {
    const counterSnap = await tx.get(counterRef());
    if (!counterSnap.exists()) throw new Error(translate('errors.kccCounterMissing'));
    const memberSnap = await tx.get(memberRef(memberId));
    if (!memberSnap.exists()) return null;
    const raw = memberSnap.data() as Partial<Omit<Member, 'id'>>;
    const oldId = typeof raw.userId16 === 'string' && raw.userId16 ? raw.userId16 : null;
    if (options.skipIfKcc8 && isKccId8(oldId)) return null;
    const aliasSnap = options.writeAlias && isLegacyKccId16(oldId) ? await tx.get(aliasRef(oldId as string)) : null;
    const legacyId =
      isKccId8(oldId) && isLegacyKccId16(raw.legacyUserId16) ? (raw.legacyUserId16 as string) : null;
    const legacyAliasSnap = legacyId ? await tx.get(aliasRef(legacyId)) : null;

    const counter = parseCounter(counterSnap.data());
    seen.last = counter.last;
    const next = counter.last + 1;
    if (next > MAX_KCC_NUMBER) throw new Error(translate('errors.kccIdsExhausted'));
    const kccId = kccIdFromNumber(next);
    const cardSnap = await tx.get(cardRef(kccId));
    if (cardSnap.exists()) throw new Error(translate('errors.kccCounterBlocked'));

    const memberUpdate: Record<string, unknown> = { userId16: kccId };
    if (options.setLegacyId && isLegacyKccId16(oldId)) memberUpdate.legacyUserId16 = oldId;
    tx.update(counterRef(), { last: next, lastId: kccId, updatedAt: new Date().toISOString() });
    tx.update(memberRef(memberId), memberUpdate);
    tx.set(cardRef(kccId), memberCardPayload(buildMemberCard({ ...raw, userId16: kccId } as Omit<Member, 'id'>)));
    const aliasWritten = !!aliasSnap && !aliasSnap.exists();
    if (aliasWritten) {
      tx.set(aliasRef(oldId as string), { kccId, createdAt: new Date().toISOString() });
    }
    if (legacyId && legacyAliasSnap?.exists() && (legacyAliasSnap.data() as { kccId?: unknown }).kccId === oldId) {
      tx.set(aliasRef(legacyId), { kccId, createdAt: new Date().toISOString() });
    }
    const oldCardDeleted = !!options.deleteOldCard && isValidKccId(oldId) && oldId !== kccId;
    if (oldCardDeleted) tx.delete(cardRef(oldId as string));
    return { kccId, oldId, name: memberDisplayName(raw), aliasWritten, oldCardDeleted };
  }));
}

/**
 * Admin one-click: gives a member a new KCC ID and removes (or rebuilds for the remaining holder) the card
 * of the old ID. After the switch the next counter number is claimed; before it a unique chronological
 * 16-digit ID (from createdAt) is generated as before. Logs kcc_id_repair (best effort).
 */
export async function reassignMemberUserId16(member: Member, allMembers: Member[]): Promise<string> {
  await requireAdminUser('errors.repairAdminOnly');
  const counter = await getKccCounter();
  let oldId: string | null = member.userId16 || null;
  let newId: string;

  if (counter) {
    const claim = await claimKccIdForExistingMember(member.id, {});
    if (!claim) throw new Error(translate('errors.memberRecordMissing'));
    newId = claim.kccId;
    oldId = claim.oldId;
  } else {
    const usedIds = new Set<string>();
    allMembers.forEach((m) => {
      if (isValidKccId(m.userId16)) usedIds.add(m.userId16);
    });
    newId = generateUniqueChronologicalUserId16(member.createdAt, usedIds);
    const batch = writeBatch(db);
    batch.update(memberRef(member.id), { userId16: newId });
    batch.set(cardRef(newId), memberCardPayload(buildMemberCard({ ...member, userId16: newId })));
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${member.id}`);
    }
  }

  if (oldId && isValidKccId(oldId) && oldId !== newId) {
    await releaseMemberCard(oldId);
  }
  await writeAdminLog({
    action: 'kcc_id_repair',
    targetType: 'member',
    targetId: member.id,
    targetLabel: memberDisplayName(member),
    details: `reassigned ${oldId || '-'} -> ${newId}`,
  });
  return newId;
}

/**
 * Best effort (admin), after a member stopped holding `oldId`: deletes memberCards/{oldId} when no member
 * holds that KCC ID any more, otherwise rebuilds the card for the remaining holder (the old card may
 * still show the previous member's data). Failures are only logged.
 */
async function releaseMemberCard(oldId: string): Promise<void> {
  if (!isValidKccId(oldId)) return;
  try {
    const holders = await getDocsFromServer(
      query(collection(db, MEMBERS_COLLECTION), where('userId16', '==', oldId), limit(1))
    );
    if (holders.empty) {
      await deleteDoc(cardRef(oldId));
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
  if (isValidKccId(updated.userId16)) {
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
  if (isMainAccountKccId(m.userId16) && m.authUid) return 0;
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
    typeof keeperRaw.userId16 === 'string' && isValidKccId(keeperRaw.userId16) ? keeperRaw.userId16 : null;
  const duplicateStoredId =
    typeof duplicateRaw.userId16 === 'string' && isValidKccId(duplicateRaw.userId16) ? duplicateRaw.userId16 : null;
  const merged = normalizeMember(keeper.id, { ...keeperRaw, ...(updates as Partial<Omit<Member, 'id'>>) });

  // After the switch a NEW 16-digit card cannot be created (rules): a keeper still on its old 16-digit ID
  // only gets its card refreshed when that card exists
  const writeKeeperCard = !!keeperStoredId && (await isCardWritable(keeperStoredId));

  // After the switch: the duplicate's old 16-digit ID (alias) now points to the keeper's KCC ID
  const duplicateLegacyId =
    isLegacyKccId16(duplicateRaw.legacyUserId16) && isKccId8(keeperStoredId) ? (duplicateRaw.legacyUserId16 as string) : null;

  // <= 4 operations (admin batches stay far below the rules' 20 exists() calls)
  const batch = writeBatch(db);
  if (Object.keys(updates).length > 0) {
    batch.update(keeperRef, updates);
  }
  if (keeperStoredId && writeKeeperCard) {
    batch.set(cardRef(keeperStoredId), memberCardPayload(buildMemberCard({ ...merged, userId16: keeperStoredId })));
  }
  if (duplicateLegacyId && keeperStoredId) {
    batch.set(aliasRef(duplicateLegacyId), { kccId: keeperStoredId, createdAt: new Date().toISOString() });
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

  await writeAdminLog({
    action: 'duplicates_merged',
    targetType: 'member',
    targetId: keeper.id,
    targetLabel: memberDisplayName(merged),
    count: 1,
    details: `merged ${duplicate.id} into ${keeper.id}`,
  });

  return merged;
}

interface RepairRow {
  id: string;
  data: Partial<Omit<Member, 'id'>>;
  storedId: string | null; // stored userId16 when it is a valid KCC ID (8 or 16 digits)
  target: string | null;
  finalId: string;
  claim?: MemberIdReassignment['reason']; // after the switch: gets the next counter number (reason)
}

/**
 * Admin-only, idempotent repair:
 * (1) the main account doc gets the main ID (0000 0000 after the switch, 16 zeros before), (2) members
 * sharing a KCC ID keep it only for the earliest registration, (3) members without a valid ID get one,
 * (4) memberCards are rebuilt and cards of IDs nobody holds any more are deleted. New IDs: before the switch
 * unique chronological 16-digit IDs (as before); after it the next counter numbers (admin claim per member).
 * After the switch, members still on a 16-digit ID are left to the 8-digit migration (their cards are not
 * rewritten: the rules deny new 16-digit cards). A second run reassigns nothing and rewrites identical
 * cards. Logs kcc_id_repair (best effort).
 */
export async function repairMemberIdsAndCards(
  onProgress?: (done: number, total: number) => void
): Promise<MemberRepairReport> {
  const currentUser = await requireAdminUser('errors.repairAdminOnly');

  const report: MemberRepairReport = {
    scanned: 0,
    duplicateGroups: 0,
    reassigned: [],
    cardsWritten: 0,
    cardsDeleted: 0,
    reservedHolders: [],
    errors: [],
  };

  const counter = await getKccCounter();
  const afterSwitch = !!counter;
  const mainId = afterSwitch ? MAIN_ACCOUNT_KCC_ID : MAIN_ACCOUNT_UID;

  // Raw member docs straight from the server
  const snap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  const rows: RepairRow[] = snap.docs.map((d) => {
    const data = d.data() as Partial<Omit<Member, 'id'>>;
    const storedId = isValidKccId(data.userId16) ? (data.userId16 as string) : null;
    return { id: d.id, data, storedId, target: storedId, finalId: '' };
  });
  report.scanned = rows.length;

  const byCreatedAt = (a: RepairRow, b: RepairRow) =>
    compareByCreatedAtThenId(a.id, a.data.createdAt, b.id, b.data.createdAt);
  const rowName = (r: RepairRow) => memberDisplayName(r.data);
  const rawStoredId = (r: RepairRow): string | null =>
    typeof r.data.userId16 === 'string' && r.data.userId16 ? r.data.userId16 : null;

  // Main account: the doc linked to the signed-in main admin that already stores the main ID (the one its
  // sign-in profile uses), otherwise the earliest doc linked to the main admin. After the switch a main doc
  // still on 16 zeros is converted by the 8-digit migration (keeps its alias), not here.
  const mainUid = isMainAdminUser(currentUser) ? currentUser.uid : null;
  const mainLinkedRows = mainUid ? rows.filter((r) => r.data.authUid === mainUid).sort(byCreatedAt) : [];
  const founderRow: RepairRow | null =
    mainLinkedRows.find((r) => isMainAccountKccId(r.storedId)) || mainLinkedRows[0] || null;
  if (founderRow && !(afterSwitch && founderRow.storedId === MAIN_ACCOUNT_UID)) founderRow.target = mainId;

  const usedIds = new Set<string>();
  rows.forEach((r) => {
    if (r.target) usedIds.add(r.target);
  });

  const reassign = (r: RepairRow, reason: MemberIdReassignment['reason']) => {
    if (afterSwitch) {
      r.claim = reason; // numbered by the counter below
      return;
    }
    const newId = generateUniqueChronologicalUserId16(r.data.createdAt, usedIds);
    usedIds.add(newId);
    r.finalId = newId;
    report.reassigned.push({ memberId: r.id, name: rowName(r), fromUserId16: rawStoredId(r), toUserId16: newId, reason });
  };

  // Duplicated KCC IDs: keep the founder (for the main ID) or the earliest registration, reassign the rest
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
    const keeper = targetId === mainId && founderRow && groupRows.includes(founderRow) ? founderRow : sorted[0];
    keeper.finalId = targetId;
    sorted.forEach((r) => {
      if (r !== keeper) reassign(r, 'duplicate');
    });
  });

  if (founderRow && founderRow.finalId === mainId && founderRow.storedId !== mainId) {
    report.reassigned.push({
      memberId: founderRow.id,
      name: rowName(founderRow),
      fromUserId16: rawStoredId(founderRow),
      toUserId16: mainId,
      reason: 'main_account',
    });
  }

  // Members without a valid stored KCC ID
  rows
    .filter((r) => !r.target)
    .sort(byCreatedAt)
    .forEach((r) => reassign(r, 'missing'));

  const claimRows = rows.filter((r) => r.claim).sort(byCreatedAt);
  const batchRows = rows.filter((r) => !r.claim && r.finalId !== r.data.userId16);
  const plannedStaleIds = new Set(
    rows.filter((r) => r.storedId && r.storedId !== r.finalId).map((r) => r.storedId as string)
  );
  const total = batchRows.length + claimRows.length + rows.length + plannedStaleIds.size;
  let done = 0;
  const failedRowIds = new Set<string>();

  // Persist the new KCC IDs (before the switch, and the main account's own ID)
  for (let i = 0; i < batchRows.length; i += ADMIN_BATCH_SIZE) {
    const chunk = batchRows.slice(i, i + ADMIN_BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((r) => batch.update(memberRef(r.id), { userId16: r.finalId }));
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

  // After the switch: one admin claim transaction per member that needs a new number
  for (const r of claimRows) {
    try {
      const claim = await claimKccIdForExistingMember(r.id, {});
      if (claim) {
        r.finalId = claim.kccId;
        report.reassigned.push({
          memberId: r.id,
          name: rowName(r),
          fromUserId16: rawStoredId(r),
          toUserId16: claim.kccId,
          reason: r.claim as MemberIdReassignment['reason'],
        });
      } else {
        failedRowIds.add(r.id); // deleted meanwhile
      }
    } catch (error) {
      failedRowIds.add(r.id);
      report.errors.push(translate('errors.repairIdUpdateFailed', { ids: r.id, detail: errorText(error) }));
      if (error instanceof Error && error.message === translate('errors.kccCounterBlocked')) break;
    }
    done += 1;
    if (onProgress) onProgress(done, total);
  }

  // (Re)build the public card of every member whose ID is now persisted (ownerUid = authUid). After the
  // switch only 8-digit cards are written (new 16-digit cards are denied; the migration rebuilds those).
  const cardRows = rows.filter(
    (r) => !failedRowIds.has(r.id) && isValidKccId(r.finalId) && (!afterSwitch || isKccId8(r.finalId))
  );
  for (let i = 0; i < cardRows.length; i += ADMIN_BATCH_SIZE) {
    const chunk = cardRows.slice(i, i + ADMIN_BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((r) =>
      batch.set(
        cardRef(r.finalId),
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
    if (failedRowIds.has(r.id) || !r.finalId) {
      if (r.storedId) heldIds.add(r.storedId);
    } else {
      heldIds.add(r.finalId);
    }
  });
  const staleIds = Array.from(
    new Set(
      rows
        .filter((r) => !failedRowIds.has(r.id) && r.finalId && r.storedId && r.storedId !== r.finalId)
        .map((r) => r.storedId as string)
    )
  ).filter((id) => !heldIds.has(id));
  for (let i = 0; i < staleIds.length; i += ADMIN_BATCH_SIZE) {
    const chunk = staleIds.slice(i, i + ADMIN_BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((id) => batch.delete(cardRef(id)));
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
    normalizeMember(r.id, { ...r.data, userId16: failedRowIds.has(r.id) || !r.finalId ? r.data.userId16 : r.finalId })
  );
  report.reservedHolders = listReservedIdHolders(finalMembers, mainUid);

  await writeAdminLog({
    action: 'kcc_id_repair',
    targetType: 'bulk',
    count: report.reassigned.length,
    details: `scanned ${report.scanned}, duplicate groups ${report.duplicateGroups}, reassigned ${report.reassigned.length}, cards written ${report.cardsWritten}, cards deleted ${report.cardsDeleted}, errors ${report.errors.length}`,
  });

  if (onProgress) onProgress(total, total);
  return report;
}

// ---------------------------------------------------------------------------------------------
// "Switch to 8-digit KCC IDs" (chronological renumbering; resumable and idempotent)
// ---------------------------------------------------------------------------------------------

async function readPlannerRows(): Promise<PlannerMemberRow[]> {
  const snap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as Partial<Omit<Member, 'id'>> }));
}

/** Admin, no writes: the migration plan from fresh server data (members + counter). */
export async function previewKccIdMigration(): Promise<KccIdMigrationPlan> {
  const me = await requireAdminUser();
  const [rows, counter] = await Promise.all([readPlannerRows(), getKccCounter()]);
  return planKccIdMigration(rows, counter, isMainAdminUser(me) ? me.uid : null);
}

function isAborted(signal?: AbortSignal): boolean {
  return !!signal && signal.aborted;
}

/**
 * Admin: applies the 8-digit switch (spec-data 2.5); resumable and idempotent (re-running after completion
 * changes nothing).
 * 0. recompute the plan from the server: before the switch it must equal the previewed one
 *    (errors.migrationPlanChanged); a switch started by someone else since the preview ->
 *    errors.migrationAlreadyStarted (preview again to resume); on resume the recomputed plan is used;
 * 1. 'counter' (fresh start): create counters/kccId { last = planEnd, planEnd } in a transaction; from then on
 *    public registrations get planEnd + 1, … and the rules close the 16-digit path;
 * 2. 'members': 3 members per batch (member userId16 + legacyUserId16, new card, alias, old-card delete =
 *    <= 12 ops); stops at the first failed batch (re-running resumes); `signal` is checked between batches;
 * 3. 'late': members still on a 16-digit / missing ID get counter numbers (admin claim transactions);
 * 4. 'photos' (rewritePhotos, default true): photos.userId16 old -> new (reads every photo once: Wi-Fi).
 * Logs kcc_id_migration (best effort).
 */
export async function applyKccIdMigration(
  previewed: KccIdMigrationPlan,
  onProgress?: (done: number, total: number, phase: 'counter' | 'members' | 'late' | 'photos') => void,
  options?: { rewritePhotos?: boolean; signal?: AbortSignal }
): Promise<KccIdMigrationReport> {
  const me = await requireAdminUser();
  const mainUid = isMainAdminUser(me) ? me.uid : null;
  const signal = options?.signal;
  const report: KccIdMigrationReport = {
    migrated: 0,
    aliasesWritten: 0,
    cardsWritten: 0,
    oldCardsDeleted: 0,
    lateClaimed: 0,
    photosUpdated: 0,
    errors: [],
    complete: false,
  };

  const [rows, counter] = await Promise.all([readPlannerRows(), getKccCounter()]);
  if (counter && !previewed?.counter) throw new Error(translate('errors.migrationAlreadyStarted'));
  let plan = planKccIdMigration(rows, counter, mainUid);
  if (!counter && plan.signature !== previewed?.signature) {
    throw new Error(translate('errors.migrationPlanChanged'));
  }
  const rawById = new Map(rows.map((r) => [r.id, r.data] as const));

  const finish = async (): Promise<KccIdMigrationReport> => {
    await writeAdminLog({
      action: 'kcc_id_migration',
      targetType: 'bulk',
      count: report.migrated,
      details: `migrated ${report.migrated}, late ${report.lateClaimed}, aliases ${report.aliasesWritten}, photos ${report.photosUpdated}, errors ${report.errors.length}${report.complete ? '' : ', incomplete'}`,
    });
    return report;
  };

  // 1. Counter (fresh start)
  if (!counter) {
    if (onProgress) onProgress(0, 1, 'counter');
    const planEnd = plan.planEnd;
    // Public claims continue after the block, and after any 8-digit member number already given out
    const last = plan.rows.reduce((max, r) => {
      const n = r.kind === 'done' ? kccNumber(r.toId) : null;
      return n !== null && n > max ? n : max;
    }, planEnd);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef());
      if (snap.exists()) throw new Error(translate('errors.migrationAlreadyStarted'));
      tx.set(counterRef(), {
        last,
        lastId: kccIdFromNumber(last),
        planEnd,
        updatedAt: new Date().toISOString(),
      });
    });
    if (onProgress) onProgress(1, 1, 'counter');
    // Same numbers as the fresh plan (free numbers 101..planEnd in the same order)
    plan = planKccIdMigration(rows, { last, lastId: kccIdFromNumber(last), planEnd }, mainUid);
  }

  // 2. Members, in plan order
  const batches = buildMigrationBatches(plan);
  const memberTotal = batches.reduce((sum, b) => sum + b.length, 0);
  let memberDone = 0;
  if (onProgress) onProgress(0, memberTotal, 'members');
  for (const chunk of batches) {
    if (isAborted(signal)) {
      report.errors.push(translate('errors.migrationCancelled'));
      return finish();
    }
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    let aliases = 0;
    let deletes = 0;
    chunk.forEach((row: KccIdMigrationRow) => {
      const raw = rawById.get(row.memberId) || {};
      const update: Record<string, unknown> = { userId16: row.toId };
      if (isLegacyKccId16(row.fromId)) update.legacyUserId16 = row.fromId;
      batch.update(memberRef(row.memberId), update);
      batch.set(
        cardRef(row.toId),
        memberCardPayload(buildMemberCard({ ...raw, userId16: row.toId } as Omit<Member, 'id'>))
      );
      if (row.writesAlias && isLegacyKccId16(row.fromId)) {
        batch.set(aliasRef(row.fromId as string), { kccId: row.toId, createdAt: now });
        aliases++;
      }
      if (row.deletesOldCard && isLegacyKccId16(row.fromId)) {
        batch.delete(cardRef(row.fromId as string));
        deletes++;
      }
    });
    try {
      await batch.commit();
    } catch (error) {
      report.errors.push(
        translate('errors.migrationBatchFailed', {
          ids: chunk.map((r) => r.memberId).join(', '),
          detail: errorText(error),
        })
      );
      return finish();
    }
    report.migrated += chunk.length;
    report.cardsWritten += chunk.length;
    report.aliasesWritten += aliases;
    report.oldCardsDeleted += deletes;
    memberDone += chunk.length;
    if (onProgress) onProgress(memberDone, memberTotal, 'members');
  }

  // 3. Late claims: 16-digit / missing IDs that are still left (registered before the counter existed)
  const fresh = await readPlannerRows();
  const pendingLate = fresh
    .filter((r) => !isKccId8(r.data.userId16))
    .sort((a, b) => compareByCreatedAtThenId(a.id, a.data.createdAt, b.id, b.data.createdAt));
  let lateFailed = 0;
  if (onProgress) onProgress(0, pendingLate.length, 'late');
  for (let i = 0; i < pendingLate.length; i++) {
    if (isAborted(signal)) {
      report.errors.push(translate('errors.migrationCancelled'));
      return finish();
    }
    const row = pendingLate[i];
    const oldId = typeof row.data.userId16 === 'string' ? row.data.userId16 : '';
    // The old card is deleted only when no other member still holds that old ID
    const otherHolder = isLegacyKccId16(oldId)
      ? fresh.some((r) => r.id !== row.id && r.data.userId16 === oldId)
      : true;
    try {
      const claim = await claimKccIdForExistingMember(row.id, {
        skipIfKcc8: true,
        setLegacyId: true,
        writeAlias: true,
        deleteOldCard: !otherHolder,
      });
      if (claim) {
        report.lateClaimed++;
        report.cardsWritten++;
        if (claim.aliasWritten) report.aliasesWritten++;
        if (claim.oldCardDeleted) report.oldCardsDeleted++;
        row.data = {
          ...row.data,
          userId16: claim.kccId,
          legacyUserId16: isLegacyKccId16(claim.oldId) ? (claim.oldId as string) : row.data.legacyUserId16,
        };
      }
    } catch (error) {
      lateFailed++;
      report.errors.push(
        translate('errors.migrationLateClaimFailed', { name: memberDisplayName(row.data), detail: errorText(error) })
      );
      if (error instanceof Error && error.message === translate('errors.kccCounterBlocked')) break;
    }
    if (onProgress) onProgress(i + 1, pendingLate.length, 'late');
  }
  // Every late row was claimed or no longer needed one (deleted / migrated by another admin meanwhile)
  report.complete = lateFailed === 0;

  // 4. Photos: userId16 old -> new
  if (options?.rewritePhotos !== false) {
    // old ID -> new ID. An old ID shared by several members follows its alias (the earliest holder), unless
    // the photo's memberId names the holder that uploaded it.
    const map = new Map<string, string>();
    const newIdByMember = new Map<string, { legacy: string; kccId: string }>();
    [...fresh]
      .sort((a, b) => compareByCreatedAtThenId(a.id, a.data.createdAt, b.id, b.data.createdAt))
      .forEach((r) => {
        const legacy = r.data.legacyUserId16;
        if (!isLegacyKccId16(legacy) || !isKccId8(r.data.userId16)) return;
        newIdByMember.set(r.id, { legacy, kccId: r.data.userId16 });
        if (!map.has(legacy)) map.set(legacy, r.data.userId16);
      });
    // Rows migrated in this run carry legacyUserId16 only on the server: add them from the plan
    plan.rows.forEach((r) => {
      if (r.kind !== 'done' && r.note !== 'late_claim' && isLegacyKccId16(r.fromId) && !map.has(r.fromId as string)) {
        map.set(r.fromId as string, r.toId);
      }
    });
    if (map.size > 0) {
      let cursor: QueryDocumentSnapshot | null = null;
      let scanned = 0;
      for (;;) {
        if (isAborted(signal)) {
          report.errors.push(translate('errors.migrationCancelled'));
          return finish();
        }
        const q: Query = cursor
          ? query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'), startAfter(cursor), limit(PHOTO_PAGE_FOR_MIGRATION))
          : query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'), limit(PHOTO_PAGE_FOR_MIGRATION));
        let page: QuerySnapshot;
        try {
          page = await getDocsFromServer(q);
        } catch (error) {
          report.errors.push(translate('errors.migrationPhotosFailed', { ids: '-', detail: errorText(error) }));
          break;
        }
        const updates = page.docs
          .map((d) => {
            const data = d.data() as { userId16?: unknown; memberId?: unknown };
            const oldId = typeof data.userId16 === 'string' ? data.userId16 : '';
            const owner = typeof data.memberId === 'string' ? newIdByMember.get(data.memberId) : undefined;
            const newId = owner && owner.legacy === oldId ? owner.kccId : map.get(oldId);
            return { id: d.id, newId };
          })
          .filter((p): p is { id: string; newId: string } => !!p.newId);
        for (let i = 0; i < updates.length; i += ADMIN_BATCH_SIZE) {
          const chunk = updates.slice(i, i + ADMIN_BATCH_SIZE);
          const batch = writeBatch(db);
          chunk.forEach((p) => batch.update(doc(db, PHOTOS_COLLECTION, p.id), { userId16: p.newId }));
          try {
            await batch.commit();
            report.photosUpdated += chunk.length;
          } catch (error) {
            report.errors.push(
              translate('errors.migrationPhotosFailed', { ids: chunk.map((p) => p.id).join(', '), detail: errorText(error) })
            );
          }
        }
        scanned += page.docs.length;
        if (onProgress) onProgress(scanned, scanned + (page.docs.length === PHOTO_PAGE_FOR_MIGRATION ? PHOTO_PAGE_FOR_MIGRATION : 0), 'photos');
        if (page.docs.length < PHOTO_PAGE_FOR_MIGRATION) break;
        cursor = page.docs[page.docs.length - 1];
      }
    }
  }

  return finish();
}

// ---------------------------------------------------------------------------------------------
// "Fix registration dates from the spreadsheet"
// ---------------------------------------------------------------------------------------------

/**
 * Admin, no writes. `rows` = formatted sheet values incl. header (A1:Z2000), `timestamps` =
 * sheetsService.fetchTimestampColumn of the mapped timestamp column, `context` = sheetTimeContext(meta).
 * Members are read from the server and matched (adminPlanning.matchSheetRowsToMembers).
 */
export async function previewRegistrationDateFix(input: {
  rows: string[][];
  mapping: ColumnMapping;
  timestamps: Array<number | string | null>;
  context: SheetTimeContext;
}): Promise<RegistrationDateFixPlan> {
  await requireAdminUser();
  if (!input?.mapping || input.mapping.timestamp < 0) {
    throw new Error(translate('errors.sheetsNoTimestampColumn'));
  }
  const snap = await getDocsFromServer(collection(db, MEMBERS_COLLECTION));
  const members = snap.docs.map((d) => normalizeMember(d.id, d.data() as Partial<Omit<Member, 'id'>>));
  const sheetRows = buildSheetDateRows(input.rows, input.mapping, input.timestamps, input.context);
  return matchSheetRowsToMembers(sheetRows, members, input.context);
}

/**
 * Admin: writes createdAt = sheet time for the given (selected) rows: re-reads each member from the server,
 * then per member `update(createdAt)` + the card rebuilt with the same createdAt (card and member createdAt
 * must stay byte-identical: the owner-refresh rule compares them). 7 members per batch (14 ops). A failed
 * batch is reported and the remaining batches continue. Logs registration_dates_fixed (best effort).
 */
export async function applyRegistrationDateFix(
  rows: RegistrationDateFixRow[],
  onProgress?: (done: number, total: number) => void,
  options?: { spreadsheetId?: string }
): Promise<RegistrationDateFixReport> {
  await requireAdminUser();
  const report: RegistrationDateFixReport = { updated: 0, cardsWritten: 0, errors: [] };
  const list = (rows || []).filter((r) => r && r.memberId && r.sheetCreatedAt && !isNaN(Date.parse(r.sheetCreatedAt)));
  const counter = list.length > 0 ? await getKccCounter() : null;
  let done = 0;

  for (let i = 0; i < list.length; i += DATE_FIX_MEMBERS_PER_BATCH) {
    const chunk = list.slice(i, i + DATE_FIX_MEMBERS_PER_BATCH);
    try {
      const snaps = await Promise.all(chunk.map((r) => getDocFromServer(memberRef(r.memberId))));
      const writable = await Promise.all(
        snaps.map((s) => (s.exists() ? isCardWritable((s.data() as Partial<Member>).userId16, counter) : false))
      );
      const batch = writeBatch(db);
      let members = 0;
      let cards = 0;
      chunk.forEach((row, k) => {
        const snap = snaps[k];
        if (!snap.exists()) {
          report.errors.push(translate('errors.memberRecordMissing') + ` (${row.memberId})`);
          return;
        }
        const raw = snap.data() as Partial<Omit<Member, 'id'>>;
        const iso = new Date(row.sheetCreatedAt).toISOString();
        batch.update(memberRef(row.memberId), { createdAt: iso });
        members++;
        if (writable[k]) {
          batch.set(
            cardRef(raw.userId16 as string),
            memberCardPayload(buildMemberCard({ ...raw, createdAt: iso } as Omit<Member, 'id'>))
          );
          cards++;
        }
      });
      if (members > 0) {
        await batch.commit();
        report.updated += members;
        report.cardsWritten += cards;
      }
    } catch (error) {
      report.errors.push(
        translate('errors.dateFixBatchFailed', { ids: chunk.map((r) => r.memberId).join(', '), detail: errorText(error) })
      );
    }
    done += chunk.length;
    if (onProgress) onProgress(done, list.length);
  }

  await writeAdminLog({
    action: 'registration_dates_fixed',
    targetType: 'bulk',
    count: report.updated,
    details: `${options?.spreadsheetId ? `sheet ${options.spreadsheetId}: ` : ''}updated ${report.updated}, cards ${report.cardsWritten}, errors ${report.errors.length}`,
  });
  return report;
}
