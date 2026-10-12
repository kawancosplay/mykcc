import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Komunitas Pop Culture, Cosplay & Wota Global (100% SFW)',
  navForm: 'Formulir Ndhaftar',
  navCard: 'KTA Digital Kula',
  navGallery: 'Galeri Cosplay',
  navProfile: 'Profil Kula',
  navAdmin: 'Dashboard Admin',
  navLogin: 'Mlebu / Ndhaftar',
  navLogout: 'Metu',
  userId16Label: 'KCC ID Resmi',
  officialBannerText: 'Situs resmi KawanCosplay',
  howYouKnow: 'Carane mesthekake keaslian situs',
  aboutKccTitle: 'Komunitas Internasional Resmi (100% SFW)',
  aboutKccDesc:
    'KawanCosplay inggih punika komunitas kreatif pop culture internasional ingkang fokus dhateng cosplay, apresiasi idol, lan anime ingkang sehat lan 100% SFW (Safe For Work), saha kabuka kangge anggota saking sedaya negari.',
  secureSiteTitle: 'Situs aman nganggo HTTPS lan gembok (🔒)',
  secureSiteDesc:
    'Priksani kolom alamat ing browser panjenengan. Situs resmi tansah kawiwitan kaliyan https:// lan nampilaken lambang gembok (🔒).',
  officialContactTitle: 'Hotline WhatsApp Resmi & Email',
  officialContactDesc:
    'Pitakenan resmi namung dipunlayani lumantar Hotline WhatsApp +62 857-1103-2782 lan cosplaysehat@gmail.com.',
  whatsappHotline: 'Hotline WhatsApp Resmi: +62 857-1103-2782',

  // Generic
  close: 'Tutup',
  optional: '(Opsional)',
  tryAgain: 'Cobi Malih',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'Ngemot Aplikasi...',
  loadingAdmin: 'Ngemot Admin...',

  // Navbar & app shell
  navFormShort: 'Ndhaftar',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Galeri',
  openMenu: 'Bikak menu',
  closeMenu: 'Tutup menu',
  chooseLanguage: 'Pilih basa ({language})',
  siteEditorShort: 'Editor Situs',
  themeEditor: 'Editor Tema',
  whatsappCommunity: 'Komunitas WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'Email: cosplaysehat@gmail.com',
  userFallbackName: 'Panganggo',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'Logo KawanCosplay',
  officialBadge: 'Resmi',

  // PWA install
  pwaInstall: 'Pasang Aplikasi',
  pwaIosTitle: 'Pasang ing iPhone / iPad',
  pwaIosStep1: '1. Tutul tombol {share} wonten ing toolbar Safari.',
  pwaIosShare: 'Bagekaken',
  pwaIosStep2: '2. Gulung mangandhap lajeng tutul {addToHome}.',
  pwaIosAddToHome: 'Tambahaken dhateng Layar Utama',

  // Admin portal shell
  backToPublicSite: 'Wangsul dhateng Situs Umum',
  adminPortalTitle: 'Portal Admin KawanCosplay',
  googleSignInBadge: 'Mlebet nganggo Google',
  adminRestricted: 'Mligi Admin',
  lockAndExitAdminTitle: 'Kunci lan medal saking portal admin',
  lockExit: 'Kunci / Medal',
  adminPortal: 'Portal Admin',
  adminPortalLinkTitle: 'Portal mligi admin KCC (mlebet nganggo Google admin)',
  sheetsPopupClosed: 'Jendhela otorisasi Google katutup saderengipun rampung.',
  sheetsWrongAccount: 'Pilih akun Google ingkang sami kaliyan akun admin ingkang saweg mlebet.',
  sheetsPopupBlocked:
    'Browser ngalangi jendhela mlebet Google. Paringi idin pop-up kangge situs punika, lajeng cobi malih.',
  sheetsConnectFailed:
    'Mboten saged nyambungaken Google Sheets. Pilih akun admin (cosplaysehat@gmail.com) lan paringi idin maos Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'Kertu ID Anggota MyKCC',
  cardPageTitle: 'Kertu ID Anggota & KCC ID',
  cardPageDesc:
    'Kangge njagi privasi sedaya anggota, dhaptar jangkep anggota namung saged dipunbikak ing portal admin. Lebetaken KCC ID 16 digit panjenengan (tuladha: 2026 1008 0715 3001) kangge nampilaken kertu digital resmi panjenengan.',
  connectedProfile: 'Profil Kasambung',
  openPass: 'Bikak Kertu',
  lookupPlaceholder: 'KCC ID 16 digit, tuladha: 2026 1008 0715 3001',
  lookupSubmit: 'Pados & Tingali Kertu ID Anggota',
  searching: 'Saweg madosi...',
  passFound: 'Kertu Kapanggih!',
  notRegisteredYet: 'Dereng ndhaftar?',
  fillRegistrationForm: 'Isi Formulir Pandhaftaran →',
  lookupInvalidId: 'Mangga lebetaken KCC ID 16 digit panjenengan (namung angka, kenging ngagem spasi).',
  lookupNotFound: 'Kertu ID Anggota kangge KCC ID punika mboten kapanggih. Mangga priksa malih 16 digitipun.',
  lookupPermissionDenied:
    'Madosi kertu saweg mboten saged (akses database dipuntolak). Mangga cobi malih mangke utawi hubungi admin KCC.',

  // Profile tab states
  profileLoadFailed: 'Profil anggota panjenengan mboten saged dipunemot.',
  checkConnectionRetry: 'Priksa sambungan internet panjenengan, lajeng cobi malih.',
  preparingProfile: 'Nyiapaken Profil Anggota...',
  preparingProfileDesc: 'Nyambungaken akun dhateng identitas digital KCC panjenengan.',
  pleaseSignIn: 'Mangga mlebet rumiyin',
  clickToSignIn: 'Klik ing ngriki kangge mlebet',

  // Footer
  footerPlatform: 'Platform Pop Culture Internasional 100% SFW.',
  copyright: '© 2026 MyKCC. Sedaya hak dipunreksa.',
  privacyShieldActive: 'Sistem Identitas 16 Digit & Tameng Privasi Aktif',
};

export default common;
