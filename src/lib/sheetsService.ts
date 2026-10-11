import { ColumnMapping, Member } from '../types';
import { generateChronologicalUserId16 } from './idGenerator';
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
  properties?: { title?: string };
  sheets?: Array<{
    properties: {
      sheetId?: number;
      title: string;
      gridProperties?: { rowCount?: number; columnCount?: number };
    };
  }>;
}

/** Spreadsheet title + tabs (spreadsheets.get). Throws SheetsApiError. */
export async function fetchSpreadsheetMetadata(accessToken: string, spreadsheetId: string): Promise<SpreadsheetMetadata> {
  return sheetsGet<SpreadsheetMetadata>(
    accessToken,
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=properties.title,sheets.properties(sheetId,title,gridProperties)`,
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

export function parseRowsToMembers(
  rows: string[][],
  mapping: ColumnMapping,
  existingCount: number = 0,
  source: 'google_form_sync' | 'spreadsheet_import' = 'spreadsheet_import'
): Omit<Member, 'id'>[] {
  if (rows.length <= 1) return [];

  const headers = rows[0] || [];
  const lowerHeaders = headers.map((h) => (h || '').toLowerCase().trim());
  const autoDiscordIdx = lowerHeaders.findIndex((h) => h.includes('discord'));

  const dataRows = rows.slice(1); // skip header row
  const parsedMembers: Omit<Member, 'id'>[] = [];

  dataRows.forEach((row, index) => {
    // Basic requirement check: at least email, name, or phone must exist
    const fullName = (mapping.fullName >= 0 ? row[mapping.fullName] : '')?.trim() || '';
    const rawEmail = (mapping.email >= 0 ? row[mapping.email] : '')?.trim() || '';
    const email =
      rawEmail.toLowerCase().endsWith('@kawancosplay.id') || /^member\d*@/i.test(rawEmail)
        ? ''
        : rawEmail; // Empty email as legacy form never asked for email
    const nameIdx = mapping.name >= 0 ? mapping.name : (mapping.cosplayName !== undefined && mapping.cosplayName >= 0 ? mapping.cosplayName : -1);
    const resolvedName = (nameIdx >= 0 ? row[nameIdx] : '')?.trim() || fullName || 'Cosplayer';
    const country = (mapping.country >= 0 ? row[mapping.country] : '')?.trim() || 'Indonesia';
    const province = (mapping.province >= 0 ? row[mapping.province] : '')?.trim();
    const city = (mapping.city >= 0 ? row[mapping.city] : '')?.trim() || 'Worldwide';
    const ageCategory = (mapping.ageCategory >= 0 ? row[mapping.ageCategory] : '')?.trim();
    const primaryRole = (mapping.primaryRole >= 0 ? row[mapping.primaryRole] : '')?.trim() || 'Cosplayer';
    const fandom = (mapping.fandom >= 0 ? row[mapping.fandom] : '')?.trim() || 'Anime & Games';
    const phone = (mapping.phone >= 0 ? row[mapping.phone] : '')?.trim();
    const phone2 = (mapping.phone2 !== undefined && mapping.phone2 >= 0 ? row[mapping.phone2] : '')?.trim();
    const discordIdx = mapping.discordUsername >= 0 ? mapping.discordUsername : autoDiscordIdx;
    const discordUsername = (discordIdx >= 0 ? row[discordIdx] : '')?.trim();
    const age = (mapping.age >= 0 ? row[mapping.age] : '')?.trim();
    const experience = (mapping.experience >= 0 ? row[mapping.experience] : '')?.trim() || '1 - 3 tahun';
    const socialMedia = (mapping.socialMedia >= 0 ? row[mapping.socialMedia] : '')?.trim();
    const portfolioUrl = (mapping.portfolioUrl >= 0 ? row[mapping.portfolioUrl] : '')?.trim();
    const reason = (mapping.reason >= 0 ? row[mapping.reason] : '')?.trim();
    const timestampRaw = (mapping.timestamp >= 0 ? row[mapping.timestamp] : '')?.trim();

    // Skip empty lines
    if (!fullName && !resolvedName && !phone && !discordUsername) return;

    const createdAtDate = timestampRaw && !isNaN(Date.parse(timestampRaw)) ? new Date(timestampRaw) : new Date();
    // User ID arranged chronologically by when they filled the form. Sheet email/role never yields the
    // main account (0000...0000) or KCC admin-range IDs; bulkImportMembers re-checks uniqueness.
    const userId16 = generateChronologicalUserId16(createdAtDate, (index % 99) + 1);

    parsedMembers.push({
      userId16,
      name: resolvedName.substring(0, 60),
      cosplayName: resolvedName.substring(0, 60),
      fullName: fullName ? fullName.substring(0, 100) : resolvedName.substring(0, 100),
      email: email ? email.substring(0, 120) : '',
      phone: phone ? phone.substring(0, 30) : undefined,
      phone2: phone2 ? phone2.substring(0, 30) : undefined,
      discordUsername: discordUsername ? discordUsername.substring(0, 60) : undefined,
      country: country.substring(0, 80),
      province: province ? province.substring(0, 80) : undefined,
      city: city.substring(0, 60),
      ageCategory: ageCategory ? ageCategory.substring(0, 50) : undefined,
      age: age ? age.substring(0, 20) : undefined,
      primaryRole: primaryRole.substring(0, 50),
      fandom: fandom.substring(0, 80),
      experience: experience.substring(0, 40),
      socialMedia: socialMedia ? socialMedia.substring(0, 120) : undefined,
      portfolioUrl: portfolioUrl ? portfolioUrl.substring(0, 300) : undefined,
      reason: reason ? reason.substring(0, 500) : undefined,
      source,
      status: 'verified',
      createdAt: createdAtDate.toISOString(),
    });
  });

  return parsedMembers;
}
