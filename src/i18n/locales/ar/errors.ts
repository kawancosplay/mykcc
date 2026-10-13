import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'رفضت قاعدة البيانات الوصول (permission denied). لم يُحفظ أي شيء. تأكد من أن كل حقل ضمن الحد المسموح به من الأحرف، أو سجّل الدخول بحساب مخوَّل، ثم حاول مرة أخرى.',
  signInRequired: 'يُرجى تسجيل الدخول أولًا للمتابعة.',
  databaseUnavailable: 'تعذّر الوصول إلى قاعدة البيانات. تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.',
  saveFailed: 'حدث خطأ أثناء الحفظ. يُرجى المحاولة مرة أخرى.',

  // firestoreService.ts
  profilePhotoTooLarge: 'صورة الملف الشخصي كبيرة جدًا. يُرجى اختيار صورة أخرى.',
  nameRequired: 'الاسم مطلوب.',
  invalidCardId: 'KCC ID غير صالح لبطاقة هوية العضو: {id}',
  uniqueIdFailed: 'تعذّر إنشاء KCC ID فريد. يُرجى المحاولة مرة أخرى.',
  mergeAdminOnly: 'المشرفون فقط يمكنهم دمج سجلات الأعضاء.',
  mergeSameRecord: 'لا يمكن دمج سجل في نفسه.',
  memberRecordMissing: 'سجل العضو هذا لم يعد موجودًا (ربما تم دمجه أو حذفه).',
  mergeDifferentAccounts: 'السجلان مرتبطان بحسابَي تسجيل دخول مختلفين، لذا لا يمكن دمجهما.',
  repairAdminOnly: 'المشرفون فقط يمكنهم تشغيل الإصلاح.',
  repairIdUpdateFailed: 'فشل تحديث KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'فشلت كتابة بطاقة هوية العضو ({ids}): {detail}',
  repairCardDeleteFailed: 'فشل حذف بطاقة هوية العضو ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'يُرجى تسجيل الدخول أولًا لرفع صورة.',
  photoTooLarge: 'الصورة كبيرة جدًا. يُرجى اختيار صورة أخرى.',

  // googleAuth.ts
  googleAccessTokenMissing: 'تعذّر الحصول على رمز وصول (access token) من تسجيل الدخول عبر Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'خطأ في Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'فشل طلب Sheets API {label}: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'حساب KCC الرئيسي (0000)',
  badgeAdmin: 'مشرف KCC #{number}',
  badgeMember: 'عضو (طابع زمني)',
};

export default errors;
