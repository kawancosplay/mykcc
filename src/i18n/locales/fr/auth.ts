import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: "Connexion à MyKCC",
  signUpTitle: "Créer un compte MyKCC",
  orContinueWith: "Ou continuer avec un autre fournisseur",
  emailLabel: "Adresse e-mail active",
  passwordLabel: "Mot de passe",
  forgotPasswordTitle: "Mot de passe oublié",
  portalSubtitle: "Portail communautaire officiel MyKCC (KCC ID)",
  loginTab: "Connexion",
  signUpTab: "Inscription",
  nameLabel: "Nom (cosname / alias)",
  namePlaceholder: "ex. : Rian_Cos / Alya / Ken",
  nameHint: "Facultatif lors de la création du compte. Vous pourrez ajouter votre nom complet et votre cosname plus tard dans le formulaire d’inscription de la communauté.",
  emailPlaceholder: "nom@gmail.com",
  forgotPasswordLink: "Mot de passe oublié ?",
  passwordPlaceholder: "Au moins 6 caractères",
  signUpSubmit: "Créer un compte et obtenir votre KCC ID",
  sendResetEmail: "Envoyer l’e-mail de réinitialisation",
  backToLogin: "Retour à la connexion",
  continueWithGoogle: "Continuer avec Google",
  emailRequired: "L’adresse e-mail est obligatoire.",
  signUpRequirements: "Une adresse e-mail valide et un mot de passe d’au moins 6 caractères sont obligatoires.",
  resetEmailSent: "Un e-mail de réinitialisation du mot de passe a été envoyé.",
  authFailed: "Un problème est survenu lors de la connexion. Veuillez réessayer.",
  googleLoginFailed: "La connexion Google a été annulée ou a rencontré un problème.",
  popupBlockedTapAgain: "Le navigateur a bloqué la fenêtre de connexion. Appuyez à nouveau sur le bouton.",
};

export default auth;
