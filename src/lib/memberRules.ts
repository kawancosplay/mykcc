import type { Member } from '../types';

// Pure member-field rules shared by firestoreService, sheetsService and the admin planners.
// No Firebase imports here (keeps the planners testable without a database).

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
// userId16, legacyUserId16, authUid, email, source, status, createdAt and memberNumber stay locked.
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

/**
 * Fields an admin may edit on a member (support "Edit details"): the owner-editable fields + email +
 * status. Never userId16, legacyUserId16, authUid, source, createdAt or memberNumber.
 */
export const MEMBER_ADMIN_EDITABLE_FIELDS: readonly string[] = [...MEMBER_OWNER_EDITABLE_FIELDS, 'email', 'status'];

/**
 * Profile form values of the location, role and fandom fields, as stored: the form writes them back on every save,
 * so a default here would land on the member's record. firestore.rules accepts them blank, except city
 * (sanitizeMemberProfileUpdate saves a blank city as 'Worldwide').
 */
export function storedProfileFields(member: Partial<Member>) {
  return {
    country: member.country || '',
    province: member.province || '',
    city: member.city || '',
    primaryRole: member.primaryRole || '',
    fandom: member.fandom || '',
  };
}

/**
 * Starting values of the public registration form. Nothing is preselected: an answer the visitor skipped must not
 * land on their record (a minor would pass as an adult). The form requires what it marks with a star.
 */
export const EMPTY_REGISTRATION_FORM = {
  name: '', // Primary required identity
  fullName: '', // Strictly optional for privacy
  email: '', // Strictly optional
  phone: '', // Mandatory WhatsApp mobile number (extra numbers are added later in the profile)
  discordUsername: '', // Discord Username column
  ageCategory: '',
  age: '', // Optional exact age or birthdate
  country: '',
  province: '',
  city: '',
  customCity: '',
  customProvince: '',
  customCountry: '',
  primaryRole: '',
  customRole: '', // Specialty / custom role when 'Lainnya / Others' is selected
  fandom: '',
  experience: '', // Optional
  socialMedia: '',
  portfolioUrl: '',
  avatarUrl: '',
  reason: '',
  acceptedCodeOfConduct: false,
};

export const MEMBER_SOURCES: readonly Member['source'][] = ['web_form', 'google_form_sync', 'spreadsheet_import'];
export const MEMBER_STATUSES: readonly Member['status'][] = ['pending', 'verified', 'active'];
export const CREATED_AT_MAX_LENGTH = 40;

export function pickSource(value: unknown): Member['source'] {
  return typeof value === 'string' && (MEMBER_SOURCES as readonly string[]).includes(value)
    ? (value as Member['source'])
    : 'web_form';
}

export function pickStatus(value: unknown): Member['status'] {
  return typeof value === 'string' && (MEMBER_STATUSES as readonly string[]).includes(value)
    ? (value as Member['status'])
    : 'verified';
}

export function isMemberStatus(value: unknown): value is Member['status'] {
  return typeof value === 'string' && (MEMBER_STATUSES as readonly string[]).includes(value);
}

/**
 * Compare age statuses by this key, not the full text: the website stores 'Minor / Di Bawah Umur (<18 tahun)',
 * the admin form 'Minor / Di Bawah Umur (<18)', and Sheets imports keep the cell text as typed.
 */
