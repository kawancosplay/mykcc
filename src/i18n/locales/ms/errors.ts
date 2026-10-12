import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Akses ditolak oleh pangkalan data (permission denied). Tiada apa-apa yang disimpan. Pastikan setiap ruangan tidak melebihi had aksaranya, atau log masuk dengan akaun yang dibenarkan, kemudian cuba lagi.',
  signInRequired: 'Sila log masuk terlebih dahulu untuk meneruskan.',
  databaseUnavailable: 'Tidak dapat menghubungi pangkalan data. Semak sambungan internet anda dan cuba lagi.',
  saveFailed: 'Berlaku masalah semasa menyimpan. Sila cuba lagi.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Foto profil terlalu besar. Sila pilih foto lain.',
  nameRequired: 'Nama wajib diisi.',
  invalidCardId: 'KCC ID tidak sah untuk kad ahli: {id}',
  uniqueIdFailed: 'Tidak dapat mencipta KCC ID yang unik. Sila cuba lagi.',
  mergeAdminOnly: 'Hanya admin boleh menggabungkan rekod ahli.',
  mergeSameRecord: 'Rekod tidak boleh digabungkan dengan dirinya sendiri.',
  memberRecordMissing: 'Rekod ahli ini sudah tiada (mungkin telah digabungkan atau dipadam).',
  mergeDifferentAccounts: 'Kedua-dua rekod dipautkan kepada akaun log masuk yang berbeza, jadi ia tidak boleh digabungkan.',
  repairAdminOnly: 'Hanya admin boleh menjalankan pembaikan.',
  repairIdUpdateFailed: 'Kemas kini KCC ID gagal ({ids}): {detail}',
  repairCardWriteFailed: 'Gagal menyimpan kad ahli ({ids}): {detail}',
  repairCardDeleteFailed: 'Gagal memadam kad ahli ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Sila log masuk terlebih dahulu untuk memuat naik foto.',
  photoTooLarge: 'Foto terlalu besar. Sila pilih foto lain.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Tidak dapat memperoleh token akses daripada log masuk Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Ralat Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Permintaan Sheets API {label} gagal: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Akaun Utama KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Ahli (Cap Masa)',
};

export default errors;
