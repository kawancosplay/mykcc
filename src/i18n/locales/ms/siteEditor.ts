import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Penyunting Rupa Laman',
  editorDesc: 'Sesuaikan susun atur, warna, latar belakang, fon dan logo secara masa nyata.',
  resetTitle: 'Set semula ke rupa lalai',
  resetDefault: 'Set Semula',
  saveFailed: 'Tidak dapat menyimpan perubahan rupa: {error}',
  autoSaveNotice: 'Perubahan disimpan ke pangkalan data laman secara automatik (admin sahaja).',
  doneClose: 'Selesai & Tutup',

  // Tabs
  tabLayout: 'Susun Atur',
  tabBackground: 'Latar Belakang',
  tabColors: 'Warna',
  tabFont: 'Fon & Tipografi',
  tabLogo: 'Logo & Identiti',

  // Layout tab
  layoutWidthLabel: 'Lebar Kandungan Halaman',
  widthNormal: 'Lebar Biasa (7XL - 1280px)',
  widthNormalDesc: 'Saiz standard yang sesuai untuk desktop & mudah alih',
  widthCompact: 'Padat (6XL - 1152px)',
  widthCompactDesc: 'Lebih rapat, fokus pada kandungan tengah',
  widthFull: 'Lebar Penuh',
  widthFullDesc: 'Merentangi seluruh lebar skrin',
  navbarStyleLabel: 'Gaya Bar Navigasi',
  navbarGlassBar: 'Bar Kaca Penuh',
  navbarGlassBarDesc: 'Melekat di bahagian atas dengan kesan kabur',
  navbarFloatingPill: 'Kapsul Terapung',
  navbarFloatingPillDesc: 'Terapung kemas di tengah atas',
  navbarMinimal: 'Minimalis Bersih',
  navbarMinimalDesc: 'Ringkas dan menjimatkan ruang',
  cardRadiusLabel: 'Kelengkungan Bucu Kad',
  radius3xl: 'Sangat Bulat (3XL)',
  radius2xl: 'Bulat Moden (2XL)',
  radiusXl: 'Standard (XL)',
  radiusLg: 'Teknikal / Nipis (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Pratetap Latar Belakang Fluent',
  bgBrightPurpleName: 'Ungu Cerah Fluent (Lalai)',
  bgBrightPurpleDesc: 'Aura kaca ungu-violet bercahaya ala Fluent dengan kedalaman yang lembut',
  bgCyberPurpleName: 'Violet Neon Cyberpunk',
  bgCyberPurpleDesc: 'Violet elektrik berkontras tinggi dengan aksen magenta terang',
  bgCosmicDarkName: 'Tengah Malam Kosmik',
  bgCosmicDarkDesc: 'Biru tua angkasa lepas dan obsidian dengan nebula ungu',
  bgFluentLavenderName: 'Lavender Fluent Lembut',
  bgFluentLavenderDesc: 'Sinaran ungu pastel bercahaya dengan kaca kabus yang lembut',
  bgDarkOnyxName: 'Oniks Obsidian',
  bgDarkOnyxDesc: 'Grafit ultra-gelap yang anggun dengan kilauan tepi ungu yang halus',
  customGradientTitle: 'Gradien CSS Tersuai',
  customGradientDesc: 'Masukkan kod CSS background atau linear-gradient anda sendiri.',
  useCustom: 'Guna Tersuai',

  // Colors tab (theme labels)
  accentColorLabel: 'Warna Aksen Tema',
  colorPurple: 'Ungu Diraja (Lalai)',
  colorRose: 'Mawar Sakura',
  colorIndigo: 'Indigo Elektrik',
  colorEmerald: 'Jed Zamrud',
  colorAmber: 'Ambar Senja',
  colorCyan: 'Sian Siber',
  customColorTitle: 'Warna Hex Tersuai',
  customColorDesc: 'Pilih mana-mana warna aksen utama yang anda suka.',

  // Font tab
  fontLabel: 'Tipografi & Fon Laman',
  fontDinNextName: 'DIN Next (Rasmi)',
  fontDinNextDesc: 'Tipografi DIN geometri moden — tajam, kemas dan berwibawa',
  fontActive: 'Aktif',
  fontSample: 'Zaki si cosplayer fasih menjahit kostum Qixi bervariasi warna dengan gaya • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Teks Nama & Subtajuk Logo',
  logoTitleLabel: 'Tajuk Utama Logo',
  logoSubtitleLabel: 'Subtajuk / Slogan',
  logoSubtitlePlaceholder: 'Portal Ahli Komuniti',
  emblemLabel: 'Pilih Lambang Terbina Dalam',
  emblemKitsune: 'Topeng Kitsune (KCC Rasmi)',
  emblemCrown: 'Mahkota Diraja',
  emblemShield: 'Perisai Komuniti',
  emblemHeart: 'Hati Persahabatan',
  emblemSparkle: 'Kilauan Bintang Ajaib',
  customLogoLabel: 'Atau Guna Imej Logo Tersuai (URL Imej)',
  customLogoHint: 'Masukkan pautan ke logo PNG/SVG lutsinar, atau biarkan kosong untuk menggunakan lambang rasmi.',
};

export default siteEditor;
