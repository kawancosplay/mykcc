import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'Log Masuk ke MyKCC',
  signUpTitle: 'Cipta Akaun MyKCC Baharu',
  orContinueWith: 'Atau log masuk dengan kaedah lain',
  emailLabel: 'Alamat Emel Aktif',
  passwordLabel: 'Kata Laluan',

  // AuthModal
  forgotPasswordTitle: 'Lupa Kata Laluan',
  portalSubtitle: 'Portal Komuniti Rasmi MyKCC (User ID 16 Digit)',
  loginTab: 'Log Masuk',
  signUpTab: 'Daftar',
  nameLabel: 'Nama (Cosname / Nama Samaran)',
  namePlaceholder: 'cth. Rian_Cos / Alya / Ken',
  nameHint: 'Pilihan semasa mencipta akaun. Anda boleh menambah nama penuh & cosname kemudian dalam borang komuniti.',
  emailPlaceholder: 'nama@gmail.com',
  forgotPasswordLink: 'Lupa kata laluan?',
  passwordPlaceholder: 'Sekurang-kurangnya 6 aksara',
  signUpSubmit: 'Cipta Akaun & Dapatkan ID 16 Digit',
  sendResetEmail: 'Hantar Emel Set Semula',
  backToLogin: 'Kembali ke Log Masuk',
  continueWithGoogle: 'Teruskan dengan Google',
  emailRequired: 'Emel diperlukan.',
  signUpRequirements: 'Emel yang sah dan kata laluan sekurang-kurangnya 6 aksara diperlukan.',
  resetEmailSent: 'Emel untuk menetapkan semula kata laluan telah dihantar.',
  authFailed: 'Berlaku masalah semasa log masuk. Sila cuba lagi.',
  googleLoginFailed: 'Log masuk Google telah dibatalkan atau menghadapi masalah.',
};

export default auth;
