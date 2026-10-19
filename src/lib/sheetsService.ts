import type { ColumnMapping, Member, SheetTimeContext } from '../types';
import { MEMBER_FIELD_LIMITS, isFakePlaceholderEmail } from './memberRules';
import { translate } from '../i18n';

// Read-only Google Sheets API access (googleAuth.SHEETS_READONLY_SCOPE). No Drive API: listing the
// admin's Drive files needs a Drive scope, so the admin pastes the spreadsheet URL / ID instead.
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Failed Google Sheets API request. `status` is the HTTP status (0 = network failure, no response);
 * `reason` is the google.rpc.ErrorInfo reason (e.g. ACCESS_TOKEN_SCOPE_INSUFFICIENT) when Google sent one.
 */
export class SheetsApiError extends Error {
  readonly status: number;
  readonly reason: string | null;

  constructor(message: string, status: number, reason: string | null = null) {
    super(message);
    this.name = 'SheetsApiError';
    this.status = status;
    this.reason = reason;
  }
}

export type SheetsErrorKind =
  | 'unauthorized' // 401: token expired / revoked -> reconnect
  | 'scope' // 403: the token lacks the Sheets read scope -> reconnect and grant it
  | 'no-access' // 403: the signed-in Google account cannot open this spreadsheet
  | 'not-found' // 404: no spreadsheet with this id (or no access)
  | 'unsupported-file' // 400: e.g. an uploaded .xlsx file, not a native Google Sheets file
  | 'bad-request' // 400: other (e.g. a tab that no longer exists)
  | 'rate-limit' // 429
  | 'network' // no response
  | 'other';

/**
 * Category of a Google Sheets API error, or null when `error` did not come from the Sheets API
 * (e.g. a Firestore error during the import).
 */
export function classifySheetsError(error: unknown): SheetsErrorKind | null {
  if (!(error instanceof SheetsApiError)) return null;
  const { status, reason, message } = error;
  if (status === 0) return 'network';
  if (status === 401) return 'unauthorized';
  if (status === 403) {
    if (reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' || /insufficient (authentication )?scopes?/i.test(message)) {
      return 'scope';
    }
    if (reason === 'SERVICE_DISABLED' || reason === 'accessNotConfigured') return 'other';
    return 'no-access';
  }
  if (status === 404) return 'not-found';
  if (status === 429) return 'rate-limit';
  if (status === 400) return /not supported for this document/i.test(message) ? 'unsupported-file' : 'bad-request';
  return 'other';
}

// Valid spreadsheet ids are long URL-safe tokens (usually 44 characters)
const SPREADSHEET_ID_PATTERN = /^[A-Za-z0-9_-]{15,}$/;

/**
 * Spreadsheet id from a full Google Sheets URL (…/spreadsheets/d/<id>/edit, also …/spreadsheets/u/1/d/<id>/…)
 * or from a bare id. Null when the input holds neither (e.g. a "Publish to web" …/d/e/… link).
 */
export function parseSpreadsheetId(input: string): string | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/\/spreadsheets\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]+)/);
  const candidate = urlMatch ? urlMatch[1] : trimmed;
  return SPREADSHEET_ID_PATTERN.test(candidate) ? candidate : null;
}

/**
 * A1 range on a named tab, quoted so tab names with spaces or punctuation always parse
 * (e.g. 'Form Responses 1'!A1:Z10).
 */
export function sheetRange(tabTitle: string, cells: string): string {
  const title = (tabTitle || 'Sheet1').replace(/'/g, "''");
  return `'${title}'!${cells}`;
}

async function toSheetsApiError(res: Response, label: string): Promise<SheetsApiError> {
  let raw = '';
  try {
    raw = await res.text();
  } catch {
    // Body unavailable
  }

  let detail = '';
  let reason: string | null = null;
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: unknown; details?: unknown } } | null;
    const apiError = parsed?.error;
    if (apiError) {
      if (typeof apiError.message === 'string') detail = apiError.message;
      if (Array.isArray(apiError.details)) {
        for (const entry of apiError.details) {
          const entryReason = entry && typeof entry === 'object' ? (entry as { reason?: unknown }).reason : undefined;
          if (typeof entryReason === 'string') {
            reason = entryReason;
            break;
          }
        }
      }
    }
  } catch {
    // Not JSON
  }

  if (!detail) detail = raw.slice(0, 300) || res.statusText;
  // The message keeps Google's own `detail` text: classifySheetsError matches on it
  return new SheetsApiError(
    translate('errors.sheetsApiResponseError', { label, status: res.status, detail }),
    res.status,
    reason
  );
}

