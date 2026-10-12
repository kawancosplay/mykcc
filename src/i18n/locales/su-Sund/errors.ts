import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'ᮃᮊ᮪ᮞᮦᮞ᮪ ᮓᮤᮒᮧᮜᮊ᮪ ᮊᮥ ᮓᮒᮘᮦᮞ᮪ (permission denied). ᮒᮩ ᮃᮚ ᮓᮒ ᮃᮔᮥ ᮓᮤᮞᮤᮙ᮪ᮕᮨᮔ᮪. ᮕᮞ᮪ᮒᮤᮊᮩᮔ᮪ ᮅᮀᮌᮜ᮪ ᮉᮞᮤᮃᮔ᮪ ᮒᮩ ᮍᮜᮩᮝᮤᮠᮔ᮪ ᮝᮒᮨᮞ᮪ ᮊᮛᮊ᮪ᮒᮨᮁᮔ, ᮃᮒᮔᮕᮤ ᮃᮞᮥᮕ᮪ ᮍᮀᮌᮧ ᮃᮊᮥᮔ᮪ ᮃᮔᮥ ᮌᮓᮥᮂ ᮝᮨᮝᮨᮔᮀ, ᮒᮨᮛᮞ᮪ ᮎᮧᮘᮤᮃᮔ᮪ ᮓᮩᮄ.',
  signInRequired: 'ᮙᮀᮌ ᮃᮞᮥᮕ᮪ ᮠᮩᮜ ᮕᮤᮊᮩᮔ᮪ ᮔᮨᮛᮞ᮪ᮊᮩᮔ᮪.',
  databaseUnavailable: 'ᮒᮩ ᮒᮤᮃᮞ ᮑᮙ᮪ᮘᮥᮀ ᮊ ᮓᮒᮘᮦᮞ᮪. ᮕᮛᮤᮊ᮪ᮞ ᮞᮙ᮪ᮘᮥᮍᮔ᮪ ᮄᮔ᮪ᮒᮨᮁᮔᮦᮒ᮪ ᮃᮔ᮪ᮏᮩᮔ᮪ ᮒᮨᮛᮞ᮪ ᮎᮧᮘᮤᮃᮔ᮪ ᮓᮩᮄ.',
  saveFailed: 'ᮃᮚ ᮊᮞᮜᮠᮔ᮪ ᮔᮜᮤᮊ ᮑᮤᮙ᮪ᮕᮨᮔ᮪. ᮙᮀᮌ ᮎᮧᮘᮤᮃᮔ᮪ ᮓᮩᮄ.',

  // firestoreService.ts
  profilePhotoTooLarge: 'ᮕᮧᮒᮧ ᮕᮢᮧᮕᮤᮜ᮪ᮔ ᮃᮌᮩᮀ ᮒᮩᮄᮀ. ᮙᮀᮌ ᮕᮤᮜᮤᮂ ᮕᮧᮒᮧ ᮞᮔᮦᮞ᮪.',
  nameRequired: 'ᮝᮞ᮪ᮒ ᮊᮨᮓᮂ ᮓᮤᮉᮞᮤᮃᮔ᮪.',
  invalidCardId: 'KCC ID ᮊᮀᮌᮧ ᮊᮁᮒᮥ ᮃᮀᮌᮧᮒ ᮒᮩ ᮞᮂ: {id}',
  uniqueIdFailed: 'ᮒᮩ ᮒᮤᮃᮞ ᮍᮓᮙᮨᮜ᮪ KCC ID ᮃᮔᮥ ᮅᮔᮤᮊ᮪. ᮙᮀᮌ ᮎᮧᮘᮤᮃᮔ᮪ ᮓᮩᮄ.',
  mergeAdminOnly: 'ᮍᮔ᮪ ᮅᮊᮥᮁ ᮃᮓ᮪ᮙᮤᮔ᮪ ᮃᮔᮥ ᮒᮤᮃᮞ ᮍᮌᮘᮥᮀᮊᮩᮔ᮪ ᮓᮒ ᮃᮀᮌᮧᮒ.',
  mergeSameRecord: 'ᮓᮒ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮌᮘᮥᮀᮊᮩᮔ᮪ ᮞᮛᮨᮀ ᮓᮤᮛᮤᮔ ᮑᮜᮤᮛ.',
  memberRecordMissing: 'ᮓᮒ ᮃᮀᮌᮧᮒ ᮄᮉ ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮒᮩ ᮃᮚ (ᮕᮍᮤᮔ᮪ᮒᮨᮔ᮪ ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮓᮤᮌᮘᮥᮀᮊᮩᮔ᮪ ᮃᮒᮔᮕᮤ ᮓᮤᮠᮕᮥᮞ᮪).',
  mergeDifferentAccounts: 'ᮊᮓᮥᮃ ᮓᮒ ᮊᮞᮙ᮪ᮘᮥᮀ ᮊ ᮃᮊᮥᮔ᮪ ᮃᮞᮥᮕ᮪ ᮃᮔᮥ ᮘᮦᮔ᮪ᮒᮨᮔ᮪, ᮏᮔ᮪ᮒᮨᮔ᮪ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮌᮘᮥᮀᮊᮩᮔ᮪.',
  repairAdminOnly: 'ᮍᮔ᮪ ᮅᮊᮥᮁ ᮃᮓ᮪ᮙᮤᮔ᮪ ᮃᮔᮥ ᮒᮤᮃᮞ ᮍᮏᮜᮔ᮪ᮊᮩᮔ᮪ ᮕᮨᮁᮘᮄᮊᮔ᮪.',
  repairIdUpdateFailed: 'ᮌᮌᮜ᮪ ᮍᮦᮀᮌᮜ᮪ᮊᮩᮔ᮪ KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'ᮌᮌᮜ᮪ ᮑᮨᮛᮒ᮪ ᮊᮁᮒᮥ ᮃᮀᮌᮧᮒ ({ids}): {detail}',
  repairCardDeleteFailed: 'ᮌᮌᮜ᮪ ᮍᮠᮕᮥᮞ᮪ ᮊᮁᮒᮥ ᮃᮀᮌᮧᮒ ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'ᮙᮀᮌ ᮃᮞᮥᮕ᮪ ᮠᮩᮜ ᮕᮤᮊᮩᮔ᮪ ᮍᮥᮀᮌᮂ ᮕᮧᮒᮧ.',
  photoTooLarge: 'ᮕᮧᮒᮧᮔ ᮃᮌᮩᮀ ᮒᮩᮄᮀ. ᮙᮀᮌ ᮕᮤᮜᮤᮂ ᮕᮧᮒᮧ ᮞᮔᮦᮞ᮪.',

  // googleAuth.ts
  googleAccessTokenMissing: 'ᮒᮩ ᮒᮤᮃᮞ ᮊᮦᮍᮤᮀᮊᮩᮔ᮪ ᮒᮧᮊᮨᮔ᮪ ᮃᮊ᮪ᮞᮦᮞ᮪ ᮒᮤᮔ ᮃᮞᮥᮕ᮪ Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'ᮊᮞᮜᮠᮔ᮪ Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'ᮕᮙᮦᮔ᮪ᮒ Sheets API {label} ᮌᮌᮜ᮪: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'ᮃᮊᮥᮔ᮪ ᮅᮒᮙ KCC (0000)',
  badgeAdmin: 'ᮃᮓ᮪ᮙᮤᮔ᮪ KCC #{number}',
  badgeMember: 'ᮃᮀᮌᮧᮒ (ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪)',
};

export default errors;
