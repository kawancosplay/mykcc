import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'ꦏꦽꦠꦼꦒ꧀ ꦭꦁꦱꦸꦁ Google Sheets & Form',
  bridgeSubtitle: 'ꦠꦿꦤ꧀ꦱꦶꦱꦶ Google Form ꦝꦠꦼꦁ Firebase',
  pageTitle: 'ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦢꦠꦧꦺꦱ꧀ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ & Google Form',
  pageDesc:
    'ꦲꦶꦩ꧀ꦥꦺꦴꦂ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦲꦁꦒꦺꦴꦠ ꦲꦶꦁꦏꦁ ꦱꦩ꧀ꦥꦸꦤ꧀ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦭꦤ꧀ ꦲꦏ꧀ꦠꦶꦥ꦳ꦏꦼꦤ꧀ ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦭꦁꦱꦸꦁ꧈ ꦱꦸꦥꦢꦺꦴꦱ꧀ ꦱꦧꦼꦤ꧀ ꦲꦁꦒꦺꦴꦠ ꦲꦼꦁꦒꦭ꧀ ꦲꦶꦁꦏꦁ ꦔꦶꦱꦶ Google Form ꦱꦊꦧꦼꦠꦶꦥꦸꦤ꧀ ꦠꦿꦤ꧀ꦱꦶꦱꦶ ꦲꦺꦴꦠꦺꦴꦩꦠꦶꦱ꧀ ꦏꦠꦩ꧀ꦧꦲꦏꦼꦤ꧀ ꦝꦠꦼꦁ Firebase.',
  connectSheets: 'ꦱꦩ꧀ꦧꦸꦔꦏꦼꦤ꧀ Google Sheets',
  renewAccess: 'ꦲꦚꦫꦶ ꦲꦏ꧀ꦱꦺꦱ꧀ Google Sheets',
  connectionRequiredTitle: 'ꦩ꧀ꦧꦼꦠꦲꦏꦼꦤ꧀ ꦱꦩ꧀ꦧꦸꦔꦤ꧀ Google Sheets',
  connectionRequiredDesc:
    'ꦏꦁꦒꦺ ꦩꦲꦺꦴꦱ꧀ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ Google Form ꦏꦤ꧀ꦛꦶ ꦭꦁꦱꦸꦁ꧈ ꦥꦫꦶꦔꦶ MyKCC ꦲꦏ꧀ꦱꦺꦱ꧀ ꦩꦲꦺꦴꦱ꧀ Google Sheets ꦏꦁꦒꦺ ꦲꦏꦸꦤ꧀ Google ꦲꦢ꧀ꦩꦶꦤ꧀ ꦲꦶꦁꦏꦁ ꦱꦮꦼꦒ꧀ ꦩ꧀ꦭꦼꦧꦼꦠ꧀꧉ ꦲꦏꦸꦤ꧀ ꦥꦸꦤꦶꦏ ꦏꦼꦢꦃ ꦒꦝꦃ ꦲꦏ꧀ꦱꦺꦱ꧀ ꦝꦠꦼꦁ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦥꦤ꧀ꦝꦥ꦳꧀ꦠꦫꦤ꧀ KawanCosplay.',
  accessRequestNotice:
    'ꦲꦏ꧀ꦱꦺꦱ꧀ ꦢꦶꦥꦸꦤ꧀ꦱꦸꦮꦸꦤ꧀ ꦏꦁꦒꦺ ꦲꦏꦸꦤ꧀ ꦲꦶꦁꦏꦁ ꦱꦮꦼꦒ꧀ ꦩ꧀ꦭꦼꦧꦼꦠ꧀꧉ MyKCC ꦤꦩꦸꦁ ꦚꦸꦮꦸꦤ꧀ ꦲꦏ꧀ꦱꦺꦱ꧀ ꦩꦲꦺꦴꦱ꧀ Google Sheets, ꦠꦤ꧀ꦥ ꦲꦏ꧀ꦱꦺꦱ꧀ Google Drive.',
  accessRequestNoticeWithEmail:
    'ꦲꦏ꧀ꦱꦺꦱ꧀ ꦢꦶꦥꦸꦤ꧀ꦱꦸꦮꦸꦤ꧀ ꦏꦁꦒꦺ ꦲꦏꦸꦤ꧀ ꦲꦶꦁꦏꦁ ꦱꦮꦼꦒ꧀ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ({email}). MyKCC ꦤꦩꦸꦁ ꦚꦸꦮꦸꦤ꧀ ꦲꦏ꧀ꦱꦺꦱ꧀ ꦩꦲꦺꦴꦱ꧀ Google Sheets, ꦠꦤ꧀ꦥ ꦲꦏ꧀ꦱꦺꦱ꧀ Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ Google Form',
  step1Desc: 'ꦠꦼꦩ꧀ꦥꦼꦭꦏꦼꦤ꧀ URL ꦲꦸꦠꦮꦶ ID ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦮꦁꦱꦸꦭꦤ꧀ Google Form.',
  spreadsheetInputLabel: 'URL / ID Google ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit ꦲꦸꦠꦮꦶ ID',
  inspectButton: 'ꦥꦿꦶꦏ꧀ꦱ',
  formatHint: 'ꦮꦔꦸꦤ꧀: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID ꦢꦺꦫꦺꦁ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦤ꧀ꦠꦼꦥꦔꦶ꧉',
  sheetTabLabel: 'ꦥꦶꦭꦶꦃ ꦠꦧ꧀ Sheet',

  // Step 2: column mapping
  step2Title: 'ꦥꦼꦩꦺꦠꦲꦤ꧀ ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦮꦁꦱꦸꦭꦤ꧀',
  step2Desc: 'ꦏꦢꦺꦠꦺꦏ꧀ꦱꦶ {count} ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦲꦶꦁ Google Form ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀',
  autoDetectedBadge: 'ꦏꦢꦺꦠꦺꦏ꧀ꦱꦶ ꦲꦺꦴꦠꦺꦴꦩꦠꦶꦱ꧀',
  columnFullName: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦗꦼꦤꦼꦁ ꦗꦁꦏꦼꦥ꧀',
  columnCosname: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦕꦺꦴꦱ꧀ꦤꦩꦺ / ꦱꦩꦫꦤ꧀',
  columnEmail: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦲꦼꦩꦻꦭ꧀',
  columnWhatsapp: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦤꦺꦴꦩꦼꦂ WhatsApp / ꦠꦺꦭ꧀ꦥꦺꦴꦤ꧀',
  columnWhatsapp2: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ WhatsApp ꦕꦝꦔꦤ꧀ / ꦤꦺꦴꦩꦼꦂ WA 2',
  optionalTag: '(ꦲꦺꦴꦥ꧀ꦱꦶꦪꦺꦴꦤꦭ꧀)',
  columnDiscord: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦪꦸꦱꦼꦂꦤꦺꦩ꧀ Discord',
  columnCity: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦏꦸꦛ / ꦢꦺꦴꦩꦶꦱꦶꦭꦶ',
  columnRole: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦥꦼꦫꦤ꧀ / ꦩꦶꦤꦠ꧀ (ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪꦼꦂ/ꦥꦔꦿꦗꦶꦤ꧀/ꦭꦤ꧀ ꦱꦥꦤꦸꦁꦒꦭꦶꦥꦸꦤ꧀)',
  columnFandom: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦥ꦳ꦤ꧀ꦢꦺꦴꦩ꧀ / ꦏꦫꦏ꧀ꦠꦼꦂ ꦥ꦳ꦮ꦳ꦺꦴꦫꦶꦠ꧀',
  columnTimestamp: 'ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀ ꦮꦁꦱꦸꦭꦤ꧀',
  optionChooseColumn: '-- ꦥꦶꦭꦶꦃ ꦏꦺꦴꦭꦺꦴꦩ꧀ --',
  optionNone: '-- ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ / ꦏꦺꦴꦱꦺꦴꦁ --',
  optionDefaultIndonesia: '-- ꦒꦮꦤ꧀ (ꦲꦶꦤ꧀ꦢꦺꦴꦤꦺꦱꦶꦪ) --',
  optionDefaultCosplayer: '-- ꦒꦮꦤ꧀ (ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪꦼꦂ) --',
  optionDefaultAnimeGames: '-- ꦒꦮꦤ꧀ (ꦲꦤꦶꦩꦺ & ꦒꦺꦩ꧀) --',
  optionCurrentTime: '-- ꦮꦼꦏ꧀ꦢꦭ꧀ ꦱꦥꦸꦤꦶꦏ --',
  previewTitle: 'ꦠꦶꦭꦶꦏꦤ꧀ ꦢꦠ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ (ꦗꦼꦤꦼꦁ꧈ WhatsApp & ꦪꦸꦱꦼꦂꦤꦺꦩ꧀ Discord):',
  previewColName: 'ꦗꦼꦤꦼꦁ / ꦕꦺꦴꦱ꧀ꦤꦩꦺ',
  previewColDiscord: 'ꦪꦸꦱꦼꦂꦤꦺꦩ꧀ Discord',
  previewColCity: 'ꦏꦸꦛ',
  previewPhone2: 'ꦤꦺꦴꦩꦼꦂ 2: {phone}',

  // Import
  importing: 'ꦔꦶꦩ꧀ꦥꦺꦴꦂ ꦝꦠꦼꦁ Firestore ({completed}/{total})...',
  importAllButton: 'ꦲꦶꦩ꧀ꦥꦺꦴꦂ ꦱꦼꦢꦪ ꦮꦁꦱꦸꦭꦤ꧀ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ (ꦏꦊꦧꦼꦠ꧀ Discord & WA) ꦝꦠꦼꦁ Firebase',
  importResult:
    'ꦲꦶꦩ꧀ꦥꦺꦴꦂ ꦫꦩ꧀ꦥꦸꦁ: <strong>{added} ꦲꦁꦒꦺꦴꦠ ꦲꦼꦁꦒꦭ꧀</strong>, {updated} ꦢꦶꦥꦸꦤꦚꦫꦶ꧈ {unchanged} ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦲꦺꦮꦃ꧈ {skipped} ꦒꦒꦭ꧀꧉',
  errorTip:
    'ꦠꦶꦥ꧀ꦱ꧀: ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀ ꦲꦸꦒꦶ ꦱꦒꦼꦢ꧀ ꦤꦼꦩ꧀ꦥꦼꦭꦏꦼꦤ꧀ URL ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ Google Form ꦲꦶꦁ ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦲꦶꦁ ꦔꦶꦁꦒꦶꦭ꧀ ꦭꦗꦼꦁ ꦏ꧀ꦭꦶꦏ꧀ "ꦥꦿꦶꦏ꧀ꦱ"꧉',
  grantAccessButton: 'ꦥꦫꦶꦔꦶ ꦲꦏ꧀ꦱꦺꦱ꧀ / ꦱꦩ꧀ꦧꦸꦔꦏꦼꦤ꧀ Google',

  // Real-time poller
  pollerTitle: 'ꦥꦩꦤ꧀ꦠꦲꦸ ꦠꦿꦤ꧀ꦱꦶꦱꦶ ꦭꦁꦱꦸꦁ',
  pollerActive: 'ꦲꦏ꧀ꦠꦶꦥ꦳꧀ (ꦭꦁꦱꦸꦁ)',
  pollerInactive: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦲꦏ꧀ꦠꦶꦥ꦳꧀',
  pollerDesc:
    'ꦤꦭꦶꦏ ꦥꦸꦤꦶꦏ ꦲꦏ꧀ꦠꦶꦥ꦳꧀꧈ ꦲꦥ꧀ꦭꦶꦏꦱꦶ ꦩꦿꦶꦏ꧀ꦱ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦱꦧꦼꦤ꧀ {seconds} ꦢꦼꦠꦶꦏ꧀꧉ ꦱꦧꦼꦤ꧀ ꦮꦁꦱꦸꦭꦤ꧀ Google Form ꦲꦼꦁꦒꦭ꧀ ꦲꦺꦴꦠꦺꦴꦩꦠꦶꦱ꧀ ꦏꦠꦩ꧀ꦧꦲꦏꦼꦤ꧀ ꦝꦠꦼꦁ Firebase ꦭꦤ꧀ ꦭꦁꦱꦸꦁ ꦥꦶꦏꦤ꧀ꦠꦸꦏ꧀ KCC ID.',
  pollIntervalLabel: 'ꦗꦫꦏ꧀ ꦥꦩ꧀ꦫꦶꦏ꧀ꦱꦤ꧀:',
  pollEverySeconds: 'ꦱꦧꦼꦤ꧀ {seconds} ꦢꦼꦠꦶꦏ꧀',
  pollEverySecondsOptimal: 'ꦱꦧꦼꦤ꧀ {seconds} ꦢꦼꦠꦶꦏ꧀ (ꦲꦺꦴꦥ꧀ꦠꦶꦩꦭ꧀)',
  lastPollLabel: 'ꦥꦩ꧀ꦫꦶꦏ꧀ꦱꦤ꧀ ꦥꦸꦁꦏꦱꦤ꧀:',
  lastPollNever: 'ꦢꦺꦫꦺꦁ ꦢꦶꦥꦸꦤ꧀ꦭꦩ꧀ꦥꦲꦏꦼꦤ꧀',
  stopPoller: 'ꦩꦤ꧀ꦝꦼꦒꦏꦼꦤ꧀ ꦥꦩꦤ꧀ꦠꦲꦸ ꦭꦁꦱꦸꦁ',
  startAutoSync: 'ꦮꦶꦮꦶꦠꦶ ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦲꦺꦴꦠꦺꦴꦩꦠꦶꦱ꧀ ꦭꦁꦱꦸꦁ',

  // Google Apps Script webhook
  webhookTitle: 'ꦮꦺꦧ꧀ꦲꦸꦏ꧀ Google Apps Script',
  webhookDesc:
    'ꦔꦼꦂꦱꦏꦏꦼꦤ꧀ ꦮꦁꦱꦸꦭꦤ꧀ Google Form ꦢꦸꦩꦸꦒꦶ ꦱꦤꦭꦶꦏ ꦤꦭꦶꦏ ꦠꦺꦴꦩ꧀ꦧꦺꦴꦭ꧀ <em>Submit</em> ꦢꦶꦥꦸꦤ꧀ꦥꦼꦚ꧀ꦕꦼꦠ꧀꧈ ꦠꦤ꧀ꦥ ꦔꦼꦤ꧀ꦠꦺꦴꦱꦶ ꦲꦶꦤ꧀ꦠꦼꦂꦮ꦳ꦭ꧀ ꦥꦺꦴꦭꦶꦁ? ꦥꦱꦁ ꦱ꧀ꦏꦿꦶꦥ꧀ ꦥꦸꦤꦶꦏ ꦲꦶꦁ Google Sheet ꦮꦁꦱꦸꦭꦤ꧀ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀:',
  scriptCommentInstall: 'ꦥꦱꦁ ꦲꦶꦁ: Google Sheet ꦮꦁꦱꦸꦭꦤ꧀ -> Extensions (ꦲꦺꦏ꧀ꦱ꧀ꦠꦺꦤ꧀ꦱꦶ) -> Apps Script',
  scriptCommentTrigger: 'ꦥꦼꦩꦶꦕꦸ (Trigger): onFormSubmit -> On form submit (ꦤꦭꦶꦏ ꦥ꦳ꦺꦴꦂꦩꦸꦭꦶꦂ ꦢꦶꦥꦸꦤ꧀ꦏꦶꦫꦶꦩ꧀)',
  scriptCommentResponseData: 'ꦮꦲꦺꦴꦱ꧀ ꦢꦠ ꦮꦁꦱꦸꦭꦤ꧀ ꦥ꦳ꦺꦴꦂꦩꦸꦭꦶꦂ',
  copied: 'ꦱꦩ꧀ꦥꦸꦤ꧀ ꦢꦶꦥꦸꦤ꧀ꦱꦭꦶꦤ꧀!',
  copyScript: 'ꦱꦭꦶꦤ꧀ ꦱ꧀ꦏꦿꦶꦥ꧀',
  installStepsTitle: 'ꦱꦼꦠꦺꦭꦤ꧀ ꦕꦼꦥꦼꦠ꧀ (1 ꦩꦼꦤꦶꦠ꧀):',
  installStep1:
    '1. ꦧꦶꦏꦏ꧀ Google Sheet ꦮꦁꦱꦸꦭꦤ꧀ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀ > ꦩꦺꦤꦸ <strong>Extensions (ꦲꦺꦏ꧀ꦱ꧀ꦠꦺꦤ꧀ꦱꦶ)</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. ꦠꦼꦩ꧀ꦥꦼꦭꦏꦼꦤ꧀ ꦏꦺꦴꦢꦺ ꦲꦶꦁ ꦔꦶꦁꦒꦶꦭ꧀ > ꦱꦶꦩ꧀ꦥꦼꦤ꧀꧉',
  installStep3:
    '3. ꦲꦶꦁ ꦩꦺꦤꦸ ꦏꦶꦮ ꦏ꧀ꦭꦶꦏ꧀ <strong>Triggers (ꦥꦼꦩꦶꦕꦸ)</strong> > Add Trigger > ꦥꦶꦭꦶꦃ ꦗꦶꦤꦶꦱ꧀ ꦲꦕꦫ: <em>On form submit</em>.',

  // Sync history
  recentSyncTitle: 'ꦫꦶꦮꦪꦠ꧀ ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦥꦭꦶꦁ ꦲꦚꦂ',
  logCount: '{count} ꦕꦛꦼꦠꦤ꧀',
  logsPermissionDenied: 'ꦲꦏ꧀ꦱꦺꦱ꧀ ꦝꦠꦼꦁ ꦭꦺꦴꦒ꧀ ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦢꦶꦥꦸꦤ꧀ꦠꦺꦴꦭꦏ꧀꧉ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ꦔꦁꦒꦺꦴ ꦲꦏꦸꦤ꧀ Google ꦲꦢ꧀ꦩꦶꦤ꧀꧉',
  logsLoadFailed: 'ꦫꦶꦮꦪꦠ꧀ ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦤꦼꦩꦺꦴꦠ꧀꧉ ꦥꦿꦶꦏ꧀ꦱ ꦱꦩ꧀ꦧꦸꦔꦤ꧀ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀꧈ ꦭꦗꦼꦁ ꦲꦼꦩꦺꦴꦠ꧀ ꦲꦸꦭꦁ ꦏꦕꦤꦶꦥꦸꦤ꧀꧉',
  logsEmpty: 'ꦢꦺꦫꦺꦁ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦏꦼꦒꦶꦪꦠꦤ꧀ ꦱꦶꦤ꧀ꦏꦿꦺꦴꦤ꧀ ꦲꦶꦁꦏꦁ ꦏꦕꦛꦼꦠ꧀꧉',
  logImportedRows: 'ꦏꦲꦶꦩ꧀ꦥꦺꦴꦂ {count} ꦧꦫꦶꦱ꧀',
  logImportSummary:
    'ꦲꦶꦩ꧀ꦥꦺꦴꦂ ꦫꦩ꧀ꦥꦸꦁ: {added} ꦲꦁꦒꦺꦴꦠ ꦲꦼꦁꦒꦭ꧀꧈ {updated} ꦢꦶꦥꦸꦤꦚꦫꦶ꧈ {unchanged} ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦲꦺꦮꦃ꧈ {skipped} ꦒꦒꦭ꧀꧉',
  logAutoSummary: 'ꦲꦺꦴꦠꦺꦴꦩꦠꦶꦱ꧀: {added} ꦲꦼꦁꦒꦭ꧀꧈ {updated} ꦢꦶꦥꦸꦤꦚꦫꦶ꧉',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'ꦥꦔꦶꦩ꧀ꦥꦺꦴꦂ Google Sheets',

  // Errors
  adminAccountFallback: 'ꦲꦏꦸꦤ꧀ ꦲꦢ꧀ꦩꦶꦤ꧀',
  errorUnauthorized:
    'ꦲꦶꦢꦶꦤ꧀ Google Sheets ꦱꦩ꧀ꦥꦸꦤ꧀ ꦏꦢꦭꦸꦮꦂꦱ ꦲꦸꦠꦮꦶ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦮ꦳ꦭꦶꦢ꧀ ꦩꦭꦶꦃ꧉ ꦏ꧀ꦭꦶꦏ꧀ "ꦱꦩ꧀ꦧꦸꦔꦏꦼꦤ꧀ Google Sheets" ꦏꦁꦒꦺ ꦔꦚꦫꦶ꧈ ꦭꦗꦼꦁ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',
  errorScope:
    'ꦲꦏ꧀ꦱꦺꦱ꧀ ꦩꦲꦺꦴꦱ꧀ Google Sheets ꦢꦺꦫꦺꦁ ꦢꦶꦥꦸꦤ꧀ꦥꦫꦶꦔꦏꦼꦤ꧀꧉ ꦏ꧀ꦭꦶꦏ꧀ "ꦱꦩ꧀ꦧꦸꦔꦏꦼꦤ꧀ Google Sheets" ꦭꦤ꧀ ꦕꦼꦤ꧀ꦛꦁ ꦲꦶꦢꦶꦤ꧀ ꦏꦁꦒꦺ ꦤꦶꦔꦭꦶ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ Google Sheets ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀꧉',
  errorNoAccess:
    'ꦲꦏꦸꦤ꧀ Google ꦲꦶꦁꦏꦁ ꦱꦮꦼꦒ꧀ ꦩ꧀ꦭꦼꦧꦼꦠ꧀ ({account}) ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦒꦝꦃ ꦲꦏ꧀ꦱꦺꦱ꧀ ꦝꦠꦼꦁ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦥꦸꦤꦶꦏ꧈ ꦲꦸꦠꦮꦶ ID ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦊꦥꦠ꧀꧉ ꦧꦒꦺꦏꦏꦼꦤ꧀ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦝꦠꦼꦁ ꦲꦏꦸꦤ꧀ ꦲꦢ꧀ꦩꦶꦤ꧀ ꦥꦸꦤꦶꦏ (ꦲꦏ꧀ꦱꦺꦱ꧀ Viewer ꦱꦩ꧀ꦥꦸꦤ꧀ ꦕꦼꦏꦥ꧀)꧈ ꦲꦸꦠꦮꦶ ꦥꦿꦶꦏ꧀ꦱ ꦩꦭꦶꦃ URL/ID-ꦤꦶꦥꦸꦤ꧀꧉',
  errorUnsupportedFile:
    'ꦥ꦳ꦻꦭ꧀ ꦥꦸꦤꦶꦏ ꦱꦤꦺꦱ꧀ ꦥ꦳ꦻꦭ꧀ Google Sheets ꦲꦱ꧀ꦭꦶ (ꦠꦸꦭꦝ: Excel .xlsx ꦲꦶꦁꦏꦁ ꦢꦶꦥꦸꦤꦸꦁꦒꦃ)꧉ ꦧꦶꦏꦏ꧀ ꦥ꦳ꦻꦭ꧀ ꦥꦸꦤꦶꦏ꧈ ꦥꦶꦭꦶꦃ File > Save as Google Sheets, ꦭꦗꦼꦁ ꦲꦒꦼꦩ꧀ URL ꦥ꦳ꦻꦭ꧀ ꦲꦶꦁꦏꦁ ꦲꦼꦁꦒꦭ꧀꧉',
  errorRateLimit: 'ꦮꦠꦼꦱ꧀ ꦥꦚꦸꦮꦸꦤꦤ꧀ Google Sheets API ꦱꦩ꧀ꦥꦸꦤ꧀ ꦏꦒꦪꦸꦃ꧉ ꦲꦼꦤ꧀ꦠꦺꦴꦱꦶ ꦏꦶꦫꦁ ꦭꦁꦏꦸꦁ ꦱꦼꦠꦸꦁꦒꦭ꧀ ꦩꦼꦤꦶꦠ꧀꧈ ꦭꦗꦼꦁ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',
  errorNetwork: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦚꦩ꧀ꦧꦸꦁ ꦝꦠꦼꦁ Google Sheets. ꦥꦿꦶꦏ꧀ꦱ ꦱꦩ꧀ꦧꦸꦔꦤ꧀ ꦲꦶꦤ꧀ꦠꦼꦂꦤꦺꦠ꧀ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀꧈ ꦭꦗꦼꦁ ꦕꦺꦴꦧꦶ ꦩꦭꦶꦃ꧉',
  errorRejected: 'Google Sheets ꦤꦺꦴꦭꦏ꧀ ꦥꦚꦸꦮꦸꦤꦤ꧀: {detail}',
  errorInvalidInput:
    'URL ꦲꦸꦠꦮꦶ ID ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦊꦉꦱ꧀꧉ ꦠꦼꦩ꧀ꦥꦼꦭꦏꦼꦤ꧀ URL Google Sheets ꦗꦁꦏꦼꦥ꧀ (https://docs.google.com/spreadsheets/d/…/edit) ꦲꦸꦠꦮꦶ ꦤꦩꦸꦁ ID-ꦤꦶꦥꦸꦤ꧀꧉',
  errorEmptyInput: 'ꦊꦧꦼꦠꦏꦼꦤ꧀ URL ꦲꦸꦠꦮꦶ ID Google Sheets ꦫꦸꦩꦶꦪꦶꦤ꧀꧉',
  errorNotConnected: 'ꦲꦏ꧀ꦱꦺꦱ꧀ Google Sheets ꦢꦺꦫꦺꦁ ꦢꦶꦥꦸꦤ꧀ꦥꦫꦶꦔꦏꦼꦤ꧀꧉ ꦏ꧀ꦭꦶꦏ꧀ "ꦱꦩ꧀ꦧꦸꦔꦏꦼꦤ꧀ Google Sheets" ꦫꦸꦩꦶꦪꦶꦤ꧀꧉',
  errorEmptySheet: 'ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦥꦸꦤꦶꦏ ꦏꦺꦴꦱꦺꦴꦁ ꦲꦸꦠꦮꦶ ꦢꦺꦫꦺꦁ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦮꦁꦱꦸꦭꦤ꧀꧉',
  errorReadFailed: 'ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦤ꧀ꦮꦲꦺꦴꦱ꧀꧉',
  errorInspectFirst: 'ꦱꦩ꧀ꦧꦸꦔꦏꦼꦤ꧀ Google Sheets ꦭꦤ꧀ ꦥꦿꦶꦏ꧀ꦱ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦫꦸꦩꦶꦪꦶꦤ꧀ (ꦭꦁꦏꦃ 1).',
  errorNoRows: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦧꦫꦶꦱ꧀ ꦮꦁꦱꦸꦭꦤ꧀ ꦲꦶꦁꦏꦁ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦤꦶꦩ꧀ꦥꦺꦴꦂ꧉',
  errorNoValidRows: 'ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦧꦫꦶꦱ꧀ ꦮ꦳ꦭꦶꦢ꧀ ꦲꦶꦁꦏꦁ ꦏꦥꦁꦒꦶꦃ ꦏꦤ꧀ꦛꦶ ꦥꦼꦩꦺꦠꦲꦤ꧀ ꦏꦺꦴꦭꦺꦴꦩ꧀ ꦥꦸꦤꦶꦏ꧉',
  errorCheckFirst: 'ꦥꦿꦶꦏ꧀ꦱ ꦱ꧀ꦥꦿꦺꦢ꧀ꦱꦾꦶꦠ꧀ ꦫꦸꦩꦶꦪꦶꦤ꧀ ꦲꦶꦁ ꦭꦁꦏꦃ 1.',
};

export default sheets;