async function sheetsGet<T>(accessToken: string, url: string, label: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (err) {
    throw new SheetsApiError(
      translate('errors.sheetsApiRequestFailed', {
        label,
        detail: err instanceof Error ? err.message : String(err),
      }),
      0
    );
  }

  if (!res.ok) throw await toSheetsApiError(res, label);
  return (await res.json()) as T;
}

export interface SpreadsheetMetadata {
  properties?: { title?: string; timeZone?: string; locale?: string };
  sheets?: Array<{
    properties: {
      sheetId?: number;
      title: string;
      gridProperties?: { rowCount?: number; columnCount?: number };
    };
  }>;
}

/** Spreadsheet title, time zone, locale + tabs (spreadsheets.get). Throws SheetsApiError. */
export async function fetchSpreadsheetMetadata(accessToken: string, spreadsheetId: string): Promise<SpreadsheetMetadata> {
  return sheetsGet<SpreadsheetMetadata>(
    accessToken,
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=${encodeURIComponent(
      'properties(title,timeZone,locale),sheets.properties(sheetId,title,gridProperties)'
    )}`,
    'metadata'
  );
}

/** Cell values of a range (spreadsheets.values.get). Throws SheetsApiError. */
export async function fetchSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string = 'A1:Z1000'
): Promise<string[][]> {
  const data = await sheetsGet<{ values?: string[][] }>(
    accessToken,
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
    'values'
  );
  return data.values || [];
}

// ---------------------------------------------------------------------------------------------
// Timestamps: the Google Form "Timestamp" column is a date cell in the SPREADSHEET's time zone and is
// formatted in the spreadsheet's locale (id_ID: 11/10/2026 01.44.06 = 11 Oct 2026 01:44:06 WIB).
// ---------------------------------------------------------------------------------------------

export const DEFAULT_SHEET_TIME_CONTEXT: SheetTimeContext = { timeZone: 'Asia/Jakarta', locale: 'id_ID' };

function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== 'string' || !timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Time zone + locale of a spreadsheet (metadata properties); each falls back to Asia/Jakarta / id_ID. */
export function sheetTimeContext(meta: SpreadsheetMetadata | null | undefined): SheetTimeContext {
  const timeZone = meta?.properties?.timeZone;
  const locale = meta?.properties?.locale;
  return {
    timeZone: isValidTimeZone(timeZone) ? timeZone : DEFAULT_SHEET_TIME_CONTEXT.timeZone,
    locale: typeof locale === 'string' && locale.trim() ? locale.trim() : DEFAULT_SHEET_TIME_CONTEXT.locale,
  };
}

/** 0-based column index -> A1 column letters: 0 -> 'A', 25 -> 'Z', 26 -> 'AA'. */
export function columnLetter(index: number): string {
  let n = Math.max(0, Math.floor(Number(index) || 0)) + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

/**
 * values.get of ONLY the timestamp column ('<tab>'!X1:X<lastRow>) with valueRenderOption=UNFORMATTED_VALUE
 * and dateTimeRenderOption=SERIAL_NUMBER. One entry per sheet row (index 0 = header): number = date cell
 * (serial), string = text cell, null = empty. Rows after the last non-empty one are not returned (treat a
 * missing index as null). All other columns keep the formatted fetchSheetValues (UNFORMATTED for every column
 * would turn phone numbers into numbers). Throws SheetsApiError.
 */
export async function fetchTimestampColumn(
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string,
  columnIndex: number,
  lastRow: number = 2000
): Promise<Array<number | string | null>> {
  const column = columnLetter(columnIndex);
  const endRow = Math.max(1, Math.floor(Number(lastRow) || 2000));
  const range = sheetRange(tabTitle, `${column}1:${column}${endRow}`);
  const params = 'valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER&majorDimension=ROWS';
  const data = await sheetsGet<{ values?: unknown[][] }>(
    accessToken,
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?${params}`,
    'values'
  );
  return (data.values || []).map((row) => {
    const value = Array.isArray(row) ? row[0] : undefined;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) return value;
    return null;
  });
}

