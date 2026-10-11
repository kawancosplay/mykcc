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

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Akun Utama KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Anggota (Timestamp)',
};

export default errors;
