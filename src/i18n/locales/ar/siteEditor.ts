import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'محرر مظهر الموقع',
  editorDesc: 'خصِّص التخطيط والألوان والخلفية والخط والشعار فوريًا.',
  resetTitle: 'إعادة التعيين إلى المظهر الافتراضي',
  resetDefault: 'استعادة الافتراضي',
  saveFailed: 'تعذّر حفظ تغييرات المظهر: {error}',
  autoSaveNotice: 'تُحفظ التغييرات في قاعدة بيانات الموقع تلقائيًا (للمشرفين فقط).',
  doneClose: 'تم وإغلاق',

  // Tabs
  tabLayout: 'التخطيط',
  tabBackground: 'الخلفية',
  tabColors: 'الألوان',
  tabFont: 'الخط والطباعة',
  tabLogo: 'الشعار والهوية',

  // Layout tab
  layoutWidthLabel: 'عرض محتوى الصفحة',
  widthNormal: 'عرض عادي (7XL - 1280px)',
  widthNormalDesc: 'حجم قياسي يناسب سطح المكتب والجوال',
  widthCompact: 'مضغوط (6XL - 1152px)',
  widthCompactDesc: 'أضيق، يركّز على المحتوى في المنتصف',
  widthFull: 'العرض الكامل',
  widthFullDesc: 'يمتد على كامل عرض الشاشة',
  navbarStyleLabel: 'نمط شريط التنقل',
  navbarGlassBar: 'شريط زجاجي كامل',
  navbarGlassBarDesc: 'يثبت في الأعلى مع تأثير ضبابي',
  navbarFloatingPill: 'كبسولة عائمة',
  navbarFloatingPillDesc: 'تطفو بأناقة في أعلى المنتصف',
  navbarMinimal: 'بسيط ونظيف',
  navbarMinimalDesc: 'بسيط وموفّر للمساحة',
  cardRadiusLabel: 'استدارة زوايا البطاقات',
  radius3xl: 'مستدير جدًا (3XL)',
  radius2xl: 'مستدير عصري (2XL)',
  radiusXl: 'قياسي (XL)',
  radiusLg: 'تقني / نحيف (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'خلفيات Fluent الجاهزة',
  bgBrightPurpleName: 'Fluent بنفسجي ساطع (افتراضي)',
  bgBrightPurpleDesc: 'هالة زجاجية مضيئة بدرجات البنفسجي على طراز Fluent مع عمق ناعم',
  bgCyberPurpleName: 'بنفسجي نيون سايبربانك',
  bgCyberPurpleDesc: 'بنفسجي كهربائي عالي التباين مع لمسات ماجنتا زاهية',
  bgCosmicDarkName: 'منتصف الليل الكوني',
  bgCosmicDarkDesc: 'كحلي الفضاء العميق والسبج مع سُدُم بنفسجية',
  bgFluentLavenderName: 'لافندر Fluent ناعم',
  bgFluentLavenderDesc: 'توهّج بنفسجي باستيلي مضيء مع زجاج مصنفر خفيف',
  bgDarkOnyxName: 'أونيكس السبج',
  bgDarkOnyxDesc: 'غرافيت أنيق فائق الدكنة مع حافة لامعة بنفسجية خفيفة',
  customGradientTitle: 'تدرّج CSS مخصص',
  customGradientDesc: 'أدخل رمز CSS الخاص بك للخلفية أو linear-gradient.',
  useCustom: 'استخدام المخصص',

  // Colors tab (theme labels)
  accentColorLabel: 'لون التمييز للمظهر',
  colorPurple: 'بنفسجي ملكي (افتراضي)',
  colorRose: 'وردي ساكورا',
  colorIndigo: 'نيلي كهربائي',
  colorEmerald: 'يشم زمردي',
  colorAmber: 'كهرماني الغروب',
  colorCyan: 'سماوي سايبر',
  customColorTitle: 'لون Hex مخصص',
  customColorDesc: 'اختر أي لون تمييز أساسي تحبه.',

  // Font tab
  fontLabel: 'خطوط الموقع والطباعة',
  fontDinNextName: 'DIN Next (الرسمي)',
  fontDinNextDesc: 'طباعة DIN هندسية عصرية — واضحة ونظيفة ومهيبة',
  fontActive: 'مُفعَّل',
  fontSample: 'أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'اسم الشعار والنص الفرعي',
  logoTitleLabel: 'العنوان الرئيسي للشعار',
  logoSubtitleLabel: 'العنوان الفرعي / العبارة التعريفية',
  logoSubtitlePlaceholder: 'بوابة أعضاء المجتمع',
  emblemLabel: 'اختر شارة مدمجة',
  emblemKitsune: 'قناع كيتسوني (KCC الرسمي)',
  emblemCrown: 'تاج ملكي',
  emblemShield: 'درع المجتمع',
  emblemHeart: 'قلب الصداقة',
  emblemSparkle: 'نجمة سحرية لامعة',
  customLogoLabel: 'أو استخدم صورة شعار مخصصة (رابط الصورة)',
  customLogoHint: 'أدخل رابطًا لشعار PNG/SVG بخلفية شفافة، أو اتركه فارغًا لاستخدام الشارة الرسمية.',
};

export default siteEditor;