const zoneFormatters = new Map<string, Intl.DateTimeFormat>();

function zoneFormatter(timeZone: string): Intl.DateTimeFormat {
  const zone = isValidTimeZone(timeZone) ? timeZone : DEFAULT_SHEET_TIME_CONTEXT.timeZone;
  let formatter = zoneFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    zoneFormatters.set(zone, formatter);
  }
  return formatter;
}

/** Offset (ms) of `timeZone` at the UTC instant `utcMs`: wall clock in that zone minus UTC. */
function zoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts: Record<string, number> = {};
  for (const part of zoneFormatter(timeZone).formatToParts(new Date(utcMs))) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  const hour = parts.hour === 24 ? 0 : parts.hour;
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, hour, parts.minute, parts.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/**
 * Wall-clock parts in an IANA zone -> UTC Date (Intl offset, two passes, DST-safe). A wall time that does
 * not exist (spring-forward gap) is shifted forward by the gap; an ambiguous one (fall back) takes one of
 * the two instants. Never NaN for valid parts.
 */
export function zonedTimeToUtc(
  p: { y: number; mo: number; d: number; h: number; mi: number; s: number },
  timeZone: string
): Date {
  const guess = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s);
  const offset1 = zoneOffsetMs(guess, timeZone);
  const utc1 = guess - offset1;
  const offset2 = zoneOffsetMs(utc1, timeZone);
  if (offset2 === offset1) return new Date(utc1);
  const utc2 = guess - offset2;
  if (zoneOffsetMs(utc2, timeZone) === offset2) return new Date(utc2);
  // Non-existent wall time (DST gap): utc1 renders as the same wall time plus the gap
  return new Date(utc1);
}

/**
 * Sheets serial (days since 1899-12-30; the fraction is the wall-clock time IN THE SPREADSHEET'S TIME ZONE)
 * -> UTC Date, rounded to the second. null for non-finite values or serials < 1.
 */
export function sheetSerialToDate(serial: number, timeZone: string): Date | null {
  if (typeof serial !== 'number' || !Number.isFinite(serial) || serial < 1) return null;
  let days = Math.floor(serial);
  let seconds = Math.round((serial - days) * 86400);
  if (seconds >= 86400) {
    days += 1;
    seconds -= 86400;
  }
  const base = new Date(Date.UTC(1899, 11, 30) + days * 86400000);
  const date = zonedTimeToUtc(
    {
      y: base.getUTCFullYear(),
      mo: base.getUTCMonth() + 1,
      d: base.getUTCDate(),
      h: Math.floor(seconds / 3600),
      mi: Math.floor((seconds % 3600) / 60),
      s: seconds % 60,
    },
    timeZone
  );
  return isNaN(date.getTime()) ? null : date;
}

// Locales whose numeric dates are month-first (M/d/yyyy); every other locale is read day-first.
const MONTH_FIRST_LOCALES: ReadonlySet<string> = new Set([
  'en_us',
  'en_ph',
  'en_ca',
  'es_us',
  'fr_ca',
  'en_as',
  'en_gu',
  'en_mh',
  'en_fm',
  'en_mp',
  'en_pr',
  'en_um',
  'en_vi',
  'es_pr',
  'en_bz',
  'en_pw',
]);

function isMonthFirstLocale(locale: string): boolean {
  const key = String(locale || '').trim().replace(/-/g, '_').toLowerCase();
  if (MONTH_FIRST_LOCALES.has(key)) return true;
  return key === 'en'; // bare "en" (Google's default) behaves like en_US
}

const MIN_SHEET_YEAR = 2000;
const MAX_SHEET_YEAR = 2100;

