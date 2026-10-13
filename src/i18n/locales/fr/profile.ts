import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Mon profil de membre',
  updateProfile: 'Mettre à jour le profil en temps réel',

  // Hero
  changeAvatar: 'Changer la photo de profil',
  verifiedActive: 'Vérifié et actif',
  kccIdLabel: 'KCC ID (16 CHIFFRES)',
  copyKccId: 'Copier le KCC ID',
  viewIdCard: 'Voir la carte de membre',

  // Profile form
  infoTitle: 'Informations du profil de membre',
  infoDesc: 'Vous pouvez modifier ces informations à tout moment ; elles sont enregistrées en temps réel dans la base de données MyKCC.',
  savedRealtime: 'Enregistré en temps réel !',
  ageCategoryLabel: 'Tranche d’âge',
  ageLabel: 'Âge / Anniversaire (facultatif)',
  agePlaceholder: 'ex. : 21 ans ou 15 mai',
  whatsappLabel: 'Numéro WhatsApp actif',
  backupPhoneLabel: 'Deuxième numéro WhatsApp / de secours',
  backupPhonePlaceholder: 'ex. : 0812... ou +62 857...',
  discordPlaceholder: 'ex. : alyachan_cos ou user#0001',
  roleLabel: 'Rôle principal dans la communauté',
  customRolePlaceholder: 'Saisissez votre autre rôle / spécialité...',
  socialMediaPlaceholder: '@pseudo (Instagram / X / TikTok)',
  reasonLabel: 'Raison de l’adhésion & notes de profil',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Fan d’idols / Wota',
  roleOtaku: 'Otaku anime, manga & jeux vidéo',
  roleGeneralEnthusiast: 'Passionné / Sympathisant',
  rolePropMaker: 'Créateur d’accessoires / Crafter',
  roleCostumeMaker: 'Costumier / Couturier',
  roleEventCrew: 'Équipe événementielle & staff',
};

export default profile;
