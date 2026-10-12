import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'Mag-log in sa MyKCC',
  signUpTitle: 'Gumawa ng Bagong MyKCC Account',
  orContinueWith: 'O magpatuloy gamit ang ibang serbisyo',
  emailLabel: 'Aktibong Email Address',
  passwordLabel: 'Password',

  // AuthModal
  forgotPasswordTitle: 'Nakalimutan ang Password',
  portalSubtitle: 'Opisyal na Community Portal ng MyKCC (16-Digit na User ID)',
  loginTab: 'Mag-log in',
  signUpTab: 'Mag-sign up',
  nameLabel: 'Pangalan (Cosname / Alyas)',
  namePlaceholder: 'hal. Rian_Cos / Alya / Ken',
  nameHint: 'Opsyonal kapag gumagawa ng account. Maaari mong idagdag ang buong pangalan at cosname mo mamaya sa community form.',
  emailPlaceholder: 'pangalan@gmail.com',
  forgotPasswordLink: 'Nakalimutan ang password?',
  passwordPlaceholder: 'Hindi bababa sa 6 na character',
  signUpSubmit: 'Gumawa ng Account at Kunin ang 16-Digit na ID',
  sendResetEmail: 'Ipadala ang Reset Email',
  backToLogin: 'Bumalik sa Pag-log in',
  continueWithGoogle: 'Magpatuloy gamit ang Google',
  emailRequired: 'Kailangan ang email.',
  signUpRequirements: 'Kailangan ng wastong email at password na hindi bababa sa 6 na character.',
  resetEmailSent: 'Naipadala na ang email para i-reset ang password.',
  authFailed: 'Nagkaproblema habang nagla-log in. Pakisubukang muli.',
  googleLoginFailed: 'Kinansela o nagkaproblema ang pag-sign in gamit ang Google.',
};

export default auth;