function daysInMonth(y: number, mo: number): number {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

function validParts(p: { y: number; mo: number; d: number; h: number; mi: number; s: number }): boolean {
  return (
    Number.isInteger(p.y) &&
    p.y >= MIN_SHEET_YEAR &&
    p.y <= MAX_SHEET_YEAR &&
    p.mo >= 1 &&
    p.mo <= 12 &&
    p.d >= 1 &&
    p.d <= daysInMonth(p.y, p.mo) &&
    p.h >= 0 &&
    p.h <= 23 &&
    p.mi >= 0 &&
    p.mi <= 59 &&
    p.s >= 0 &&
    p.s <= 59
  );
}

const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})$/i;
const YEAR_FIRST = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2})[:.](\d{2})(?:[:.](\d{2})(?:\.\d{1,9})?)?)?$/;
const DAY_MONTH_YEAR =
  /^(\d{1,2})([/.-])(\d{1,2})\2(\d{4})(?:[ ,T]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?(?:\s*([AaPp])\.?\s*[Mm]\.?)?)?$/;

/**
 * Text timestamp -> Date in ctx.timeZone, or null (NEVER "now"). Accepts d/M/yyyy and M/d/yyyy with '/',
 * '-' or '.' separators, H.mm[.ss] (Indonesian) or H:mm[:ss], optional AM/PM; yyyy-MM-dd[ T]HH:mm[:ss];
 * ISO 8601 with an offset/Z (taken as is). Day/month order: a part > 12 decides; otherwise month-first
 * only for month-first locales (en_US, en_PH, es_US, fr_CA, …), day-first for every other locale (id_ID).
 * Rejects impossible dates (31/02) and years outside 2000..2100.
 */
export function parseSheetTimestamp(raw: string, ctx: SheetTimeContext): Date | null {
  const value = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
  if (!value) return null;
  const timeZone = ctx?.timeZone || DEFAULT_SHEET_TIME_CONTEXT.timeZone;

  if (ISO_WITH_ZONE.test(value)) {
    const ms = Date.parse(value);
    if (isNaN(ms)) return null;
    const year = new Date(ms).getUTCFullYear();
    return year >= MIN_SHEET_YEAR && year <= MAX_SHEET_YEAR ? new Date(ms) : null;
  }

  const yearFirst = value.match(YEAR_FIRST);
  if (yearFirst) {
    const parts = {
      y: Number(yearFirst[1]),
      mo: Number(yearFirst[2]),
      d: Number(yearFirst[3]),
      h: Number(yearFirst[4] ?? 0),
      mi: Number(yearFirst[5] ?? 0),
      s: Number(yearFirst[6] ?? 0),
    };
    return validParts(parts) ? zonedTimeToUtc(parts, timeZone) : null;
  }

  const dmy = value.match(DAY_MONTH_YEAR);
  if (!dmy) return null;
  const a = Number(dmy[1]);
  const b = Number(dmy[3]);
  let day: number;
  let month: number;
  if (a > 12 && b <= 12) {
    day = a;
    month = b;
  } else if (b > 12 && a <= 12) {
    day = b;
    month = a;
  } else if (isMonthFirstLocale(ctx?.locale || DEFAULT_SHEET_TIME_CONTEXT.locale)) {
    month = a;
    day = b;
  } else {
    day = a;
    month = b;
  }

  let hour = Number(dmy[5] ?? 0);
  const meridiem = dmy[8] ? dmy[8].toLowerCase() : '';
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === 'a') hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
  }
  const parts = { y: Number(dmy[4]), mo: month, d: day, h: hour, mi: Number(dmy[6] ?? 0), s: Number(dmy[7] ?? 0) };
  return validParts(parts) ? zonedTimeToUtc(parts, timeZone) : null;
}

/**
 * Registration time of one sheet row: the unformatted timestamp cell when given (serial -> date in the
 * sheet's zone, text -> parseSheetTimestamp), else the formatted cell text. null when nothing parses.
 */
export function resolveSheetRowDate(
  formatted: string | undefined,
  unformatted: number | string | null | undefined,
  ctx: SheetTimeContext
): Date | null {
  if (typeof unformatted === 'number') {
    const fromSerial = sheetSerialToDate(unformatted, ctx.timeZone);
    if (fromSerial) return fromSerial;
  } else if (typeof unformatted === 'string' && unformatted.trim()) {
    const fromText = parseSheetTimestamp(unformatted, ctx);
    if (fromText) return fromText;
  }
  return typeof formatted === 'string' && formatted.trim() ? parseSheetTimestamp(formatted, ctx) : null;
}

