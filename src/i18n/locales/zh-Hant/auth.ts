import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: '登入 MyKCC',
  signUpTitle: '建立新的 MyKCC 帳號',
  orContinueWith: '或使用其他方式繼續',
  emailLabel: '常用電子郵件地址',
  passwordLabel: '密碼',

  // AuthModal
  forgotPasswordTitle: '忘記密碼',
  portalSubtitle: 'MyKCC 官方社群入口網站（16 位數使用者 ID）',
  loginTab: '登入',
  signUpTab: '註冊',
  nameLabel: '名稱（Cosname / 暱稱）',
  namePlaceholder: '例如 Rian_Cos / Alya / Ken',
  nameHint: '建立帳號時可不填。您之後可以在社群表單中補上全名與 Cosname。',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: '忘記密碼？',
  passwordPlaceholder: '至少 6 個字元',
  signUpSubmit: '建立帳號並取得 16 位數 ID',
  sendResetEmail: '傳送重設郵件',
  backToLogin: '返回登入',
  continueWithGoogle: '使用 Google 繼續',
  emailRequired: '請填寫電子郵件。',
  signUpRequirements: '需要有效的電子郵件，以及至少 6 個字元的密碼。',
  resetEmailSent: '已寄出密碼重設郵件。',
  authFailed: '登入時發生問題，請再試一次。',
  googleLoginFailed: 'Google 登入已取消或發生問題。',
};

export default auth;
