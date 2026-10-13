import type { Member } from '../types';
import { translate } from '../i18n';

// =============================================================================================
// KCC ID (stored in the field `userId16` for compatibility, see AGENTS.md section 5)
// - 8 digits (current): 00000000 = main account, 00000001-00000100 = admin range (admin-assigned
//   only), members 00000101-99999999 issued by the counter counters/kccId, never reused.
// - 16 digits (legacy, before the 8-digit switch): 0000000000000000 = main account,
//   0000000000000001-0000000000000100 = admin range, members YYYYMMDDHHmmss + 2-digit sequence.
// Every "is this a stored KCC ID" check uses isValidKccId (8 or 16 digits).
// =============================================================================================

export const MAIN_ACCOUNT_EMAIL = 'cosplaysehat@gmail.com';
export const FOUNDER_ADMIN_EMAIL = MAIN_ACCOUNT_EMAIL;
/** Main account's 8-digit KCC ID (after the 8-digit switch). */
export const MAIN_ACCOUNT_KCC_ID = '00000000';
/** Legacy 16-digit main account ID (kept, used before the switch). Prefer mainAccountKccId() for display. */
export const MAIN_ACCOUNT_UID = '0000000000000000';
export const FOUNDER_USER_ID = MAIN_ACCOUNT_UID;

// KCC Admin range: 1 to 100 (0000 0001 - 0000 0100; legacy 0000 0000 0000 0001 - 0000 0000 0000 0100)
export const ADMIN_UID_START = 1;
export const ADMIN_UID_END = 100;
/** First number the counter gives to a regular member (0000 0101). */
export const FIRST_MEMBER_NUMBER = 101;
export const MAX_KCC_NUMBER = 99_999_999;

const KCC8_PATTERN = /^\d{8}$/;
const KCC16_PATTERN = /^\d{16}$/;
const LEGACY_RESERVED_MAX = '0000000000000100';
const KCC8_RESERVED_MAX = '00000100';
const PLACEHOLDER_KCC_ID = '---- ----';

/** 8-digit KCC ID (raw stored value, no spaces). */
export function isKccId8(id: unknown): id is string {
  return typeof id === 'string' && KCC8_PATTERN.test(id);
}

/** Legacy 16-digit KCC ID (raw stored value, no spaces). */
export function isLegacyKccId16(id: unknown): id is string {
  return typeof id === 'string' && KCC16_PATTERN.test(id);
}

/** A stored KCC ID: 8 or 16 digits (== firestore.rules isValidKccId). */
export function isValidKccId(id: unknown): id is string {
  return isKccId8(id) || isLegacyKccId16(id);
}

/**
 * Reserved KCC ID (main account or admin range): 8 digits <= 00000100, or 16 digits <= 0000000000000100.
 * Valid IDs have a fixed length per format, so lexicographic order equals numeric order (as in the rules).
 */
export function isReservedKccId(id?: string | null): boolean {
  const value = typeof id === 'string' ? id : '';
  if (KCC8_PATTERN.test(value)) return value <= KCC8_RESERVED_MAX;
  if (KCC16_PATTERN.test(value)) return value <= LEGACY_RESERVED_MAX;
  return false;
}

/** The main account's KCC ID in either format ('00000000' or '0000000000000000'). */
export function isMainAccountKccId(id?: string | null): boolean {
  return id === MAIN_ACCOUNT_KCC_ID || id === MAIN_ACCOUNT_UID;
}

/** Admin range 1..100 in either format (the main account's 0 is not part of it). */
export function isAdminRangeKccId(id?: string | null): boolean {
  return isReservedKccId(id) && !isMainAccountKccId(id);
}

/** 8-digit KCC ID -> its number; null for anything else (including 16-digit IDs). */
export function kccNumber(id: string): number | null {
  return isKccId8(id) ? Number(id) : null;
}

