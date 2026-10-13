import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'உலகளாவிய பாப் கலாச்சார, காஸ்ப்ளே & Wota சமூகம் (100% SFW)',
  navForm: 'பதிவுப் படிவம்',
  navCard: 'என் டிஜிட்டல் பாஸ்',
  navGallery: 'காஸ்ப்ளே கேலரி',
  navProfile: 'என் சுயவிவரம்',
  navAdmin: 'நிர்வாகி டாஷ்போர்டு',
  navLogin: 'உள்நுழை / பதிவுசெய்',
  navLogout: 'வெளியேறு',
  userId16Label: 'அதிகாரப்பூர்வ KCC ID',
  officialBannerText: 'KawanCosplay-இன் அதிகாரப்பூர்வ இணையதளம்',
  howYouKnow: 'இதை எப்படி அறிவது',
  aboutKccTitle: 'அதிகாரப்பூர்வ சர்வதேச சமூகம் (100% SFW)',
  aboutKccDesc: 'KawanCosplay என்பது 100% SFW (Safe For Work) ஆரோக்கியமான காஸ்ப்ளே, ஐடல் ரசனை, அனிமே ஆகியவற்றுக்காக அர்ப்பணிக்கப்பட்ட, உலகம் முழுவதும் உள்ள உறுப்பினர்களுக்குத் திறந்திருக்கும் ஒரு சர்வதேசப் படைப்பாற்றல் பாப் கலாச்சாரச் சமூகம்.',
  secureSiteTitle: 'பாதுகாப்பான இணையதளங்கள் HTTPS & பூட்டுக் குறியீட்டை (🔒) பயன்படுத்துகின்றன',
  secureSiteDesc: 'உங்கள் உலாவியின் முகவரிப் பட்டியைப் பாருங்கள். அதிகாரப்பூர்வ இணையதளங்கள் எப்போதும் https:// என்று தொடங்கி, பாதுகாப்பான பூட்டுக் குறியீட்டை (🔒) காட்டும்.',
  officialContactTitle: 'அதிகாரப்பூர்வ WhatsApp ஹாட்லைன் & மின்னஞ்சல்',
  officialContactDesc: 'அதிகாரப்பூர்வ விசாரணைகள் WhatsApp ஹாட்லைன் +62 857-1103-2782 மற்றும் cosplaysehat@gmail.com வழியாக மட்டுமே கையாளப்படுகின்றன.',
  whatsappHotline: 'அதிகாரப்பூர்வ WhatsApp ஹாட்லைன்: +62 857-1103-2782',

  // Generic
  close: 'மூடு',
  optional: '(விருப்பத்தேர்வு)',
  tryAgain: 'மீண்டும் முயற்சி செய்',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'செயலி ஏற்றப்படுகிறது...',
  loadingAdmin: 'நிர்வாகி பக்கம் ஏற்றப்படுகிறது...',

  // Navbar & app shell
  navFormShort: 'பதிவு',
  navCardShort: 'KCC ID',
  navGalleryShort: 'கேலரி',
  openMenu: 'மெனுவைத் திற',
  closeMenu: 'மெனுவை மூடு',
  chooseLanguage: 'மொழியைத் தேர்ந்தெடு ({language})',
  siteEditorShort: 'தள எடிட்டர்',
  themeEditor: 'தீம் எடிட்டர்',
  whatsappCommunity: 'WhatsApp சமூகம்',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'மின்னஞ்சல்: cosplaysehat@gmail.com',
  userFallbackName: 'பயனர்',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'KawanCosplay லோகோ',
  officialBadge: 'அதிகாரப்பூர்வம்',

  // PWA install
  pwaInstall: 'செயலியை நிறுவு',
  pwaIosTitle: 'iPhone / iPad-இல் நிறுவுக',
  pwaIosStep1: '1. Safari கருவிப்பட்டியில் உள்ள {share} பொத்தானைத் தட்டவும்.',
  pwaIosShare: 'பகிர்',
  pwaIosStep2: '2. கீழே ஸ்க்ரோல் செய்து {addToHome} என்பதைத் தட்டவும்.',
  pwaIosAddToHome: 'முகப்புத் திரையில் சேர்',

  // Admin portal shell
  backToPublicSite: 'பொதுத் தளத்திற்குத் திரும்பு',
  adminPortalTitle: 'KawanCosplay நிர்வாகி போர்டல்',
  googleSignInBadge: 'Google உள்நுழைவு',
  adminRestricted: 'நிர்வாகிகளுக்கு மட்டும்',
  lockAndExitAdminTitle: 'நிர்வாகி போர்டலைப் பூட்டி வெளியேறு',
  lockExit: 'பூட்டு / வெளியேறு',
  adminPortal: 'நிர்வாகி போர்டல்',
  adminPortalLinkTitle: 'KCC நிர்வாகிகளுக்கு மட்டுமான போர்டல் (நிர்வாகி Google உள்நுழைவு)',
  sheetsPopupClosed: 'செயல்முறை முடிவதற்கு முன்பே Google அங்கீகாரச் சாளரம் மூடப்பட்டது.',
  sheetsWrongAccount: 'உள்நுழைந்துள்ள நிர்வாகிக் கணக்கின் அதே Google கணக்கைத் தேர்ந்தெடுக்கவும்.',
  sheetsPopupBlocked: 'உலாவி Google உள்நுழைவுச் சாளரத்தைத் தடுத்துவிட்டது. இந்தத் தளத்திற்கு பாப்-அப்களை அனுமதித்து மீண்டும் முயற்சிக்கவும்.',
  sheetsConnectFailed:
    'Google Sheets-ஐ இணைக்க முடியவில்லை. நிர்வாகிக் கணக்கை (cosplaysehat@gmail.com) தேர்ந்தெடுத்து, Google Sheets-ஐப் படிப்பதற்கான அனுமதியை வழங்கவும்.',

  // KCC ID lookup page
  cardPageBadge: 'MyKCC உறுப்பினர் அடையாள அட்டை',
  cardPageTitle: 'உறுப்பினர் அடையாள அட்டை & KCC ID',
  cardPageDesc:
    'அனைத்து உறுப்பினர்களின் தனியுரிமையைப் பாதுகாக்க, முழு உறுப்பினர் பட்டியல் நிர்வாகி போர்டலுக்கு மட்டுமே கட்டுப்படுத்தப்பட்டுள்ளது. உங்கள் அதிகாரப்பூர்வ டிஜிட்டல் பாஸைக் காண, உங்கள் 16 இலக்க KCC ID-ஐ (எ.கா. 2026 1008 0715 3001) உள்ளிடவும்.',
  connectedProfile: 'இணைக்கப்பட்ட சுயவிவரம்',
  openPass: 'பாஸைத் திற',
  lookupPlaceholder: '16 இலக்க KCC ID, எ.கா. 2026 1008 0715 3001',
  lookupSubmit: 'உறுப்பினர் அடையாள அட்டையைத் தேடிக் காண்க',
  searching: 'தேடுகிறது...',
  passFound: 'பாஸ் கண்டுபிடிக்கப்பட்டது!',
  notRegisteredYet: 'இன்னும் பதிவுசெய்யவில்லையா?',
  fillRegistrationForm: 'பதிவுப் படிவத்தை நிரப்புக →',
  lookupInvalidId: 'உங்கள் 16 இலக்க KCC ID-ஐ உள்ளிடவும் (இலக்கங்கள் மட்டும்; இடைவெளிகள் அனுமதிக்கப்படும்).',
  lookupNotFound: 'அந்த KCC ID-க்கு உறுப்பினர் அடையாள அட்டை எதுவும் கிடைக்கவில்லை. 16 இலக்கங்களையும் மீண்டும் சரிபார்க்கவும்.',
  lookupPermissionDenied:
    'அட்டைத் தேடல் தற்போது கிடைக்கவில்லை (தரவுத்தள அணுகல் மறுக்கப்பட்டது). பின்னர் மீண்டும் முயற்சிக்கவும் அல்லது KCC நிர்வாகியைத் தொடர்புகொள்ளவும்.',

  // Profile tab states
  profileLoadFailed: 'உங்கள் உறுப்பினர் சுயவிவரத்தை ஏற்ற முடியவில்லை.',
  checkConnectionRetry: 'உங்கள் இணைய இணைப்பைச் சரிபார்த்து, மீண்டும் முயற்சிக்கவும்.',
  preparingProfile: 'உறுப்பினர் சுயவிவரம் தயாராகிறது...',
  preparingProfileDesc: 'உங்கள் கணக்கு டிஜிட்டல் KCC அடையாளத்துடன் இணைக்கப்படுகிறது.',
  pleaseSignIn: 'தயவுசெய்து உள்நுழையவும்',
  clickToSignIn: 'உள்நுழைய இங்கே கிளிக் செய்யவும்',

  // Footer
  footerPlatform: '100% SFW சர்வதேச பாப் கலாச்சாரத் தளம்.',
  copyright: '© 2026 MyKCC. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  privacyShieldActive: '16 இலக்க அடையாளம் & தனியுரிமைக் கவச அமைப்பு செயலில் உள்ளது',
};

export default common;
