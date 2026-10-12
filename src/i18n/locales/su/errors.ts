import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Aksés ditolak ku database (permission denied). Teu aya data anu disimpen. Pastikeun unggal eusian teu ngaleuwihan wates karakterna, atanapi asup nganggo akun anu gaduh wewenang, teras cobian deui.',
  signInRequired: 'Mangga asup heula pikeun neraskeun.',
  databaseUnavailable: 'Teu tiasa nyambung ka database. Pariksa sambungan internét anjeun teras cobian deui.',
  saveFailed: 'Aya kasalahan nalika nyimpen. Mangga cobian deui.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Poto profilna ageung teuing. Mangga pilih poto sanés.',
  nameRequired: 'Wasta kedah dieusian.',
  invalidCardId: 'KCC ID kanggo kartu anggota teu sah: {id}',
  uniqueIdFailed: 'Teu tiasa ngadamel KCC ID anu unik. Mangga cobian deui.',
  mergeAdminOnly: 'Ngan ukur admin anu tiasa ngagabungkeun data anggota.',
  mergeSameRecord: 'Data teu tiasa digabungkeun sareng dirina nyalira.',
  memberRecordMissing: 'Data anggota ieu parantos teu aya (panginten parantos digabungkeun atanapi dihapus).',
  mergeDifferentAccounts: 'Kadua data kasambung ka akun asup anu bénten, janten teu tiasa digabungkeun.',
  repairAdminOnly: 'Ngan ukur admin anu tiasa ngajalankeun perbaikan.',
  repairIdUpdateFailed: 'Gagal ngénggalkeun KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'Gagal nyerat kartu anggota ({ids}): {detail}',
  repairCardDeleteFailed: 'Gagal ngahapus kartu anggota ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Mangga asup heula pikeun ngunggah poto.',
  photoTooLarge: 'Potona ageung teuing. Mangga pilih poto sanés.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Teu tiasa kéngingkeun token aksés tina asup Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Kasalahan Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Paménta Sheets API {label} gagal: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Akun Utama KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Anggota (Timestamp)',
};

export default errors;
