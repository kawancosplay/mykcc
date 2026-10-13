import type { LocaleNamespace } from '../../types';

// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'جسر فوري بين Google Sheets و Google Form',
  bridgeSubtitle: 'الانتقال من Google Form إلى Firebase',
  pageTitle: 'مزامنة قاعدة البيانات مع جدول البيانات و Google Form',
  pageDesc:
    'استورد جدول البيانات الحالي الخاص بالأعضاء الحاليين وفعِّل المزامنة الفورية، حتى يُضاف كل عضو جديد يملأ Google Form خلال الفترة الانتقالية إلى Firebase تلقائيًا.',
  connectSheets: 'ربط Google Sheets',
  renewAccess: 'تجديد الوصول إلى Google Sheets',
  connectionRequiredTitle: 'يلزم الاتصال بـ Google Sheets',
  connectionRequiredDesc:
    'لقراءة جدول بيانات Google Form مباشرةً، امنح MyKCC صلاحية القراءة في Google Sheets لحساب Google الخاص بالمشرف المسجَّل دخوله. يجب أن يكون لهذا الحساب وصول إلى جدول بيانات التسجيل الخاص بـ KawanCosplay.',
  accessRequestNotice:
    'يُطلب الوصول للحساب المسجَّل دخوله. لا يطلب MyKCC سوى صلاحية القراءة في Google Sheets، دون أي وصول إلى Google Drive.',
  accessRequestNoticeWithEmail:
    'يُطلب الوصول للحساب المسجَّل دخوله ({email}). لا يطلب MyKCC سوى صلاحية القراءة في Google Sheets، دون أي وصول إلى Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'جدول بيانات Google Form',
  step1Desc: 'الصق رابط (URL) أو معرّف (ID) جدول بيانات ردود Google Form.',
  spreadsheetInputLabel: 'رابط / معرّف جدول بيانات Google (URL / ID)',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit أو المعرّف',
  inspectButton: 'فحص',
  formatHint: 'التنسيق: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'لم يتم التعرّف على الرابط / المعرّف بعد.',
  sheetTabLabel: 'اختر علامة تبويب الورقة',

  // Step 2: column mapping
  step2Title: 'ربط أعمدة الردود',
  step2Desc: 'تم اكتشاف {count} من الأعمدة في Google Form الخاص بك',
  autoDetectedBadge: 'اكتُشف تلقائيًا',
  columnFullName: 'عمود الاسم الكامل',
  columnCosname: 'عمود اسم الكوسبلاي / الاسم المستعار',
  columnEmail: 'عمود البريد الإلكتروني',
  columnWhatsapp: 'عمود رقم WhatsApp / الهاتف',
  columnWhatsapp2: 'عمود رقم WhatsApp الاحتياطي / رقم WA الثاني',
  optionalTag: '(اختياري)',
  columnDiscord: 'عمود اسم المستخدم في Discord',
  columnCity: 'عمود المدينة / مكان الإقامة',
  columnRole: 'عمود الدور / الاهتمام (كوسبلاير/حرفي/إلخ)',
  columnFandom: 'عمود الفاندوم / الشخصية المفضلة',
  columnTimestamp: 'عمود الطابع الزمني للرد',
  optionChooseColumn: '-- اختر العمود --',
  optionNone: '-- لا شيء / فارغ --',
  optionDefaultIndonesia: '-- الافتراضي (إندونيسيا) --',
  optionDefaultCosplayer: '-- الافتراضي (كوسبلاير) --',
  optionDefaultAnimeGames: '-- الافتراضي (أنمي وألعاب) --',
  optionCurrentTime: '-- الوقت الحالي --',
  previewTitle: 'معاينة بيانات جدول البيانات (الاسم و WhatsApp واسم المستخدم في Discord):',
  previewColName: 'الاسم / اسم الكوسبلاي',
  previewColDiscord: 'اسم المستخدم في Discord',
  previewColCity: 'المدينة',
  previewPhone2: 'الرقم الثاني: {phone}',

  // Import
  importing: 'جارٍ الاستيراد إلى Firestore ({completed}/{total})...',
  importAllButton: 'استيراد جميع ردود جدول البيانات (بما فيها Discord و WA) إلى Firebase',
  importResult:
    'اكتمل الاستيراد: <strong>أعضاء جدد: {added}</strong>، تم تحديث {updated}، دون تغيير {unchanged}، فشل {skipped}.',
  errorTip: 'تلميح: يمكنك أيضًا لصق رابط جدول بيانات Google Form في حقل الإدخال أعلاه والنقر على «فحص».',
  grantAccessButton: 'منح الوصول / ربط Google',

  // Real-time poller
  pollerTitle: 'الفحص الدوري الفوري للفترة الانتقالية',
  pollerActive: 'نشط (مباشر)',
  pollerInactive: 'غير نشط',
  pollerDesc:
    'أثناء تفعيل هذه الميزة، يفحص التطبيق جدول البيانات كل {seconds} ثانية. يُضاف كل رد جديد على Google Form إلى Firebase تلقائيًا ويحصل على KCC ID الخاص به فورًا.',
  pollIntervalLabel: 'فاصل الفحص:',
  pollEverySeconds: 'كل {seconds} ثانية',
  pollEverySecondsOptimal: 'كل {seconds} ثانية (الأمثل)',
  lastPollLabel: 'آخر فحص:',
  lastPollNever: 'لم يُشغَّل بعد',
  stopPoller: 'إيقاف الفحص المباشر',
  startAutoSync: 'بدء المزامنة التلقائية الفورية',

  // Google Apps Script webhook
  webhookTitle: 'Webhook عبر Google Apps Script',
  webhookDesc:
    'هل تريد أن تصل ردود Google Form فور الضغط على زر <em>إرسال</em> (Submit)، دون انتظار فاصل الفحص الدوري؟ ثبِّت هذا السكربت في جدول بيانات الردود في Google Sheets:',
  scriptCommentInstall: 'التثبيت في: جدول بيانات الردود في Google Sheets -> الإضافات (Extensions) -> Apps Script',
  scriptCommentTrigger: 'المشغّل (Trigger): onFormSubmit -> عند إرسال النموذج (On form submit)',
  scriptCommentResponseData: 'قراءة بيانات رد النموذج',
  copied: 'تم النسخ!',
  copyScript: 'نسخ السكربت',
  installStepsTitle: 'إعداد سريع (دقيقة واحدة):',
  installStep1: '1. افتح جدول بيانات الردود في Google Sheets > قائمة <strong>الإضافات</strong> (Extensions) > <strong>Apps Script</strong>.',
  installStep2: '2. الصق الرمز أعلاه > احفظ.',
  installStep3:
    '3. من القائمة الجانبية انقر على <strong>المشغّلات</strong> (Triggers) > إضافة مشغّل (Add Trigger) > اختيار نوع الحدث (Select event type): <em>عند إرسال النموذج</em> (On form submit).',

  // Sync history
  recentSyncTitle: 'سجل المزامنة الأخير',
  logCount: 'السجلات: {count}',
  logsPermissionDenied: 'تم رفض الوصول إلى سجلات المزامنة. سجّل الدخول بحساب Google الخاص بالمشرف.',
  logsLoadFailed: 'تعذّر تحميل سجل المزامنة. تحقّق من اتصالك، ثم أعد تحميل الصفحة.',
  logsEmpty: 'لم يُسجَّل أي نشاط مزامنة بعد.',
  logImportedRows: 'تم استيراد {count} من الصفوف',
  logImportSummary:
    'اكتمل الاستيراد: أعضاء جدد: {added}، تم تحديث {updated}، دون تغيير {unchanged}، فشل {skipped}.',
  logAutoSummary: 'تلقائي: جديد {added}، تم تحديث {updated}.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'أداة الاستيراد من Google Sheets',

  // Errors
  adminAccountFallback: 'حساب المشرف',
  errorUnauthorized:
    'انتهت صلاحية إذن Google Sheets أو لم يعد صالحًا. انقر على «ربط Google Sheets» لتجديده، ثم حاول مرة أخرى.',
  errorScope:
    'لم تُمنح صلاحية القراءة في Google Sheets. انقر على «ربط Google Sheets» وحدِّد خانة الإذن لعرض جداول بياناتك في Google Sheets.',
  errorNoAccess:
    'حساب Google المسجَّل دخوله ({account}) ليس لديه وصول إلى جدول البيانات هذا، أو أن معرّف جدول البيانات خاطئ. شارك جدول البيانات مع حساب المشرف هذا (يكفي دور «عارض» (Viewer))، أو تحقّق من الرابط/المعرّف.',
  errorUnsupportedFile:
    'هذا الملف ليس ملف Google Sheets أصليًا (مثل ملف Excel .xlsx تم رفعه). افتحه واختر ملف > حفظ كجداول بيانات Google (File > Save as Google Sheets)، ثم استخدم رابط الملف الجديد.',
  errorRateLimit: 'تم بلوغ الحد الأقصى لطلبات Google Sheets API. انتظر دقيقة تقريبًا، ثم حاول مرة أخرى.',
  errorNetwork: 'تعذّر الوصول إلى Google Sheets. تحقّق من اتصالك بالإنترنت، ثم حاول مرة أخرى.',
  errorRejected: 'رفض Google Sheets الطلب: {detail}',
  errorInvalidInput:
    'رابط أو معرّف جدول البيانات غير صالح. الصق رابط Google Sheets الكامل (https://docs.google.com/spreadsheets/d/…/edit) أو المعرّف فقط.',
  errorEmptyInput: 'أدخل رابط Google Sheets أو معرّفه أولًا.',
  errorNotConnected: 'لم يُمنح الوصول إلى Google Sheets بعد. انقر على «ربط Google Sheets» أولًا.',
  errorEmptySheet: 'جدول البيانات هذا فارغ أو لا يحتوي على ردود بعد.',
  errorReadFailed: 'تعذّرت قراءة جدول البيانات.',
  errorInspectFirst: 'اربط Google Sheets وافحص جدول بيانات أولًا (الخطوة 1).',
  errorNoRows: 'لا توجد صفوف ردود لاستيرادها.',
  errorNoValidRows: 'لم يُعثر على صفوف صالحة باستخدام ربط الأعمدة هذا.',
  errorCheckFirst: 'افحص جدول بيانات أولًا في الخطوة 1.',
};

export default sheets;
