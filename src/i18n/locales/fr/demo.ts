import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Bac à sable de test du formulaire (démo)',
  sandboxBadge: 'Mode bac à sable',
  description:
    'Remplissage automatique en 1 clic pour tester la génération des KCC ID (UID horodaté, UID admin 0001-0100, compte principal 0000).',
  randomizeTitle: 'Générer un profil aléatoire',
  randomize: 'Aléatoire',

  // KCC ID allocation rules
  rulesTitle: 'Règles des ID utilisateur KawanCosplay :',
  ruleMainAccount: 'Compte principal KCC',
  ruleAdminRange: 'Plage admin KCC',
  ruleTimestamp: 'UID membre basé sur l’horodatage',

  // Preset cards
  previewName: 'Nom :',
  previewWhatsapp: 'WA :',
  previewDiscord: 'DC :',
  fillForm: 'Remplir le formulaire',
  submitTest: 'Envoyer le test',
  tip: 'Astuce : cliquez sur « {action} » pour simuler instantanément l’envoi et voir la carte KCC ID générée ainsi que le déblocage WhatsApp.',
  presetLoaded: 'Préréglage chargé',

  // Presets
  presetCosplayerName: 'Cosplayer démo (UID horodaté)',
  presetCosplayerBadge: 'UID horodaté',
  presetCosplayerDesc: 'UID à 16 chiffres basé sur l’horodatage de l’envoi (AAAAMMJJHHmmssSeq)',
  presetAdminName: 'Admin KCC démo (UID 0001-0100)',
  presetAdminBadge: 'Plage d’UID admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 à 0000 0000 0000 0100 pour les admins KCC',
  presetMainAccountName: 'Compte principal KCC démo (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 strictement réservé au compte principal cosplaysehat@gmail.com',
  presetPropMakerName: 'Créateur d’accessoires / Crafter démo',
  presetPropMakerBadge: 'Crafter (horodaté)',
  presetPropMakerDesc: 'Artisan accessoires & armures avec UID horodaté',
  presetPhotographerName: 'Photographe cosplay démo',
  presetPhotographerBadge: 'Photographe',
  presetPhotographerDesc: 'Photographe & vidéaste avec UID horodaté',
  presetOthersName: 'Démo Autre / Rôle personnalisé',
  presetOthersBadge: 'Rôle « Autre »',
  presetOthersDesc: 'Rôle personnalisé « Autre » spécialisé en maquillage cosplay & stylisme de perruques',
  presetDuplicateName: 'Test KCC ID unique (correspondance : {name})',
  presetDuplicateBadge: 'Vérif. KCC ID unique',
  presetDuplicateDesc: 'Vérifie qu’un même numéro WhatsApp conserve le KCC ID : {id}',
  presetSecondaryPhoneName: 'Test numéro secondaire (2 numéros : {name})',
  presetSecondaryPhoneBadge: 'Vérif. 2 numéros WA',
  presetSecondaryPhoneDesc: 'Ajoute un numéro secondaire et conserve le KCC ID : {id}',
};

export default demo;
