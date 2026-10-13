import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'لوحة تحكم مشرفي KawanCosplay',
  dashboardDesc: 'بوابة إدارية مقيَّدة لقائمة أعضاء المجتمع ومزامنة Google Sheets.',
  loginPrompt: 'أدخل مفتاح مرور المشرف أو سجّل الدخول باسم cosplaysehat@gmail.com',
  privacyRestrictedNotice: 'لحماية خصوصية الأعضاء، يقتصر الوصول إلى قائمة الأعضاء بشكل صارم على مشرفي KawanCosplay.',
  exportCsv: 'تصدير CSV',
  totalMembers: 'إجمالي الأعضاء المسجَّلين',
  resetFilter: 'إعادة تعيين الفلاتر',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'جارٍ التحقق من صلاحية المشرف...',
  signedInNotAdmin: 'تم تسجيل الدخول باسم {account} — هذا الحساب ليس مشرفًا في KCC.',
  emailNotVerified: 'البريد الإلكتروني غير موثَّق — استخدم تسجيل الدخول عبر Google.',
  signInWithAdminGoogleEmail: 'سجّل الدخول بحساب Google الخاص بالمشرف ({email})',
  signOutThisAccount: 'تسجيل الخروج',
  whatsappAdminHelp: 'مساعدة المشرفين عبر WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'بوابة إدارة KawanCosplay',
  verifiedAccessBadge: 'وصول موثَّق',
  dashboardPrivacyNote: 'خصوصية الأعضاء محمية بشكل صارم: لا يرى الأسماء وبيانات التواصل إلا المشرفون المسجَّلون.',
  whatsappHotlineShort: 'خط WA الساخن: {phone}',
  signOutAdmin: 'تسجيل الخروج من حساب المشرف',
  statusStat: 'الحالة: {status}',
  statusVerified: 'موثَّق',
  statusActive: 'نشط',
  statusPending: 'قيد الانتظار',
  tabMembers: 'قائمة الأعضاء ({count})',
  tabSync: 'مزامنة Google Sheets و Form',
  tabStats: 'إحصاءات المجتمع',

  // Member list states
  permissionDeniedTitle: 'تم رفض الوصول',
  permissionDeniedDesc:
    'رفضت قاعدة البيانات وصول هذا الحساب إلى قائمة الأعضاء. سجّل الدخول بحساب Google الخاص بالمشرف ({email}) أو بحساب مُدرج في مجموعة admins، ثم أعد تحميل الصفحة. وتأكد أيضًا من نشر أحدث قواعد Firestore (Firestore Rules) في قاعدة البيانات {database}.',
  signInWithAdminGoogle: 'سجّل الدخول بحساب Google الخاص بالمشرف',
  reloadPage: 'إعادة تحميل الصفحة',
  loadMembersFailedTitle: 'تعذّر تحميل قائمة الأعضاء',
  loadMembersFailedDesc: 'تعذّر تحميل قائمة الأعضاء. تحقّق من اتصالك، ثم أعد تحميل الصفحة.',
  loadingMembers: 'جارٍ تحميل بيانات الأعضاء...',

  // Member status & delete
  statusUpdateFailed: 'تعذّر تحديث حالة العضو: {error}',
  deleteMemberConfirm: 'هل تريد حذف العضو «{name}» (KCC ID: {id}) من قاعدة بيانات Firestore؟',
  deleteMemberFailed: 'تعذّر حذف العضو: {error}',

  // KCC ID & public card repair
  repairTitle: 'إصلاح KCC ID والبطاقات العامة',
  repairDesc:
    'يمنح KCC ID فريدًا للأعضاء الذين لديهم معرّف مكرر (يحتفظ التسجيل الأقدم بالمعرّف القديم)، ويحفظ أرقام KCC ID غير المحفوظة بعد، ويعيد بناء مجموعة memberCards العامة المستخدمة في البحث عن البطاقات. التشغيل المتكرر آمن.',
  repairDuplicatesDetected: 'تم اكتشاف أعضاء لديهم KCC ID مكرر (العدد: {count}) — اضغط على «{action}».',
  allIdsUnique: 'جميع أرقام KCC ID فريدة.',
  runRepair: 'تشغيل الإصلاح',
  repairRunning: 'جارٍ الإصلاح...',
  repairRunningProgress: 'جارٍ الإصلاح ({done}/{total})...',
  repairConfirm:
    'هل تريد تشغيل إصلاح KCC ID والبطاقات العامة لجميع الأعضاء؟\n\n- يحصل الأعضاء الذين لديهم KCC ID مكرر على معرّف جديد (يحتفظ التسجيل الأقدم بالمعرّف القديم).\n- ستُحفظ أرقام KCC ID غير المحفوظة بعد.\n- يُعاد بناء مجموعة memberCards العامة.\n\nالتشغيل المتكرر آمن. هل تريد المتابعة؟',
  repairFailed: 'فشل الإصلاح: {error}',
  repairDone: 'اكتمل الإصلاح.',
  repairStatScanned: 'الأعضاء الذين تم فحصهم',
  repairStatDuplicateGroups: 'مجموعات المعرّفات المكررة',
  repairStatCardsWritten: 'البطاقات المكتوبة',
  repairStatCardsDeleted: 'البطاقات المحذوفة',
  reassignedListTitle: 'أرقام KCC ID التي تم تغييرها / حفظها ({count}):',
  repairReasonDuplicate: 'معرّف مكرر',
  repairReasonMissing: 'معرّف غير محفوظ بعد',
  repairReasonMainAccount: 'معرّف الحساب الرئيسي يستخدمه عضو آخر',
  noIdsChanged: 'لم يلزم تغيير أي KCC ID.',
  issuesCount: 'الأخطاء ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'أرقام KCC ID المحجوزة للمشرفين / الحساب الرئيسي ({range})',
  reservedIdsDesc:
    'المعرّفات في هذا النطاق مخصصة فقط لحساب KCC الرئيسي والمشرفين. حصل الأعضاء أدناه على أحدها بناءً على الدور/البريد الإلكتروني الذي أدخلوه في الاستمارة العامة (النظام القديم). اضغط على «{action}» لمنحهم KCC ID فريدًا مرتَّبًا زمنيًا.',
  noReservedHolders: 'لا يحمل أي عضو KCC ID مخصصًا للمشرفين فقط.',
  reservedHolderMeta: 'المصدر: {source} • الدور: {role}',
  processing: 'جارٍ المعالجة...',
  assignNewId: 'تعيين معرّف جديد',
  reassignConfirm: 'هل تريد تعيين KCC ID جديد لـ «{name}» (المعرّف الحالي {id})؟',
  reassignMainAccountWarning:
    'تحذير: هذا هو معرّف الحساب الرئيسي. لا تتابع إذا كان هذا العضو هو الحساب الرسمي {email}.',
  resultSuccess: 'نجاح: {message}',
  resultFailed: 'فشل: {message}',

  // Duplicate registrations
  duplicatesTitle: 'التسجيلات المكررة (الشخص نفسه)',
  duplicatesDesc:
    'أعضاء ملؤوا الاستمارة أكثر من مرة (رقم WhatsApp أو Discord أو بريد إلكتروني أو حساب تواصل اجتماعي مطابق). يحتفظ «الدمج» بأحدث البيانات وبكل أرقام WhatsApp في التسجيل الأقدم (يبقى KCC ID الخاص به كما هو)، ثم يحذف النسخة المكررة مع بطاقتها. راجِع البيانات قبل الدمج.',
  scanDuplicates: 'البحث عن التسجيلات المكررة',
  mergeConfirm:
    'هل تريد دمج «{duplicate}» ({duplicateId}) في «{keeper}» ({keeperId})؟\n\nتُنسخ أحدث البيانات وأرقام WhatsApp إلى التسجيل الأقدم، ثم تُحذف النسخة المكررة نهائيًا. هل تريد المتابعة؟',
  mergeSuccess: 'تم دمج «{duplicate}» في «{keeper}» — يبقى KCC ID {id} كما هو.',
  bulkMergeIdenticalConfirm:
    'هل تريد دمج مجموعات التكرار المتطابقة تمامًا (عدد المجموعات: {groups}، عدد السجلات المكررة: {records})؟\n\nتشمل فقط المجموعات التي لها اسم الكوسبلاي نفسه ورقم WhatsApp الأساسي نفسه، وأُنشئت بفارق {seconds} ثانية على الأكثر (نسخ مطابقة / استيراد مزدوج).\nتنتقل أحدث البيانات وكل أرقام WhatsApp إلى التسجيل الأقدم (يبقى KCC ID الخاص به كما هو)، ثم تُحذف النسخ المكررة نهائيًا. هل تريد المتابعة؟',
  bulkMergeAllConfirm:
    'هل تريد دمج جميع المجموعات التي تم فحصها دون استثناء (عدد المجموعات: {groups}، عدد السجلات المكررة: {records})؟\n\nيشمل ذلك مجموعات لا يجمعها سوى تطابق رقم WhatsApp أو Discord أو البريد الإلكتروني أو حساب التواصل الاجتماعي أو الاسم — تأكد من أنك راجعت القائمة أدناه.\nتنتقل أحدث البيانات وكل أرقام WhatsApp إلى التسجيل الأقدم (يبقى KCC ID الخاص به كما هو)، ثم تُحذف النسخ المكررة نهائيًا. لا يمكن التراجع عن هذا الإجراء. هل تريد المتابعة؟',
  bulkMergeDone: 'اكتمل الدمج الجماعي ({mode}).',
  bulkModeIdentical: 'المجموعات المتطابقة',
  bulkModeAll: 'جميع نتائج الفحص',
  bulkStatGroups: 'المجموعات المعالَجة',
  bulkStatMergedGroups: 'المجموعات المدمجة',
  bulkStatMergedRecords: 'النسخ المكررة المدمجة',
  bulkStatFailedGroups: 'المجموعات الفاشلة',
  bulkMoreErrors: '…و{count} أخرى (راجِع وحدة تحكم المتصفح).',
  scanSummary:
    'تم العثور على مجموعات تكرار (العدد: {groups}، السجلات المكررة: {records})، منها {identical} مجموعة متطابقة (اسم الكوسبلاي نفسه ورقم WhatsApp الأساسي نفسه، وأُنشئت بفارق {seconds} ثانية على الأكثر).',
  mergeAllIdentical: 'دمج كل المتطابقة ({count})',
  mergeAllScanned: 'دمج كل نتائج الفحص ({count})',
  bulkMergeProgress: 'جارٍ دمج المجموعات {done}/{total}…',
  noDuplicatesFound: 'لم يتم اكتشاف تسجيلات مكررة.',
  keeperBadge: 'محفوظ (يبقى KCC ID)',
  merging: 'جارٍ الدمج...',
  mergeInto: 'دمج في {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'بحث...',
  filterAllRoles: 'جميع الأدوار ({count})',
  filterAllCities: 'جميع المواقع',
  filterAllAges: 'جميع الأعمار',
  filterLegalAge: 'بالغ (18+)',
  filterMinor: 'قاصر (أقل من 18)',
  filterPreferNotToSay: 'غير محدد',
  sortNewest: '🕒 الوقت: الأحدث',
  sortNameAsc: '🔤 الاسم: أ ← ي',
  purgeButtonTitle: 'مسح جميع بيانات الأعضاء في Firestore',
  purgeButton: 'مسح بيانات الأعضاء',
  purging: 'جارٍ المسح...',
  purgePrompt:
    'تحذير شديد: سيؤدي هذا إلى حذف جميع بيانات الأعضاء نهائيًا من قاعدة بيانات Firestore.\n\nاكتب «{keyword}» (بالأحرف اللاتينية الكبيرة تمامًا كما هي) لتأكيد مسح قاعدة البيانات:',
  purgeCancelled: 'تم إلغاء التأكيد (الكلمة المفتاحية غير مطابقة).',
  purgeSuccess: 'اكتمل المسح: تم حذف {count} من سجلات الأعضاء من قاعدة البيانات.',
  purgeFailed: 'تعذّر حذف بيانات الأعضاء: {error}',
  exportNoData: 'لا توجد بيانات للتصدير.',
  showingMembers: 'الأعضاء المعروضون: {shown} من أصل {total}',

  // CSV export column headers
  csvKccId: 'KCC ID (16 رقمًا)',
  csvCosname: 'اسم الكوسبلاي / الاسم المستعار',
  csvLegalName: 'الاسم القانوني',
  csvPrimaryWhatsapp: 'رقم WhatsApp الأساسي',
  csvBackupWhatsapp: 'رقم WhatsApp الاحتياطي',
  csvDiscord: 'اسم المستخدم في Discord',
  csvEmail: 'البريد الإلكتروني',
  csvAgeCategory: 'الفئة العمرية',
  csvAge: 'العمر / تاريخ الميلاد',
  csvCountry: 'البلد',
  csvProvince: 'المحافظة',
  csvCity: 'المدينة',
  csvPrimaryRole: 'الدور الرئيسي',
  csvFandom: 'الفاندوم',
  csvExperience: 'الخبرة',
  csvStatus: 'الحالة',
  csvRegisteredAt: 'تاريخ التسجيل',

  // Members table
  colMember: 'العضو / اسم الكوسبلاي',
  colKccId: 'KCC ID (16 رقمًا)',
  colContact: 'WhatsApp والتواصل',
  colDiscord: 'اسم المستخدم في Discord',
  colRole: 'الدور والاهتمامات',
  colAge: 'العمر',
  colLocation: 'الموقع',
  colStatus: 'الحالة',
  colRegistered: 'تاريخ التسجيل',
  colActions: 'الإجراءات',
  sortAz: '▲ أ-ي',
  sortZa: '▼ ي-أ',
  sortIdAsc: '▲ المعرّف',
  sortAgeYoungest: '▲ الأصغر',
  sortAgeOldest: '▼ الأكبر',
  sortStatusAsc: '▲ موثَّق',
  sortStatusDesc: '▼ قيد الانتظار',
  sortTimeNewest: '▼ الأحدث',
  sortTimeOldest: '▲ الأقدم',
  legalNameValue: 'الاسم القانوني: {name}',
  mainAccountBadge: 'حساب KCC الرئيسي',
  adminIdBadge: 'مشرف KCC #{number}',
  timestampIdBadge: 'معرّف زمني',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'عرض KCC ID',
  deleteMemberTitle: 'حذف العضو',
  emptyDatabaseTitle: 'قاعدة بيانات الأعضاء فارغة',
  emptyDatabaseDesc:
    'لا توجد بيانات أعضاء في قاعدة البيانات بعد. استورد البيانات من جدول بيانات Google Form أو انتظر تسجيلات جديدة.',
  noResultsTitle: 'لا توجد نتائج',
  noResultsDesc: 'لا توجد بيانات أعضاء تطابق كلمة البحث أو الفلاتر المحددة.',
  openSheetsSync: 'فتح مزامنة Google Sheets و Form',
};

export default admin;
