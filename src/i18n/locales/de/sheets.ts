import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Echtzeit-Brücke für Google Sheets & Form',
  bridgeSubtitle: 'Umstieg von Google Form auf Firebase',
  pageTitle: 'Datenbank-Sync für Tabelle & Google Form',
  pageDesc:
    'Importiere die vorhandene Tabelle mit den bisherigen Mitgliedern und schalte den Echtzeit-Sync ein, damit jedes neue Mitglied, das während der Übergangsphase das Google Form ausfüllt, automatisch zu Firebase hinzugefügt wird.',
  connectSheets: 'Google Sheets verbinden',
  renewAccess: 'Zugriff auf Google Sheets erneuern',
  connectionRequiredTitle: 'Verbindung zu Google Sheets erforderlich',
  connectionRequiredDesc:
    'Um die Google-Form-Tabelle direkt zu lesen, gib MyKCC für das angemeldete Admin-Google-Konto Lesezugriff auf Google Sheets. Dieses Konto muss Zugriff auf die KawanCosplay-Registrierungstabelle haben.',
  accessRequestNotice:
    'Der Zugriff wird für das angemeldete Konto angefordert. MyKCC fragt nur nach Lesezugriff auf Google Sheets, kein Zugriff auf Google Drive.',
  accessRequestNoticeWithEmail:
    'Der Zugriff wird für das angemeldete Konto ({email}) angefordert. MyKCC fragt nur nach Lesezugriff auf Google Sheets, kein Zugriff auf Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Google-Form-Tabelle',
  step1Desc: 'Füge die URL oder ID der Tabelle mit den Google-Form-Antworten ein.',
  spreadsheetInputLabel: 'URL / ID der Google-Tabelle',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit oder ID',
  inspectButton: 'Prüfen',
  formatHint: 'Aufbau der URL: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID noch nicht erkannt.',
  sheetTabLabel: 'Tabellenblatt wählen',

  // Step 2: column mapping
  step2Title: 'Zuordnung der Antwortspalten',
  step2Desc: '{count} Spalten in deinem Google Form erkannt',
  autoDetectedBadge: 'Automatisch erkannt',
  columnFullName: 'Spalte: vollständiger Name',
  columnCosname: 'Spalte: Cosname / Alias',
  columnEmail: 'Spalte: E-Mail',
  columnWhatsapp: 'Spalte: WhatsApp- / Telefonnummer',
  columnWhatsapp2: 'Spalte: Ersatz-WhatsApp / WA-Nr. 2',
  optionalTag: '(optional)',
  columnDiscord: 'Spalte: Discord-Benutzername',
  columnCity: 'Spalte: Stadt / Wohnort',
  columnRole: 'Spalte: Rolle / Interesse (Cosplayer/Crafter/usw.)',
  columnFandom: 'Spalte: Fandom / Lieblingscharakter',
  columnTimestamp: 'Spalte: Zeitstempel der Antwort',
  optionChooseColumn: '-- Spalte wählen --',
  optionNone: '-- Keine / leer --',
  optionDefaultIndonesia: '-- Standard (Indonesien) --',
  optionDefaultCosplayer: '-- Standard (Cosplayer) --',
  optionDefaultAnimeGames: '-- Standard (Anime & Spiele) --',
  optionCurrentTime: '-- Aktuelle Zeit --',
  previewTitle: 'Vorschau der Tabellendaten (Name, WhatsApp & Discord-Benutzername):',
  previewColName: 'Name / Cosname',
  previewColDiscord: 'Discord-Benutzername',
  previewColCity: 'Stadt',
  previewPhone2: 'Nr. 2: {phone}',

  // Import
  importing: 'Wird in Firestore importiert ({completed}/{total})...',
  importAllButton: 'Alle Antworten der Tabelle (inkl. Discord & WA) in Firebase importieren',
  importResult:
    'Import abgeschlossen: <strong>{added} neue Mitglieder</strong>, {updated} aktualisiert, {unchanged} unverändert, {skipped} fehlgeschlagen.',
  errorTip: 'Tipp: Du kannst die URL der Google-Form-Tabelle auch oben ins Eingabefeld einfügen und auf „Prüfen“ klicken.',
  grantAccessButton: 'Zugriff erlauben / Google verbinden',

  // Real-time poller
  pollerTitle: 'Echtzeit-Poller für die Übergangsphase',
  pollerActive: 'Aktiv (live)',
  pollerInactive: 'Inaktiv',
  pollerDesc:
    'Solange dies aktiv ist, prüft die App die Tabelle alle {seconds} Sekunden. Jede neue Google-Form-Antwort wird automatisch zu Firebase hinzugefügt und erhält sofort ihre KCC ID.',
  pollIntervalLabel: 'Prüfintervall:',
  pollEverySeconds: 'Alle {seconds} Sekunden',
  pollEverySecondsOptimal: 'Alle {seconds} Sekunden (optimal)',
  lastPollLabel: 'Letzte Prüfung:',
  lastPollNever: 'Noch nicht ausgeführt',
  stopPoller: 'Live-Poller stoppen',
  startAutoSync: 'Echtzeit-Auto-Sync starten',

  // Google Apps Script webhook
  webhookTitle: 'Google-Apps-Script-Webhook',
  webhookDesc:
    'Sollen Google-Form-Antworten sofort beim Klick auf <em>Senden</em> (Submit) ankommen, ohne auf das Abfrageintervall zu warten? Installiere dieses Skript in der Antworttabelle in Google Sheets:',
  scriptCommentInstall: 'Installieren in: Antwort-Tabelle in Google Sheets -> Erweiterungen (Extensions) -> Apps Script',
  scriptCommentTrigger: 'Trigger: onFormSubmit -> Bei Formularübermittlung (On form submit)',
  scriptCommentResponseData: 'Daten der Formularantwort lesen',
  copied: 'Kopiert!',
  copyScript: 'Skript kopieren',
  installStepsTitle: 'Schnelleinrichtung (1 Minute):',
  installStep1:
    '1. Öffne die Antworttabelle in Google Sheets > Menü <strong>Erweiterungen</strong> (Extensions) > <strong>Apps Script</strong>.',
  installStep2: '2. Füge den Code oben ein > Speichern.',
  installStep3:
    '3. Klicke im linken Menü auf <strong>Trigger</strong> (Triggers) > Trigger hinzufügen > Ereignistyp auswählen: <em>Bei Formularübermittlung</em> (On form submit).',

  // Sync history
  recentSyncTitle: 'Letzte Synchronisierungen',
  logCount: '{count} Einträge',
  logsPermissionDenied: 'Zugriff auf die Sync-Protokolle verweigert. Melde dich mit dem Admin-Google-Konto an.',
  logsLoadFailed: 'Der Sync-Verlauf konnte nicht geladen werden. Prüfe deine Verbindung und lade die Seite dann neu.',
  logsEmpty: 'Noch keine Sync-Aktivität aufgezeichnet.',
  logImportedRows: '{count} Zeilen importiert',
  logImportSummary:
    'Import abgeschlossen: {added} neue Mitglieder, {updated} aktualisiert, {unchanged} unverändert, {skipped} fehlgeschlagen.',
  logAutoSummary: 'Automatisch: {added} neu, {updated} aktualisiert.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Import aus Google Sheets',

  // Errors
  adminAccountFallback: 'das Admin-Konto',
  errorUnauthorized:
    'Die Berechtigung für Google Sheets ist abgelaufen oder nicht mehr gültig. Klicke auf „Google Sheets verbinden“, um sie zu erneuern, und versuche es dann erneut.',
  errorScope:
    'Der Lesezugriff auf Google Sheets wurde nicht erteilt. Klicke auf „Google Sheets verbinden“ und setze das Häkchen bei der Berechtigung, deine Tabellen in Google Sheets anzusehen.',
  errorNoAccess:
    'Das angemeldete Google-Konto ({account}) hat keinen Zugriff auf diese Tabelle, oder die Tabellen-ID ist falsch. Gib die Tabelle für dieses Admin-Konto frei (Freigeben; Zugriff als „Betrachter“ reicht) oder prüfe die URL/ID noch einmal.',
  errorUnsupportedFile:
    'Diese Datei ist keine native Datei von Google Sheets (z. B. eine hochgeladene Excel-Datei .xlsx). Öffne sie, wähle Datei > Als Google Tabellen speichern (File > Save as Google Sheets) und verwende dann die URL der neuen Datei.',
  errorRateLimit: 'Das Anfragelimit der Google Sheets API wurde erreicht. Warte etwa eine Minute und versuche es dann erneut.',
  errorNetwork: 'Google Sheets ist nicht erreichbar. Prüfe deine Internetverbindung und versuche es dann erneut.',
  errorRejected: 'Google Sheets hat die Anfrage abgelehnt: {detail}',
  errorInvalidInput:
    'Ungültige Tabellen-URL oder -ID. Füge die vollständige URL von Google Sheets (https://docs.google.com/spreadsheets/d/…/edit) oder nur die ID ein.',
  errorEmptyInput: 'Gib zuerst eine URL oder ID von Google Sheets ein.',
  errorNotConnected: 'Der Zugriff auf Google Sheets wurde noch nicht erteilt. Klicke zuerst auf „Google Sheets verbinden“.',
  errorEmptySheet: 'Diese Tabelle ist leer oder hat noch keine Antworten.',
  errorReadFailed: 'Die Tabelle konnte nicht gelesen werden.',
  errorInspectFirst: 'Verbinde zuerst Google Sheets und prüfe eine Tabelle (Schritt 1).',
  errorNoRows: 'Es gibt keine Antwortzeilen zum Importieren.',
  errorNoValidRows: 'Mit dieser Spaltenzuordnung wurden keine gültigen Zeilen gefunden.',
  errorCheckFirst: 'Prüfe zuerst eine Tabelle in Schritt 1.',
};

export default sheets;
