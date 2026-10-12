import type { LocaleNamespace } from '../../types';

const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Jambatan Masa Nyata Google Sheets & Form',
  bridgeSubtitle: 'Peralihan Google Form ke Firebase',
  pageTitle: 'Penyegerakan Pangkalan Data Hamparan & Google Form',
  pageDesc:
    'Import hamparan sedia ada yang mengandungi ahli semasa dan hidupkan penyegerakan masa nyata, supaya setiap ahli baharu yang mengisi Google Form sepanjang tempoh peralihan ditambah ke Firebase secara automatik.',
  connectSheets: 'Sambung Google Sheets',
  renewAccess: 'Perbaharui Akses Google Sheets',
  connectionRequiredTitle: 'Sambungan Google Sheets Diperlukan',
  connectionRequiredDesc:
    'Untuk membaca hamparan Google Form secara terus, berikan MyKCC akses baca ke Google Sheets bagi akaun Google admin yang sedang log masuk. Akaun tersebut mesti mempunyai akses ke hamparan pendaftaran KawanCosplay.',
  accessRequestNotice:
    'Akses dipohon untuk akaun yang sedang log masuk. MyKCC hanya meminta akses baca ke Google Sheets, tanpa akses Google Drive.',
  accessRequestNoticeWithEmail:
    'Akses dipohon untuk akaun yang sedang log masuk ({email}). MyKCC hanya meminta akses baca ke Google Sheets, tanpa akses Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Hamparan Google Form',
  step1Desc: 'Tampal URL atau ID hamparan respons Google Form.',
  spreadsheetInputLabel: 'URL / ID Hamparan Google',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit atau ID',
  inspectButton: 'Semak',
  formatHint: 'Format URL: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID belum dikenal pasti.',
  sheetTabLabel: 'Pilih Tab Helaian',

  // Step 2: column mapping
  step2Title: 'Pemetaan Lajur Respons',
  step2Desc: 'Dikesan {count} lajur dalam Google Form anda',
  autoDetectedBadge: 'Dikesan Secara Automatik',
  columnFullName: 'Lajur Nama Penuh',
  columnCosname: 'Lajur Cosname / Nama Samaran',
  columnEmail: 'Lajur Emel',
  columnWhatsapp: 'Lajur WhatsApp / Nombor Telefon',
  columnWhatsapp2: 'Lajur WhatsApp Simpanan / No. WA 2',
  optionalTag: '(Pilihan)',
  columnDiscord: 'Lajur Nama Pengguna Discord',
  columnCity: 'Lajur Bandar / Tempat Tinggal',
  columnRole: 'Lajur Peranan / Minat (Cosplayer/Pengraf/dll.)',
  columnFandom: 'Lajur Fandom / Watak Kegemaran',
  columnTimestamp: 'Lajur Cap Masa Respons',
  optionChooseColumn: '-- Pilih Lajur --',
  optionNone: '-- Tiada / Kosong --',
  optionDefaultIndonesia: '-- Lalai (Indonesia) --',
  optionDefaultCosplayer: '-- Lalai (Cosplayer) --',
  optionDefaultAnimeGames: '-- Lalai (Anime & Permainan) --',
  optionCurrentTime: '-- Masa Semasa --',
  previewTitle: 'Pratonton Data Hamparan (Nama, WhatsApp & Nama Pengguna Discord):',
  previewColName: 'Nama / Cosname',
  previewColDiscord: 'Nama Pengguna Discord',
  previewColCity: 'Bandar',
  previewPhone2: 'No. 2: {phone}',

  // Import
  importing: 'Mengimport ke Firestore ({completed}/{total})...',
  importAllButton: 'Import Semua Respons Hamparan (termasuk Discord & WA) ke Firebase',
  importResult:
    'Import selesai: <strong>{added} ahli baharu</strong>, {updated} dikemas kini, {unchanged} tidak berubah, {skipped} gagal.',
  errorTip: 'Petua: anda juga boleh menampal URL hamparan Google Form ke dalam ruangan input di atas dan klik "Semak".',
  grantAccessButton: 'Beri Akses / Sambung Google',

  // Real-time poller
  pollerTitle: 'Peninjau Peralihan Masa Nyata',
  pollerActive: 'Aktif (Langsung)',
  pollerInactive: 'Tidak Aktif',
  pollerDesc:
    'Semasa ciri ini dihidupkan, aplikasi menyemak hamparan setiap {seconds} saat. Setiap respons Google Form baharu ditambah ke Firebase secara automatik dan terus menerima KCC ID.',
  pollIntervalLabel: 'Selang Semakan:',
  pollEverySeconds: 'Setiap {seconds} saat',
  pollEverySecondsOptimal: 'Setiap {seconds} saat (Optimum)',
  lastPollLabel: 'Semakan Terakhir:',
  lastPollNever: 'Belum dijalankan',
  stopPoller: 'Hentikan Peninjau Langsung',
  startAutoSync: 'Mulakan Penyegerakan Automatik Masa Nyata',

  // Google Apps Script webhook
  webhookTitle: 'Webhook Google Apps Script',
  webhookDesc:
    'Mahu respons Google Form tiba serta-merta sebaik sahaja butang <em>Submit</em> ditekan, tanpa menunggu selang tinjauan? Pasang skrip ini dalam Google Sheet respons anda:',
  scriptCommentInstall: 'Pasang di: Google Sheet respons -> Sambungan -> Apps Script',
  scriptCommentTrigger: 'Pencetus: onFormSubmit -> Semasa penghantaran borang',
  scriptCommentResponseData: 'Baca data respons borang',
  copied: 'Disalin!',
  copyScript: 'Salin Skrip',
  installStepsTitle: 'Persediaan Pantas (1 Minit):',
  installStep1: '1. Buka Google Sheet respons anda > menu <strong>Sambungan</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. Tampal kod di atas > Simpan.',
  installStep3:
    '3. Di menu kiri, klik <strong>Pencetus</strong> > Tambah Pencetus > Pilih jenis peristiwa: <em>Semasa penghantaran borang</em>.',

  // Sync history
  recentSyncTitle: 'Sejarah Penyegerakan Terkini',
  logCount: '{count} Log',
  logsPermissionDenied: 'Akses ke log penyegerakan ditolak. Log masuk dengan akaun Google admin.',
  logsLoadFailed: 'Tidak dapat memuatkan sejarah penyegerakan. Semak sambungan anda, kemudian muat semula halaman.',
  logsEmpty: 'Belum ada aktiviti penyegerakan yang direkodkan.',
  logImportedRows: '{count} baris diimport',
  logImportSummary:
    'Import selesai: {added} ahli baharu, {updated} dikemas kini, {unchanged} tidak berubah, {skipped} gagal.',
  logAutoSummary: 'Automatik: {added} baharu, {updated} dikemas kini.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Pengimport Google Sheets',

  // Errors
  adminAccountFallback: 'akaun admin',
  errorUnauthorized:
    'Kebenaran Google Sheets telah tamat tempoh atau tidak lagi sah. Klik "Sambung Google Sheets" untuk memperbaharuinya, kemudian cuba lagi.',
  errorScope:
    'Akses baca ke Google Sheets tidak diberikan. Klik "Sambung Google Sheets" dan tandakan kebenaran untuk melihat hamparan Google Sheets anda.',
  errorNoAccess:
    'Akaun Google yang sedang log masuk ({account}) tiada akses ke hamparan ini, atau ID hamparan salah. Kongsi hamparan dengan akaun admin tersebut (akses Pemapar sudah memadai), atau semak semula URL/ID.',
  errorUnsupportedFile:
    'Fail ini bukan fail Google Sheets asli (cth. fail Excel .xlsx yang dimuat naik). Buka fail itu, pilih Fail > Simpan sebagai Google Sheets, kemudian gunakan URL fail baharu tersebut.',
  errorRateLimit: 'Had permintaan Google Sheets API telah dicapai. Tunggu kira-kira seminit, kemudian cuba lagi.',
  errorNetwork: 'Tidak dapat menghubungi Google Sheets. Semak sambungan internet anda, kemudian cuba lagi.',
  errorRejected: 'Google Sheets menolak permintaan: {detail}',
  errorInvalidInput:
    'URL atau ID hamparan tidak sah. Tampal URL penuh Google Sheets (https://docs.google.com/spreadsheets/d/…/edit) atau ID-nya sahaja.',
  errorEmptyInput: 'Masukkan URL atau ID Google Sheets terlebih dahulu.',
  errorNotConnected: 'Akses Google Sheets belum diberikan. Klik "Sambung Google Sheets" terlebih dahulu.',
  errorEmptySheet: 'Hamparan ini kosong atau belum mempunyai respons.',
  errorReadFailed: 'Tidak dapat membaca hamparan.',
  errorInspectFirst: 'Sambung Google Sheets dan semak hamparan terlebih dahulu (Langkah 1).',
  errorNoRows: 'Tiada baris respons untuk diimport.',
  errorNoValidRows: 'Tiada baris sah ditemui dengan pemetaan lajur ini.',
  errorCheckFirst: 'Semak hamparan terlebih dahulu dalam Langkah 1.',
};

export default sheets;
