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
  sheetsNoTimestampColumn: 'Choose the timestamp column in the column mapping first.',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC Main Account (0000)',
  badgeAdmin: 'KCC Admin #{number}',
  badgeMember: 'Member',

  // Generic admin check (every admin-only data-layer function)
  adminOnly: 'Only admins can do this.',

  // KCC ID counter (firestoreService.ts)
  invalidKccId: 'Invalid KCC ID: {id}',
  kccCounterBlocked: 'The KCC ID counter is blocked. Please try again later or contact a KCC admin.',
  kccCounterMissing: 'The 8-digit switch has not started yet (there is no KCC ID counter).',
  kccIdsExhausted: 'No more KCC IDs are available.',

  // 8-digit switch (firestoreService.ts); {count} = number of members
  migrationPlanChanged:
    'Members changed since the preview (new registration or edit). Preview again before applying.',
  migrationAlreadyStarted: 'Another admin already started the switch. Preview again to resume it.',
  migrationBatchFailed: 'The switch stopped at members {ids}: {detail}. Preview again to resume.',
  migrationLateClaimFailed: 'Could not give {name} a new KCC ID: {detail}',
  migrationPhotosFailed: 'KCC IDs on photos could not be updated ({ids}): {detail}',
  migrationCancelled: 'Stopped on request. Preview again to resume.',
  migrationWarnDuplicateOldId:
    '{count} members share an old KCC ID with another member. Merge duplicates first; otherwise the old ID will point to the earliest of them.',
  migrationWarnMissingOldId: '{count} members have no valid KCC ID yet; they get a new number without an old-ID link.',
  migrationWarnUnparsableDates:
    '{count} members have no readable registration date and are numbered last. Run "Fix registration dates" first.',
  migrationWarnReservedConflict:
    '{count} members hold a reserved KCC ID that another member keeps; they get a regular number.',
  migrationWarnLateClaims:
    '{count} members registered with an old 16-digit ID after the switch started; they get the next free numbers when you apply.',
  migrationWarnUnusedNumbers: '{count} planned numbers are no longer needed (a member was deleted); they stay unused.',

  // Fix registration dates (firestoreService.ts)
  dateFixBatchFailed: 'Registration dates of {ids} could not be saved: {detail}',

  // Admins (adminService.ts)
  adminNeedsSignIn: 'This member has never signed in to MyKCC, so they cannot be made an admin yet.',
  adminIsMainAccount: 'The main account is always an admin.',
  adminAlreadyAdmin: 'This member is already an admin.',
  adminRemoveSelfNeedsConfirm: 'You are about to remove yourself as an admin. Confirm it again to continue.',

  // Dashboard lock (dashboardLock.ts / googleAuth.ts)
  lockMainOnly: 'Only the main account can change the dashboard password.',
  lockWrongPassword: 'Wrong dashboard password.',
  lockReauthWrongAccount: 'Please confirm with the main Google account.',
  lockPasswordTooShort: 'The dashboard password must have at least {min} characters.',
  lockCryptoUnavailable:
    'This browser cannot check the dashboard password (Web Crypto is unavailable). Use an up-to-date browser over HTTPS.',

  // Member support (authService.ts / firestoreService.ts)
  memberHasNoEmail: 'This member has no email address saved.',
  memberNotLinked: 'This member is not linked to a login.',
  cannotUnlinkSignInProfile: 'This record is a sign-in profile; merge or delete it instead of unlinking.',
  authInvalidEmail: 'The stored email address is not valid.',
  authTooManyRequests: 'Too many requests. Please wait a few minutes and try again.',
  authNetworkFailed: 'Network error. Check your connection and try again.',
} as const;
