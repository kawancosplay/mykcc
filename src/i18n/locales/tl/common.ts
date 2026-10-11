import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Komunitas Pop Culture, Cosplay & Wota Global (100% SFW)',
  navForm: 'Form Pendaftaran',
  navCard: 'KCC ID Saya',
  navGallery: 'Galeri Cosplay',
  navProfile: 'Profil Saya',
  navAdmin: 'Dashboard Admin',
  navLogin: 'Masuk / Daftar',
  navLogout: 'Keluar',
  userId16Label: 'KCC ID Resmi',
  officialBannerText: 'Situs resmi KawanCosplay',
  howYouKnow: 'Cara memastikan keaslian situs',
  aboutKccTitle: 'Media & Komunitas Internasional (100% SFW)',
  aboutKccDesc: 'KawanCosplay adalah wadah komunitas pop culture internasional yang mengedepankan konten 100% SFW (Safe For Work), ramah pemula, terbuka untuk cosplayer, wota, otaku, dan sahabat penggemar dari seluruh dunia.',
  secureSiteTitle: 'Situs aman menggunakan HTTPS & Ikon Gembok (🔒)',
  secureSiteDesc: 'Periksa bilah alamat browser Anda. Situs web resmi selalu menggunakan awalan https:// dan menampilkan ikon gembok terkunci (🔒).',
  officialContactTitle: 'Hotline WhatsApp Resmi & Email',
  officialContactDesc: 'Layanan resmi KawanCosplay hanya melalui WhatsApp Hotline +62 857-1103-2782 dan email cosplaysehat@gmail.com.',
  whatsappHotline: 'Hotline WhatsApp Resmi: +62 857-1103-2782',

  // Generic
  close: 'Tutup',
  optional: '(Opsional)',
  tryAgain: 'Coba Lagi',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'Memuat Aplikasi...',
  loadingAdmin: 'Memuat Admin...',

  // Navbar & app shell
  navFormShort: 'Pendaftaran',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Galeri',
  openMenu: 'Buka Menu',
  closeMenu: 'Tutup Menu',
  chooseLanguage: 'Pilih Bahasa ({language})',
  siteEditorShort: 'Editor Situs',
  themeEditor: 'Editor Tema',
  whatsappCommunity: 'Komunitas WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'Email: cosplaysehat@gmail.com',
  userFallbackName: 'Pengguna',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'Logo KawanCosplay',
  officialBadge: 'Resmi',

  // PWA install
  pwaInstall: 'Pasang Aplikasi',
  pwaIosTitle: 'Pasang di iPhone / iPad',
  pwaIosStep1: '1. Ketuk tombol {share} di toolbar Safari.',
  pwaIosShare: 'Bagikan',
  pwaIosStep2: '2. Gulir ke bawah lalu ketuk {addToHome}.',
  pwaIosAddToHome: 'Tambah ke Layar Utama',

  // Admin portal shell
  backToPublicSite: 'Kembali ke Situs Utama',
  adminPortalTitle: 'Portal Admin KawanCosplay',
  googleSignInBadge: 'Login Google',
  adminRestricted: 'Khusus Admin',
  lockAndExitAdminTitle: 'Kunci dan Keluar Portal Admin',
  lockExit: 'Kunci / Keluar',
  adminPortal: 'Portal Admin',
  adminPortalLinkTitle: 'Portal Khusus Admin KCC (Login Google Admin)',
  sheetsPopupClosed: 'Jendela otorisasi Google ditutup sebelum selesai.',
  sheetsWrongAccount: 'Pilih akun Google yang sama dengan akun admin yang sedang masuk.',
  sheetsPopupBlocked: 'Browser memblokir jendela login Google. Izinkan pop-up untuk situs ini, lalu coba lagi.',
  sheetsConnectFailed:
    'Gagal menghubungkan Google Sheets. Pastikan memilih akun admin (cosplaysehat@gmail.com) dan memberi izin baca Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: "MyKCC Member's ID Card",
  cardPageTitle: "Member's ID Card & KCC ID",
  cardPageDesc:
    'Demi menjaga privasi seluruh anggota, daftar lengkap anggota hanya dapat diakses oleh Admin di portal terpisah. Masukkan 16-Digit KCC ID Anda (contoh: 2026 1008 0715 3001) untuk menampilkan kartu identitas digital resmi Anda.',
  connectedProfile: 'Akun Anda Terhubung',
  openPass: 'Buka Kartu',
  lookupPlaceholder: 'KCC ID 16 digit, contoh: 2026 1008 0715 3001',
  lookupSubmit: "Cari & Tampilkan Member's ID Card",
  searching: 'Mencari...',
  passFound: 'Data Ditemukan!',
  notRegisteredYet: 'Belum terdaftar?',
  fillRegistrationForm: 'Isi Formulir Pendaftaran →',
  lookupInvalidId: 'Mohon masukkan 16 digit KCC ID Anda (angka saja, spasi boleh).',
  lookupNotFound: 'Kartu anggota dengan KCC ID tersebut tidak ditemukan. Periksa kembali 16 digit KCC ID Anda.',
  lookupPermissionDenied:
    'Pencarian kartu sedang tidak tersedia (akses database ditolak). Silakan coba lagi nanti atau hubungi Admin KCC.',

  // Profile tab states
  profileLoadFailed: 'Gagal memuat profil member.',
  checkConnectionRetry: 'Periksa koneksi internet Anda, lalu coba lagi.',
  preparingProfile: 'Menyiapkan Profil Member...',
  preparingProfileDesc: 'Menghubungkan akun ke identitas digital KCC Anda.',
  pleaseSignIn: 'Harap login',
  clickToSignIn: 'Klik di sini untuk login',

  // Footer
  footerPlatform: 'Platform Pop Culture Internasional 100% SFW.',
  copyright: '© 2026 MyKCC. Hak cipta dilindungi.',
  privacyShieldActive: 'Sistem Identitas 16 Digit & Perisai Privasi Aktif',
};

export default common;
