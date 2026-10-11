import { Member } from '../types';

export const MAIN_ACCOUNT_EMAIL = 'cosplaysehat@gmail.com';
export const FOUNDER_ADMIN_EMAIL = MAIN_ACCOUNT_EMAIL;
export const MAIN_ACCOUNT_UID = '0000000000000000';
export const FOUNDER_USER_ID = MAIN_ACCOUNT_UID;

// KCC Admin range: 0000 0000 0000 0001 to 0000 0000 0000 0100 (1 to 100)
export const ADMIN_UID_START = 1;
export const ADMIN_UID_END = 100;

/**
 * Checks if a 16-digit ID belongs to the KCC main account (0000 0000 0000 0000)
 */
export function isMainAccountUserId(id?: string): boolean {
  if (!id) return false;
  return id.replace(/\D/g, '') === MAIN_ACCOUNT_UID;
}

/**
 * Checks if a 16-digit ID is in the reserved KCC Admin range (0000 0000 0000 0001 to 0000 0000 0000 0100)
 */
export function isAdminUserId(id?: string): boolean {
  if (!id) return false;
  const clean = id.replace(/\D/g, '');
  if (clean.length === 0) return false;
  const num = parseInt(clean, 10);
  return !isNaN(num) && num >= ADMIN_UID_START && num <= ADMIN_UID_END;
}

/**
 * Checks if a value is a stored KCC ID: exactly 16 digits (no spaces)
 */
export function isValidUserId16(id?: string | null): boolean {
  return typeof id === 'string' && /^\d{16}$/.test(id);
}

/**
 * Checks if an ID is reserved: main account (0000 0000 0000 0000) or the KCC Admin range (0001-0100).
 * Reserved IDs are never assigned from public form input (firestore.rules allow them for admins only).
 */
export function isReservedUserId16(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return isMainAccountUserId(id) || isAdminUserId(id);
}

/**
 * Formats an admin slot number (1-100) into a 16-digit zero-padded string
 * e.g. slot 1 -> "0000000000000001" (formatted "0000 0000 0000 0001")
 */
export function formatAdminSlotUserId(slot: number): string {
  const clamped = Math.max(ADMIN_UID_START, Math.min(ADMIN_UID_END, Math.floor(slot)));
  return clamped.toString().padStart(16, '0');
}

/**
 * Finds the next available unused admin slot in range 0000 0000 0000 0001 to 0000 0000 0000 0100
 */
export function getNextAvailableAdminSlot(existingMembers: Member[] = []): string {
  const usedSlots = new Set<number>();
  for (const m of existingMembers) {
    if (m.userId16) {
      const clean = m.userId16.replace(/\D/g, '');
      const num = parseInt(clean, 10);
      if (num >= ADMIN_UID_START && num <= ADMIN_UID_END) {
        usedSlots.add(num);
      }
    }
  }

  for (let slot = ADMIN_UID_START; slot <= ADMIN_UID_END; slot++) {
    if (!usedSlots.has(slot)) {
      return formatAdminSlotUserId(slot);
    }
  }

  // Fallback to slot 100 if all filled
  return formatAdminSlotUserId(ADMIN_UID_END);
}

/**
 * Arranges a 16-digit User ID strictly based on timestamp for regular members:
 * Structure: YYYY (4) + MM (2) + DD (2) + HH (2) + mm (2) + ss (2) + Seq (2) = exactly 16 digits.
 * Example: Form filled on 2026-10-08 07:15:30 -> "2026100807153001"
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

/**
 * Arranges a 16-digit User ID strictly based on sequence for regular members:
 * Structure: sequenceNumber.toString().padStart(16, '0')
 * Note: Regular members start strictly after admin slots (0000 0000 0000 0101+).
 * If a 1-based offset (1..100) is passed, it correctly maps to (100 + offset)
 * so member #1 becomes 101, member #2 becomes 102, avoiding identical IDs.
 */
export function generateSequentialUserId16(sequenceNumber: number): string {
  const num = Math.floor(sequenceNumber);
  const resolved = num <= 0 ? 101 : num <= 100 ? 100 + num : num;
  return resolved.toString().padStart(16, '0');
}

/**
 * Finds the next available sequence number for a regular member (starting after admin slots).
 */
