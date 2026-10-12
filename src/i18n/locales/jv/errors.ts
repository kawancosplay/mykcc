import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Akses dipuntolak dening database (permission denied). Mboten wonten ingkang kasimpen. Mangga pesthekaken saben kolom mboten ngluwihi wates karakteripun, utawi mlebet nganggo akun ingkang gadhah idin, lajeng cobi malih.',
  signInRequired: 'Mangga mlebet rumiyin kangge nglajengaken.',
  databaseUnavailable: 'Mboten saged nyambung dhateng database. Priksa sambungan internet panjenengan lajeng cobi malih.',
  saveFailed: 'Wonten kalepatan nalika nyimpen. Mangga cobi malih.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Ukuran foto profil ageng sanget. Mangga pilih foto sanes.',
  nameRequired: 'Jeneng wajib dipunisi.',
  invalidCardId: 'KCC ID kangge kertu anggota mboten leres: {id}',
  uniqueIdFailed: 'Mboten saged damel KCC ID ingkang unik. Mangga cobi malih.',
  mergeAdminOnly: 'Namung admin ingkang saged nggabungaken data anggota.',
  mergeSameRecord: 'Data mboten saged dipungabungaken kaliyan piyambakipun.',
  memberRecordMissing: 'Data anggota punika sampun mboten wonten (bokmenawi sampun dipungabungaken utawi dipunbusak).',
  mergeDifferentAccounts:
    'Kalih data punika kagandheng dhateng akun mlebet ingkang benten, dados mboten saged dipungabungaken.',
  repairAdminOnly: 'Namung admin ingkang saged nglampahaken pandandosan.',
  repairIdUpdateFailed: 'Gagal nganyari KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'Gagal nyerat kertu anggota ({ids}): {detail}',
  repairCardDeleteFailed: 'Gagal mbusak kertu anggota ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Mangga mlebet rumiyin kangge ngunggah foto.',
  photoTooLarge: 'Ukuran foto ageng sanget. Mangga pilih foto sanes.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Mboten saged pikantuk access token saking mlebet Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Kalepatan Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Panyuwunan Sheets API {label} gagal: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Akun Utama KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Anggota (Timestamp)',
};

export default errors;
