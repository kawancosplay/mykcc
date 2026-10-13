import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'مجتمع عالمي للثقافة الشعبية والكوسبلاي ومحبي الآيدول (wota) (100% SFW)',
  navForm: 'استمارة التسجيل',
  navCard: 'بطاقتي الرقمية',
  navGallery: 'معرض الكوسبلاي',
  navProfile: 'ملفي الشخصي',
  navAdmin: 'لوحة تحكم المشرف',
  navLogin: 'تسجيل الدخول / إنشاء حساب',
  navLogout: 'تسجيل الخروج',
  userId16Label: 'KCC ID الرسمي',
  officialBannerText: 'الموقع الرسمي لـ KawanCosplay',
  howYouKnow: 'إليك كيف تتأكد',
  aboutKccTitle: 'مجتمع دولي رسمي (100% SFW)',
  aboutKccDesc: 'KawanCosplay مجتمع دولي إبداعي للثقافة الشعبية، مكرَّس للكوسبلاي الصحي والآمن 100% SFW (Safe For Work)، وتقدير الآيدول، والأنمي، ومفتوح للأعضاء من جميع أنحاء العالم.',
  secureSiteTitle: 'المواقع الآمنة تستخدم HTTPS ورمز القفل (🔒)',
  secureSiteDesc: 'انظر إلى شريط العنوان في متصفحك. تبدأ المواقع الرسمية دائمًا بـ https:// وتعرض رمز القفل الآمن (🔒).',
  officialContactTitle: 'خط WhatsApp الساخن الرسمي والبريد الإلكتروني',
  officialContactDesc: 'تُعالَج الاستفسارات الرسمية حصريًا عبر خط WhatsApp الساخن +62 857-1103-2782 والبريد الإلكتروني cosplaysehat@gmail.com.',
  whatsappHotline: 'خط WhatsApp الساخن الرسمي: +62 857-1103-2782',

  // Generic
  close: 'إغلاق',
  optional: '(اختياري)',
  tryAgain: 'إعادة المحاولة',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'جارٍ تحميل التطبيق...',
  loadingAdmin: 'جارٍ تحميل لوحة المشرف...',

  // Navbar & app shell
  navFormShort: 'التسجيل',
  navCardShort: 'KCC ID',
  navGalleryShort: 'المعرض',
  openMenu: 'فتح القائمة',
  closeMenu: 'إغلاق القائمة',
  chooseLanguage: 'اختر اللغة ({language})',
  siteEditorShort: 'محرر الموقع',
  themeEditor: 'محرر المظهر',
  whatsappCommunity: 'مجتمع WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'البريد الإلكتروني: cosplaysehat@gmail.com',
  userFallbackName: 'مستخدم',
  idValue: 'المعرّف: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'شعار KawanCosplay',
  officialBadge: 'رسمي',

  // PWA install
  pwaInstall: 'تثبيت التطبيق',
  pwaIosTitle: 'التثبيت على iPhone / iPad',
  pwaIosStep1: '1. اضغط على زر {share} في شريط أدوات Safari.',
  pwaIosShare: 'مشاركة',
  pwaIosStep2: '2. مرِّر للأسفل واضغط على {addToHome}.',
  pwaIosAddToHome: 'إضافة إلى الشاشة الرئيسية',

  // Admin portal shell
  backToPublicSite: 'العودة إلى الموقع العام',
  adminPortalTitle: 'بوابة مشرفي KawanCosplay',
  googleSignInBadge: 'تسجيل الدخول عبر Google',
  adminRestricted: 'للمشرفين فقط',
  lockAndExitAdminTitle: 'قفل بوابة المشرفين والخروج منها',
  lockExit: 'قفل / خروج',
  adminPortal: 'بوابة المشرفين',
  adminPortalLinkTitle: 'بوابة خاصة بمشرفي KCC فقط (تسجيل الدخول بحساب Google الخاص بالمشرف)',
  sheetsPopupClosed: 'أُغلقت نافذة تفويض Google قبل اكتمال العملية.',
  sheetsWrongAccount: 'اختر حساب Google نفسه المستخدم في حساب المشرف المسجَّل دخوله.',
  sheetsPopupBlocked: 'حظر المتصفح نافذة تسجيل الدخول إلى Google. اسمح بالنوافذ المنبثقة لهذا الموقع وحاول مرة أخرى.',
  sheetsConnectFailed:
    'تعذّر ربط Google Sheets. اختر حساب المشرف (cosplaysehat@gmail.com) واسمح بصلاحية القراءة في Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'بطاقة هوية العضو من MyKCC',
  cardPageTitle: 'بطاقة هوية العضو و KCC ID',
  cardPageDesc:
    'لحماية خصوصية جميع الأعضاء، تقتصر قائمة الأعضاء الكاملة على بوابة المشرفين. أدخل KCC ID المكوّن من 16 رقمًا (مثال: 2026 1008 0715 3001) لعرض بطاقتك الرقمية الرسمية.',
  connectedProfile: 'الملف الشخصي المرتبط',
  openPass: 'فتح البطاقة',
  lookupPlaceholder: 'KCC ID من 16 رقمًا، مثال: 2026 1008 0715 3001',
  lookupSubmit: 'البحث وعرض بطاقة هوية العضو',
  searching: 'جارٍ البحث...',
  passFound: 'تم العثور على البطاقة!',
  notRegisteredYet: 'لم تسجّل بعد؟',
  fillRegistrationForm: 'املأ استمارة التسجيل ←',
  lookupInvalidId: 'يُرجى إدخال KCC ID المكوّن من 16 رقمًا (أرقام فقط، ويُسمح بالمسافات).',
  lookupNotFound: 'لم يتم العثور على بطاقة هوية عضو لهذا KCC ID. يُرجى التحقق من الأرقام الستة عشر.',
  lookupPermissionDenied:
    'البحث عن البطاقات غير متاح حاليًا (تم رفض الوصول إلى قاعدة البيانات). يُرجى المحاولة لاحقًا أو التواصل مع أحد مشرفي KCC.',

  // Profile tab states
  profileLoadFailed: 'تعذّر تحميل ملفك الشخصي كعضو.',
  checkConnectionRetry: 'تحقّق من اتصالك بالإنترنت، ثم حاول مرة أخرى.',
  preparingProfile: 'جارٍ تجهيز ملف العضو...',
  preparingProfileDesc: 'جارٍ ربط الحساب بهويتك الرقمية في KCC.',
  pleaseSignIn: 'يُرجى تسجيل الدخول',
  clickToSignIn: 'انقر هنا لتسجيل الدخول',

  // Footer
  footerPlatform: 'منصة دولية للثقافة الشعبية 100% SFW.',
  copyright: '© 2026 MyKCC. جميع الحقوق محفوظة.',
  privacyShieldActive: 'نظام حماية الهوية والخصوصية بـ 16 رقمًا مُفعَّل',
};

export default common;
