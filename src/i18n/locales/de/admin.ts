import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'KawanCosplay-Admin-Dashboard',
  dashboardDesc: 'Geschütztes Admin-Portal für die Mitgliederliste der Community und die Synchronisierung mit Google Sheets.',
  privacyRestrictedNotice:
    'Zum Schutz der Privatsphäre der Mitglieder ist die Mitgliederliste streng auf die Admins von KawanCosplay beschränkt.',
  exportCsv: 'CSV exportieren',
  totalMembers: 'Registrierte Mitglieder gesamt',
  resetFilter: 'Filter zurücksetzen',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Admin-Zugriff wird geprüft...',
  signedInNotAdmin: 'Angemeldet als {account} – dieses Konto ist kein KCC-Admin.',
  emailNotVerified: 'E-Mail nicht verifiziert – nutze die Google-Anmeldung.',
  signInWithAdminGoogleEmail: 'Mit dem Admin-Google-Konto anmelden ({email})',
  signOutThisAccount: 'Abmelden',
  whatsappAdminHelp: 'Hilfe vom Admin per WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'KawanCosplay-Verwaltungsportal',
  verifiedAccessBadge: 'Verifizierter Zugriff',
  dashboardPrivacyNote:
    'Die Privatsphäre der Mitglieder wird streng geschützt: Nur registrierte Admins können Namen & Kontaktdaten sehen.',
  whatsappHotlineShort: 'WA-Hotline: {phone}',
  signOutAdmin: 'Vom Admin-Konto abmelden',
  statusStat: 'Status: {status}',
  statusVerified: 'Verifiziert',
  statusActive: 'Aktiv',
  statusPending: 'Ausstehend',
  tabMembers: 'Mitgliederliste ({count})',
  tabSync: 'Google Sheets & Form-Sync',
  tabStats: 'Community-Statistik',

  // Member list states
  permissionDeniedTitle: 'Zugriff verweigert',
  permissionDeniedDesc:
    'Die Datenbank hat diesem Konto den Zugriff auf die Mitgliederliste verweigert. Melde dich mit dem Admin-Google-Konto ({email}) oder einem Konto aus der admins-Collection an und lade die Seite dann neu. Stelle außerdem sicher, dass die aktuellen Firestore Rules für die Datenbank {database} veröffentlicht sind.',
  signInWithAdminGoogle: 'Mit dem Admin-Google-Konto anmelden',
  reloadPage: 'Seite neu laden',
  loadMembersFailedTitle: 'Mitgliederliste konnte nicht geladen werden',
  loadMembersFailedDesc: 'Die Mitgliederliste konnte nicht geladen werden. Prüfe deine Verbindung und lade die Seite dann neu.',
  loadingMembers: 'Mitgliederdaten werden geladen...',

  // Member status & delete
  statusUpdateFailed: 'Der Mitgliedsstatus konnte nicht aktualisiert werden: {error}',
  deleteMemberConfirm: 'Mitglied „{name}“ (KCC ID: {id}) aus der Firestore-Datenbank löschen?',
  deleteMemberFailed: 'Das Mitglied konnte nicht gelöscht werden: {error}',

  // KCC ID & public card repair
  repairTitle: 'Reparatur von KCC ID & öffentlichem Ausweis',
  repairDesc:
    'Vergibt eine eindeutige KCC ID an Mitglieder mit doppelter ID (die früheste Registrierung behält die alte ID), speichert noch nicht gespeicherte KCC IDs und baut die öffentliche memberCards-Collection für die Ausweissuche neu auf. Kann bedenkenlos mehrfach ausgeführt werden.',
  repairDuplicatesDetected: '{count} Mitglieder mit doppelter KCC ID erkannt – klicke auf „{action}“.',
  allIdsUnique: 'Alle KCC IDs sind eindeutig.',
  runRepair: 'Reparatur starten',
  repairRunning: 'Wird repariert...',
  repairRunningProgress: 'Wird repariert ({done}/{total})...',
  repairConfirm:
    'Reparatur von KCC ID & öffentlichem Ausweis für alle Mitglieder ausführen?\n\n- Mitglieder mit doppelter KCC ID erhalten eine neue ID (die früheste Registrierung behält die alte ID).\n- Noch nicht gespeicherte KCC IDs werden gespeichert.\n- Die öffentliche memberCards-Collection wird neu aufgebaut.\n\nKann bedenkenlos mehrfach ausgeführt werden. Fortfahren?',
  repairFailed: 'Reparatur fehlgeschlagen: {error}',
  repairDone: 'Reparatur abgeschlossen.',
  repairStatScanned: 'Mitglieder geprüft',
  repairStatDuplicateGroups: 'Gruppen mit doppelter ID',
  repairStatCardsWritten: 'Ausweise gespeichert',
  repairStatCardsDeleted: 'Ausweise gelöscht',
  reassignedListTitle: 'Geänderte / gespeicherte KCC IDs ({count}):',
  repairReasonDuplicate: 'doppelte ID',
  repairReasonMissing: 'ID noch nicht gespeichert',
  repairReasonMainAccount: 'ID des Hauptkontos von einem anderen Mitglied verwendet',
  noIdsChanged: 'Es mussten keine KCC IDs geändert werden.',
  issuesCount: 'Fehler ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'Für Admins / Hauptkonto reservierte KCC IDs ({range})',
  reservedIdsDesc:
    'IDs in diesem Bereich sind nur für das KCC-Hauptkonto & die Admins bestimmt. Die Mitglieder unten haben eine solche ID aufgrund der Rolle/E-Mail erhalten, die sie im öffentlichen Formular angegeben haben (altes System). Klicke auf „{action}“, um ihnen eine eindeutige chronologische KCC ID zu geben.',
  noReservedHolders: 'Kein Mitglied hat eine KCC ID, die nur für Admins bestimmt ist.',
  reservedHolderMeta: 'Quelle: {source} • Rolle: {role}',
  processing: 'Wird verarbeitet...',
  assignNewId: 'Neue ID vergeben',
  reassignConfirm: 'Neue KCC ID für „{name}“ vergeben (aktuell {id})?',
  reassignMainAccountWarning:
    'ACHTUNG: Dies ist die ID des Hauptkontos. Fahre nicht fort, wenn dieses Mitglied das offizielle Konto {email} ist.',
  resultSuccess: 'Erfolgreich: {message}',
  resultFailed: 'Fehlgeschlagen: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Doppelte Registrierungen (dieselbe Person)',
  duplicatesDesc:
    'Mitglieder, die das Formular mehr als einmal ausgefüllt haben (gleiche WhatsApp-Nummer, Discord, E-Mail oder Social Media). „Zusammenführen“ übernimmt die neuesten Daten und alle WhatsApp-Nummern in die früheste Registrierung (deren KCC ID bleibt) und löscht dann das Duplikat samt Ausweis. Prüfe die Einträge vor dem Zusammenführen.',
  scanDuplicates: 'Nach doppelten Registrierungen suchen',
  mergeConfirm:
    '„{duplicate}“ ({duplicateId}) mit „{keeper}“ ({keeperId}) zusammenführen?\n\nDie neuesten Daten & WhatsApp-Nummern werden in die früheste Registrierung kopiert, danach wird das Duplikat endgültig gelöscht. Fortfahren?',
  mergeSuccess: '„{duplicate}“ wurde mit „{keeper}“ zusammengeführt – KCC ID {id} bleibt.',
  bulkMergeIdenticalConfirm:
    '{groups} IDENTISCHE Duplikatgruppen ({records} doppelte Einträge) zusammenführen?\n\nNur Gruppen mit gleichem Cosname und gleicher Haupt-WhatsApp-Nummer, die im Abstand von höchstens {seconds} Sekunden erstellt wurden (exakte Kopien / doppelte Importe).\nDie neuesten Daten & alle WhatsApp-Nummern gehen an die früheste Registrierung (deren KCC ID bleibt), danach werden die Duplikate endgültig gelöscht. Fortfahren?',
  bulkMergeAllConfirm:
    'ALLE {groups} gefundenen Gruppen ({records} doppelte Einträge) zusammenführen?\n\nDazu gehören auch Gruppen, die nur über dieselbe WhatsApp-Nummer, Discord, E-Mail, Social Media oder denselben Namen erkannt wurden – stelle sicher, dass du die Liste unten geprüft hast.\nDie neuesten Daten & alle WhatsApp-Nummern gehen an die früheste Registrierung (deren KCC ID bleibt), danach werden die Duplikate endgültig gelöscht. Dies kann nicht rückgängig gemacht werden. Fortfahren?',
  bulkMergeDone: 'Sammel-Zusammenführung abgeschlossen ({mode}).',
  bulkModeIdentical: 'identische Gruppen',
  bulkModeAll: 'alle Suchergebnisse',
  bulkStatGroups: 'Gruppen verarbeitet',
  bulkStatMergedGroups: 'Gruppen zusammengeführt',
  bulkStatMergedRecords: 'Duplikate zusammengeführt',
  bulkStatFailedGroups: 'Gruppen fehlgeschlagen',
  bulkMoreErrors: '…und {count} weitere (siehe Browser-Konsole).',
  scanSummary:
    '{groups} Duplikatgruppen gefunden ({records} doppelte Einträge), darunter {identical} identische Gruppen (gleicher Cosname & gleiche Haupt-WhatsApp-Nummer, im Abstand von höchstens {seconds} Sekunden erstellt).',
  mergeAllIdentical: 'Alle identischen zusammenführen ({count})',
  mergeAllScanned: 'Alle Suchergebnisse zusammenführen ({count})',
  bulkMergeProgress: '{done}/{total} Gruppen werden zusammengeführt…',
  noDuplicatesFound: 'Keine doppelten Registrierungen erkannt.',
  keeperBadge: 'Behalten (KCC ID bleibt)',
  merging: 'Wird zusammengeführt...',
  mergeInto: 'Mit {id} zusammenführen',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Suchen...',
  filterAllRoles: 'Alle Rollen ({count})',
  filterAllCities: 'Alle Orte',
  filterAllAges: 'Alle Altersgruppen',
  filterLegalAge: 'Volljährig (18+)',
  filterMinor: 'Minderjährig (<18)',
  filterPreferNotToSay: 'Keine Angabe',
  sortNewest: '🕒 Zeit: Neueste',
  sortNameAsc: '🔤 Name: A → Z',
  purgeButtonTitle: 'Alle Mitgliederdaten in Firestore löschen',
  purgeButton: 'Mitgliederdaten löschen',
  purging: 'Wird gelöscht...',
  purgePrompt:
    'ERNSTE WARNUNG: Dadurch werden ALLE MITGLIEDERDATEN endgültig aus der Firestore-Datenbank GELÖSCHT.\n\nGib „{keyword}“ (in Großbuchstaben) ein, um das Leeren der Datenbank zu bestätigen:',
  purgeCancelled: 'Bestätigung abgebrochen (das Schlüsselwort stimmte nicht überein).',
  purgeSuccess: 'Löschen abgeschlossen: {count} Mitgliedseinträge wurden aus der Datenbank gelöscht.',
  purgeFailed: 'Die Mitgliederdaten konnten nicht gelöscht werden: {error}',
  exportNoData: 'Es gibt keine Daten zum Exportieren.',
  showingMembers: '{shown} von {total} Mitgliedern angezeigt',

  // CSV export column headers
  csvKccId: 'KCC ID (16 Stellen)',
  csvCosname: 'Cosname / Alias',
  csvLegalName: 'Bürgerlicher Name',
  csvPrimaryWhatsapp: 'Haupt-WhatsApp',
  csvBackupWhatsapp: 'Ersatz-WhatsApp',
  csvDiscord: 'Discord-Benutzername',
  csvEmail: 'E-Mail',
  csvAgeCategory: 'Alterskategorie',
  csvAge: 'Alter / Geburtstag',
  csvCountry: 'Land',
  csvProvince: 'Provinz',
  csvCity: 'Stadt',
  csvPrimaryRole: 'Hauptrolle',
  csvFandom: 'Fandom',
  csvExperience: 'Erfahrung',
  csvStatus: 'Status',
  csvRegisteredAt: 'Registrierungsdatum',

  // Members table
  colMember: 'Mitglied / Cosname',
  colKccId: '16-stellige KCC ID',
  colContact: 'WhatsApp & Kontakt',
  colDiscord: 'Discord-Benutzername',
  colRole: 'Rolle & Interessen',
  colAge: 'Alter',
  colLocation: 'Ort',
  colStatus: 'Status',
  colRegistered: 'Registriert',
  colActions: 'Aktionen',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Jüngste',
  sortAgeOldest: '▼ Älteste',
  sortStatusAsc: '▲ Verif.',
  sortStatusDesc: '▼ Ausst.',
  sortTimeNewest: '▼ Neueste',
  sortTimeOldest: '▲ Älteste',
  legalNameValue: 'Bürgerlich: {name}',
  mainAccountBadge: 'KCC-Hauptkonto',
  adminIdBadge: 'KCC-Admin #{number}',
  timestampIdBadge: 'Zeitstempel-ID',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'KCC ID ansehen',
  deleteMemberTitle: 'Mitglied löschen',
  emptyDatabaseTitle: 'Die Mitgliederdatenbank ist leer',
  emptyDatabaseDesc:
    'In der Datenbank sind noch keine Mitgliederdaten. Importiere sie aus der Google-Form-Tabelle oder warte auf neue Registrierungen.',
  noResultsTitle: 'Keine Ergebnisse',
  noResultsDesc: 'Keine Mitgliederdaten passen zum Suchbegriff oder zu den gewählten Filtern.',
  openSheetsSync: 'Google Sheets & Form-Sync öffnen',
};

export default admin;