/** Integer 0..99,999,999 -> 8-digit KCC ID. Throws RangeError otherwise. */
export function kccIdFromNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > MAX_KCC_NUMBER) {
    throw new RangeError(`KCC number out of range: ${n}`);
  }
  return String(n).padStart(8, '0');
}

/**
 * Display format: 8 digits -> 'XXXX XXXX', 16 digits -> 'XXXX XXXX XXXX XXXX', anything else -> '---- ----'.
 * Spaces and dashes in the input are ignored; the value is never padded.
 */
export function formatKccId(id?: string | null): string {
  const clean: string = typeof id === 'string' ? id.replace(/[\s-]/g, '') : '';
  if (KCC8_PATTERN.test(clean)) return `${clean.slice(0, 4)} ${clean.slice(4, 8)}`;
  if (KCC16_PATTERN.test(clean)) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
  }
  return PLACEHOLDER_KCC_ID;
}

/** Typed input (spaces, dashes and any other non-digits are stripped) -> 8-digit / legacy 16-digit / invalid. */
export function parseKccIdInput(
  input: string
): { kind: 'kcc8'; id: string } | { kind: 'legacy16'; id: string } | { kind: 'invalid' } {
  const digits = String(input ?? '').replace(/\D/g, '');
  if (isKccId8(digits)) return { kind: 'kcc8', id: digits };
  if (isLegacyKccId16(digits)) return { kind: 'legacy16', id: digits };
  return { kind: 'invalid' };
}

/** Reserved legacy ID -> its 8-digit slot: 16 zeros -> '00000000', '000000000000000N' (N <= 100) -> last 8. */
export function legacyReservedToKcc8(old16: string): string | null {
  if (!isLegacyKccId16(old16) || old16 > LEGACY_RESERVED_MAX) return null;
  return old16.slice(8);
}

/** '00000000xxxxxxxx' -> 'xxxxxxxx' (a 16-digit ID that is just a zero-padded 8-digit ID); else null. */
export function paddedLegacyToKcc8(old16: string): string | null {
  if (!isLegacyKccId16(old16) || !old16.startsWith('00000000')) return null;
  return old16.slice(8);
}

/** Admin slot 1..100 -> 8-digit KCC ID ('000000NN'); out-of-range input is clamped. */
export function formatAdminSlotKccId(slot: number): string {
  const clamped = Math.max(ADMIN_UID_START, Math.min(ADMIN_UID_END, Math.floor(Number(slot) || 0)));
  return kccIdFromNumber(clamped);
}

/** @deprecated Legacy 16-digit format of an admin slot (before the 8-digit switch). Use formatAdminSlotKccId. */
export function formatAdminSlotUserId(slot: number): string {
  const clamped = Math.max(ADMIN_UID_START, Math.min(ADMIN_UID_END, Math.floor(Number(slot) || 0)));
  return clamped.toString().padStart(16, '0');
}

/**
 * Admin UI only: the first admin-range ID (1..100) not held by any of `existing`, in the requested format
 * (8 after the switch, 16 before). A slot held in either format counts as taken. Falls back to slot 100.
 */
export function getNextAvailableAdminSlot(existing: Member[] = [], format: 8 | 16 = 16): string {
  const usedSlots = new Set<number>();
  for (const m of existing) {
    const id = m?.userId16;
    if (isAdminRangeKccId(id)) usedSlots.add(Number(id));
  }
  const toId = format === 8 ? formatAdminSlotKccId : formatAdminSlotUserId;
  for (let slot = ADMIN_UID_START; slot <= ADMIN_UID_END; slot++) {
    if (!usedSlots.has(slot)) return toId(slot);
  }
  return toId(ADMIN_UID_END);
}

// ---------------------------------------------------------------------------------------------
// Deprecated wrappers (kept until every call site uses the KCC ID helpers above)
// ---------------------------------------------------------------------------------------------

/** @deprecated Use isMainAccountKccId (raw value). Accepts formatted input (non-digits are ignored). */
export function isMainAccountUserId(id?: string): boolean {
  if (!id) return false;
  return isMainAccountKccId(id.replace(/\D/g, ''));
}

