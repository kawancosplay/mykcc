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
  } else {
    date = dateInput;
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
 */
export function generateSequentialUserId16(sequenceNumber: number): string {
  return Math.max(101, sequenceNumber).toString().padStart(16, '0');
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
 * Formats a 16-digit string into 4 blocks of 4 digits: "XXXX XXXX XXXX XXXX"
 * Guaranteed to return "0000 0000 0000 0000" for cosplaysehat@gmail.com
 */
export function format16DigitUserId(id?: string, email?: string): string {
  if (email && email.toLowerCase().trim() === MAIN_ACCOUNT_EMAIL) {
    return '0000 0000 0000 0000';
  }
  if (!id) return '----------------';
  const clean = id.replace(/\D/g, '').padEnd(16, '0').slice(0, 16);
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)}`;
}

/**
 * Returns badge metadata for the User ID
 */
export function getUserIdBadgeInfo(
  userId16?: string,
  email?: string
): {
  type: 'main' | 'admin' | 'member';
  label: string;
  badgeClass: string;
} {
  const clean = (userId16 || '').replace(/\D/g, '');
  if (clean === MAIN_ACCOUNT_UID || (email && email.toLowerCase().trim() === MAIN_ACCOUNT_EMAIL)) {
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
 * Checks if a member submission matches an existing member in the database.
 * Requirement: "Each member has a single KCC ID account" & "double filled form with the same/similar data shares the same user ID"
 */
export function findDuplicateMember(
  members: Member[],
  candidate: {
    email?: string;
    phone?: string;
    discordUsername?: string;
    name?: string;
    cosplayName?: string;
    socialMedia?: string;
    fullName?: string;
  }
): Member | null {
  if (!members || members.length === 0) return null;

  const candEmail = candidate.email?.trim().toLowerCase() || '';
  const candPhone = normalizePhone(candidate.phone);
  const candDiscord = candidate.discordUsername?.trim().toLowerCase().replace(/^@/, '') || '';
  const candCosname = (candidate.name || candidate.cosplayName || '').trim().toLowerCase();
  const candSocial = normalizeSocial(candidate.socialMedia);

  for (const m of members) {
    // 1. WhatsApp Phone match (primary single KCC ID identifier, at least 8 digits)
    if (candPhone && candPhone.length >= 8) {
      const existingPhone = normalizePhone(m.phone);
      if (existingPhone && existingPhone === candPhone) {
        return m;
      }
    }

    // 2. Discord Username match
    if (candDiscord && candDiscord.length >= 2) {
      const existingDiscord = m.discordUsername?.trim().toLowerCase().replace(/^@/, '') || '';
      if (existingDiscord && existingDiscord === candDiscord) {
        return m;
      }
    }

    // 3. Email match (if provided and non-empty)
    if (candEmail && candEmail.length > 3) {
      const existingEmail = m.email?.trim().toLowerCase() || '';
      if (existingEmail && existingEmail === candEmail) {
        return m;
      }
    }

    // 4. Social media handle match
    if (candSocial && candSocial.length >= 3) {
      const existingSocial = normalizeSocial(m.socialMedia);
      if (existingSocial && existingSocial === candSocial) {
        return m;
      }
    }

    // 5. Exact Name / Cosplay Name match (case-insensitive, trimmed, min 3 chars)
    if (candCosname && candCosname.length >= 3) {
      const existingCosname = (m.name || m.cosplayName || '').trim().toLowerCase();
      if (existingCosname && existingCosname === candCosname) {
        return m;
      }
    }
  }

  return null;
}
