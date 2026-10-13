import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Tableau de bord admin KawanCosplay',
  dashboardDesc: 'Portail d’administration à accès restreint pour la liste des membres de la communauté et la synchronisation Google Sheets.',
  privacyRestrictedNotice: 'Pour protéger la vie privée des membres, la liste des membres est strictement réservée aux admins de KawanCosplay.',
  exportCsv: 'Exporter en CSV',
  totalMembers: 'Total des membres inscrits',
  resetFilter: 'Réinitialiser les filtres',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Vérification de l’accès admin...',
  signedInNotAdmin: 'Connecté en tant que {account} — ce compte n’est pas un admin KCC.',
  emailNotVerified: 'E-mail non vérifié — utilisez la connexion Google.',
  signInWithAdminGoogleEmail: 'Se connecter avec le compte Google admin ({email})',
  signOutThisAccount: 'Se déconnecter',
  whatsappAdminHelp: 'Aide admin via WhatsApp : {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portail de gestion KawanCosplay',
  verifiedAccessBadge: 'Accès vérifié',
  dashboardPrivacyNote: 'La vie privée des membres est strictement protégée : seuls les admins enregistrés peuvent voir les noms et les coordonnées.',
  whatsappHotlineShort: 'Hotline WA : {phone}',
  signOutAdmin: 'Se déconnecter du compte admin',
  statusStat: 'Statut : {status}',
  statusVerified: 'Vérifié',
  statusActive: 'Actif',
  statusPending: 'En attente',
  tabMembers: 'Liste des membres ({count})',
  tabSync: 'Synchro Google Sheets & formulaire',
  tabStats: 'Statistiques de la communauté',

  // Member list states
  permissionDeniedTitle: 'Accès refusé',
  permissionDeniedDesc:
    'La base de données a refusé l’accès à la liste des membres pour ce compte. Connectez-vous avec le compte Google admin ({email}) ou avec un compte figurant dans la collection admins, puis rechargez la page. Vérifiez aussi que les dernières règles Firestore (Firestore Rules) sont publiées sur la base de données {database}.',
  signInWithAdminGoogle: 'Se connecter avec le compte Google admin',
  reloadPage: 'Recharger la page',
  loadMembersFailedTitle: 'Impossible de charger la liste des membres',
  loadMembersFailedDesc: 'Impossible de charger la liste des membres. Vérifiez votre connexion, puis rechargez la page.',
  loadingMembers: 'Chargement des données des membres...',

  // Member status & delete
  statusUpdateFailed: 'Impossible de mettre à jour le statut du membre : {error}',
  deleteMemberConfirm: 'Supprimer le membre « {name} » (KCC ID : {id}) de la base de données Firestore ?',
  deleteMemberFailed: 'Impossible de supprimer le membre : {error}',

  // KCC ID & public card repair
  repairTitle: 'Réparation des KCC ID & des cartes publiques',
  repairDesc:
    'Attribue un KCC ID unique aux membres dont l’ID est en double (l’inscription la plus ancienne garde l’ancien ID), enregistre les KCC ID qui ne sont pas encore stockés et reconstruit la collection publique memberCards utilisée pour la recherche de cartes. Peut être lancée plusieurs fois sans risque.',
  repairDuplicatesDetected: '{count} membres avec un KCC ID en double détectés — appuyez sur « {action} ».',
  allIdsUnique: 'Tous les KCC ID sont uniques.',
  runRepair: 'Lancer la réparation',
  repairRunning: 'Réparation...',
  repairRunningProgress: 'Réparation ({done}/{total})...',
  repairConfirm:
    'Lancer la réparation des KCC ID & des cartes publiques pour tous les membres ?\n\n- Les membres avec un KCC ID en double reçoivent un nouvel ID (l’inscription la plus ancienne garde l’ancien ID).\n- Les KCC ID pas encore enregistrés seront enregistrés.\n- La collection publique memberCards est reconstruite.\n\nPeut être lancée plusieurs fois sans risque. Continuer ?',
  repairFailed: 'Échec de la réparation : {error}',
  repairDone: 'Réparation terminée.',
  repairStatScanned: 'Membres analysés',
  repairStatDuplicateGroups: 'Groupes d’ID en double',
  repairStatCardsWritten: 'Cartes écrites',
  repairStatCardsDeleted: 'Cartes supprimées',
  reassignedListTitle: 'KCC ID modifiés / enregistrés ({count}) :',
  repairReasonDuplicate: 'ID en double',
  repairReasonMissing: 'ID pas encore enregistré',
  repairReasonMainAccount: 'ID du compte principal utilisé par un autre membre',
  noIdsChanged: 'Aucun KCC ID n’a dû être modifié.',
  issuesCount: 'Erreurs ({count}) :',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID réservés aux admins / au compte principal ({range})',
  reservedIdsDesc:
    'Les ID de cette plage sont réservés au compte principal KCC et aux admins. Les membres ci-dessous en ont reçu un à partir du rôle ou de l’e-mail saisi dans le formulaire public (ancien système). Appuyez sur « {action} » pour leur attribuer un KCC ID chronologique unique.',
  noReservedHolders: 'Aucun membre ne détient un KCC ID réservé aux admins.',
  reservedHolderMeta: 'Source : {source} • Rôle : {role}',
  processing: 'Traitement...',
  assignNewId: 'Attribuer un nouvel ID',
  reassignConfirm: 'Attribuer un nouveau KCC ID à « {name} » (actuellement {id}) ?',
  reassignMainAccountWarning:
    'ATTENTION : il s’agit de l’ID du compte principal. Ne continuez pas si ce membre est le compte officiel {email}.',
  resultSuccess: 'Succès : {message}',
  resultFailed: 'Échec : {message}',

  // Duplicate registrations
  duplicatesTitle: 'Inscriptions en double (même personne)',
  duplicatesDesc:
    'Membres ayant rempli le formulaire plus d’une fois (même numéro WhatsApp, Discord, e-mail ou réseau social). « Fusionner » conserve les données les plus récentes et tous les numéros WhatsApp sur l’inscription la plus ancienne (son KCC ID est conservé), puis supprime le doublon ainsi que sa carte. Vérifiez avant de fusionner.',
  scanDuplicates: 'Rechercher les inscriptions en double',
  mergeConfirm:
    'Fusionner « {duplicate} » ({duplicateId}) dans « {keeper} » ({keeperId}) ?\n\nLes données et les numéros WhatsApp les plus récents sont copiés vers l’inscription la plus ancienne, puis le doublon est définitivement supprimé. Continuer ?',
  mergeSuccess: '« {duplicate} » fusionné dans « {keeper} » — le KCC ID {id} est conservé.',
  bulkMergeIdenticalConfirm:
    'Fusionner {groups} groupes de doublons IDENTIQUES ({records} fiches en double) ?\n\nUniquement les groupes ayant le même cosname et le même numéro WhatsApp principal, créés à {seconds} secondes d’intervalle au maximum (copies exactes / doubles importations).\nLes données les plus récentes et tous les numéros WhatsApp vont à l’inscription la plus ancienne (son KCC ID est conservé), puis les doublons sont définitivement supprimés. Continuer ?',
  bulkMergeAllConfirm:
    'Fusionner TOUS les {groups} groupes analysés ({records} fiches en double) ?\n\nCela inclut des groupes rapprochés uniquement par le même numéro WhatsApp, Discord, e-mail, réseau social ou nom — assurez-vous d’avoir vérifié la liste ci-dessous.\nLes données les plus récentes et tous les numéros WhatsApp vont à l’inscription la plus ancienne (son KCC ID est conservé), puis les doublons sont définitivement supprimés. Cette action est irréversible. Continuer ?',
  bulkMergeDone: 'Fusion groupée terminée ({mode}).',
  bulkModeIdentical: 'groupes identiques',
  bulkModeAll: 'tous les résultats de l’analyse',
  bulkStatGroups: 'Groupes traités',
  bulkStatMergedGroups: 'Groupes fusionnés',
  bulkStatMergedRecords: 'Doublons fusionnés',
  bulkStatFailedGroups: 'Groupes en échec',
  bulkMoreErrors: '…et {count} autres (voir la console du navigateur).',
  scanSummary:
    '{groups} groupes de doublons trouvés ({records} fiches en double), dont {identical} groupes identiques (même cosname et même numéro WhatsApp principal, créés à {seconds} secondes d’intervalle au maximum).',
  mergeAllIdentical: 'Fusionner tous les identiques ({count})',
  mergeAllScanned: 'Fusionner tous les résultats ({count})',
  bulkMergeProgress: 'Fusion de {done}/{total} groupes…',
  noDuplicatesFound: 'Aucune inscription en double détectée.',
  keeperBadge: 'Conservé (KCC ID inchangé)',
  merging: 'Fusion...',
  mergeInto: 'Fusionner dans {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Rechercher...',
  filterAllRoles: 'Tous les rôles ({count})',
  filterAllCities: 'Tous les lieux',
  filterAllAges: 'Tous les âges',
  filterLegalAge: 'Adulte (18+)',
  filterMinor: 'Mineur (<18)',
  filterPreferNotToSay: 'Non précisé',
  sortNewest: '🕒 Date : plus récents',
  sortNameAsc: '🔤 Nom : A → Z',
  purgeButtonTitle: 'Purger toutes les données des membres dans Firestore',
  purgeButton: 'Purger les données',
  purging: 'Purge...',
  purgePrompt:
    'AVERTISSEMENT GRAVE : cette action va SUPPRIMER DÉFINITIVEMENT TOUTES LES DONNÉES DES MEMBRES de la base de données Firestore.\n\nTapez « {keyword} » (en majuscules) pour confirmer l’effacement de la base de données :',
  purgeCancelled: 'Confirmation annulée (le mot-clé ne correspond pas).',
  purgeSuccess: 'Purge terminée : {count} fiches de membres ont été supprimées de la base de données.',
  purgeFailed: 'Impossible de supprimer les données des membres : {error}',
  exportNoData: 'Aucune donnée à exporter.',
  showingMembers: '{shown} membres affichés sur {total}',

  // CSV export column headers
  csvKccId: 'KCC ID (16 chiffres)',
  csvCosname: 'Cosname / pseudo',
  csvLegalName: 'Nom légal',
  csvPrimaryWhatsapp: 'WhatsApp principal',
  csvBackupWhatsapp: 'WhatsApp de secours',
  csvDiscord: 'Nom d’utilisateur Discord',
  csvEmail: 'E-mail',
  csvAgeCategory: 'Tranche d’âge',
  csvAge: 'Âge / Anniversaire',
  csvCountry: 'Pays',
  csvProvince: 'Province',
  csvCity: 'Ville',
  csvPrimaryRole: 'Rôle principal',
  csvFandom: 'Fandom',
  csvExperience: 'Expérience',
  csvStatus: 'Statut',
  csvRegisteredAt: 'Date d’inscription',

  // Members table
  colMember: 'Membre / Cosname',
  colKccId: 'KCC ID à 16 chiffres',
  colContact: 'WhatsApp & contact',
  colDiscord: 'Nom d’utilisateur Discord',
  colRole: 'Rôle & intérêts',
  colAge: 'Âge',
  colLocation: 'Lieu',
  colStatus: 'Statut',
  colRegistered: 'Inscrit le',
  colActions: 'Actions',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Plus jeunes',
  sortAgeOldest: '▼ Plus âgés',
  sortStatusAsc: '▲ Vér',
  sortStatusDesc: '▼ Att',
  sortTimeNewest: '▼ Plus récents',
  sortTimeOldest: '▲ Plus anciens',
  legalNameValue: 'Nom légal : {name}',
  mainAccountBadge: 'Compte principal KCC',
  adminIdBadge: 'Admin KCC n° {number}',
  timestampIdBadge: 'ID horodaté',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Voir le KCC ID',
  deleteMemberTitle: 'Supprimer le membre',
  emptyDatabaseTitle: 'La base de données des membres est vide',
  emptyDatabaseDesc:
    'Il n’y a pas encore de données de membres dans la base de données. Importez-les depuis la feuille de calcul du Google Form ou attendez de nouvelles inscriptions.',
  noResultsTitle: 'Aucun résultat',
  noResultsDesc: 'Aucune donnée de membre ne correspond au mot-clé recherché ou aux filtres sélectionnés.',
  openSheetsSync: 'Ouvrir la synchro Google Sheets & formulaire',
};

export default admin;
