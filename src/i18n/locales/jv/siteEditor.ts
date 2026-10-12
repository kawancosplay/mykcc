import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Editor Tampilan Situs',
  editorDesc: 'Atur tata letak, warni, latar, font, lan logo kanthi langsung.',
  resetTitle: 'Wangsulaken dhateng tampilan gawan',
  resetDefault: 'Wangsulaken Gawan',
  saveFailed: 'Owah-owahan tampilan mboten saged kasimpen: {error}',
  autoSaveNotice: 'Owah-owahan kasimpen otomatis ing database situs (namung admin).',
  doneClose: 'Rampung & Tutup',

  // Tabs
  tabLayout: 'Tata Letak',
  tabBackground: 'Latar',
  tabColors: 'Warni',
  tabFont: 'Font & Tipografi',
  tabLogo: 'Logo & Identitas',

  // Layout tab
  layoutWidthLabel: 'Wiyaripun Isi Kaca',
  widthNormal: 'Wiyar Normal (7XL - 1280px)',
  widthNormalDesc: 'Ukuran standar ingkang trep ing desktop & HP',
  widthCompact: 'Ringkes (6XL - 1152px)',
  widthCompactDesc: 'Langkung ciyut, fokus ing isi tengah',
  widthFull: 'Sawiyaripun Layar',
  widthFullDesc: 'Mulur dumugi sawiyaripun layar',
  navbarStyleLabel: 'Gaya Bar Navigasi',
  navbarGlassBar: 'Bar Kaca Sawutuhipun',
  navbarGlassBarDesc: 'Nempel ing nginggil kanthi efek blur',
  navbarFloatingPill: 'Pil Ngambang',
  navbarFloatingPillDesc: 'Ngambang rapi ing tengah nginggil',
  navbarMinimal: 'Minimalis Resik',
  navbarMinimalDesc: 'Prasaja lan ngirit papan',
  cardRadiusLabel: 'Radius Pojok Kertu',
  radius3xl: 'Bunder Sanget (3XL)',
  radius2xl: 'Bunder Modern (2XL)',
  radiusXl: 'Standar (XL)',
  radiusLg: 'Teknis / Ramping (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Preset Latar Fluent',
  bgBrightPurpleName: 'Ungu Padhang Fluent (Gawan)',
  bgBrightPurpleDesc: 'Aura kaca ungu-violet Fluent ingkang sumunar kanthi gradasi jero ingkang alus',
  bgCyberPurpleName: 'Violet Neon Cyberpunk',
  bgCyberPurpleDesc: 'Violet listrik kontras inggil kanthi aksen magenta ingkang mencorong',
  bgCosmicDarkName: 'Tengah Dalu Kosmik',
  bgCosmicDarkDesc: 'Biru tuwa angkasa lan obsidian kanthi nebula ungu',
  bgFluentLavenderName: 'Lavender Fluent Alus',
  bgFluentLavenderDesc: 'Sorot ungu pastel ingkang sumunar kanthi kaca buram ingkang alus',
  bgDarkOnyxName: 'Onyx Obsidian',
  bgDarkOnyxDesc: 'Grafit peteng sanget ingkang elegan kanthi pinggiran ungu ingkang tipis',
  customGradientTitle: 'Gradien CSS Kustom',
  customGradientDesc: 'Lebetaken kode CSS background utawi linear-gradient piyambak.',
  useCustom: 'Agem Kustom',

  // Colors tab (theme labels)
  accentColorLabel: 'Warni Aksen Tema',
  colorPurple: 'Ungu Kraton (Gawan)',
  colorRose: 'Mawar Sakura',
  colorIndigo: 'Indigo Listrik',
  colorEmerald: 'Jade Zamrud',
  colorAmber: 'Amber Surup',
  colorCyan: 'Cyan Cyber',
  customColorTitle: 'Warni Hex Kustom',
  customColorDesc: 'Pilih warni aksen utama ingkang panjenengan remeni.',

  // Font tab
  fontLabel: 'Tipografi & Font Situs',
  fontDinNextName: 'DIN Next (Resmi)',
  fontDinNextDesc: 'Tipografi DIN geometris modern — cetha, resik lan wibawa',
  fontActive: 'Aktif',
  fontSample: 'Kidang kencana mlumpat nglangkungi kali ingkang bening • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Teks Jeneng Logo & Subjudhul',
  logoTitleLabel: 'Judhul Logo Utama',
  logoSubtitleLabel: 'Subjudhul / Tagline',
  logoSubtitlePlaceholder: 'Portal Anggota Komunitas',
  emblemLabel: 'Pilih Lambang Gawan',
  emblemKitsune: 'Topeng Kitsune (KCC Resmi)',
  emblemCrown: 'Makutha Kraton',
  emblemShield: 'Tameng Komunitas',
  emblemHeart: 'Ati Paseduluran',
  emblemSparkle: 'Lintang Sumunar Magis',
  customLogoLabel: 'Utawi Agem Gambar Logo Kustom (URL Gambar)',
  customLogoHint: 'Lebetaken link logo PNG/SVG transparan, utawi kosongaken kangge ngagem lambang resmi.',
};

export default siteEditor;
