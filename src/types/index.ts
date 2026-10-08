export interface Member {
  id: string;
  userId16: string; // 16-digit KCC ID arranged by form submission timestamp (0000000000000000 for cosplaysehat@gmail.com)
  authUid?: string; // Linked Firebase Auth UID
  fullName?: string; // Legacy compatibility only; form & database only ask for Name (cosplayName)
  cosplayName: string; // Nama (Name / Cosname / Stage Name / Alias)
  email?: string; // Optional email (empty on database for legacy form entries)
  phone?: string; // Nomor WhatsApp Aktif (Wajib karena komunitas berbasis WhatsApp)
  discordUsername?: string; // Username Discord (Contoh: username atau user#0000)
  country?: string; // Negara / Country / Region
  province?: string; // Provinsi / State / Prefecture
  city: string; // Kota / Kabupaten / City / County
  age?: string; // Usia / Tanggal Lahir
  ageCategory?: string; // Kategori Usia: "Legal Age / Dewasa (18+ tahun)" | "Minor / Di Bawah Umur (<18 tahun)"
  birthday?: string;
  primaryRole: string; // Peran / Minat: Cosplayer, Idol Fan, Otaku, Sahabat Umum, Crafter, Photographer, etc.
  fandom: string; // Fandom / Seri Favorit
  experience?: string; // Pengalaman
  socialMedia?: string; // Media Sosial
  portfolioUrl?: string; // Portofolio / Link Drive
  avatarUrl?: string; // Foto Profil / Avatar
  reason?: string; // Alasan Bergabung & Harapan
  memberNumber?: string; // Legacy field replaced by 16-digit userId16
  source: 'web_form' | 'google_form_sync' | 'spreadsheet_import';
  status: 'pending' | 'verified' | 'active';
  createdAt: string; // Timestamp pendaftaran (ISO string)
}

export interface Photo {
  id: string;
  memberId?: string;
  userId16?: string;
  authorName: string;
  authorCosname?: string;
  authorAvatar?: string;
  photoUrl: string;
  title: string;
  character: string;
  series: string;
  event: string;
  photographer?: string;
  caption?: string;
  likesCount?: number;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  spreadsheetId: string;
  importedCount: number;
  source: string;
  syncedAt: string;
  details?: string;
}

export interface SheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface ColumnMapping {
  timestamp: number;
  cosplayName: number; // Nama (Name / Cosname / Alias)
  fullName: number; // Fallback if sheet has an extra name column
  email: number;
  phone: number;
  discordUsername: number;
  ageCategory: number;
  age: number;
  country: number;
  province: number;
  city: number;
  primaryRole: number;
  fandom: number;
  experience: number;
  socialMedia: number;
  portfolioUrl: number;
  reason: number;
}
