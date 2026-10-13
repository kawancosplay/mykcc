/**
 * KCC ID as stored in the field `userId16` (name kept for compatibility, see AGENTS.md):
 * 8 digits (current, running number; 00000000 = main account, 00000001-00000100 = admin range, members from
 * 00000101) or 16 digits (legacy, before the 8-digit switch). Legacy IDs resolve through memberCardAliases.
 */
export type KccId = string;

export interface Member {
  id: string;
  userId16: KccId; // the KCC ID: 8 digits after the 8-digit switch, 16 digits before ('' = not assigned yet)
  legacyUserId16?: string; // old 16-digit KCC ID, written only by the 8-digit migration (admin)
  authUid?: string; // Linked Firebase Auth UID
  fullName?: string; // Legacy compatibility only; form & database only ask for Name (name)
  name: string; // Nama (Name / Cosname / Stage Name / Alias)
  cosplayName?: string; // Compatibility alias with existing Firestore database documents
  email?: string; // Optional email (empty on database for legacy form entries)
  phone?: string; // Nomor WhatsApp Aktif (Wajib karena komunitas berbasis WhatsApp)
  phone2?: string; // Nomor WhatsApp Cadangan / Tambahan (Opsional jika memiliki lebih dari 1 nomor)
  additionalPhones?: string[]; // Nomor-nomor kontak tambahan lainnya
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
  memberNumber?: string; // Legacy field replaced by the KCC ID (userId16)
  source: 'web_form' | 'google_form_sync' | 'spreadsheet_import';
  status: 'pending' | 'verified' | 'active';
  createdAt: string; // Timestamp pendaftaran (ISO string)
}

export interface Photo {
  id: string;
  memberId?: string;
  userId16?: KccId; // uploader's KCC ID at upload time (rewritten to 8 digits by the migration photo pass)
  authorName: string;
  authorCosname?: string;
  authorNameAlias?: string;
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
  authorUid?: string; // Uploader's Firebase Auth UID (set by addPhotoToFirestore)
}

// Public, non-private projection of a member stored at memberCards/{userId16} (KCC ID card lookup)
export interface MemberCard {
  userId16: KccId; // == memberCards doc id, 8 digits (or 16 digits for a legacy card)
  cosplayName: string; // 1..80
  primaryRole: string; // <= 120
  city: string; // <= 80
  country: string; // <= 80, '' allowed
  status: 'pending' | 'verified' | 'active';
  createdAt: string; // ISO
  avatarUrl?: string; // only if <= 400000 chars
  ownerUid?: string; // uid allowed to refresh the card (= member.authUid)
}

export type SubscriptionErrorKind = 'permission-denied' | 'unavailable' | 'unknown';

export interface BulkImportResult {
  added: number;
  updated: number;
  unchanged: number;
  skipped: number;
  issuedIds?: string[]; // KCC IDs given to new rows, in order
}

export interface MemberIdReassignment {
  memberId: string;
  name: string;
  fromUserId16: string | null;
  toUserId16: string;
  reason: 'duplicate' | 'missing' | 'main_account';
}

export interface MemberRepairReport {
  scanned: number;
  duplicateGroups: number;
  reassigned: MemberIdReassignment[];
  cardsWritten: number;
  cardsDeleted: number;
  reservedHolders: Member[];
  errors: string[];
}

// Result of a public form submission (authService.submitRegistration)
export interface RegistrationResult {
  member: Member;
  reusedExisting: boolean; // true when the submission updated the person's existing registration (same KCC ID)
}

