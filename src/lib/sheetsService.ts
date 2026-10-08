import { ColumnMapping, Member, SheetFile } from '../types';
import {
  generate16DigitUserId,
  generateChronologicalUserId16,
  resolveMemberUserId16,
} from './idGenerator';

export async function fetchSpreadsheetsFromDrive(accessToken: string): Promise<SheetFile[]> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,modifiedTime)&pageSize=25&orderBy=modifiedTime desc",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Drive API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to list spreadsheets:', err);
    throw err;
  }
}

export async function fetchSpreadsheetMetadata(accessToken: string, spreadsheetId: string) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties(sheetId,title,gridProperties)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API metadata error (${res.status}): ${err}`);
  }

  return await res.json();
}

export async function fetchSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string = 'A1:Z1000'
): Promise<string[][]> {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API values error (${res.status}): ${err}`);
  }

  const data = await res.json();
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
    fullName: findIndex(['nama lengkap', 'full name', 'nama asli', 'nama']),
    cosplayName: findIndex(['cosplay name', 'cosname', 'nama panggung', 'stage name', 'nickname', 'nama karakter', 'nama panggilan']),
    email: findIndex(['email', 'surel', 'alamat email']),
    phone: findIndex(['whatsapp', 'wa', 'telepon', 'hp', 'phone', 'kontak', 'nomor wa', 'no wa', 'no. wa']),
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
    const cosplayName = (mapping.cosplayName >= 0 ? row[mapping.cosplayName] : '')?.trim() || fullName || 'Cosplayer';
    const country = (mapping.country >= 0 ? row[mapping.country] : '')?.trim() || 'Indonesia';
    const province = (mapping.province >= 0 ? row[mapping.province] : '')?.trim();
    const city = (mapping.city >= 0 ? row[mapping.city] : '')?.trim() || 'Worldwide';
    const ageCategory = (mapping.ageCategory >= 0 ? row[mapping.ageCategory] : '')?.trim();
    const primaryRole = (mapping.primaryRole >= 0 ? row[mapping.primaryRole] : '')?.trim() || 'Cosplayer';
    const fandom = (mapping.fandom >= 0 ? row[mapping.fandom] : '')?.trim() || 'Anime & Games';
    const phone = (mapping.phone >= 0 ? row[mapping.phone] : '')?.trim();
    const discordIdx = mapping.discordUsername >= 0 ? mapping.discordUsername : autoDiscordIdx;
    const discordUsername = (discordIdx >= 0 ? row[discordIdx] : '')?.trim();
    const age = (mapping.age >= 0 ? row[mapping.age] : '')?.trim();
    const experience = (mapping.experience >= 0 ? row[mapping.experience] : '')?.trim() || '1 - 3 tahun';
    const socialMedia = (mapping.socialMedia >= 0 ? row[mapping.socialMedia] : '')?.trim();
    const portfolioUrl = (mapping.portfolioUrl >= 0 ? row[mapping.portfolioUrl] : '')?.trim();
    const reason = (mapping.reason >= 0 ? row[mapping.reason] : '')?.trim();
    const timestampRaw = (mapping.timestamp >= 0 ? row[mapping.timestamp] : '')?.trim();

    // Skip empty lines
    if (!fullName && !cosplayName && !phone && !discordUsername) return;

    const createdAtDate = timestampRaw && !isNaN(Date.parse(timestampRaw)) ? new Date(timestampRaw) : new Date();
    // User ID arranged chronologically by when they filled the form; cosplaysehat@gmail.com is 0000000000000000
    // UID 0000 0000 0000 0001 to 0000 0000 0000 0100 is assigned to KCC admin
    const userId16 = resolveMemberUserId16({
      email,
      role: primaryRole,
      dateInput: createdAtDate,
      sequenceNumber: existingCount + index + 1,
    });

    parsedMembers.push({
      userId16,
      fullName: fullName ? fullName.substring(0, 100) : cosplayName.substring(0, 100),
      cosplayName: cosplayName.substring(0, 60),
      email: email ? email.substring(0, 120) : '',
      phone: phone ? phone.substring(0, 30) : undefined,
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