/**
 * Smart auto-detector for common Google Form responses columns in Indonesian and English
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const lowerHeaders = headers.map((h) => (h || '').toLowerCase().trim());

  const findIndex = (patterns: string[]): number => {
    for (const pattern of patterns) {
      const idx = lowerHeaders.findIndex((h) => h.includes(pattern));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  return {
    timestamp: findIndex(['timestamp', 'waktu', 'time', 'tanggal daftar']),
    name: findIndex(['cosplay name', 'cosname', 'nama panggung', 'stage name', 'nickname', 'nama karakter', 'nama panggilan', 'nama']),
    cosplayName: findIndex(['cosplay name', 'cosname', 'nama panggung', 'stage name', 'nickname', 'nama karakter', 'nama panggilan', 'nama']),
    fullName: findIndex(['nama lengkap', 'full name', 'nama asli']),
    email: findIndex(['email', 'surel', 'alamat email']),
    phone: findIndex(['nomor wa utama', 'whatsapp utama', 'whatsapp', 'wa', 'telepon', 'hp', 'phone', 'kontak', 'nomor wa', 'no wa', 'no. wa']),
    phone2: findIndex(['nomor wa cadangan', 'wa cadangan', 'nomor wa 2', 'wa 2', 'whatsapp 2', 'no hp 2', 'nomor kedua', 'secondary phone', 'no wa kedua', 'hp 2']),
    discordUsername: findIndex([
      'discord',
      'username discord',
      'discord username',
      'id discord',
      'akun discord',
      'nama discord',
      'discord tag',
      'discord id',
      'dc',
    ]),
    country: findIndex(['negara', 'country', 'region']),
    province: findIndex(['provinsi', 'province', 'state', 'prefecture']),
    city: findIndex(['kota', 'kabupaten', 'domisili', 'daerah', 'city', 'county', 'asal', 'alamat']),
    ageCategory: findIndex(['kategori usia', 'age category', 'status usia', 'legal age', 'minor']),
    age: findIndex(['usia', 'umur', 'age', 'tanggal lahir', 'dob']),
    primaryRole: findIndex(['peran', 'kategori', 'role', 'minat', 'divisi', 'posisi']),
    fandom: findIndex(['fandom', 'karakter favorit', 'anime', 'game', 'seri', 'genre']),
    experience: findIndex(['pengalaman', 'lama cosplay', 'experience', 'jam terbang']),
    socialMedia: findIndex(['sosial media', 'instagram', 'tiktok', 'medsos', 'social', 'handle', 'ig']),
    portfolioUrl: findIndex(['portofolio', 'portfolio', 'link drive', 'drive', 'foto', 'link']),
    reason: findIndex(['alasan', 'ekspektasi', 'tujuan', 'pesan', 'motivasi']),
  };
}

type ParsedSheetMember = Omit<Member, 'id'> & { sheetRow: number; createdAtFromSheet: boolean };

function cell(row: string[], index: number | undefined): string {
  if (index === undefined || index < 0) return '';
  const value = row[index];
  return typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value).trim();
}

function clampTo(value: string, maxLength: number): string | undefined {
  const clean = value.trim().slice(0, maxLength);
  return clean ? clean : undefined;
}

/**
 * Sheet rows (formatted values, row 0 = header) -> members. createdAt comes from `opts.timestamps[i]`
 * (unformatted cell of sheet row i: serial -> date in the sheet's zone, text -> parseSheetTimestamp) or else
 * from the formatted cell via parseSheetTimestamp, in `opts.context` (default Asia/Jakarta / id_ID).
 * Rows whose date cannot be parsed get createdAt = now AND are listed in `unparsableRows` (1-based sheet rows;
 * only when a timestamp column is mapped). userId16 is '' (KCC IDs are assigned by bulkImportMembers).
 * Values are clamped to MEMBER_FIELD_LIMITS. Blank rows (no name, phone, email or Discord) are skipped.
 */
