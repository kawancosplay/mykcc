import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'Administrator-Dashboard',
  dashboardDesc: 'Geschützter Verwaltungsbereich zum Schutz der Mitgliederdaten.',
  loginPrompt: 'Admin-Schlüssel eingeben oder mit offizieller E-Mail anmelden.',
  privacyRestrictedNotice: 'Aus Datenschutzgründen ist die Mitgliederliste nur für Administratoren zugänglich.',
  exportCsv: 'CSV exportieren',
  totalMembers: 'Registrierte Mitglieder',
  resetFilter: 'Filter zurücksetzen',
};

export default admin;
