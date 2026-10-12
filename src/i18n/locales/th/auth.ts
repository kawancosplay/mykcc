import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'เข้าสู่ระบบ MyKCC',
  signUpTitle: 'สร้างบัญชี MyKCC ใหม่',
  orContinueWith: 'หรือดำเนินการต่อด้วยช่องทางอื่น',
  emailLabel: 'ที่อยู่อีเมลที่ใช้งานได้',
  passwordLabel: 'รหัสผ่าน',

  // AuthModal
  forgotPasswordTitle: 'ลืมรหัสผ่าน',
  portalSubtitle: 'พอร์ทัลชุมชน MyKCC อย่างเป็นทางการ (รหัสผู้ใช้ 16 หลัก)',
  loginTab: 'เข้าสู่ระบบ',
  signUpTab: 'สมัครสมาชิก',
  nameLabel: 'ชื่อ (Cosname / นามแฝง)',
  namePlaceholder: 'เช่น Rian_Cos / Alya / Ken',
  nameHint: 'ไม่บังคับตอนสร้างบัญชี คุณสามารถเพิ่มชื่อจริงและ cosname ได้ภายหลังในแบบฟอร์มชุมชน',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: 'ลืมรหัสผ่าน?',
  passwordPlaceholder: 'อย่างน้อย 6 ตัวอักษร',
  signUpSubmit: 'สร้างบัญชีและรับ ID 16 หลัก',
  sendResetEmail: 'ส่งอีเมลรีเซ็ตรหัสผ่าน',
  backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
  continueWithGoogle: 'ดำเนินการต่อด้วย Google',
  emailRequired: 'ต้องระบุอีเมล',
  signUpRequirements: 'ต้องใช้อีเมลที่ถูกต้องและรหัสผ่านอย่างน้อย 6 ตัวอักษร',
  resetEmailSent: 'ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว',
  authFailed: 'เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ โปรดลองอีกครั้ง',
  googleLoginFailed: 'การเข้าสู่ระบบด้วย Google ถูกยกเลิกหรือเกิดปัญหา',
};

export default auth;
