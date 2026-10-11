// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
export default {
  // Header
  bridgeBadge: 'Google Sheets & Form Real-Time Bridge',
  bridgeSubtitle: 'Google Form to Firebase transition',
  pageTitle: 'Spreadsheet & Google Form Database Sync',
  pageDesc:
    'Import the existing spreadsheet of current members and turn on real-time sync, so every new member who fills in the Google Form during the transition is added to Firebase automatically.',
  connectSheets: 'Connect Google Sheets',
  renewAccess: 'Renew Google Sheets Access',
  connectionRequiredTitle: 'Google Sheets Connection Required',
  connectionRequiredDesc:
    'To read the Google Form spreadsheet directly, give MyKCC read access to Google Sheets for the signed-in admin Google account. That account must have access to the KawanCosplay registration spreadsheet.',
  accessRequestNotice:
    'Access is requested for the signed-in account. MyKCC only asks for read access to Google Sheets, no Google Drive access.',
  accessRequestNoticeWithEmail:
    'Access is requested for the signed-in account ({email}). MyKCC only asks for read access to Google Sheets, no Google Drive access.',

  // Step 1: spreadsheet
  step1Title: 'Google Form Spreadsheet',
  step1Desc: 'Paste the URL or ID of the Google Form responses spreadsheet.',
  spreadsheetInputLabel: 'Google Spreadsheet URL / ID',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit or ID',
  inspectButton: 'Check',
  formatHint: 'Format: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID not recognised yet.',
  sheetTabLabel: 'Choose Sheet Tab',

  // Step 2: column mapping
  step2Title: 'Response Column Mapping',
  step2Desc: 'Detected {count} columns in your Google Form',
  autoDetectedBadge: 'Auto-Detected',
  columnFullName: 'Full Name Column',
  columnCosname: 'Cosname / Alias Column',
  columnEmail: 'Email Column',
  columnWhatsapp: 'WhatsApp / Phone Number Column',
  columnWhatsapp2: 'Backup WhatsApp / WA No. 2 Column',
  optionalTag: '(Optional)',
  columnDiscord: 'Discord Username Column',
  columnCity: 'City / Domicile Column',
  columnRole: 'Role / Interest Column (Cosplayer/Crafter/etc.)',
  columnFandom: 'Fandom / Favorite Character Column',
  columnTimestamp: 'Response Timestamp Column',
  optionChooseColumn: '-- Choose Column --',
  optionNone: '-- None / Empty --',
  optionDefaultIndonesia: '-- Default (Indonesia) --',
  optionDefaultCosplayer: '-- Default (Cosplayer) --',
  optionDefaultAnimeGames: '-- Default (Anime & Games) --',
  optionCurrentTime: '-- Current Time --',
  previewTitle: 'Spreadsheet Data Preview (Name, WhatsApp & Discord Username):',
  previewColName: 'Name / Cosname',
  previewColDiscord: 'Discord Username',
  previewColCity: 'City',
  previewPhone2: 'No. 2: {phone}',

  // Import
  importing: 'Importing into Firestore ({completed}/{total})...',
  importAllButton: 'Import All Spreadsheet Responses (incl. Discord & WA) into Firebase',
  importResult:
    'Import finished: <strong>{added} new members</strong>, {updated} updated, {unchanged} unchanged, {skipped} failed.',
  errorTip: 'Tip: you can also paste the Google Form spreadsheet URL into the input above and click "Check".',
  grantAccessButton: 'Grant Access / Connect Google',

  // Real-time poller
  pollerTitle: 'Real-Time Transition Poller',
  pollerActive: 'Active (Live)',
  pollerInactive: 'Inactive',
  pollerDesc:
    'While this is on, the app checks the spreadsheet every {seconds} seconds. Every new Google Form response is added to Firebase automatically and gets its KCC ID right away.',
  pollIntervalLabel: 'Check Interval:',
  pollEverySeconds: 'Every {seconds} seconds',
  pollEverySecondsOptimal: 'Every {seconds} seconds (Optimal)',
  lastPollLabel: 'Last Check:',
  lastPollNever: 'Not run yet',
  stopPoller: 'Stop Live Poller',
  startAutoSync: 'Start Real-Time Auto Sync',

  // Google Apps Script webhook
  webhookTitle: 'Google Apps Script Webhook',
  webhookDesc:
    'Want Google Form responses to arrive instantly when the <em>Submit</em> button is pressed, without waiting for the polling interval? Install this script in your responses Google Sheet:',
  scriptCommentInstall: 'Install in: responses Google Sheet -> Extensions -> Apps Script',
  scriptCommentTrigger: 'Trigger: onFormSubmit -> On form submit',
  scriptCommentResponseData: 'Read the form response data',
  copied: 'Copied!',
  copyScript: 'Copy Script',
  installStepsTitle: 'Quick Setup (1 Minute):',
  installStep1: '1. Open your responses Google Sheet > <strong>Extensions</strong> menu > <strong>Apps Script</strong>.',
  installStep2: '2. Paste the code above > Save.',
  installStep3:
    '3. In the left menu click <strong>Triggers</strong> > Add Trigger > Select event type: <em>On form submit</em>.',

  // Sync history
  recentSyncTitle: 'Recent Sync History',
  logCount: '{count} Logs',
  logsPermissionDenied: 'Access to the sync logs was denied. Sign in with the admin Google account.',
  logsLoadFailed: 'Could not load the sync history. Check your connection, then reload the page.',
  logsEmpty: 'No sync activity recorded yet.',
  logImportedRows: 'Imported {count} rows',
  logImportSummary:
    'Import finished: {added} new members, {updated} updated, {unchanged} unchanged, {skipped} failed.',
  logAutoSummary: 'Automatic: {added} new, {updated} updated.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Google Sheets Importer',

  // Errors
  adminAccountFallback: 'the admin account',
  errorUnauthorized:
    'The Google Sheets permission expired or is no longer valid. Click "Connect Google Sheets" to renew it, then try again.',
  errorScope:
    'Read access to Google Sheets was not granted. Click "Connect Google Sheets" and tick the permission to see your Google Sheets spreadsheets.',
  errorNoAccess:
    'The signed-in Google account ({account}) has no access to this spreadsheet, or the spreadsheet ID is wrong. Share the spreadsheet with that admin account (Viewer access is enough), or double-check the URL/ID.',
  errorUnsupportedFile:
    'This file is not a native Google Sheets file (e.g. an uploaded Excel .xlsx). Open it, choose File > Save as Google Sheets, then use the new file URL.',
  errorRateLimit: 'The Google Sheets API request limit was reached. Wait about a minute, then try again.',
  errorNetwork: 'Could not reach Google Sheets. Check your internet connection, then try again.',
  errorRejected: 'Google Sheets rejected the request: {detail}',
  errorInvalidInput:
    'Invalid spreadsheet URL or ID. Paste the full Google Sheets URL (https://docs.google.com/spreadsheets/d/…/edit) or just its ID.',
  errorEmptyInput: 'Enter a Google Sheets URL or ID first.',
  errorNotConnected: 'Google Sheets access has not been granted yet. Click "Connect Google Sheets" first.',
  errorEmptySheet: 'This spreadsheet is empty or has no responses yet.',
  errorReadFailed: 'Could not read the spreadsheet.',
  errorInspectFirst: 'Connect Google Sheets and inspect a spreadsheet first (Step 1).',
  errorNoRows: 'There are no response rows to import.',
  errorNoValidRows: 'No valid rows were found with this column mapping.',
  errorCheckFirst: 'Check a spreadsheet first in Step 1.',
} as const;
