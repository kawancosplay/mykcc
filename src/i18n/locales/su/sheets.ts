import type { LocaleNamespace } from '../../types';

const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Sasak Real-Time Google Sheets & Form',
  bridgeSubtitle: 'Transisi ti Google Form ka Firebase',
  pageTitle: 'Singkronisasi Database Spreadsheet & Google Form',
  pageDesc:
    'Impor spreadsheet anggota anu tos aya sareng hurungkeun singkronisasi real-time, supados unggal anggota énggal anu ngeusian Google Form salami mangsa transisi otomatis ditambihkeun ka Firebase.',
  connectSheets: 'Sambungkeun Google Sheets',
  renewAccess: 'Énggalkeun Aksés Google Sheets',
  connectionRequiredTitle: 'Peryogi Sambungan Google Sheets',
  connectionRequiredDesc:
    'Pikeun maca spreadsheet Google Form sacara langsung, pasihan MyKCC aksés maca Google Sheets kanggo akun Google admin anu nuju asup. Akun éta kedah gaduh aksés ka spreadsheet pendaftaran KawanCosplay.',
  accessRequestNotice:
    'Aksés dipénta kanggo akun anu nuju asup. MyKCC ngan ukur nyuhunkeun aksés maca Google Sheets, tanpa aksés Google Drive.',
  accessRequestNoticeWithEmail:
    'Aksés dipénta kanggo akun anu nuju asup ({email}). MyKCC ngan ukur nyuhunkeun aksés maca Google Sheets, tanpa aksés Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Spreadsheet Google Form',
  step1Desc: 'Témpélkeun URL atanapi ID spreadsheet waleran Google Form.',
  spreadsheetInputLabel: 'URL / ID Google Spreadsheet',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit atanapi ID',
  inspectButton: 'Pariksa',
  formatHint: 'Format: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID teu acan dikenal.',
  sheetTabLabel: 'Pilih Tab Lambaran',

  // Step 2: column mapping
  step2Title: 'Pamétaan Kolom Waleran',
  step2Desc: 'Kapendak {count} kolom dina Google Form anjeun',
  autoDetectedBadge: 'Kapendak Otomatis',
  columnFullName: 'Kolom Wasta Lengkep',
  columnCosname: 'Kolom Cosname / Sandiasma',
  columnEmail: 'Kolom Surélék',
  columnWhatsapp: 'Kolom WhatsApp / Nomer Telepon',
  columnWhatsapp2: 'Kolom WhatsApp Cadangan / No. WA 2',
  optionalTag: '(Opsional)',
  columnDiscord: 'Kolom Wasta Pangguna Discord',
  columnCity: 'Kolom Kota / Dumuk',
  columnRole: 'Kolom Peran / Minat (Cosplayer/Pangrajin/jsb.)',
  columnFandom: 'Kolom Fandom / Karakter Karesep',
  columnTimestamp: 'Kolom Timestamp Waleran',
  optionChooseColumn: '-- Pilih Kolom --',
  optionNone: '-- Teu Aya / Kosong --',
  optionDefaultIndonesia: '-- Baku (Indonésia) --',
  optionDefaultCosplayer: '-- Baku (Cosplayer) --',
  optionDefaultAnimeGames: '-- Baku (Anime & Game) --',
  optionCurrentTime: '-- Waktos Ayeuna --',
  previewTitle: 'Tilikan Data Spreadsheet (Wasta, WhatsApp & Wasta Pangguna Discord):',
  previewColName: 'Wasta / Cosname',
  previewColDiscord: 'Wasta Pangguna Discord',
  previewColCity: 'Kota',
  previewPhone2: 'No. 2: {phone}',

  // Import
  importing: 'Nuju ngimpor ka Firestore ({completed}/{total})...',
  importAllButton: 'Impor Sadaya Waleran Spreadsheet (kalebet Discord & WA) ka Firebase',
  importResult:
    'Impor réngsé: <strong>{added} anggota énggal</strong>, {updated} diénggalkeun, {unchanged} teu robih, {skipped} gagal.',
  errorTip: 'Tip: anjeun ogé tiasa nempélkeun URL spreadsheet Google Form kana kolom di luhur teras klik "Pariksa".',
  grantAccessButton: 'Pasihan Aksés / Sambungkeun Google',

  // Real-time poller
  pollerTitle: 'Poller Transisi Real-Time',
  pollerActive: 'Aktif (Live)',
  pollerInactive: 'Teu Aktif',
  pollerDesc:
    'Salami ieu hurung, aplikasi mariksa spreadsheet unggal {seconds} detik. Unggal waleran Google Form énggal otomatis ditambihkeun ka Firebase sareng langsung kénging KCC ID.',
  pollIntervalLabel: 'Selang Pamariksaan:',
  pollEverySeconds: 'Unggal {seconds} detik',
  pollEverySecondsOptimal: 'Unggal {seconds} detik (Optimal)',
  lastPollLabel: 'Pamariksaan Pamungkas:',
  lastPollNever: 'Teu acan dijalankeun',
  stopPoller: 'Eureunkeun Live Poller',
  startAutoSync: 'Mimitian Singkronisasi Otomatis Real-Time',

  // Google Apps Script webhook
  webhookTitle: 'Webhook Google Apps Script',
  webhookDesc:
    'Hoyong waleran Google Form langsung dugi nalika tombol <em>Submit</em> dipencet, tanpa ngantosan selang polling? Pasang skrip ieu dina Google Sheet waleran anjeun:',
  scriptCommentInstall: 'Pasang di: Google Sheet waleran -> Extensions (Ekstensi) -> Apps Script',
  scriptCommentTrigger: 'Trigger (Pemicu): onFormSubmit -> On form submit (Nalika formulir dikintun)',
  scriptCommentResponseData: 'Maca data waleran formulir',
  copied: 'Katiron!',
  copyScript: 'Tiron Skrip',
  installStepsTitle: 'Pamasangan Gancang (1 Menit):',
  installStep1: '1. Buka Google Sheet waleran anjeun > ménu <strong>Extensions (Ekstensi)</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. Témpélkeun kode di luhur > Simpen.',
  installStep3:
    '3. Dina ménu kénca klik <strong>Triggers (Pemicu)</strong> > Add Trigger (Tambihkeun Pemicu) > Pilih jinis acara: <em>On form submit (Nalika formulir dikintun)</em>.',

  // Sync history
  recentSyncTitle: 'Riwayat Singkronisasi Panganyarna',
  logCount: '{count} Log',
  logsPermissionDenied: 'Aksés ka log singkronisasi ditolak. Asup nganggo akun Google admin.',
  logsLoadFailed: 'Riwayat singkronisasi teu tiasa dimuat. Pariksa sambungan anjeun, teras muat deui kacana.',
  logsEmpty: 'Teu acan aya kagiatan singkronisasi anu kacatet.',
  logImportedRows: 'Ngimpor {count} baris',
  logImportSummary:
    'Impor réngsé: {added} anggota énggal, {updated} diénggalkeun, {unchanged} teu robih, {skipped} gagal.',
  logAutoSummary: 'Otomatis: {added} énggal, {updated} diénggalkeun.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Pangimpor Google Sheets',

  // Errors
  adminAccountFallback: 'akun admin',
  errorUnauthorized:
    'Idin Google Sheets parantos kadaluwarsa atanapi teu valid deui. Klik "Sambungkeun Google Sheets" pikeun ngaénggalkeunana, teras cobian deui.',
  errorScope:
    'Aksés maca Google Sheets teu acan dipasihkeun. Klik "Sambungkeun Google Sheets" teras centang idin pikeun ningali spreadsheet Google Sheets anjeun.',
  errorNoAccess:
    'Akun Google anu nuju asup ({account}) teu gaduh aksés ka spreadsheet ieu, atanapi ID spreadsheet-na lepat. Bagikeun spreadsheet ka akun admin éta (aksés Viewer tos cekap), atanapi pariksa deui URL/ID-na.',
  errorUnsupportedFile:
    'File ieu sanés file Google Sheets asli (conto: file Excel .xlsx anu diunggah). Buka filena, pilih File > Simpen salaku Google Sheets, teras anggo URL file énggalna.',
  errorRateLimit: 'Wates paménta Google Sheets API parantos kahontal. Antosan kirang langkung samenit, teras cobian deui.',
  errorNetwork: 'Teu tiasa nyambung ka Google Sheets. Pariksa sambungan internét anjeun, teras cobian deui.',
  errorRejected: 'Google Sheets nolak paménta: {detail}',
  errorInvalidInput:
    'URL atanapi ID spreadsheet teu valid. Témpélkeun URL Google Sheets lengkep (https://docs.google.com/spreadsheets/d/…/edit) atanapi ID-na waé.',
  errorEmptyInput: 'Lebetkeun URL atanapi ID Google Sheets heula.',
  errorNotConnected: 'Aksés Google Sheets teu acan dipasihkeun. Klik "Sambungkeun Google Sheets" heula.',
  errorEmptySheet: 'Spreadsheet ieu kosong atanapi teu acan gaduh waleran.',
  errorReadFailed: 'Spreadsheet teu tiasa dibaca.',
  errorInspectFirst: 'Sambungkeun Google Sheets teras pariksa spreadsheet heula (Léngkah 1).',
  errorNoRows: 'Teu aya baris waleran anu kedah diimpor.',
  errorNoValidRows: 'Teu aya baris valid anu kapendak nganggo pamétaan kolom ieu.',
  errorCheckFirst: 'Pariksa spreadsheet heula dina Léngkah 1.',
};

export default sheets;
