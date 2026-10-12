import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'ꦲꦏ꧀ꦱꦺꦱ꧀ ꦢꦶꦥꦸꦤ꧀ꦠꦺꦴꦭꦏ꧀ ꦢꦺꦤꦶꦁ ꦢꦠꦧꦺꦱ꧀ (permission denied). ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦲꦶꦁꦏꦁ ꦏꦱꦶꦩ꧀ꦥꦼꦤ꧀꧉ ꦩꦁꦒ ꦥꦼꦱ꧀ꦛꦺꦏꦏꦼꦤ꧀ ꦱꦧꦼꦤ꧀ ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦔ꧀ꦭꦸꦮꦶꦲꦶ ꦮꦠꦼꦱ꧀ ꦏꦫꦏ꧀ꦠꦼꦫꦶꦥꦸꦤ꧀꧈ ꦲꦸꦠꦮꦶ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ꦔꦁꦒꦺꦴ ꦲꦏꦸꦤ꧀ ꦲꦶꦁꦏꦁ ꦒꦝꦃ ꦲꦶꦢꦶꦤ꧀꧈ ꦭꦗꦼꦁ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',
  signInRequired: 'ꦩꦁꦒ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ꦫꦸꦩꦶꦪꦶꦤ꧀ ꦏꦁꦒꦺ ꦔ꧀ꦭꦗꦼꦔꦏꦼꦤ꧀꧉',
  databaseUnavailable: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦚꦩ꧀ꦧꦸꦁ ꦝꦠꦼꦁ ꦢꦠꦧꦺꦱ꧀꧉ ꦥꦿꦶꦏ꧀ꦱ ꦱꦩ꧀ꦧꦸꦔꦤ꧀ ꦲꦶꦤ꧀ꦠꦼꦂꦤꦺꦠ꧀ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀ ꦭꦗꦼꦁ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',
  saveFailed: 'ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦏꦊꦥꦠꦤ꧀ ꦤꦭꦶꦏ ꦚꦶꦩ꧀ꦥꦼꦤ꧀꧉ ꦩꦁꦒ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',

  // firestoreService.ts
  profilePhotoTooLarge: 'ꦲꦸꦏꦸꦫꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦥꦿꦺꦴꦥ꦳ꦶꦭ꧀ ꦲꦒꦼꦁ ꦱꦔꦼꦠ꧀꧉ ꦩꦁꦒ ꦥꦶꦭꦶꦃ ꦥ꦳ꦺꦴꦠꦺꦴ ꦱꦤꦺꦱ꧀꧉',
  nameRequired: 'ꦗꦼꦤꦼꦁ ꦮꦗꦶꦧ꧀ ꦢꦶꦥꦸꦤꦶꦱꦶ꧉',
  invalidCardId: 'KCC ID ꦏꦁꦒꦺ ꦏꦼꦂꦠꦸ ꦲꦁꦒꦺꦴꦠ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦊꦉꦱ꧀: {id}',
  uniqueIdFailed: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦩꦼꦭ꧀ KCC ID ꦲꦶꦁꦏꦁ ꦲꦸꦤꦶꦏ꧀꧉ ꦩꦁꦒ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',
  mergeAdminOnly: 'ꦤꦩꦸꦁ ꦲꦢ꧀ꦩꦶꦤ꧀ ꦲꦶꦁꦏꦁ ꦱꦒꦼꦢ꧀ ꦔ꧀ꦒꦧꦸꦔꦏꦼꦤ꧀ ꦢꦠ ꦲꦁꦒꦺꦴꦠ꧉',
  mergeSameRecord: 'ꦢꦠ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦔꦧꦸꦔꦏꦼꦤ꧀ ꦏꦭꦶꦪꦤ꧀ ꦥꦶꦪꦩ꧀ꦧꦏꦶꦥꦸꦤ꧀꧉',
  memberRecordMissing: 'ꦢꦠ ꦲꦁꦒꦺꦴꦠ ꦥꦸꦤꦶꦏ ꦱꦩ꧀ꦥꦸꦤ꧀ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ (ꦧꦺꦴꦏ꧀ꦩꦼꦤꦮꦶ ꦱꦩ꧀ꦥꦸꦤ꧀ ꦢꦶꦥꦸꦔꦧꦸꦔꦏꦼꦤ꧀ ꦲꦸꦠꦮꦶ ꦢꦶꦥꦸꦤ꧀ꦧꦸꦱꦏ꧀)꧉',
  mergeDifferentAccounts:
    'ꦏꦭꦶꦃ ꦢꦠ ꦥꦸꦤꦶꦏ ꦏꦒꦤ꧀ꦝꦺꦁ ꦝꦠꦼꦁ ꦲꦏꦸꦤ꧀ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ꦲꦶꦁꦏꦁ ꦧꦺꦤ꧀ꦠꦺꦤ꧀꧈ ꦢꦢꦺꦴꦱ꧀ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦔꦧꦸꦔꦏꦼꦤ꧀꧉',
  repairAdminOnly: 'ꦤꦩꦸꦁ ꦲꦢ꧀ꦩꦶꦤ꧀ ꦲꦶꦁꦏꦁ ꦱꦒꦼꦢ꧀ ꦔ꧀ꦭꦩ꧀ꦥꦲꦏꦼꦤ꧀ ꦥꦤ꧀ꦢꦤ꧀ꦢꦺꦴꦱꦤ꧀꧉',
  repairIdUpdateFailed: 'ꦒꦒꦭ꧀ ꦔꦚꦫꦶ KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'ꦒꦒꦭ꧀ ꦚꦼꦫꦠ꧀ ꦏꦼꦂꦠꦸ ꦲꦁꦒꦺꦴꦠ ({ids}): {detail}',
  repairCardDeleteFailed: 'ꦒꦒꦭ꧀ ꦩ꧀ꦧꦸꦱꦏ꧀ ꦏꦼꦂꦠꦸ ꦲꦁꦒꦺꦴꦠ ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'ꦩꦁꦒ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ꦫꦸꦩꦶꦪꦶꦤ꧀ ꦏꦁꦒꦺ ꦔꦸꦁꦒꦃ ꦥ꦳ꦺꦴꦠꦺꦴ꧉',
  photoTooLarge: 'ꦲꦸꦏꦸꦫꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦲꦒꦼꦁ ꦱꦔꦼꦠ꧀꧉ ꦩꦁꦒ ꦥꦶꦭꦶꦃ ꦥ꦳ꦺꦴꦠꦺꦴ ꦱꦤꦺꦱ꧀꧉',

  // googleAuth.ts
  googleAccessTokenMissing: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦥꦶꦏꦤ꧀ꦠꦸꦏ꧀ ꦠꦺꦴꦏꦺꦤ꧀ ꦲꦏ꧀ꦱꦺꦱ꧀ ꦱꦏꦶꦁ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'ꦏꦊꦥꦠꦤ꧀ Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'ꦥꦚꦸꦮꦸꦤꦤ꧀ Sheets API {label} ꦒꦒꦭ꧀: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'ꦲꦏꦸꦤ꧀ ꦲꦸꦠꦩ KCC (0000)',
  badgeAdmin: 'ꦲꦢ꧀ꦩꦶꦤ꧀ KCC #{number}',
  badgeMember: 'ꦲꦁꦒꦺꦴꦠ (ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀)',
};

export default errors;
