import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'بيئة اختبار الاستمارة التجريبية (Sandbox)',
  sandboxBadge: 'وضع الاختبار المعزول',
  description:
    'تعبئة تلقائية بنقرة واحدة لبيانات جاهزة لاختبار إنشاء KCC ID (UID حسب الطابع الزمني، UID المشرفين 0001-0100، الحساب الرئيسي 0000).',
  randomizeTitle: 'إنشاء شخصية عشوائية',
  randomize: 'عشوائي',

  // KCC ID allocation rules
  rulesTitle: 'قواعد معرّفات المستخدمين في KawanCosplay:',
  ruleMainAccount: 'حساب KCC الرئيسي',
  ruleAdminRange: 'نطاق مشرفي KCC',
  ruleTimestamp: 'UID للأعضاء مرتَّب حسب الطابع الزمني',

  // Preset cards
  previewName: 'الاسم:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'تعبئة الاستمارة',
  submitTest: 'إرسال تجريبي',
  tip: 'تلميح: انقر على «{action}» لمحاكاة الإرسال فورًا وعرض بطاقة هوية العضو مع KCC ID المُنشأ وفتح رابط WhatsApp.',
  presetLoaded: 'تم تحميل البيانات الجاهزة',

  // Presets
  presetCosplayerName: 'كوسبلاير تجريبي (UID حسب الطابع الزمني)',
  presetCosplayerBadge: 'UID زمني',
  presetCosplayerDesc: 'UID من 16 رقمًا مرتَّب حسب الطابع الزمني للإرسال (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'مشرف KCC تجريبي (UID 0001-0100)',
  presetAdminBadge: 'نطاق UID المشرفين',
  presetAdminDesc: 'UID من 0000 0000 0000 0001 إلى 0000 0000 0000 0100 لمشرفي KCC',
  presetMainAccountName: 'حساب KCC الرئيسي التجريبي (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 مخصص حصريًا للحساب الرئيسي cosplaysehat@gmail.com',
  presetPropMakerName: 'صانع دعائم / حرفي تجريبي',
  presetPropMakerBadge: 'حرفي (زمني)',
  presetPropMakerDesc: 'حرفي دعائم ودروع مع UID قائم على الطابع الزمني',
  presetPhotographerName: 'مصوّر كوسبلاي تجريبي',
  presetPhotographerBadge: 'مصوّر',
  presetPhotographerDesc: 'مصوّر فوتوغرافي ومصوّر فيديو مع UID قائم على الطابع الزمني',
  presetOthersName: 'تجريبي: أخرى / دور مخصص',
  presetOthersBadge: 'دور «أخرى»',
  presetOthersDesc: 'دور مخصص «أخرى» متخصص في مكياج الكوسبلاي وتصفيف الشعر المستعار',
  presetDuplicateName: 'اختبار KCC ID الواحد (تطابق: {name})',
  presetDuplicateBadge: 'فحص KCC ID الواحد',
  presetDuplicateDesc: 'يتحقق من أن رقم WhatsApp المطابق يحتفظ بـ KCC ID: {id}',
  presetSecondaryPhoneName: 'اختبار الرقم الثانوي (رقمان: {name})',
  presetSecondaryPhoneBadge: 'فحص رقمَي WA',
  presetSecondaryPhoneDesc: 'يضيف رقمًا ثانويًا ويحتفظ بـ KCC ID: {id}',
};

export default demo;
