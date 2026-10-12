import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Komunitas Pop Culture, Cosplay & Wota Global (100% SFW)',
  navForm: 'Formulir Daptar',
  navCard: 'KTA Digital Abdi',
  navGallery: 'Galeri Cosplay',
  navProfile: 'Profil Abdi',
  navAdmin: 'Dashboard Admin',
  navLogin: 'Asup / Daptar',
  navLogout: 'Kaluar',
  userId16Label: 'KCC ID Resmi',
  officialBannerText: 'Loka wéb resmi KawanCosplay',
  howYouKnow: 'Cara mastikeun loka resmi',
  aboutKccTitle: 'Komunitas Internasional Resmi (100% SFW)',
  aboutKccDesc: 'KawanCosplay mangrupikeun komunitas pop culture kréatif internasional anu ngutamakeun cosplay séhat 100% SFW (Safe For Work), apresiasi idol sareng anime, tur kabuka kanggo anggota ti sakuliah dunya.',
  secureSiteTitle: 'Loka aman ngagunakeun HTTPS & ikon gembok (🔒)',
  secureSiteDesc: 'Pariksa bar alamat dina panyungsi anjeun. Loka wéb resmi salawasna dimimitian ku https:// sareng nembongkeun ikon gembok anu aman (🔒).',
  officialContactTitle: 'Hotline WhatsApp Resmi & Surélék',
  officialContactDesc: 'Patarosan resmi ngan ukur dilayanan ngalangkungan Hotline WhatsApp +62 857-1103-2782 sareng cosplaysehat@gmail.com.',
  whatsappHotline: 'Hotline WhatsApp Resmi: +62 857-1103-2782',

  // Generic
  close: 'Tutup',
  optional: '(Opsional)',
  tryAgain: 'Cobian Deui',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'Ngamuat Aplikasi...',
  loadingAdmin: 'Ngamuat Admin...',

  // Navbar & app shell
  navFormShort: 'Daptar',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Galeri',
  openMenu: 'Buka ménu',
  closeMenu: 'Tutup ménu',
  chooseLanguage: 'Pilih basa ({language})',
  siteEditorShort: 'Éditor Loka',
  themeEditor: 'Éditor Téma',
  whatsappCommunity: 'Komunitas WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'Surélék: cosplaysehat@gmail.com',
  userFallbackName: 'Pangguna',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'Logo KawanCosplay',
  officialBadge: 'Resmi',

  // PWA install
  pwaInstall: 'Pasang Aplikasi',
  pwaIosTitle: 'Pasang dina iPhone / iPad',
  pwaIosStep1: '1. Toél tombol {share} dina toolbar Safari.',
  pwaIosShare: 'Bagikeun',
  pwaIosStep2: '2. Gulirkeun ka handap, teras toél {addToHome}.',
  pwaIosAddToHome: 'Tambihkeun ka Layar Utama',

  // Admin portal shell
  backToPublicSite: 'Wangsul ka Loka Umum',
  adminPortalTitle: 'Portal Admin KawanCosplay',
  googleSignInBadge: 'Asup nganggo Google',
  adminRestricted: 'Husus Admin',
  lockAndExitAdminTitle: 'Konci teras kaluar ti portal admin',
  lockExit: 'Konci / Kaluar',
  adminPortal: 'Portal Admin',
  adminPortalLinkTitle: 'Portal husus admin KCC (asup nganggo Google admin)',
  sheetsPopupClosed: 'Jandéla otorisasi Google ditutup sateuacan réngsé.',
  sheetsWrongAccount: 'Pilih akun Google anu sami sareng akun admin anu nuju asup.',
  sheetsPopupBlocked: 'Panyungsi meungpeuk jandéla asup Google. Idinan pop-up kanggo loka ieu, teras cobian deui.',
  sheetsConnectFailed:
    'Google Sheets teu tiasa disambungkeun. Pilih akun admin (cosplaysehat@gmail.com) sareng idinan aksés maca Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'Kartu ID Anggota MyKCC',
  cardPageTitle: 'Kartu ID Anggota & KCC ID',
  cardPageDesc:
    'Pikeun ngajaga privasi sadaya anggota, daptar lengkep anggota ngan ukur tiasa diaksés di portal admin. Lebetkeun KCC ID 16-Digit anjeun (conto: 2026 1008 0715 3001) pikeun nembongkeun kartu digital resmi anjeun.',
  connectedProfile: 'Profil anu Kasambung',
  openPass: 'Buka Kartu',
  lookupPlaceholder: 'KCC ID 16-Digit, conto: 2026 1008 0715 3001',
  lookupSubmit: 'Milarian & Tingali Kartu ID Anggota',
  searching: 'Nuju milarian...',
  passFound: 'Kartu Kapendak!',
  notRegisteredYet: 'Teu acan kadaptar?',
  fillRegistrationForm: 'Eusian Formulir Daptar →',
  lookupInvalidId: 'Mangga lebetkeun KCC ID 16-digit anjeun (ngan ukur angka, kenging nganggo spasi).',
  lookupNotFound: 'Kartu ID Anggota kanggo KCC ID éta teu kapendak. Mangga pariksa deui 16 digitna.',
  lookupPermissionDenied:
    'Milarian kartu ayeuna nuju teu sayogi (aksés database ditolak). Mangga cobian deui engké atanapi hubungi admin KCC.',

  // Profile tab states
  profileLoadFailed: 'Profil anggota anjeun teu tiasa dimuat.',
  checkConnectionRetry: 'Pariksa sambungan internét anjeun, teras cobian deui.',
  preparingProfile: 'Nyiapkeun Profil Anggota...',
  preparingProfileDesc: 'Nyambungkeun akun ka idéntitas digital KCC anjeun.',
  pleaseSignIn: 'Mangga asup heula',
  clickToSignIn: 'Klik di dieu pikeun asup',

  // Footer
  footerPlatform: 'Platform Pop Culture Internasional 100% SFW.',
  copyright: '© 2026 MyKCC. Sadaya hak ditangtayungan.',
  privacyShieldActive: 'Sistem Idéntitas 16-Digit & Tameng Privasi Aktif',
};

export default common;
