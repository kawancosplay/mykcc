import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Dashboard Admin KawanCosplay',
  dashboardDesc: 'Area khusus pengelola untuk manajemen database member dan sinkronisasi formulir.',
  loginPrompt: 'Masukkan Passkey Admin atau login dengan email cosplaysehat@gmail.com',
  privacyRestrictedNotice: 'Demi privasi dan perlindungan data anggota, daftar anggota hanya dapat diakses oleh Admin KawanCosplay.',
  exportCsv: 'Ekspor Data CSV',
  totalMembers: 'Total Anggota Terdaftar',
  resetFilter: 'Reset Filter',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Memeriksa akses admin...',
  signedInNotAdmin: 'Anda masuk sebagai {account} — akun ini bukan admin KCC.',
  emailNotVerified: 'Email belum terverifikasi — gunakan Login Google.',
  signInWithAdminGoogleEmail: 'Masuk dengan Akun Google Admin ({email})',
  signOutThisAccount: 'Keluar dari akun ini',
  whatsappAdminHelp: 'Bantuan Admin via WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portal Manajemen KawanCosplay',
  verifiedAccessBadge: 'Akses Terverifikasi',
  dashboardPrivacyNote: 'Privasi anggota dijaga ketat: hanya admin terdaftar yang dapat melihat daftar nama & kontak.',
  whatsappHotlineShort: 'Hotline WA: {phone}',
  signOutAdmin: 'Keluar Akun Admin',
  statusStat: 'Status {status}',
  statusVerified: 'Terverifikasi',
  statusActive: 'Aktif',
  statusPending: 'Tertunda',
  tabMembers: 'Daftar Anggota & Roster ({count})',
  tabSync: 'Sinkronisasi Google Sheets & Formulir',
  tabStats: 'Statistik Komunitas',

  // Member list states
  permissionDeniedTitle: 'Akses Ditolak (Permission Denied)',
  permissionDeniedDesc:
    'Database menolak akses daftar anggota untuk akun ini. Masuk dengan akun Google admin ({email}) atau akun yang terdaftar di koleksi admins, lalu muat ulang halaman. Pastikan juga Firestore Rules terbaru sudah dipublikasikan ke database {database}.',
  signInWithAdminGoogle: 'Masuk dengan Akun Google Admin',
  reloadPage: 'Muat Ulang Halaman',
  loadMembersFailedTitle: 'Gagal Memuat Daftar Anggota',
  loadMembersFailedDesc: 'Gagal memuat daftar anggota. Periksa koneksi lalu muat ulang halaman.',
  loadingMembers: 'Memuat data anggota...',

  // Member status & delete
  statusUpdateFailed: 'Gagal memperbarui status member: {error}',
  deleteMemberConfirm: 'Hapus data member "{name}" (KCC ID: {id}) dari database Firestore?',
  deleteMemberFailed: 'Gagal menghapus member: {error}',

  // KCC ID & public card repair
  repairTitle: 'Perbaikan KCC ID & Kartu Publik (Repair)',
  repairDesc:
    'Memberi KCC ID unik untuk anggota yang ID-nya ganda (yang terdaftar paling awal tetap memakai ID lama), menyimpan KCC ID yang belum tersimpan, dan membangun ulang koleksi publik memberCards untuk pencarian kartu. Aman dijalankan berulang kali.',
  repairDuplicatesDetected: 'Terdeteksi {count} anggota dengan KCC ID ganda — tekan "{action}".',
  allIdsUnique: 'Semua KCC ID unik.',
  runRepair: 'Jalankan Perbaikan',
  repairRunning: 'Memproses Perbaikan...',
  repairRunningProgress: 'Memproses Perbaikan ({done}/{total})...',
  repairConfirm:
    'Jalankan perbaikan KCC ID & kartu publik untuk seluruh anggota?\n\n- Anggota dengan KCC ID ganda akan mendapat ID baru (yang terdaftar paling awal tetap memakai ID lama).\n- KCC ID yang belum tersimpan akan disimpan.\n- Koleksi publik memberCards dibangun ulang.\n\nAman dijalankan berulang kali. Lanjutkan?',
  repairFailed: 'Perbaikan gagal: {error}',
  repairDone: 'Perbaikan selesai.',
  repairStatScanned: 'Anggota dipindai',
  repairStatDuplicateGroups: 'Grup ID ganda',
  repairStatCardsWritten: 'Kartu ditulis',
  repairStatCardsDeleted: 'Kartu dihapus',
  reassignedListTitle: 'KCC ID yang diubah / disimpan ({count}):',
  repairReasonDuplicate: 'ID ganda',
  repairReasonMissing: 'ID belum tersimpan',
  repairReasonMainAccount: 'ID Main Account dipakai anggota lain',
  noIdsChanged: 'Tidak ada KCC ID yang perlu diubah.',
  issuesCount: 'Kendala ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID Khusus Admin / Main Account ({range})',
  reservedIdsDesc:
    'ID di rentang ini hanya untuk akun utama & admin KCC. Anggota di bawah ini mendapatkannya dari isian peran/email pada formulir publik (sistem lama). Tekan "{action}" untuk memberi KCC ID kronologis yang unik.',
  noReservedHolders: 'Tidak ada anggota yang memegang KCC ID khusus admin.',
  reservedHolderMeta: 'Sumber: {source} • Peran: {role}',
  processing: 'Memproses...',
  assignNewId: 'Tetapkan ID Baru',
  reassignConfirm: 'Tetapkan KCC ID baru untuk "{name}" (saat ini {id})?',
  reassignMainAccountWarning:
    'PERHATIAN: ini adalah ID Main Account. Jangan lanjutkan jika anggota ini adalah akun resmi {email}.',
  resultSuccess: 'Berhasil: {message}',
  resultFailed: 'Gagal: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Pendaftaran Ganda (Orang yang Sama)',
  duplicatesDesc:
    'Anggota yang mengisi formulir lebih dari sekali (nomor WhatsApp, Discord, email, atau media sosial yang sama). "Gabungkan" menyimpan data terbaru dan semua nomor WhatsApp ke pendaftaran paling awal (KCC ID-nya tetap), lalu menghapus data ganda beserta kartunya. Periksa dulu sebelum menggabungkan.',
  scanDuplicates: 'Pindai Pendaftaran Ganda',
  mergeConfirm:
    'Gabungkan "{duplicate}" ({duplicateId}) ke "{keeper}" ({keeperId})?\n\nData terbaru & nomor WhatsApp disalin ke pendaftaran paling awal, lalu data ganda dihapus permanen. Lanjutkan?',
  mergeSuccess: '"{duplicate}" digabung ke "{keeper}" — KCC ID {id} tetap.',
  bulkMergeIdenticalConfirm:
    'Gabungkan {groups} grup pendaftaran ganda yang IDENTIK ({records} data ganda)?\n\nHanya grup dengan cosname dan nomor WhatsApp utama yang sama serta waktu daftar berselisih maksimal {seconds} detik (salinan persis / impor ganda).\nData terbaru & nomor WhatsApp disalin ke pendaftaran paling awal (KCC ID-nya tetap), lalu data ganda dihapus permanen. Lanjutkan?',
  bulkMergeAllConfirm:
    'Gabungkan SEMUA {groups} grup hasil pindaian ({records} data ganda)?\n\nTermasuk grup yang hanya cocok lewat nomor WhatsApp, Discord, email, media sosial, atau nama yang sama — pastikan daftar di bawah sudah diperiksa.\nData terbaru & nomor WhatsApp disalin ke pendaftaran paling awal (KCC ID-nya tetap), lalu data ganda dihapus permanen. Tindakan ini tidak dapat dibatalkan. Lanjutkan?',
  bulkMergeDone: 'Penggabungan massal selesai ({mode}).',
  bulkModeIdentical: 'grup identik',
  bulkModeAll: 'semua hasil pindaian',
  bulkStatGroups: 'Grup diproses',
  bulkStatMergedGroups: 'Grup digabung',
  bulkStatMergedRecords: 'Data ganda digabung',
  bulkStatFailedGroups: 'Grup gagal',
  bulkMoreErrors: '…dan {count} kendala lainnya (lihat console browser).',
  scanSummary:
    'Ditemukan {groups} grup pendaftaran ganda ({records} data ganda), termasuk {identical} grup identik (cosname & nomor WhatsApp utama sama, waktu daftar berselisih maksimal {seconds} detik).',
  mergeAllIdentical: 'Gabungkan semua yang identik ({count})',
  mergeAllScanned: 'Gabungkan semua hasil pindaian ({count})',
  bulkMergeProgress: 'Menggabungkan {done}/{total} grup…',
  noDuplicatesFound: 'Tidak ada pendaftaran ganda yang terdeteksi.',
  keeperBadge: 'Dipertahankan (KCC ID tetap)',
  merging: 'Menggabungkan...',
  mergeInto: 'Gabungkan ke {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Cari...',
  filterAllRoles: 'Semua Peran ({count})',
  filterAllCities: 'Semua Domisili',
  filterAllAges: 'Semua Usia',
  filterLegalAge: 'Dewasa (18+)',
  filterMinor: 'Di Bawah Umur (<18)',
  filterPreferNotToSay: 'Tidak menyebutkan',
  sortNewest: '🕒 Waktu: Terbaru',
  sortNameAsc: '🔤 Nama: A → Z',
  purgeButtonTitle: 'Purge / Hapus seluruh data anggota di Firestore',
  purgeButton: 'Purge Data Member',
  purging: 'Memproses Purge...',
  purgePrompt:
    "PERINGATAN KERAS: Tindakan ini akan MENGHAPUS SEMUA DATA ANGGOTA dari database Firestore secara permanen.\n\nKetik '{keyword}' (huruf besar) untuk konfirmasi pembersihan database:",
  purgeCancelled: 'Konfirmasi dibatalkan (kata kunci tidak sesuai).',
  purgeSuccess: 'Pembersihan Berhasil: {count} data anggota telah dihapus dari database.',
  purgeFailed: 'Gagal menghapus data anggota: {error}',
  exportNoData: 'Tidak ada data untuk diekspor.',
  showingMembers: 'Menampilkan {shown} dari {total} anggota',

  // CSV export column headers
  csvKccId: 'KCC ID (16 Digit)',
  csvCosname: 'Cosname / Alias',
  csvLegalName: 'Nama Legal',
  csvPrimaryWhatsapp: 'WhatsApp Utama',
  csvBackupWhatsapp: 'WhatsApp Cadangan',
  csvDiscord: 'Username Discord',
  csvEmail: 'Email',
  csvAgeCategory: 'Kategori Usia',
  csvAge: 'Usia/Lahir',
  csvCountry: 'Negara',
  csvProvince: 'Provinsi',
  csvCity: 'Kota',
  csvPrimaryRole: 'Peran Utama',
  csvFandom: 'Fandom',
  csvExperience: 'Pengalaman',
  csvStatus: 'Status',
  csvRegisteredAt: 'Tanggal Daftar',

  // Members table
  colMember: 'Member / Cosname',
  colKccId: 'KCC ID 16 Digit',
  colContact: 'WhatsApp & Kontak',
  colDiscord: 'Username Discord',
  colRole: 'Peran & Minat',
  colAge: 'Usia',
  colLocation: 'Domisili',
  colStatus: 'Status',
  colRegistered: 'Waktu Daftar',
  colActions: 'Aksi / Hapus',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Muda',
  sortAgeOldest: '▼ Tua',
  sortStatusAsc: '▲ Verif',
  sortStatusDesc: '▼ Tunda',
  sortTimeNewest: '▼ Baru',
  sortTimeOldest: '▲ Lama',
  legalNameValue: 'Nama legal: {name}',
  mainAccountBadge: 'KCC Main Account',
  adminIdBadge: 'KCC Admin #{number}',
  timestampIdBadge: 'ID Timestamp',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Lihat KCC ID',
  deleteMemberTitle: 'Hapus Member',
  emptyDatabaseTitle: 'Database Anggota Kosong',
  emptyDatabaseDesc:
    'Belum ada data anggota di database. Impor dari spreadsheet Google Form atau tunggu pendaftaran baru.',
  noResultsTitle: 'Tidak Ada Hasil',
  noResultsDesc: 'Tidak ada data anggota yang cocok dengan kata kunci pencarian atau filter yang dipilih.',
  openSheetsSync: 'Buka Sinkronisasi Google Sheets & Formulir',
};

export default admin;
