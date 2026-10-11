import type { LocaleNamespace } from '../../types';

const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Jembatan Real-Time Google Sheets & Form',
  bridgeSubtitle: 'Transisi Google Form ke Firebase',
  pageTitle: 'Sinkronisasi Database Spreadsheet & Google Form',
  pageDesc:
    'Impor database spreadsheet anggota lama yang sudah ada dan aktifkan sinkronisasi real-time sehingga setiap kali ada anggota baru mengisi Google Form selama masa transisi, data otomatis masuk ke Firebase.',
  connectSheets: 'Hubungkan Google Sheets',
  renewAccess: 'Perbarui Izin Google Sheets',
  connectionRequiredTitle: 'Koneksi Google Sheets Diperlukan',
  connectionRequiredDesc:
    'Untuk membaca spreadsheet Google Form secara langsung, beri MyKCC izin baca Google Sheets untuk akun Google admin yang sedang masuk. Akun tersebut harus memiliki akses ke spreadsheet pendaftaran KawanCosplay.',
  accessRequestNotice:
    'Izin diminta untuk akun yang sedang masuk. MyKCC hanya meminta akses baca Google Sheets, tanpa akses Google Drive.',
  accessRequestNoticeWithEmail:
    'Izin diminta untuk akun yang sedang masuk ({email}). MyKCC hanya meminta akses baca Google Sheets, tanpa akses Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Spreadsheet Google Form',
  step1Desc: 'Tempel URL atau ID spreadsheet respon Google Form.',
  spreadsheetInputLabel: 'URL / ID Google Spreadsheet',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit atau ID',
  inspectButton: 'Periksa',
  formatHint: 'Format: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID belum dikenali.',
  sheetTabLabel: 'Pilih Tab Lembar Kerja (Sheet Tab)',

  // Step 2: column mapping
  step2Title: 'Pemetaan Kolom Respon (Mapping)',
  step2Desc: 'Sistem telah mendeteksi {count} kolom dari form Google kamu',
  autoDetectedBadge: 'Terdeteksi Otomatis',
  columnFullName: 'Kolom Nama Lengkap',
  columnCosname: 'Kolom Cosname / Alias',
  columnEmail: 'Kolom Email',
  columnWhatsapp: 'Kolom WhatsApp / No HP',
  columnWhatsapp2: 'Kolom WhatsApp Cadangan / No WA 2',
  optionalTag: '(Opsional)',
  columnDiscord: 'Kolom Username Discord',
  columnCity: 'Kolom Kota / Domisili',
  columnRole: 'Kolom Peran / Minat (Cosplayer/Crafter/dll)',
  columnFandom: 'Kolom Fandom / Karakter Favorit',
  columnTimestamp: 'Kolom Timestamp Respon',
  optionChooseColumn: '-- Pilih Kolom --',
  optionNone: '-- Tidak Ada / Kosong --',
  optionDefaultIndonesia: '-- Default (Indonesia) --',
  optionDefaultCosplayer: '-- Default (Cosplayer) --',
  optionDefaultAnimeGames: '-- Default (Anime & Games) --',
  optionCurrentTime: '-- Waktu Saat Ini --',
  previewTitle: 'Pratinjau Data Spreadsheet (Nama, WhatsApp & Discord Username):',
  previewColName: 'Nama / Cosname',
  previewColDiscord: 'Username Discord',
  previewColCity: 'Domisili',
  previewPhone2: 'No 2: {phone}',

  // Import
  importing: 'Mengimpor ke Firestore ({completed}/{total})...',
  importAllButton: 'Impor Seluruh Respon Spreadsheet (Termasuk Discord & WA) ke Firebase',
  importResult:
    'Impor selesai: <strong>{added} anggota baru</strong>, {updated} diperbarui, {unchanged} tidak berubah, {skipped} gagal.',
  errorTip:
    'Tips: Anda juga bisa langsung menempelkan URL Spreadsheet Google Form di kolom input atas lalu klik "Periksa".',
  grantAccessButton: 'Beri Izin / Hubungkan Google',

  // Real-time poller
  pollerTitle: 'Poller Transisi Real-Time',
  pollerActive: 'Aktif (Live)',
  pollerInactive: 'Nonaktif',
  pollerDesc:
    'Ketika fitur ini aktif, aplikasi akan memeriksa spreadsheet setiap {seconds} detik. Setiap ada respon Google Form baru yang masuk, anggota otomatis ditambahkan ke Firebase dan KCC ID langsung diterbitkan.',
  pollIntervalLabel: 'Interval Pemeriksaan:',
  pollEverySeconds: 'Setiap {seconds} detik',
  pollEverySecondsOptimal: 'Setiap {seconds} detik (Optimal)',
  lastPollLabel: 'Pemeriksaan Terakhir:',
  lastPollNever: 'Belum dijalankan',
  stopPoller: 'Hentikan Live Poller',
  startAutoSync: 'Mulai Real-Time Auto Sync',

  // Google Apps Script webhook
  webhookTitle: 'Webhook Google Apps Script',
  webhookDesc:
    'Ingin respon Google Form langsung terkirim seketika saat tombol <em>Submit</em> ditekan tanpa perlu menunggu interval polling? Pasang script ini di Google Sheet responmu:',
  scriptCommentInstall: 'Pasang di: Google Sheet Tanggapan -> Ekstensi -> Apps Script',
  scriptCommentTrigger: 'Pemicu (Trigger): onFormSubmit -> Saat Mengirim Formulir',
  scriptCommentResponseData: 'Ambil data respon form',
  copied: 'Tersalin!',
  copyScript: 'Salin Script',
  installStepsTitle: 'Langkah Pasang Cepat (1 Menit):',
  installStep1: '1. Buka Google Sheet responmu > Menu <strong>Ekstensi</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. Paste kode di atas > Simpan.',
  installStep3:
    '3. Di menu kiri klik <strong>Pemicu (Triggers)</strong> > Tambah Pemicu > Pilih acara: <em>Saat mengirim formulir</em>.',

  // Sync history
  recentSyncTitle: 'Riwayat Sinkronisasi Terbaru',
  logCount: '{count} Log',
  logsPermissionDenied: 'Akses log sinkronisasi ditolak — masuk dengan akun Google admin.',
  logsLoadFailed: 'Gagal memuat riwayat sinkronisasi. Periksa koneksi lalu muat ulang halaman.',
  logsEmpty: 'Belum ada aktivitas sinkronisasi yang tercatat.',
  logImportedRows: 'Impor {count} baris',
  logImportSummary:
    'Impor selesai: {added} anggota baru, {updated} diperbarui, {unchanged} tidak berubah, {skipped} gagal.',
  logAutoSummary: 'Otomatis: {added} baru, {updated} diperbarui.',
  logSourceImporter: 'Importer Google Sheets',

  // Errors
  adminAccountFallback: 'akun admin',
  errorUnauthorized:
    'Izin Google Sheets sudah kedaluwarsa atau tidak berlaku lagi. Klik "Hubungkan Google Sheets" untuk memperbaruinya, lalu coba lagi.',
  errorScope:
    'Izin baca Google Sheets belum diberikan. Klik "Hubungkan Google Sheets" dan centang izin untuk melihat spreadsheet Google Sheets Anda.',
  errorNoAccess:
    'Akun Google yang sedang masuk ({account}) tidak memiliki akses ke spreadsheet ini, atau ID spreadsheet salah. Bagikan (Share) spreadsheet ke akun admin tersebut — akses Viewer sudah cukup — atau periksa kembali URL/ID-nya.',
  errorUnsupportedFile:
    'File ini bukan Google Sheets asli (misalnya file Excel .xlsx yang diunggah). Buka file tersebut lalu pilih File > Simpan sebagai Google Spreadsheet, kemudian pakai URL file barunya.',
  errorRateLimit: 'Batas permintaan Google Sheets API tercapai. Tunggu sekitar satu menit lalu coba lagi.',
  errorNetwork: 'Tidak dapat menghubungi Google Sheets. Periksa koneksi internet Anda lalu coba lagi.',
  errorRejected: 'Google Sheets menolak permintaan: {detail}',
  errorInvalidInput:
    'URL atau ID spreadsheet tidak valid. Tempel URL lengkap Google Sheets (https://docs.google.com/spreadsheets/d/…/edit) atau ID-nya saja.',
  errorEmptyInput: 'Masukkan URL atau ID Google Sheets terlebih dahulu.',
  errorNotConnected: 'Izin Google Sheets belum diberikan. Klik "Hubungkan Google Sheets" terlebih dahulu.',
  errorEmptySheet: 'Spreadsheet ini masih kosong atau belum memiliki data respon.',
  errorReadFailed: 'Gagal mengakses data spreadsheet.',
  errorInspectFirst: 'Hubungkan Google Sheets lalu periksa spreadsheet terlebih dahulu (Langkah 1).',
  errorNoRows: 'Tidak ada baris data respon baru untuk diimpor.',
  errorNoValidRows: 'Tidak ada baris valid yang ditemukan berdasarkan pemetaan kolom.',
  errorCheckFirst: 'Periksa spreadsheet terlebih dahulu pada Langkah 1.',
};

export default sheets;