/** @deprecated Use isAdminRangeKccId (raw value). Accepts formatted input (non-digits are ignored). */
export function isAdminUserId(id?: string): boolean {
  if (!id) return false;
  return isAdminRangeKccId(id.replace(/\D/g, ''));
}

/**
 * @deprecated "Is LEGACY id": exactly 16 digits (== isLegacyKccId16). Every "is this a stored KCC ID"
 * check must use isValidKccId (8 or 16 digits).
 */
export function isValidUserId16(id?: string | null): boolean {
  return isLegacyKccId16(id);
}

/** @deprecated Use isReservedKccId. Accepts formatted input (non-digits are ignored). */
export function isReservedUserId16(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return isReservedKccId(id.replace(/\D/g, ''));
}

/** @deprecated Use formatKccId (an 8-digit ID is shown as 'XXXX XXXX', never padded to 16 digits). */
export function format16DigitUserId(id?: string, _email?: string): string {
  return formatKccId(id);
}

// ---------------------------------------------------------------------------------------------
// Legacy 16-digit generators: ONLY for the pre-switch fallback (no counter yet). They never produce
// an ID starting with 00000000 (the rules reject those for non-admins: they would shadow 8-digit IDs).
// ---------------------------------------------------------------------------------------------

/**
 * Legacy 16-digit ID from a timestamp: YYYY MM DD HH mm ss + 2-digit sequence.
 * Example: 2026-10-08 07:15:30 -> "2026100807153001"
 */
export function generateChronologicalUserId16(
  dateInput?: Date | string | null,
  sequenceNumber: number = 1
): string {
  let date: Date;
  if (!dateInput) {
    date = new Date();
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    date = dateInput;
  } else {
    // Invalid Date or a non-Date value from a legacy document (e.g. a Firestore Timestamp)
    date = new Date();
  }

  const yyyy = date.getFullYear().toString().padStart(4, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  const seq = (Math.max(1, sequenceNumber) % 100).toString().padStart(2, '0');

  const result = `${yyyy}${mm}${dd}${hh}${min}${ss}${seq}`;
  return result.slice(0, 16).padEnd(16, '0');
}

/** Legacy fallback: a 16-digit chronological ID for `dateInput` (default now) with a random sequence. */
export function generate16DigitUserId(dateInput?: Date | string): string {
  return generateChronologicalUserId16(dateInput, Math.floor(1 + Math.random() * 98));
}

/**
 * Legacy fallback: a chronological 16-digit ID (from dateInput, sequence 01-99) that is not in usedIds,
 * not reserved and does not start with 00000000. Falls back to a random sequence for the current time,
 * then to later seconds. Does NOT add the returned ID to usedIds (the caller does that).
 */
export function generateUniqueChronologicalUserId16(
  dateInput: Date | string | null | undefined,
  usedIds: Set<string>
): string {
  const isFree = (candidate: string) =>
    isLegacyKccId16(candidate) &&
    !usedIds.has(candidate) &&
    !isReservedKccId(candidate) &&
    !candidate.startsWith('00000000');

  // An invalid Date object would produce "NaN..." digits, so treat it like a missing date
  const safeDate = dateInput instanceof Date && isNaN(dateInput.getTime()) ? null : dateInput;

  for (let seq = 1; seq <= 99; seq++) {
    const candidate = generateChronologicalUserId16(safeDate, seq);
    if (isFree(candidate)) return candidate;
  }

  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = generate16DigitUserId(new Date());
    if (isFree(candidate)) return candidate;
  }

  // Every sequence of this second is taken: walk forward second by second
  const baseMs = Date.now();
  for (let offset = 1; offset <= 86400; offset++) {
    const shifted = new Date(baseMs + offset * 1000);
    for (let seq = 1; seq <= 99; seq++) {
      const candidate = generateChronologicalUserId16(shifted, seq);
      if (isFree(candidate)) return candidate;
    }
  }

  return generate16DigitUserId(new Date());
}

