import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'Masuk ke Akun MyKCC',
  signUpTitle: 'Buat Akun Member Baru MyKCC',
  orContinueWith: 'Atau masuk dengan akun lain',
  emailLabel: 'Alamat Email Aktif',
  passwordLabel: 'Kata Sandi (Password)',

  // AuthModal
  forgotPasswordTitle: 'Lupa Kata Sandi',
  portalSubtitle: 'Portal Komunitas Resmi MyKCC (16-Digit User ID)',
  loginTab: 'Masuk',
  signUpTab: 'Daftar',
  nameLabel: 'Nama (Name / Cosname / Alias)',
  namePlaceholder: 'Contoh: Rian_Cos / Alya / Ken',
  nameHint: 'Opsional saat buat akun. Nama lengkap & cosname dapat diisi saat mengisi formulir komunitas.',
  emailPlaceholder: 'nama@gmail.com',
  forgotPasswordLink: 'Lupa kata sandi?',
  passwordPlaceholder: 'Minimal 6 karakter',
  signUpSubmit: 'Buat Akun & Dapatkan 16-Digit ID',
  sendResetEmail: 'Kirim Email Reset',
  backToLogin: 'Kembali ke Login',
  continueWithGoogle: 'Lanjutkan dengan Google',
  emailRequired: 'Email diperlukan.',
  signUpRequirements: 'Email valid dan kata sandi minimal 6 karakter diperlukan.',
  resetEmailSent: 'Email untuk reset kata sandi telah dikirim.',
  authFailed: 'Terjadi kendala autentikasi.',
  googleLoginFailed: 'Login dengan Google dibatalkan atau terkendala.',
};

export default auth;
