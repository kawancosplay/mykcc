import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'என் உறுப்பினர் சுயவிவரம்',
  updateProfile: 'சுயவிவரத் தகவலை நிகழ்நேரத்தில் புதுப்பிக்கவும்',

  // Hero
  changeAvatar: 'சுயவிவரப் படத்தை மாற்று',
  verifiedActive: 'சரிபார்க்கப்பட்டது & செயலில்',
  kccIdLabel: 'KCC ID (16 இலக்கங்கள்)',
  copyKccId: 'KCC ID-ஐ நகலெடு',
  viewIdCard: 'உறுப்பினர் அடையாள அட்டையைக் காண்க',

  // Profile form
  infoTitle: 'உறுப்பினர் சுயவிவரத் தகவல்',
  infoDesc: 'இந்தத் தகவலை எப்போது வேண்டுமானாலும் மாற்றலாம்; இது MyKCC தரவுத்தளத்தில் நிகழ்நேரத்தில் சேமிக்கப்படும்.',
  savedRealtime: 'நிகழ்நேரத்தில் சேமிக்கப்பட்டது!',
  ageCategoryLabel: 'வயதுப் பிரிவு',
  ageLabel: 'வயது / பிறந்தநாள் (விருப்பத்தேர்வு)',
  agePlaceholder: 'எ.கா. 21 வயது அல்லது மே 15',
  whatsappLabel: 'செயலில் உள்ள WhatsApp எண்',
  backupPhoneLabel: 'இரண்டாவது / மாற்று WhatsApp எண்',
  backupPhonePlaceholder: 'எ.கா. 0812... அல்லது +62 857...',
  discordPlaceholder: 'எ.கா. alyachan_cos அல்லது user#0001',
  roleLabel: 'முதன்மைச் சமூகப் பங்கு',
  customRolePlaceholder: 'உங்கள் பிற பங்கு / சிறப்புத் திறனை உள்ளிடவும்...',
  socialMediaPlaceholder: '@பயனர்பெயர் (Instagram / X / TikTok)',
  reasonLabel: 'சேர்வதற்கான காரணம் & சுயவிவரக் குறிப்புகள்',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'ஐடல் ரசிகர் / Wota',
  roleOtaku: 'அனிமே, மாங்கா & கேமிங் ஒட்டாகு',
  roleGeneralEnthusiast: 'பொது ஆர்வலர் / ஆதரவாளர்',
  rolePropMaker: 'ப்ராப் தயாரிப்பாளர் / கைவினைஞர்',
  roleCostumeMaker: 'உடை தயாரிப்பாளர் / தையல் கலைஞர்',
  roleEventCrew: 'நிகழ்வுக் குழு & பணியாளர்கள்',
};

export default profile;