export function parseSheetRows(
  rows: string[][],
  mapping: ColumnMapping,
  source: Member['source'],
  opts?: { context?: SheetTimeContext; timestamps?: Array<number | string | null> }
): { members: ParsedSheetMember[]; unparsableRows: number[] } {
  const members: ParsedSheetMember[] = [];
  const unparsableRows: number[] = [];
  if (!Array.isArray(rows) || rows.length <= 1) return { members, unparsableRows };

  const L = MEMBER_FIELD_LIMITS;
  const context = opts?.context || DEFAULT_SHEET_TIME_CONTEXT;
  const timestamps = Array.isArray(opts?.timestamps) ? opts!.timestamps : null;
  const headers = rows[0] || [];
  const lowerHeaders = headers.map((h) => (h || '').toLowerCase().trim());
  const autoDiscordIdx = lowerHeaders.findIndex((h) => h.includes('discord'));
  const nameIdx =
    mapping.name >= 0 ? mapping.name : mapping.cosplayName !== undefined && mapping.cosplayName >= 0 ? mapping.cosplayName : -1;
  const discordIdx = mapping.discordUsername >= 0 ? mapping.discordUsername : autoDiscordIdx;

  for (let r = 1; r < rows.length; r++) {
    const row = Array.isArray(rows[r]) ? rows[r] : [];
    const sheetRow = r + 1;

    const rawName = cell(row, nameIdx);
    const fullName = cell(row, mapping.fullName);
    const rawEmail = cell(row, mapping.email);
    const phone = cell(row, mapping.phone);
    const phone2 = cell(row, mapping.phone2);
    const discordUsername = cell(row, discordIdx);

    // Blank line (the Sheets API returns empty rows in the middle of a range as [])
    if (!rawName && !fullName && !rawEmail && !phone && !phone2 && !discordUsername) continue;

    // Legacy forms never asked for email; placeholder emails are dropped
    const email = rawEmail && !isFakePlaceholderEmail(rawEmail) ? rawEmail.toLowerCase() : '';
    const resolvedName = rawName || fullName || 'Cosplayer';

    let createdAt: Date | null = null;
    if (mapping.timestamp >= 0) {
      createdAt = resolveSheetRowDate(cell(row, mapping.timestamp), timestamps ? timestamps[r] : undefined, context);
      if (!createdAt) unparsableRows.push(sheetRow);
    }
    const createdAtFromSheet = !!createdAt;

    members.push({
      userId16: '',
      name: resolvedName.slice(0, L.name),
      cosplayName: resolvedName.slice(0, L.cosplayName),
      fullName: (fullName || resolvedName).slice(0, L.fullName),
      email: email.slice(0, L.email),
      phone: clampTo(phone, L.phone),
      phone2: clampTo(phone2, L.phone2),
      discordUsername: clampTo(discordUsername, L.discordUsername),
      country: (cell(row, mapping.country) || 'Indonesia').slice(0, L.country),
      province: clampTo(cell(row, mapping.province), L.province),
      city: (cell(row, mapping.city) || 'Worldwide').slice(0, L.city),
      ageCategory: clampTo(cell(row, mapping.ageCategory), L.ageCategory),
      age: clampTo(cell(row, mapping.age), L.age),
      primaryRole: (cell(row, mapping.primaryRole) || 'Cosplayer').slice(0, L.primaryRole),
      fandom: (cell(row, mapping.fandom) || 'Anime & Games').slice(0, L.fandom),
      experience: (cell(row, mapping.experience) || '1 - 3 tahun').slice(0, L.experience),
      socialMedia: clampTo(cell(row, mapping.socialMedia), L.socialMedia),
      portfolioUrl: clampTo(cell(row, mapping.portfolioUrl), L.portfolioUrl),
      reason: clampTo(cell(row, mapping.reason), L.reason),
      source,
      status: 'verified',
      createdAt: (createdAt || new Date()).toISOString(),
      sheetRow,
      createdAtFromSheet,
    });
  }

  return { members, unparsableRows };
}

/**
 * Thin wrapper for the auto-sync poller: parseSheetRows(...).members without the row bookkeeping.
 * `existingCount` is ignored (kept so existing callers compile); KCC IDs are assigned by bulkImportMembers.
 */
export function parseRowsToMembers(
  rows: string[][],
  mapping: ColumnMapping,
  _existingCount: number = 0,
  source: 'google_form_sync' | 'spreadsheet_import' = 'spreadsheet_import',
  opts?: { context?: SheetTimeContext; timestamps?: Array<number | string | null> }
): Omit<Member, 'id'>[] {
  return parseSheetRows(rows, mapping, source, opts).members.map(
    ({ sheetRow: _sheetRow, createdAtFromSheet: _fromSheet, ...member }) => member
  );
}
