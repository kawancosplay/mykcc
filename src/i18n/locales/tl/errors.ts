import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Tinanggihan ng database ang access (permission denied). Walang na-save. Siguraduhing nasa loob ng limitasyon ng character ang bawat field, o mag-sign in gamit ang awtorisadong account, pagkatapos ay subukang muli.',
  signInRequired: 'Paki-sign in muna para magpatuloy.',
  databaseUnavailable: 'Hindi maabot ang database. Suriin ang iyong internet connection at subukang muli.',
  saveFailed: 'Nagkaproblema habang nagse-save. Pakisubukang muli.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Masyadong malaki ang profile photo. Pumili ng ibang larawan.',
  nameRequired: 'Kailangan ang pangalan.',
  invalidCardId: 'Hindi wastong KCC ID para sa member card: {id}',
  uniqueIdFailed: 'Hindi makagawa ng natatanging KCC ID. Pakisubukang muli.',
  mergeAdminOnly: 'Mga admin lang ang puwedeng magsama ng mga record ng miyembro.',
  mergeSameRecord: 'Hindi puwedeng isama ang isang record sa sarili nito.',
  memberRecordMissing: 'Wala na ang record ng miyembrong ito (maaaring napagsama na o nabura).',
  mergeDifferentAccounts: 'Magkaibang sign-in account ang naka-link sa dalawang record, kaya hindi sila mapagsasama.',
  repairAdminOnly: 'Mga admin lang ang puwedeng magpatakbo ng pag-aayos.',
  repairIdUpdateFailed: 'Nabigo ang pag-update ng KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'Nabigo ang pagsulat ng member card ({ids}): {detail}',
  repairCardDeleteFailed: 'Nabigo ang pagbura ng member card ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Paki-sign in muna para makapag-upload ng larawan.',
  photoTooLarge: 'Masyadong malaki ang larawan. Pumili ng ibang larawan.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Hindi makakuha ng access token mula sa Google sign-in.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Error sa Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Nabigo ang request sa Sheets API {label}: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Main Account ng KCC (0000)',
  badgeAdmin: 'KCC Admin #{number}',
  badgeMember: 'Miyembro (Timestamp)',
};

export default errors;
