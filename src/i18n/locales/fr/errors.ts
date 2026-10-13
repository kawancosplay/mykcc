import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Accès refusé par la base de données (permission denied). Rien n’a été enregistré. Vérifiez que chaque champ respecte sa limite de caractères, ou connectez-vous avec un compte autorisé, puis réessayez.',
  signInRequired: 'Veuillez d’abord vous connecter pour continuer.',
  databaseUnavailable: 'Impossible de joindre la base de données. Vérifiez votre connexion Internet et réessayez.',
  saveFailed: 'Un problème est survenu lors de l’enregistrement. Veuillez réessayer.',

  // firestoreService.ts
  profilePhotoTooLarge: 'La photo de profil est trop volumineuse. Veuillez choisir une autre photo.',
  nameRequired: 'Le nom est obligatoire.',
  invalidCardId: 'KCC ID invalide pour la carte de membre : {id}',
  uniqueIdFailed: 'Impossible de créer un KCC ID unique. Veuillez réessayer.',
  mergeAdminOnly: 'Seuls les admins peuvent fusionner des fiches de membres.',
  mergeSameRecord: 'Une fiche ne peut pas être fusionnée avec elle-même.',
  memberRecordMissing: 'Cette fiche de membre n’existe plus (elle a peut-être été fusionnée ou supprimée).',
  mergeDifferentAccounts: 'Les deux fiches sont liées à des comptes de connexion différents ; elles ne peuvent donc pas être fusionnées.',
  repairAdminOnly: 'Seuls les admins peuvent lancer la réparation.',
  repairIdUpdateFailed: 'Échec de la mise à jour du KCC ID ({ids}) : {detail}',
  repairCardWriteFailed: 'Échec de l’écriture de la carte de membre ({ids}) : {detail}',
  repairCardDeleteFailed: 'Échec de la suppression de la carte de membre ({ids}) : {detail}',

  // galleryService.ts
  photoSignInRequired: 'Veuillez d’abord vous connecter pour publier une photo.',
  photoTooLarge: 'La photo est trop volumineuse. Veuillez choisir une autre photo.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Impossible d’obtenir un jeton d’accès depuis la connexion Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Erreur {label} de l’API Sheets ({status}) : {detail}',
  sheetsApiRequestFailed: 'Échec de la requête {label} de l’API Sheets : {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Compte principal KCC (0000)',
  badgeAdmin: 'Admin KCC n° {number}',
  badgeMember: 'Membre (horodaté)',
};

export default errors;
