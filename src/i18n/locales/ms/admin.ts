import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Papan Pemuka Admin KawanCosplay',
  dashboardDesc: 'Portal pentadbiran terhad untuk senarai ahli komuniti dan penyegerakan Google Sheets.',
  loginPrompt: 'Masukkan Kunci Laluan Admin atau log masuk sebagai cosplaysehat@gmail.com',
  privacyRestrictedNotice: 'Demi melindungi privasi ahli, senarai ahli hanya boleh diakses oleh pentadbir KawanCosplay.',
  exportCsv: 'Eksport CSV',
  totalMembers: 'Jumlah Ahli Berdaftar',
  resetFilter: 'Set Semula Penapis',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Menyemak akses admin...',
  signedInNotAdmin: 'Log masuk sebagai {account} — akaun ini bukan admin KCC.',
  emailNotVerified: 'Emel belum disahkan — gunakan log masuk Google.',
  signInWithAdminGoogleEmail: 'Log masuk dengan Akaun Google Admin ({email})',
  signOutThisAccount: 'Log keluar',
  whatsappAdminHelp: 'Bantuan admin melalui WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portal Pengurusan KawanCosplay',
  verifiedAccessBadge: 'Akses Disahkan',
  dashboardPrivacyNote: 'Privasi ahli dilindungi ketat: hanya admin berdaftar boleh melihat nama & kenalan.',
  whatsappHotlineShort: 'Hotline WA: {phone}',
  signOutAdmin: 'Log Keluar Akaun Admin',
  statusStat: 'Status: {status}',
  statusVerified: 'Disahkan',
  statusActive: 'Aktif',
  statusPending: 'Menunggu',
  tabMembers: 'Senarai & Daftar Ahli ({count})',
  tabSync: 'Penyegerakan Google Sheets & Borang',
  tabStats: 'Statistik Komuniti',

  // Member list states
  permissionDeniedTitle: 'Akses Ditolak',
  permissionDeniedDesc:
    'Pangkalan data menolak akses ke senarai ahli untuk akaun ini. Log masuk dengan akaun Google admin ({email}) atau akaun yang tersenarai dalam koleksi admins, kemudian muat semula halaman. Pastikan juga Firestore Rules terkini telah diterbitkan ke pangkalan data {database}.',
  signInWithAdminGoogle: 'Log masuk dengan Akaun Google Admin',
  reloadPage: 'Muat Semula Halaman',
  loadMembersFailedTitle: 'Tidak Dapat Memuatkan Senarai Ahli',
  loadMembersFailedDesc: 'Tidak dapat memuatkan senarai ahli. Semak sambungan anda, kemudian muat semula halaman.',
  loadingMembers: 'Memuatkan data ahli...',

  // Member status & delete
  statusUpdateFailed: 'Tidak dapat mengemas kini status ahli: {error}',
  deleteMemberConfirm: 'Padam ahli "{name}" (KCC ID: {id}) daripada pangkalan data Firestore?',
  deleteMemberFailed: 'Tidak dapat memadam ahli: {error}',

  // KCC ID & public card repair
  repairTitle: 'Pembaikan KCC ID & Kad Awam',
  repairDesc:
    'Memberikan KCC ID unik kepada ahli yang ID-nya berganda (pendaftaran paling awal mengekalkan ID lama), menyimpan KCC ID yang belum disimpan, dan membina semula koleksi awam memberCards yang digunakan untuk carian kad. Selamat dijalankan berulang kali.',
  repairDuplicatesDetected: 'Dikesan {count} ahli dengan KCC ID berganda — tekan "{action}".',
  allIdsUnique: 'Semua KCC ID adalah unik.',
  runRepair: 'Jalankan Pembaikan',
  repairRunning: 'Sedang membaiki...',
  repairRunningProgress: 'Sedang membaiki ({done}/{total})...',
  repairConfirm:
    'Jalankan pembaikan KCC ID & kad awam untuk semua ahli?\n\n- Ahli dengan KCC ID berganda akan menerima ID baharu (pendaftaran paling awal mengekalkan ID lama).\n- KCC ID yang belum disimpan akan disimpan.\n- Koleksi awam memberCards dibina semula.\n\nSelamat dijalankan berulang kali. Teruskan?',
  repairFailed: 'Pembaikan gagal: {error}',
  repairDone: 'Pembaikan selesai.',
  repairStatScanned: 'Ahli diimbas',
  repairStatDuplicateGroups: 'Kumpulan ID berganda',
  repairStatCardsWritten: 'Kad ditulis',
  repairStatCardsDeleted: 'Kad dipadam',
  reassignedListTitle: 'KCC ID yang ditukar / disimpan ({count}):',
  repairReasonDuplicate: 'ID berganda',
  repairReasonMissing: 'ID belum disimpan',
  repairReasonMainAccount: 'ID Akaun Utama digunakan oleh ahli lain',
  noIdsChanged: 'Tiada KCC ID yang perlu ditukar.',
  issuesCount: 'Ralat ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID Khas Admin / Akaun Utama ({range})',
  reservedIdsDesc:
    'ID dalam julat ini hanya untuk akaun utama & admin KCC. Ahli di bawah menerimanya berdasarkan peranan/emel yang dimasukkan dalam borang awam (sistem lama). Tekan "{action}" untuk memberikan mereka KCC ID kronologi yang unik.',
  noReservedHolders: 'Tiada ahli yang memegang KCC ID khas admin.',
  reservedHolderMeta: 'Sumber: {source} • Peranan: {role}',
  processing: 'Memproses...',
  assignNewId: 'Tetapkan ID Baharu',
  reassignConfirm: 'Tetapkan KCC ID baharu untuk "{name}" (kini {id})?',
  reassignMainAccountWarning:
    'AMARAN: ini ialah ID Akaun Utama. Jangan teruskan jika ahli ini ialah akaun rasmi {email}.',
  resultSuccess: 'Berjaya: {message}',
  resultFailed: 'Gagal: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Pendaftaran Berganda (Orang yang Sama)',
  duplicatesDesc:
    'Ahli yang mengisi borang lebih daripada sekali (nombor WhatsApp, Discord, emel atau media sosial yang sama). "Gabung" menyimpan data terkini dan setiap nombor WhatsApp pada pendaftaran paling awal (KCC ID-nya kekal), kemudian memadam pendua bersama kadnya. Semak dahulu sebelum menggabungkan.',
  scanDuplicates: 'Imbas Pendaftaran Berganda',
  mergeConfirm:
    'Gabungkan "{duplicate}" ({duplicateId}) ke dalam "{keeper}" ({keeperId})?\n\nData terkini & nombor WhatsApp disalin ke pendaftaran paling awal, kemudian pendua dipadam secara kekal. Teruskan?',
  mergeSuccess: '"{duplicate}" telah digabungkan ke dalam "{keeper}" — KCC ID {id} kekal.',
  bulkMergeIdenticalConfirm:
    'Gabungkan {groups} kumpulan pendua yang SERUPA ({records} rekod pendua)?\n\nHanya kumpulan dengan cosname dan nombor WhatsApp utama yang sama, dicipta dalam jarak paling lama {seconds} saat (salinan tepat / import berganda).\nData terkini & setiap nombor WhatsApp dipindahkan ke pendaftaran paling awal (KCC ID-nya kekal), kemudian pendua dipadam secara kekal. Teruskan?',
  bulkMergeAllConfirm:
    'Gabungkan SEMUA {groups} kumpulan yang diimbas ({records} rekod pendua)?\n\nIni termasuk kumpulan yang hanya dipadankan melalui nombor WhatsApp, Discord, emel, media sosial atau nama yang sama — pastikan anda telah menyemak senarai di bawah.\nData terkini & setiap nombor WhatsApp dipindahkan ke pendaftaran paling awal (KCC ID-nya kekal), kemudian pendua dipadam secara kekal. Tindakan ini tidak boleh dibatalkan. Teruskan?',
  bulkMergeDone: 'Penggabungan pukal selesai ({mode}).',
  bulkModeIdentical: 'kumpulan serupa',
  bulkModeAll: 'semua hasil imbasan',
  bulkStatGroups: 'Kumpulan diproses',
  bulkStatMergedGroups: 'Kumpulan digabungkan',
  bulkStatMergedRecords: 'Pendua digabungkan',
  bulkStatFailedGroups: 'Kumpulan gagal',
  bulkMoreErrors: '…dan {count} lagi (lihat konsol pelayar).',
  scanSummary:
    'Ditemui {groups} kumpulan pendua ({records} rekod pendua), termasuk {identical} kumpulan serupa (cosname & nombor WhatsApp utama sama, dicipta dalam jarak paling lama {seconds} saat).',
  mergeAllIdentical: 'Gabung semua yang serupa ({count})',
  mergeAllScanned: 'Gabung semua hasil imbasan ({count})',
  bulkMergeProgress: 'Menggabungkan {done}/{total} kumpulan…',
  noDuplicatesFound: 'Tiada pendaftaran berganda dikesan.',
  keeperBadge: 'Dikekalkan (KCC ID kekal)',
  merging: 'Menggabungkan...',
  mergeInto: 'Gabung ke dalam {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Cari...',
  filterAllRoles: 'Semua Peranan ({count})',
  filterAllCities: 'Semua Lokasi',
  filterAllAges: 'Semua Umur',
  filterLegalAge: 'Dewasa (18+)',
  filterMinor: 'Bawah Umur (<18)',
  filterPreferNotToSay: 'Tidak dinyatakan',
  sortNewest: '🕒 Masa: Terkini',
  sortNameAsc: '🔤 Nama: A → Z',
  purgeButtonTitle: 'Hapuskan semua data ahli dalam Firestore',
  purgeButton: 'Hapus Data Ahli',
  purging: 'Sedang menghapus...',
  purgePrompt:
    "AMARAN SERIUS: Tindakan ini akan MEMADAM SEMUA DATA AHLI daripada pangkalan data Firestore secara kekal.\n\nTaip '{keyword}' (huruf besar) untuk mengesahkan pengosongan pangkalan data:",
  purgeCancelled: 'Pengesahan dibatalkan (kata kunci tidak sepadan).',
  purgeSuccess: 'Penghapusan selesai: {count} rekod ahli telah dipadam daripada pangkalan data.',
  purgeFailed: 'Tidak dapat memadam data ahli: {error}',
  exportNoData: 'Tiada data untuk dieksport.',
  showingMembers: 'Memaparkan {shown} daripada {total} ahli',

  // CSV export column headers
  csvKccId: 'KCC ID (16 Digit)',
  csvCosname: 'Cosname / Nama Samaran',
  csvLegalName: 'Nama Sah',
  csvPrimaryWhatsapp: 'WhatsApp Utama',
  csvBackupWhatsapp: 'WhatsApp Simpanan',
  csvDiscord: 'Nama Pengguna Discord',
  csvEmail: 'Emel',
  csvAgeCategory: 'Kategori Umur',
  csvAge: 'Umur / Tarikh Lahir',
  csvCountry: 'Negara',
  csvProvince: 'Negeri / Wilayah',
  csvCity: 'Bandar',
  csvPrimaryRole: 'Peranan Utama',
  csvFandom: 'Fandom',
  csvExperience: 'Pengalaman',
  csvStatus: 'Status',
  csvRegisteredAt: 'Tarikh Pendaftaran',

  // Members table
  colMember: 'Ahli / Cosname',
  colKccId: 'KCC ID 16 Digit',
  colContact: 'WhatsApp & Kenalan',
  colDiscord: 'Nama Pengguna Discord',
  colRole: 'Peranan & Minat',
  colAge: 'Umur',
  colLocation: 'Lokasi',
  colStatus: 'Status',
  colRegistered: 'Didaftarkan',
  colActions: 'Tindakan',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Termuda',
  sortAgeOldest: '▼ Tertua',
  sortStatusAsc: '▲ Sah',
  sortStatusDesc: '▼ Tunggu',
  sortTimeNewest: '▼ Terkini',
  sortTimeOldest: '▲ Terlama',
  legalNameValue: 'Nama sah: {name}',
  mainAccountBadge: 'Akaun Utama KCC',
  adminIdBadge: 'Admin KCC #{number}',
  timestampIdBadge: 'ID Cap Masa',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Lihat KCC ID',
  deleteMemberTitle: 'Padam Ahli',
  emptyDatabaseTitle: 'Pangkalan Data Ahli Kosong',
  emptyDatabaseDesc:
    'Belum ada data ahli dalam pangkalan data. Import daripada hamparan Google Form atau tunggu pendaftaran baharu.',
  noResultsTitle: 'Tiada Hasil',
  noResultsDesc: 'Tiada data ahli yang sepadan dengan kata kunci carian atau penapis yang dipilih.',
  openSheetsSync: 'Buka Penyegerakan Google Sheets & Borang',
};

export default admin;
