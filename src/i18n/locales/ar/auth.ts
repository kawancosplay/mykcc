import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'تسجيل الدخول إلى MyKCC',
  signUpTitle: 'إنشاء حساب MyKCC جديد',
  orContinueWith: 'أو تابع باستخدام مزوّدين آخرين',
  emailLabel: 'البريد الإلكتروني النشط',
  passwordLabel: 'كلمة المرور',

  // AuthModal
  forgotPasswordTitle: 'نسيت كلمة المرور',
  portalSubtitle: 'بوابة مجتمع MyKCC الرسمية (KCC ID من 16 رقمًا)',
  loginTab: 'تسجيل الدخول',
  signUpTab: 'إنشاء حساب',
  nameLabel: 'الاسم (اسم الكوسبلاي / اسم مستعار)',
  namePlaceholder: 'مثال: Rian_Cos / Alya / Ken',
  nameHint: 'اختياري عند إنشاء الحساب. يمكنك إضافة اسمك الكامل واسم الكوسبلاي لاحقًا في استمارة التسجيل الخاصة بالمجتمع.',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: 'نسيت كلمة المرور؟',
  passwordPlaceholder: '6 أحرف على الأقل',
  signUpSubmit: 'إنشاء حساب والحصول على KCC ID من 16 رقمًا',
  sendResetEmail: 'إرسال رسالة إعادة التعيين',
  backToLogin: 'العودة إلى تسجيل الدخول',
  continueWithGoogle: 'المتابعة باستخدام Google',
  emailRequired: 'البريد الإلكتروني مطلوب.',
  signUpRequirements: 'يلزم إدخال بريد إلكتروني صالح وكلمة مرور من 6 أحرف على الأقل.',
  resetEmailSent: 'تم إرسال رسالة لإعادة تعيين كلمة المرور.',
  authFailed: 'حدث خطأ أثناء تسجيل الدخول. يُرجى المحاولة مرة أخرى.',
  googleLoginFailed: 'أُلغي تسجيل الدخول عبر Google أو واجه مشكلة.',
};

export default auth;
