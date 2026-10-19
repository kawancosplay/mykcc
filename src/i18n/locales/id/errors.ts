import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Akses ditolak oleh database (permission denied). Data belum tersimpan. Pastikan semua isian tidak melebihi batas karakter, atau masuk dengan akun yang berwenang, lalu coba lagi.',
  signInRequired: 'Silakan login terlebih dahulu untuk melanjutkan.',
  databaseUnavailable: 'Koneksi ke database terputus. Periksa internet Anda lalu coba lagi.',
  saveFailed: 'Terjadi kendala saat menyimpan data. Silakan coba lagi.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Ukuran foto profil terlalu besar. Silakan pilih foto lain.',
  nameRequired: 'Nama wajib diisi.',
  invalidCardId: 'KCC ID tidak valid untuk kartu anggota: {id}',
  uniqueIdFailed: 'Gagal membuat KCC ID unik. Silakan coba lagi.',
  mergeAdminOnly: 'Hanya admin yang dapat menggabungkan data.',
  mergeSameRecord: 'Data yang sama tidak dapat digabungkan dengan dirinya sendiri.',
  memberRecordMissing: 'Data anggota sudah tidak ada (mungkin sudah digabung atau dihapus).',
  mergeDifferentAccounts: 'Kedua data terhubung ke akun login yang berbeda, sehingga tidak dapat digabung.',
  repairAdminOnly: 'Hanya admin yang dapat menjalankan perbaikan.',
  repairIdUpdateFailed: 'Gagal memperbarui KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'Gagal menyimpan kartu anggota ({ids}): {detail}',
  repairCardDeleteFailed: 'Gagal menghapus kartu anggota ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Silakan login terlebih dahulu untuk mengunggah foto.',
  photoTooLarge: 'Ukuran foto terlalu besar. Silakan pilih foto lain.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Gagal mendapatkan token akses dari login Google.',

  // sheetsService.ts
  sheetsApiResponseError: 'Kesalahan Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Permintaan Sheets API {label} gagal: {detail}',
  sheetsNoTimestampColumn: 'Pilih dulu kolom timestamp pada pemetaan kolom.',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Akun Utama KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Anggota',

  // Pemeriksaan admin umum
  adminOnly: 'Hanya admin yang dapat melakukan ini.',

  // Penghitung KCC ID
  invalidKccId: 'KCC ID tidak valid: {id}',
  kccCounterBlocked: 'Penghitung KCC ID sedang terblokir. Coba lagi nanti atau hubungi admin KCC.',
  kccCounterMissing: 'Peralihan ke 8 digit belum dimulai (penghitung KCC ID belum ada).',
  kccIdsExhausted: 'KCC ID sudah habis.',

  // Peralihan ke KCC ID 8 digit
  migrationPlanChanged:
    'Data anggota berubah sejak pratinjau (ada pendaftaran atau perubahan baru). Buat pratinjau lagi sebelum menerapkan.',
  migrationAlreadyStarted: 'Admin lain sudah memulai peralihan. Buat pratinjau lagi untuk melanjutkannya.',
  migrationBatchFailed: 'Peralihan berhenti pada anggota {ids}: {detail}. Buat pratinjau lagi untuk melanjutkan.',
  migrationLateClaimFailed: 'Gagal memberi KCC ID baru untuk {name}: {detail}',
  migrationPhotosFailed: 'KCC ID pada foto gagal diperbarui ({ids}): {detail}',
  migrationCancelled: 'Dihentikan atas permintaan. Buat pratinjau lagi untuk melanjutkan.',
  migrationWarnDuplicateOldId:
    '{count} anggota memakai KCC ID lama yang sama dengan anggota lain. Gabungkan data ganda dulu; jika tidak, ID lama akan menunjuk ke anggota yang paling awal.',
  migrationWarnMissingOldId:
    '{count} anggota belum punya KCC ID yang valid; mereka mendapat nomor baru tanpa tautan ID lama.',
  migrationWarnUnparsableDates:
    '{count} anggota tidak memiliki tanggal pendaftaran yang terbaca dan diberi nomor paling akhir. Jalankan "Perbaiki tanggal pendaftaran" dulu.',
  migrationWarnReservedConflict:
    '{count} anggota memegang KCC ID khusus yang tetap dipakai anggota lain; mereka mendapat nomor biasa.',
  migrationWarnLateClaims:
    '{count} anggota mendaftar dengan ID lama 16 digit setelah peralihan dimulai; mereka mendapat nomor kosong berikutnya saat diterapkan.',
  migrationWarnUnusedNumbers:
    '{count} nomor yang direncanakan tidak dipakai lagi (ada anggota yang dihapus); nomor tersebut dibiarkan kosong.',

  // Perbaikan tanggal pendaftaran
  dateFixBatchFailed: 'Tanggal pendaftaran {ids} gagal disimpan: {detail}',

  // Admin
  adminNeedsSignIn: 'Anggota ini belum pernah login ke MyKCC, jadi belum bisa dijadikan admin.',
  adminIsMainAccount: 'Akun utama selalu menjadi admin.',
  adminAlreadyAdmin: 'Anggota ini sudah menjadi admin.',
  adminRemoveSelfNeedsConfirm: 'Anda akan menghapus diri sendiri dari admin. Konfirmasi sekali lagi untuk melanjutkan.',

  // Kunci dasbor
  lockMainOnly: 'Hanya akun utama yang dapat mengubah kata sandi dasbor.',
  lockWrongPassword: 'Kata sandi dasbor salah.',
  lockReauthWrongAccount: 'Mohon konfirmasi dengan akun Google utama.',
  lockPasswordTooShort: 'Kata sandi dasbor minimal {min} karakter.',
  lockCryptoUnavailable:
    'Browser ini tidak dapat memeriksa kata sandi dasbor (Web Crypto tidak tersedia). Gunakan browser terbaru melalui HTTPS.',

  // Bantuan anggota
  memberHasNoEmail: 'Anggota ini belum menyimpan alamat email.',
  memberNotLinked: 'Anggota ini belum terhubung ke login.',
  cannotUnlinkSignInProfile: 'Data ini adalah profil login; gabungkan atau hapus, jangan dilepas.',
  authInvalidEmail: 'Alamat email yang tersimpan tidak valid.',
  authTooManyRequests: 'Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.',
  authNetworkFailed: 'Gangguan jaringan. Periksa koneksi lalu coba lagi.',
};

export default errors;
