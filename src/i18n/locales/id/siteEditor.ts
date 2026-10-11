import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Editor Tampilan Situs',
  editorDesc: 'Kustomisasi tata letak, warna, latar belakang, font, dan logo secara langsung (real-time).',
  resetTitle: 'Reset ke tampilan bawaan',
  resetDefault: 'Reset Default',
  saveFailed: 'Perubahan tampilan gagal disimpan: {error}',
  autoSaveNotice: 'Perubahan otomatis tersimpan ke database situs (khusus admin).',
  doneClose: 'Selesai & Tutup',

  // Tabs
  tabLayout: 'Tata Letak',
  tabBackground: 'Latar Belakang',
  tabColors: 'Skema Warna',
  tabFont: 'Font & Tipografi',
  tabLogo: 'Logo & Identitas',

  // Layout tab
  layoutWidthLabel: 'Lebar Konten Halaman',
  widthNormal: 'Lebar Normal (7XL - 1280px)',
  widthNormalDesc: 'Ukuran standar ramah desktop & mobile',
  widthCompact: 'Ringkas (6XL - 1152px)',
  widthCompactDesc: 'Lebih rapat dan fokus ke konten tengah',
  widthFull: 'Layar Penuh',
  widthFullDesc: 'Membentang memenuhi seluruh lebar layar',
  navbarStyleLabel: 'Gaya Bilah Navigasi',
  navbarGlassBar: 'Bilah Kaca Penuh',
  navbarGlassBarDesc: 'Menempel di atas dengan efek blur',
  navbarFloatingPill: 'Kapsul Melayang',
  navbarFloatingPillDesc: 'Terapung manis di tengah atas',
  navbarMinimal: 'Gaya Minimalis',
  navbarMinimalDesc: 'Sederhana dan hemat ruang',
  cardRadiusLabel: 'Kelengkungan Sudut Kartu',
  radius3xl: 'Sangat Bulat (3XL)',
  radius2xl: 'Modern Bulat (2XL)',
  radiusXl: 'Standar (XL)',
  radiusLg: 'Teknis / Ramping (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Pilihan Latar Belakang',
  bgBrightPurpleName: 'Ungu Cerah Fluent (Bawaan)',
  bgBrightPurpleDesc: 'Aura kaca ungu-violet bercahaya ala Fluent dengan kedalaman yang halus',
  bgCyberPurpleName: 'Violet Neon Cyberpunk',
  bgCyberPurpleDesc: 'Violet elektrik kontras tinggi dengan aksen magenta menyala',
  bgCosmicDarkName: 'Tengah Malam Kosmik',
  bgCosmicDarkDesc: 'Biru navy luar angkasa dan obsidian dengan nebula ungu',
  bgFluentLavenderName: 'Lavender Fluent Lembut',
  bgFluentLavenderDesc: 'Pendar ungu pastel dengan kaca buram yang lembut',
  bgDarkOnyxName: 'Onyx Obsidian',
  bgDarkOnyxDesc: 'Grafit ultra-gelap yang elegan dengan kilau tepi ungu yang halus',
  customGradientTitle: 'Gradient Kustom',
  customGradientDesc: 'Masukkan kode CSS background atau linear-gradient Anda sendiri.',
  useCustom: 'Gunakan Kustom',

  // Colors tab (theme labels)
  accentColorLabel: 'Palet Aksen Warna',
  colorPurple: 'Ungu Royal (Bawaan)',
  colorRose: 'Mawar Sakura',
  colorIndigo: 'Indigo Elektrik',
  colorEmerald: 'Giok Zamrud',
  colorAmber: 'Amber Senja',
  colorCyan: 'Cyan Siber',
  customColorTitle: 'Warna Hex Kustom',
  customColorDesc: 'Pilih warna aksen primer sesuka hati.',

  // Font tab
  fontLabel: 'Tipografi & Font Situs',
  fontDinNextName: 'DIN Next (Resmi)',
  fontDinNextDesc: 'Tipografi DIN geometris modern — tajam, bersih, dan berwibawa',
  fontActive: 'Aktif',
  fontSample: 'Muharjo seorang xenofobia universal yang takut pada warga jazirah, contohnya Qatar • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Teks Nama & Subtitle Logo',
  logoTitleLabel: 'Judul Utama Logo',
  logoSubtitleLabel: 'Subtitle / Tagline',
  logoSubtitlePlaceholder: 'Portal Member Komunitas',
  emblemLabel: 'Pilih Lambang / Emblem Bawaan',
  emblemKitsune: 'Topeng Kitsune (Resmi KCC)',
  emblemCrown: 'Mahkota Kerajaan',
  emblemShield: 'Perisai Komunitas',
  emblemHeart: 'Hati Persahabatan',
  emblemSparkle: 'Kilau Bintang Ajaib',
  customLogoLabel: 'Atau Gunakan Gambar Logo Kustom (URL Gambar)',
  customLogoHint: 'Masukkan link gambar logo PNG/SVG transparan atau biarkan kosong untuk menggunakan emblem resmi.',
};

export default siteEditor;
