import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Éditor Tampilan Loka',
  editorDesc: 'Atur tata letak, warna, latar, font, sareng logo sacara real-time.',
  resetTitle: 'Balikkeun ka tampilan baku',
  resetDefault: 'Balikkeun Baku',
  saveFailed: 'Parobihan tampilan teu tiasa disimpen: {error}',
  autoSaveNotice: 'Parobihan otomatis disimpen ka database loka (ngan ukur admin).',
  doneClose: 'Réngsé & Tutup',

  // Tabs
  tabLayout: 'Tata Letak',
  tabBackground: 'Latar',
  tabColors: 'Warna',
  tabFont: 'Font & Tipografi',
  tabLogo: 'Logo & Idéntitas',

  // Layout tab
  layoutWidthLabel: 'Lébar Eusi Kaca',
  widthNormal: 'Lébar Normal (7XL - 1280px)',
  widthNormalDesc: 'Ukuran standar anu cocog di desktop & HP',
  widthCompact: 'Ringkes (6XL - 1152px)',
  widthCompactDesc: 'Langkung pageuh, museur kana eusi tengah',
  widthFull: 'Lébar Pinuh',
  widthFullDesc: 'Ngabentang sapanjang lébar layar',
  navbarStyleLabel: 'Gaya Bar Navigasi',
  navbarGlassBar: 'Bar Kaca Pinuh',
  navbarGlassBarDesc: 'Napel di luhur kalayan éfék blur',
  navbarFloatingPill: 'Kapsul Ngambang',
  navbarFloatingPillDesc: 'Ngambang rapih di tengah luhur',
  navbarMinimal: 'Minimalis Beresih',
  navbarMinimalDesc: 'Basajan tur hémat rohangan',
  cardRadiusLabel: 'Radius Juru Kartu',
  radius3xl: 'Buleud Pisan (3XL)',
  radius2xl: 'Buleud Modéren (2XL)',
  radiusXl: 'Standar (XL)',
  radiusLg: 'Téknis / Ramping (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Pilihan Latar Fluent',
  bgBrightPurpleName: 'Fluent Wungu Caang (Baku)',
  bgBrightPurpleDesc: 'Aura kaca wungu-violet anu cahayaan ala Fluent kalayan jero anu lemes',
  bgCyberPurpleName: 'Violet Néon Cyberpunk',
  bgCyberPurpleDesc: 'Violet listrik kontras luhur kalayan aksén magénta anu hurung',
  bgCosmicDarkName: 'Tengah Wengi Kosmik',
  bgCosmicDarkDesc: 'Biru navy luar angkasa sareng obsidian kalayan nébula wungu',
  bgFluentLavenderName: 'Lavender Fluent Lemes',
  bgFluentLavenderDesc: 'Cahaya wungu pastél kalayan kaca burem anu lemes',
  bgDarkOnyxName: 'Onyx Obsidian',
  bgDarkOnyxDesc: 'Grafit poék pisan anu élégan kalayan sisi wungu anu hérang samar',
  customGradientTitle: 'Gradién CSS Kustom',
  customGradientDesc: 'Lebetkeun kode CSS background atanapi linear-gradient anjeun nyalira.',
  useCustom: 'Anggo Kustom',

  // Colors tab (theme labels)
  accentColorLabel: 'Warna Aksén Téma',
  colorPurple: 'Wungu Karajaan (Baku)',
  colorRose: 'Mawar Sakura',
  colorIndigo: 'Indigo Listrik',
  colorEmerald: 'Zamrud Giok',
  colorAmber: 'Amber Burit',
  colorCyan: 'Cyan Siber',
  customColorTitle: 'Warna Hex Kustom',
  customColorDesc: 'Pilih warna aksén utama naon waé anu dipikaresep.',

  // Font tab
  fontLabel: 'Tipografi & Font Loka',
  fontDinNextName: 'DIN Next (Resmi)',
  fontDinNextDesc: 'Tipografi DIN géométris modéren — seukeut, beresih, sareng wibawa',
  fontActive: 'Aktif',
  fontSample: 'Sakadang kuya jeung sakadang monyét ngagugulung bal di sisi walungan • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Téks Wasta & Subjudul Logo',
  logoTitleLabel: 'Judul Utama Logo',
  logoSubtitleLabel: 'Subjudul / Tagline',
  logoSubtitlePlaceholder: 'Portal Anggota Komunitas',
  emblemLabel: 'Pilih Lambang Bawaan',
  emblemKitsune: 'Topéng Kitsune (KCC Resmi)',
  emblemCrown: 'Makuta Karajaan',
  emblemShield: 'Tameng Komunitas',
  emblemHeart: 'Haté Silaturahmi',
  emblemSparkle: 'Béntang Gaib Hérang',
  customLogoLabel: 'Atanapi Anggo Gambar Logo Kustom (URL Gambar)',
  customLogoHint: 'Lebetkeun tumbu ka logo PNG/SVG transparan, atanapi kosongkeun pikeun nganggo lambang resmi.',
};

export default siteEditor;
