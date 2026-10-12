import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'Tableau de bord Administrateur',
  dashboardDesc: 'Portail de gestion sécurisé pour la liste des membres.',
  loginPrompt: 'Entrez la clé secrète Admin ou connectez-vous avec l’adresse officielle.',
  privacyRestrictedNotice: 'Par souci de confidentialité, la liste complète des membres est réservée aux administrateurs.',
  exportCsv: 'Exporter CSV',
  totalMembers: 'Total des membres',
  resetFilter: 'Réinitialiser',
};

export default admin;
