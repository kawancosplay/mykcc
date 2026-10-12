import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Kreteg Langsung Google Sheets & Form',
  bridgeSubtitle: 'Transisi Google Form dhateng Firebase',
  pageTitle: 'Sinkron Database Spreadsheet & Google Form',
  pageDesc:
    'Impor spreadsheet anggota ingkang sampun wonten lan aktifaken sinkron langsung, supados saben anggota enggal ingkang ngisi Google Form salebetipun transisi otomatis katambahaken dhateng Firebase.',
  connectSheets: 'Sambungaken Google Sheets',
  renewAccess: 'Anyari Akses Google Sheets',
  connectionRequiredTitle: 'Mbetahaken Sambungan Google Sheets',
  connectionRequiredDesc:
    'Kangge maos spreadsheet Google Form kanthi langsung, paringi MyKCC akses maos Google Sheets kangge akun Google admin ingkang saweg mlebet. Akun punika kedah gadhah akses dhateng spreadsheet pandhaftaran KawanCosplay.',
  accessRequestNotice:
    'Akses dipunsuwun kangge akun ingkang saweg mlebet. MyKCC namung nyuwun akses maos Google Sheets, tanpa akses Google Drive.',
  accessRequestNoticeWithEmail:
    'Akses dipunsuwun kangge akun ingkang saweg mlebet ({email}). MyKCC namung nyuwun akses maos Google Sheets, tanpa akses Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Spreadsheet Google Form',
  step1Desc: 'Tempelaken URL utawi ID spreadsheet wangsulan Google Form.',
  spreadsheetInputLabel: 'URL / ID Google Spreadsheet',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit utawi ID',
  inspectButton: 'Priksa',
  formatHint: 'Wangun: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID dereng saged dipuntepangi.',
  sheetTabLabel: 'Pilih Tab Sheet',

  // Step 2: column mapping
  step2Title: 'Pemetaan Kolom Wangsulan',
  step2Desc: 'Kadeteksi {count} kolom ing Google Form panjenengan',
  autoDetectedBadge: 'Kadeteksi Otomatis',
  columnFullName: 'Kolom Jeneng Jangkep',
  columnCosname: 'Kolom Cosname / Samaran',
  columnEmail: 'Kolom Email',
  columnWhatsapp: 'Kolom Nomer WhatsApp / Telpon',
  columnWhatsapp2: 'Kolom WhatsApp Cadhangan / No. WA 2',
  optionalTag: '(Opsional)',
  columnDiscord: 'Kolom Username Discord',
  columnCity: 'Kolom Kutha / Domisili',
  columnRole: 'Kolom Peran / Minat (Cosplayer/Pangrajin/lsp.)',
  columnFandom: 'Kolom Fandom / Karakter Favorit',
  columnTimestamp: 'Kolom Timestamp Wangsulan',
  optionChooseColumn: '-- Pilih Kolom --',
  optionNone: '-- Mboten Wonten / Kosong --',
  optionDefaultIndonesia: '-- Gawan (Indonesia) --',
  optionDefaultCosplayer: '-- Gawan (Cosplayer) --',
  optionDefaultAnimeGames: '-- Gawan (Anime & Game) --',
  optionCurrentTime: '-- Wekdal Sapunika --',
  previewTitle: 'Tilikan Data Spreadsheet (Jeneng, WhatsApp & Username Discord):',
  previewColName: 'Jeneng / Cosname',
  previewColDiscord: 'Username Discord',
  previewColCity: 'Kutha',
  previewPhone2: 'No. 2: {phone}',

  // Import
  importing: 'Ngimpor dhateng Firestore ({completed}/{total})...',
  importAllButton: 'Impor Sedaya Wangsulan Spreadsheet (kalebet Discord & WA) dhateng Firebase',
  importResult:
    'Impor rampung: <strong>{added} anggota enggal</strong>, {updated} dipunanyari, {unchanged} mboten ewah, {skipped} gagal.',
  errorTip:
    'Tips: panjenengan ugi saged nempelaken URL spreadsheet Google Form ing kolom ing nginggil lajeng klik "Priksa".',
  grantAccessButton: 'Paringi Akses / Sambungaken Google',

  // Real-time poller
  pollerTitle: 'Pamantau Transisi Langsung',
  pollerActive: 'Aktif (Langsung)',
  pollerInactive: 'Mboten Aktif',
  pollerDesc:
    'Nalika punika aktif, aplikasi mriksa spreadsheet saben {seconds} detik. Saben wangsulan Google Form enggal otomatis katambahaken dhateng Firebase lan langsung pikantuk KCC ID.',
  pollIntervalLabel: 'Jarak Pamriksan:',
  pollEverySeconds: 'Saben {seconds} detik',
  pollEverySecondsOptimal: 'Saben {seconds} detik (Optimal)',
  lastPollLabel: 'Pamriksan Pungkasan:',
  lastPollNever: 'Dereng dipunlampahaken',
  stopPoller: 'Mandhegaken Pamantau Langsung',
  startAutoSync: 'Wiwiti Sinkron Otomatis Langsung',

  // Google Apps Script webhook
  webhookTitle: 'Webhook Google Apps Script',
  webhookDesc:
    'Ngersakaken wangsulan Google Form dumugi sanalika nalika tombol <em>Submit</em> dipunpencet, tanpa ngentosi interval polling? Pasang script punika ing Google Sheet wangsulan panjenengan:',
  scriptCommentInstall: 'Pasang ing: Google Sheet wangsulan -> Extensions (Ekstensi) -> Apps Script',
  scriptCommentTrigger: 'Pemicu (Trigger): onFormSubmit -> On form submit (Nalika formulir dipunkirim)',
  scriptCommentResponseData: 'Waos data wangsulan formulir',
  copied: 'Sampun Dipunsalin!',
  copyScript: 'Salin Script',
  installStepsTitle: 'Setelan Cepet (1 Menit):',
  installStep1:
    '1. Bikak Google Sheet wangsulan panjenengan > menu <strong>Extensions (Ekstensi)</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. Tempelaken kode ing nginggil > Simpen.',
  installStep3:
    '3. Ing menu kiwa klik <strong>Triggers (Pemicu)</strong> > Add Trigger > Pilih jinis acara: <em>On form submit</em>.',

  // Sync history
  recentSyncTitle: 'Riwayat Sinkron Paling Anyar',
  logCount: '{count} Cathetan',
  logsPermissionDenied: 'Akses dhateng log sinkron dipuntolak. Mlebet nganggo akun Google admin.',
  logsLoadFailed: 'Riwayat sinkron mboten saged dipunemot. Priksa sambungan panjenengan, lajeng emot ulang kacanipun.',
  logsEmpty: 'Dereng wonten kegiatan sinkron ingkang kacathet.',
  logImportedRows: 'Kaimpor {count} baris',
  logImportSummary:
    'Impor rampung: {added} anggota enggal, {updated} dipunanyari, {unchanged} mboten ewah, {skipped} gagal.',
  logAutoSummary: 'Otomatis: {added} enggal, {updated} dipunanyari.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Pangimpor Google Sheets',

  // Errors
  adminAccountFallback: 'akun admin',
  errorUnauthorized:
    'Idin Google Sheets sampun kadaluwarsa utawi mboten valid malih. Klik "Sambungaken Google Sheets" kangge nganyari, lajeng cobi malih.',
  errorScope:
    'Akses maos Google Sheets dereng dipunparingaken. Klik "Sambungaken Google Sheets" lan centhang idin kangge ningali spreadsheet Google Sheets panjenengan.',
  errorNoAccess:
    'Akun Google ingkang saweg mlebet ({account}) mboten gadhah akses dhateng spreadsheet punika, utawi ID spreadsheet lepat. Bagekaken spreadsheet dhateng akun admin punika (akses Viewer sampun cekap), utawi priksa malih URL/ID-nipun.',
  errorUnsupportedFile:
    'File punika sanes file Google Sheets asli (tuladha: Excel .xlsx ingkang dipununggah). Bikak file punika, pilih File > Save as Google Sheets, lajeng agem URL file ingkang enggal.',
  errorRateLimit: 'Wates panyuwunan Google Sheets API sampun kagayuh. Entosi kirang langkung setunggal menit, lajeng cobi malih.',
  errorNetwork: 'Mboten saged nyambung dhateng Google Sheets. Priksa sambungan internet panjenengan, lajeng cobi malih.',
  errorRejected: 'Google Sheets nolak panyuwunan: {detail}',
  errorInvalidInput:
    'URL utawi ID spreadsheet mboten leres. Tempelaken URL Google Sheets jangkep (https://docs.google.com/spreadsheets/d/…/edit) utawi namung ID-nipun.',
  errorEmptyInput: 'Lebetaken URL utawi ID Google Sheets rumiyin.',
  errorNotConnected: 'Akses Google Sheets dereng dipunparingaken. Klik "Sambungaken Google Sheets" rumiyin.',
  errorEmptySheet: 'Spreadsheet punika kosong utawi dereng wonten wangsulan.',
  errorReadFailed: 'Spreadsheet mboten saged dipunwaos.',
  errorInspectFirst: 'Sambungaken Google Sheets lan priksa spreadsheet rumiyin (Langkah 1).',
  errorNoRows: 'Mboten wonten baris wangsulan ingkang saged dipunimpor.',
  errorNoValidRows: 'Mboten wonten baris valid ingkang kapanggih kanthi pemetaan kolom punika.',
  errorCheckFirst: 'Priksa spreadsheet rumiyin ing Langkah 1.',
};

export default sheets;