/**
 * Badge metadata for a KCC ID (8 or 16 digits), based on the stored ID only (an unverified email never
 * grants the main account badge).
 */
export function getUserIdBadgeInfo(
  userId16?: string,
  _email?: string
): {
  type: 'main' | 'admin' | 'member';
  label: string;
  badgeClass: string;
} {
  const clean = (userId16 || '').replace(/[\s-]/g, '');
  if (isMainAccountKccId(clean)) {
    return {
      type: 'main',
      label: translate('errors.badgeMainAccount'),
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  }
  if (isAdminRangeKccId(clean)) {
    return {
      type: 'admin',
      label: translate('errors.badgeAdmin', { number: String(Number(clean)).padStart(4, '0') }),
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
  }
  return {
    type: 'member',
    label: translate('errors.badgeMember'),
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  };
}

/**
 * Clean phone string for comparison (keeps digits only, normalizes leading 0 / 62)
 */
function normalizePhone(p?: string): string {
  if (!p) return '';
  let digits = p.replace(/\D/g, '');
  if (digits.startsWith('62')) digits = '0' + digits.slice(2);
  return digits;
}

/**
 * Normalize social media handle for comparison
 */
function normalizeSocial(s?: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?(instagram|tiktok|twitter|x)\.com\//, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .trim();
}

/** Social media handle for comparison (URL prefix, '@' and trailing slashes removed, lowercase). */
export function normalizeSocialHandle(s?: string): string {
  return typeof s === 'string' ? normalizeSocial(s) : '';
}

/** Phone number for comparison: digits only, leading 62 -> 0 ('' for non-strings). */
export function normalizePhoneDigits(p?: string): string {
  return typeof p === 'string' ? normalizePhone(p) : '';
}

/**
 * Extracts and normalizes all available phone numbers for a member or candidate record
 */
export function extractAllPhones(data?: {
  phone?: string;
  phone2?: string;
  additionalPhones?: string[];
}): string[] {
  if (!data) return [];
  const list: string[] = [];
  // Legacy or hand-edited documents may hold non-string values: only strings are compared
  if (typeof data.phone === 'string' && data.phone) list.push(data.phone);
  if (typeof data.phone2 === 'string' && data.phone2) list.push(data.phone2);
  if (Array.isArray(data.additionalPhones)) {
    for (const p of data.additionalPhones) {
      if (typeof p === 'string' && p) list.push(p);
    }
  }
  return Array.from(new Set(list.map(normalizePhone).filter((p) => p.length >= 8)));
}

// Phone storage limits (identical to firestore.rules: phone/phone2 <= 30 chars, additionalPhones <= 3 x 30).
// Kept local (not imported from firestoreService) to avoid an import cycle.
export const PHONE_MAX_LENGTH = 30;
export const MAX_ADDITIONAL_PHONES = 3;

export interface PhoneFields {
  phone?: string;
  phone2?: string;
  additionalPhones?: string[];
}

/**
 * Merges the phone numbers of an existing record with those of an incoming submission.
 * Existing numbers come first, so the existing primary number stays primary.
 * Numbers are trimmed, clamped to PHONE_MAX_LENGTH and de-duplicated (by normalized digits when the
 * number has 8+ digits, else by lowercased text). Result: phone = 1st, phone2 = 2nd, additionalPhones =
 * up to MAX_ADDITIONAL_PHONES more. Keys without a value are omitted.
 */
export function mergeMemberPhones(
  existing?: PhoneFields | null,
  incoming?: PhoneFields | null
): PhoneFields {
  const raw: unknown[] = [];
  const collect = (src?: PhoneFields | null) => {
    if (!src) return;
    raw.push(src.phone, src.phone2);
    if (Array.isArray(src.additionalPhones)) raw.push(...src.additionalPhones);
  };
  collect(existing);
  collect(incoming);

  const seen = new Set<string>();
  const list: string[] = [];
  for (const value of raw) {
    if (typeof value !== 'string') continue;
    const clean = value.trim().slice(0, PHONE_MAX_LENGTH);
    if (!clean) continue;
    const digits = normalizePhone(clean);
    const key = digits.length >= 8 ? digits : clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(clean);
  }

  const result: PhoneFields = {};
  if (list[0]) result.phone = list[0];
  if (list[1]) result.phone2 = list[1];
  const extra = list.slice(2, 2 + MAX_ADDITIONAL_PHONES);
  if (extra.length > 0) result.additionalPhones = extra;
  return result;
}

/**
 * Checks if a member submission matches an existing member in the database.
 * Requirement: "Each member has a single KCC ID account" & "double filled form with the same/similar data shares the same user ID"
 * Also supports members with multiple phone numbers (primary & secondary/phone2/additionalPhones).
 */
export function findDuplicateMember(
  members: Member[],
  candidate: {
    email?: string;
    phone?: string;
    phone2?: string;
    additionalPhones?: string[];
    discordUsername?: string;
    name?: string;
    cosplayName?: string;
    socialMedia?: string;
    fullName?: string;
  }
): Member | null {
  if (!members || members.length === 0) return null;

  // Raw / legacy documents may hold non-string values: they are treated as empty instead of throwing
  const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
  const discordKey = (value: unknown): string => text(value).toLowerCase().replace(/^@/, '');

  const candEmail = text(candidate.email).toLowerCase();
  const candPhones = extractAllPhones(candidate);
  const candDiscord = discordKey(candidate.discordUsername);
  const candCosname = (text(candidate.name) || text(candidate.cosplayName)).toLowerCase();
  const candSocial = normalizeSocial(text(candidate.socialMedia));

  for (const m of members) {
    if (!m) continue;
    const existingPhones = extractAllPhones(m);
    const existingDiscord = discordKey(m.discordUsername);
    const existingEmail = text(m.email).toLowerCase();

    // 1. WhatsApp Phone match (matches primary, secondary, or any additional phone numbers)
    if (candPhones.length > 0 && existingPhones.length > 0) {
      const hasSharedPhone = candPhones.some((cp) => existingPhones.includes(cp));
      if (hasSharedPhone) {
        return m;
      }
    }

    // 2. Discord Username match
    if (candDiscord && candDiscord.length >= 2) {
      if (existingDiscord && existingDiscord === candDiscord) {
        return m;
      }
    }

    // 3. Email match (if provided and non-empty)
    if (candEmail && candEmail.length > 3) {
      if (existingEmail && existingEmail === candEmail) {
        return m;
      }
    }

    // 4. Social media handle match
    if (candSocial && candSocial.length >= 3) {
      const existingSocial = normalizeSocial(text(m.socialMedia));
      if (existingSocial && existingSocial === candSocial) {
        return m;
      }
    }

    // 5. Exact Name / Cosplay Name match only if not a generic placeholder and no conflicting contact info
    if (candCosname && candCosname.length >= 3) {
      const genericNames = ['member', 'cosplayer', 'cosplay', 'guest', 'kawan', 'anonymous', 'anon', 'admin'];
      if (!genericNames.includes(candCosname)) {
        const existingCosname = (text(m.name) || text(m.cosplayName)).toLowerCase();
        if (existingCosname && existingCosname === candCosname) {
          // If both have phone numbers recorded and none match, they are distinct people!
          if (candPhones.length > 0 && existingPhones.length > 0 && !candPhones.some((p) => existingPhones.includes(p))) {
            continue;
          }
          // If both have Discord usernames and they differ, they are distinct people!
          if (candDiscord && existingDiscord && existingDiscord !== candDiscord) {
            continue;
          }
          // If both have emails and they differ, they are distinct people!
          if (candEmail && existingEmail && existingEmail !== candEmail) {
            continue;
          }
          return m;
        }
      }
    }
  }

  return null;
}