export function getNextMemberSequenceNumber(existingMembers: Member[]): number {
  let maxSeq = 100;
  for (const m of existingMembers) {
    if (m.userId16 && !isAdminUserId(m.userId16) && !isMainAccountUserId(m.userId16)) {
      const clean = m.userId16.replace(/\D/g, '');
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  return maxSeq + 1;
}

/**
 * Resolves or generates the 16-digit KCC User ID:
 * - UID 0000 0000 0000 0000 is assigned for KCC main account
 * - UID 0000 0000 0000 0001 to 0000 0000 0000 0100 is assigned to KCC admin
 * - Regular member User IDs are arranged strictly sequentially
 */
export function resolveMemberUserId16(
  emailOrOptions?:
    | string
    | {
        email?: string;
        role?: string;
        isAdmin?: boolean;
        adminSlot?: number;
        sequenceNumber?: number;
        dateInput?: Date | string | null;
        existingMembers?: Member[];
      },
  sequenceNumberOrDate: number | string | Date = 101,
  role?: string,
  existingMembers?: Member[]
): string {
  let email: string | undefined;
  let targetRole: string | undefined = role;
  let isAdmin = false;
  let adminSlot: number | undefined;
  let targetSeq = typeof sequenceNumberOrDate === 'number' ? sequenceNumberOrDate : 101;
  let membersList: Member[] | undefined = existingMembers;
  let dateInput: Date | string | null | undefined;

  if (typeof sequenceNumberOrDate === 'string' || sequenceNumberOrDate instanceof Date) {
    dateInput = sequenceNumberOrDate;
  }

  if (typeof emailOrOptions === 'object' && emailOrOptions !== null) {
    email = emailOrOptions.email;
    targetRole = emailOrOptions.role;
    isAdmin = !!emailOrOptions.isAdmin;
    adminSlot = emailOrOptions.adminSlot;
    targetSeq = emailOrOptions.sequenceNumber ?? targetSeq;
    membersList = emailOrOptions.existingMembers ?? membersList;
    if (emailOrOptions.dateInput) {
      dateInput = emailOrOptions.dateInput;
    }
  } else {
    email = emailOrOptions;
  }

  // 1. KCC Main Account: Strictly 0000 0000 0000 0000
  if (
    (email && email.trim().toLowerCase() === MAIN_ACCOUNT_EMAIL) ||
    targetRole?.toLowerCase().includes('main account') ||
    targetRole?.toLowerCase().includes('founder')
  ) {
    return MAIN_ACCOUNT_UID;
  }

  // 2. KCC Admin: Strictly 0000 0000 0000 0001 to 0000 0000 0000 0100
  const isRoleAdmin =
    isAdmin ||
    (targetRole &&
      (targetRole.toLowerCase().includes('admin') ||
        targetRole.toLowerCase().includes('pengurus') ||
        targetRole.toLowerCase().includes('staff')));

  if (adminSlot && adminSlot >= ADMIN_UID_START && adminSlot <= ADMIN_UID_END) {
    return formatAdminSlotUserId(adminSlot);
  }

  if (isRoleAdmin) {
    return getNextAvailableAdminSlot(membersList);
  }

  // If dateInput is provided and sequenceNumber was not explicitly specified as an ID >= 101, generate chronological
  if (dateInput && targetSeq === 101) {
    return generateChronologicalUserId16(dateInput);
  }

  // 3. Regular Members: Arranged strictly sequentially
  return generateSequentialUserId16(targetSeq);
}


/**
 * Fallback alias: Generates a 16-digit chronological User ID for right now
 */
export function generate16DigitUserId(dateInput?: Date | string): string {
  return generateChronologicalUserId16(dateInput, Math.floor(1 + Math.random() * 98));
}

/**
 * Generates a chronological 16-digit ID (from dateInput, sequence 01-99) that is not in usedIds and
 * not reserved. Falls back to a random sequence for the current time, then to later seconds.
 * Does NOT add the returned ID to usedIds (the caller does that).
 */
export function generateUniqueChronologicalUserId16(
  dateInput: Date | string | null | undefined,
  usedIds: Set<string>
): string {
  const isFree = (candidate: string) =>
    isValidUserId16(candidate) && !usedIds.has(candidate) && !isReservedUserId16(candidate);

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
 * Formats a 16-digit string into 4 blocks of 4 digits: "XXXX XXXX XXXX XXXX"
 * The stored ID is always shown as-is: an email (e.g. typed into the public form) never turns a card
 * into the main account. `_email` is kept only for call-site compatibility.
 */
export function format16DigitUserId(id?: string, _email?: string): string {
  if (!id) return '----------------';
  const clean = id.replace(/\D/g, '').padEnd(16, '0').slice(0, 16);
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
}

/**
 * Returns badge metadata for the User ID
 */
export function getUserIdBadgeInfo(
  userId16?: string,
  _email?: string
): {
  type: 'main' | 'admin' | 'member';
  label: string;
  badgeClass: string;
} {
  // Based on the stored ID only (an unverified email never grants the main account badge)
  const clean = (userId16 || '').replace(/\D/g, '');
  if (clean === MAIN_ACCOUNT_UID) {
    return {
      type: 'main',
      label: 'KCC Main Account (0000)',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  }
  const num = parseInt(clean, 10);
  if (num >= ADMIN_UID_START && num <= ADMIN_UID_END) {
    return {
      type: 'admin',
      label: `KCC Admin #${num.toString().padStart(4, '0')}`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
  }
  return {
    type: 'member',
    label: 'Member (Timestamp)',
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
