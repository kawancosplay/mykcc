import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'தரவுத்தளம் அணுகலை மறுத்துவிட்டது (permission denied). எதுவும் சேமிக்கப்படவில்லை. ஒவ்வொரு புலமும் அதன் எழுத்து வரம்பிற்குள் உள்ளதா என உறுதிசெய்யவும், அல்லது அனுமதி பெற்ற கணக்கில் உள்நுழையவும்; பிறகு மீண்டும் முயற்சிக்கவும்.',
  signInRequired: 'தொடர, முதலில் உள்நுழையவும்.',
  databaseUnavailable: 'தரவுத்தளத்தை அணுக முடியவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  saveFailed: 'சேமிக்கும்போது ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.',

  // firestoreService.ts
  profilePhotoTooLarge: 'சுயவிவரப் படம் மிகப் பெரியதாக உள்ளது. வேறொரு படத்தைத் தேர்ந்தெடுக்கவும்.',
  nameRequired: 'பெயர் கட்டாயம்.',
  invalidCardId: 'உறுப்பினர் அட்டைக்கான KCC ID தவறானது: {id}',
  uniqueIdFailed: 'தனித்துவமான KCC ID-ஐ உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  mergeAdminOnly: 'நிர்வாகிகள் மட்டுமே உறுப்பினர் பதிவுகளை ஒன்றிணைக்க முடியும்.',
  mergeSameRecord: 'ஒரு பதிவை அதனுடனேயே ஒன்றிணைக்க முடியாது.',
  memberRecordMissing: 'இந்த உறுப்பினர் பதிவு இப்போது இல்லை (இது ஒன்றிணைக்கப்பட்டிருக்கலாம் அல்லது நீக்கப்பட்டிருக்கலாம்).',
  mergeDifferentAccounts: 'இரண்டு பதிவுகளும் வெவ்வேறு உள்நுழைவுக் கணக்குகளுடன் இணைக்கப்பட்டுள்ளதால், அவற்றை ஒன்றிணைக்க முடியாது.',
  repairAdminOnly: 'நிர்வாகிகள் மட்டுமே சரிசெய்தலை இயக்க முடியும்.',
  repairIdUpdateFailed: 'KCC ID புதுப்பிப்பு தோல்வியடைந்தது ({ids}): {detail}',
  repairCardWriteFailed: 'உறுப்பினர் அட்டையைச் சேமிப்பது தோல்வியடைந்தது ({ids}): {detail}',
  repairCardDeleteFailed: 'உறுப்பினர் அட்டையை நீக்குவது தோல்வியடைந்தது ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'புகைப்படத்தைப் பதிவேற்ற, முதலில் உள்நுழையவும்.',
  photoTooLarge: 'புகைப்படம் மிகப் பெரியதாக உள்ளது. வேறொரு புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Google உள்நுழைவிலிருந்து அணுகல் டோக்கனைப் பெற முடியவில்லை.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets API {label} பிழை ({status}): {detail}',
  sheetsApiRequestFailed: 'Sheets API {label} கோரிக்கை தோல்வியடைந்தது: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC முதன்மைக் கணக்கு (0000)',
  badgeAdmin: 'KCC நிர்வாகி #{number}',
  badgeMember: 'உறுப்பினர் (நேரமுத்திரை)',
};

export default errors;
