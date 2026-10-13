import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'Bei MyKCC anmelden',
  signUpTitle: 'Neues MyKCC-Konto erstellen',
  orContinueWith: 'Oder mit einem anderen Anbieter fortfahren',
  emailLabel: 'Aktive E-Mail-Adresse',
  passwordLabel: 'Passwort',

  // AuthModal
  forgotPasswordTitle: 'Passwort vergessen',
  portalSubtitle: 'Offizielles MyKCC-Community-Portal (16-stellige User-ID)',
  loginTab: 'Anmelden',
  signUpTab: 'Registrieren',
  nameLabel: 'Name (Cosname / Alias)',
  namePlaceholder: 'z. B. Rian_Cos / Alya / Ken',
  nameHint:
    'Beim Erstellen des Kontos optional. Deinen vollständigen Namen & Cosname kannst du später im Registrierungsformular ergänzen.',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: 'Passwort vergessen?',
  passwordPlaceholder: 'Mindestens 6 Zeichen',
  signUpSubmit: 'Konto erstellen & 16-stellige ID erhalten',
  sendResetEmail: 'Reset-E-Mail senden',
  backToLogin: 'Zurück zur Anmeldung',
  continueWithGoogle: 'Weiter mit Google',
  emailRequired: 'E-Mail ist erforderlich.',
  signUpRequirements: 'Eine gültige E-Mail-Adresse und ein Passwort mit mindestens 6 Zeichen sind erforderlich.',
  resetEmailSent: 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.',
  authFailed: 'Bei der Anmeldung ist etwas schiefgelaufen. Bitte versuche es erneut.',
  googleLoginFailed: 'Die Google-Anmeldung wurde abgebrochen oder ist auf ein Problem gestoßen.',
};

export default auth;