export function ageCategoryKey(value: unknown): string {
  return String(value ?? '').split(/[/(]/)[0].trim().toLowerCase();
}

/** 'Prefer not to say' is no longer offered, but members who already have it keep it: forms show it with its label. */
export function isPreferNotToSayAge(value: unknown): boolean {
  return ageCategoryKey(value) === 'memilih untuk tidak menyebutkan';
}

/** Every new sign-in profile starts blank: a signed-in member with no status must choose one (AgeStatusGate). */
export function isAgeStatusBlank(member: Pick<Member, 'ageCategory'>): boolean {
  return !String(member.ageCategory ?? '').trim();
}

/** Legacy placeholder emails (memberxxx@kawancosplay.id, member12@…) are treated as no email. */
export function isFakePlaceholderEmail(email?: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  return lower.endsWith('@kawancosplay.id') || /^member\d*@/i.test(lower);
}

export function clampString(value: unknown, maxLength: number): string {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

export function timestampLikeToDate(value: unknown): Date | null {
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

/** createdAt must be a string of at most 40 characters (rules); ISO strings are kept as they are. */
export function normalizeCreatedAt(value: unknown): string {
  if (typeof value === 'string' && value.length > 0 && value.length <= CREATED_AT_MAX_LENGTH) return value;
  const fromTimestamp = timestampLikeToDate(value);
  if (fromTimestamp) return fromTimestamp.toISOString();
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

/** createdAt (ISO string or Firestore Timestamp) -> ms; Number.MAX_SAFE_INTEGER when missing/unparsable. */
export function createdAtMs(value: unknown): number {
  if (typeof value === 'string' && value) {
    const ms = Date.parse(value);
    if (!isNaN(ms)) return ms;
  }
  const fromTimestamp = timestampLikeToDate(value);
  if (fromTimestamp) return fromTimestamp.getTime();
  return Number.MAX_SAFE_INTEGER;
}

/** Earliest createdAt first; ties (and missing dates) broken by doc id ascending. */
export function compareByCreatedAtThenId(aId: string, aCreatedAt: unknown, bId: string, bCreatedAt: unknown): number {
  const diff = createdAtMs(aCreatedAt) - createdAtMs(bCreatedAt);
  if (diff !== 0) return diff;
  return aId < bId ? -1 : aId > bId ? 1 : 0;
}

/** Display name of a raw member doc (name > cosplayName > fullName > 'Member'). */
export function memberDisplayName(data: Partial<Member> | null | undefined): string {
  const value = data?.name || data?.cosplayName || data?.fullName;
  return typeof value === 'string' && value.trim() ? value.trim() : 'Member';
}

// 'Legal Age (17 tahun)' has the same key as Legal Age, but must not show as an adult: only these spellings do
const LEGAL_AGE_SPELLING = /^legal age\s*(\/\s*dewasa\s*)?(\(\s*18\+(\s*tahun)?\s*\))?$/i;

/**
 * What the profile's age status select shows: the listed option for any spelling of this status (ageCategoryKey), so
 * its label is translated, else the value itself. Text over the rules' limit stays as it is: every save is refused
 * until it is replaced, so the member must be able to pick its listed option.
 */
export function listedAgeCategory(value: string, listed: readonly string[]): string {
  if (!isListedAgeCategory(value)) return value;
  const key = ageCategoryKey(value);
  return listed.find((opt) => ageCategoryKey(opt) === key) ?? value;
}

/** Legal Age or Minor in a spelling listedAgeCategory maps to its option: the only statuses the app lets anyone pick. */
export function isListedAgeCategory(value: string): boolean {
  if (value.length > MEMBER_FIELD_LIMITS.ageCategory) return false;
  const key = ageCategoryKey(value);
  return key === 'minor' || (key === 'legal age' && LEGAL_AGE_SPELLING.test(value.trim()));
}

/**
 * The extra option the profile's age status needs, because a select whose value matches no option shows its first
 * one (Legal Age): a blank status ('') or text that is no listed status. null when a listed option covers it.
 */
export function unlistedAgeCategory(stored: string | undefined, listed: readonly string[]): string | null {
  const value = stored || '';
  return listed.includes(listedAgeCategory(value, listed)) ? null : value;
}

/**
 * Profile save: the age status is written only once the member changed it, so a blank stays blank and a stored
 * spelling is never rewritten. undefined = not written (sanitizeMemberProfileUpdate skips it).
 */
export function changedAgeCategory(stored: string | undefined, chosen: string): string | undefined {
  return chosen === (stored || '') ? undefined : chosen;
}
