// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
export default {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Access denied by the database (permission denied). Nothing was saved. Make sure every field is within its character limit, or sign in with an authorized account, then try again.',
  signInRequired: 'Please sign in first to continue.',
  databaseUnavailable: 'Could not reach the database. Check your internet connection and try again.',
  saveFailed: 'Something went wrong while saving. Please try again.',

  // firestoreService.ts
  profilePhotoTooLarge: 'The profile photo is too large. Please choose another photo.',
  nameRequired: 'Name is required.',
  invalidCardId: 'Invalid KCC ID for the member card: {id}',
  uniqueIdFailed: 'Could not create a unique KCC ID. Please try again.',
  mergeAdminOnly: 'Only admins can merge member records.',
  mergeSameRecord: 'A record cannot be merged into itself.',
  memberRecordMissing: 'This member record no longer exists (it may have been merged or deleted).',
  mergeDifferentAccounts: 'Both records are linked to different sign-in accounts, so they cannot be merged.',
  repairAdminOnly: 'Only admins can run the repair.',
  repairIdUpdateFailed: 'KCC ID update failed ({ids}): {detail}',
  repairCardWriteFailed: 'Member card write failed ({ids}): {detail}',
  repairCardDeleteFailed: 'Member card delete failed ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Please sign in first to upload a photo.',
  photoTooLarge: 'The photo is too large. Please choose another photo.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Could not get an access token from the Google sign-in.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets API {label} error ({status}): {detail}',
  sheetsApiRequestFailed: 'Sheets API {label} request failed: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC Main Account (0000)',
  badgeAdmin: 'KCC Admin #{number}',
  badgeMember: 'Member (Timestamp)',
} as const;
