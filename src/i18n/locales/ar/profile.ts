import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'ملفي الشخصي كعضو',
  updateProfile: 'تحديث بيانات الملف الشخصي فوريًا',

  // Hero
  changeAvatar: 'تغيير صورة الملف الشخصي',
  verifiedActive: 'موثَّق ونشط',
  kccIdLabel: 'KCC ID (16 رقمًا)',
  copyKccId: 'نسخ KCC ID',
  viewIdCard: 'عرض بطاقة هوية العضو',

  // Profile form
  infoTitle: 'معلومات ملف العضو',
  infoDesc: 'يمكنك تغيير هذه المعلومات في أي وقت؛ إذ تُحفظ فوريًا في قاعدة بيانات MyKCC.',
  savedRealtime: 'تم الحفظ فوريًا!',
  ageCategoryLabel: 'الفئة العمرية',
  ageLabel: 'العمر / تاريخ الميلاد (اختياري)',
  agePlaceholder: 'مثال: 21 سنة أو 15 مايو',
  whatsappLabel: 'رقم WhatsApp النشط',
  backupPhoneLabel: 'رقم WhatsApp الثاني / الاحتياطي',
  backupPhonePlaceholder: 'مثال: 0812... أو +62 857...',
  discordPlaceholder: 'مثال: alyachan_cos أو user#0001',
  roleLabel: 'الدور الرئيسي في المجتمع',
  customRolePlaceholder: 'اكتب دورك / تخصصك الآخر...',
  socialMediaPlaceholder: '@اسم_المستخدم (Instagram / X / TikTok)',
  reasonLabel: 'سبب الانضمام وملاحظات الملف الشخصي',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'محب الآيدول / Wota',
  roleOtaku: 'أوتاكو الأنمي والمانغا والألعاب',
  roleGeneralEnthusiast: 'متحمّس عام / داعم',
  rolePropMaker: 'صانع دعائم / حرفي',
  roleCostumeMaker: 'صانع أزياء / خيّاط',
  roleEventCrew: 'طاقم وفريق الفعاليات',
};

export default profile;