// Admin-side dedupe: the same person registered more than once (firestoreService.findDuplicateRegistrationGroups)
export interface DuplicateRegistrationGroup {
  keeper: Member; // earliest registration; keeps its KCC ID
  duplicates: Member[];
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
  name: number; // Nama (Name / Cosname / Alias)
  cosplayName?: number; // Compatibility with legacy column mapping
  fullName: number; // Fallback if sheet has an extra name column
  email: number;
  phone: number;
  phone2?: number;
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

// ---------------------------------------------------------------------------------------------
// Sprint 3: KCC ID counter, aliases, admins, dashboard lock, audit log, migrations
// ---------------------------------------------------------------------------------------------

/** counters/kccId. Exists = the 8-digit switch has started. `lastId` = `last` zero-padded to 8 digits. */
export interface KccCounter {
  last: number;
  lastId: string;
  planEnd?: number;
  updatedAt?: string;
}

/** memberCardAliases/{old16}: a legacy 16-digit KCC ID -> the member's 8-digit KCC ID. */
export interface MemberCardAlias {
  kccId: string;
  createdAt: string;
}

export interface AdminEntry {
  uid: string;
  memberId?: string;
  email?: string;
  name?: string;
  addedBy?: string;
  addedByEmail?: string;
  addedAt: string | null; // ISO from the server Timestamp; null for console-created docs without it
  legacy: boolean; // true when the doc does not have the sprint-3 schema (console-created)
}

export interface DashboardLockRecord {
  algorithm: 'PBKDF2-SHA256';
  hash: string; // base64, 32 bytes
  salt: string; // base64, 16 bytes
  iterations: number;
  updatedAt: string | null; // ISO
  updatedBy: string; // uid
}

/** == firestore.rules adminLogActions() */
export type AdminLogAction =
  | 'admin_added'
  | 'admin_removed'
  | 'photo_deleted'
  | 'member_deleted'
  | 'member_edited'
  | 'member_unlinked'
  | 'member_status_changed'
  | 'password_reset_sent'
  | 'kcc_id_migration'
  | 'kcc_id_repair'
  | 'registration_dates_fixed'
  | 'duplicates_merged'
  | 'sheets_import'
  | 'dashboard_lock_set'
  | 'dashboard_lock_cleared';

export type AdminLogTargetType = 'member' | 'admin' | 'photo' | 'settings' | 'bulk';

export interface AdminLogEntry {
  id: string;
  action: AdminLogAction;
  actorUid: string;
  actorEmail?: string;
  at: string | null; // ISO from the server Timestamp (null while pending)
  targetType?: AdminLogTargetType;
  targetId?: string; // <= 128
  targetLabel?: string; // <= 120 (name shown in the log; never phone/email of a member)
  details?: string; // <= 1000
  count?: number; // int >= 0 (bulk actions)
}

export type AdminLogInput = Omit<AdminLogEntry, 'id' | 'actorUid' | 'actorEmail' | 'at'>;

// 8-digit migration ("Switch to 8-digit KCC IDs")
export type KccIdMigrationKind = 'main' | 'admin' | 'member' | 'done';

export type KccIdMigrationNote =
  | 'duplicate_old_id'
  | 'missing_old_id'
  | 'unparsable_created_at'
  | 'reserved_conflict'
  | 'late_claim';

export interface KccIdMigrationRow {
  memberId: string;
  name: string;
  createdAt: string; // as stored (after the date fix)
  fromId: string | null; // stored userId16 (16 digits) or null when missing/invalid
  toId: string; // 8 digits; for note 'late_claim' a PROVISIONAL number (claimed at apply time)
  kind: KccIdMigrationKind; // 'done' = already holds its 8-digit ID (resume / re-run)
  writesAlias: boolean; // fromId gets memberCardAliases/{fromId} -> toId
  deletesOldCard: boolean; // memberCards/{fromId} is deleted (false when another pending row still holds it)
  note?: KccIdMigrationNote;
}

export interface KccIdMigrationPlan {
  computedAt: string;
  rows: KccIdMigrationRow[]; // ordered by toId
  planEnd: number; // last number of the chronological block (100 + member rows)
  counter: KccCounter | null; // counter as read (null = switch not started)
  pending: number; // rows with kind !== 'done'
  signature: string; // stable hash of the (memberId -> toId) pairs, to detect drift
  warnings: string[];
}

export interface KccIdMigrationReport {
  migrated: number;
  aliasesWritten: number;
  cardsWritten: number;
  oldCardsDeleted: number;
  lateClaimed: number; // 16-digit members found after the counter existed, given counter numbers
  photosUpdated: number;
  errors: string[];
  complete: boolean; // no member holds a 16-digit or missing ID any more
}

// Registration dates from the spreadsheet ("Fix registration dates")
export interface SheetTimeContext {
  timeZone: string;
  locale: string;
}

export interface RegistrationDateFixRow {
  memberId: string;
  name: string;
  kccId: string;
  source: Member['source'];
  currentCreatedAt: string;
  sheetCreatedAt: string;
  deltaMs: number;
  sheetRow: number; // 1-based row number in the sheet
  matchedBy: 'phone' | 'email' | 'discord' | 'social' | 'name';
  ambiguous: boolean; // the row matched more than one member
  selected: boolean; // default tick in the preview
}

export interface RegistrationDateFixPlan {
  rows: RegistrationDateFixRow[]; // only members whose date would change (> 1 s)
  unchanged: number;
  unmatchedRows: number;
  unparsableRows: number;
  context: SheetTimeContext;
}

export interface RegistrationDateFixReport {
  updated: number;
  cardsWritten: number;
  errors: string[];
}

// Paged photos; the cursor is opaque to components
export type PhotoPageCursor = { readonly __brand: 'PhotoPageCursor' };

export interface PhotoPage {
  photos: Photo[];
  cursor: PhotoPageCursor | null;
  hasMore: boolean;
}
