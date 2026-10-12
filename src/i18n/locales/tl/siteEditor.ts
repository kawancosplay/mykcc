import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Editor ng Itsura ng Site',
  editorDesc: 'I-customize ang layout, mga kulay, background, font, at logo nang real-time.',
  resetTitle: 'Ibalik sa default na itsura',
  resetDefault: 'Ibalik ang Default',
  saveFailed: 'Hindi ma-save ang mga pagbabago sa itsura: {error}',
  autoSaveNotice: 'Awtomatikong sine-save ang mga pagbabago sa database ng site (para sa admin lamang).',
  doneClose: 'Tapos at Isara',

  // Tabs
  tabLayout: 'Ayos',
  tabBackground: 'Likuran',
  tabColors: 'Mga Kulay',
  tabFont: 'Font at Typography',
  tabLogo: 'Logo at Pagkakakilanlan',

  // Layout tab
  layoutWidthLabel: 'Lapad ng Nilalaman ng Page',
  widthNormal: 'Normal na Lapad (7XL - 1280px)',
  widthNormalDesc: 'Karaniwang laki na maganda sa desktop at mobile',
  widthCompact: 'Siksik (6XL - 1152px)',
  widthCompactDesc: 'Mas masikip, nakatuon sa nilalaman sa gitna',
  widthFull: 'Buong Lapad',
  widthFullDesc: 'Sumasakop sa buong lapad ng screen',
  navbarStyleLabel: 'Istilo ng Navigation Bar',
  navbarGlassBar: 'Buong Glass Bar',
  navbarGlassBarDesc: 'Nakadikit sa itaas na may blur effect',
  navbarFloatingPill: 'Lumulutang na Pill',
  navbarFloatingPillDesc: 'Maayos na lumulutang sa itaas na gitna',
  navbarMinimal: 'Malinis at Minimal',
  navbarMinimalDesc: 'Simple at tipid sa espasyo',
  cardRadiusLabel: 'Kurba ng Sulok ng Card',
  radius3xl: 'Sobrang Bilog (3XL)',
  radius2xl: 'Modernong Bilog (2XL)',
  radiusXl: 'Karaniwan (XL)',
  radiusLg: 'Teknikal / Manipis (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Mga Preset ng Fluent Background',
  bgBrightPurpleName: 'Matingkad na Lilang Fluent (Default)',
  bgBrightPurpleDesc: 'Makinang na lila-violet na aura ng salamin sa istilong Fluent na may malambot na lalim',
  bgCyberPurpleName: 'Neon Violet na Cyberpunk',
  bgCyberPurpleDesc: 'Matingkad na electric violet na may nag-aapoy na magenta na accent',
  bgCosmicDarkName: 'Kosmikong Hatinggabi',
  bgCosmicDarkDesc: 'Malalim na navy ng kalawakan at obsidian na may lilang nebula',
  bgFluentLavenderName: 'Malambot na Lavender na Fluent',
  bgFluentLavenderDesc: 'Makinang na pastel na lilang liwanag na may banayad na frosted glass',
  bgDarkOnyxName: 'Onyx na Obsidian',
  bgDarkOnyxDesc: 'Napakadilim at makinis na graphite na may banayad na lilang kinang sa gilid',
  customGradientTitle: 'Custom na CSS Gradient',
  customGradientDesc: 'Ilagay ang sarili mong CSS background o linear-gradient code.',
  useCustom: 'Gamitin ang Custom',

  // Colors tab (theme labels)
  accentColorLabel: 'Accent na Kulay ng Tema',
  colorPurple: 'Maharlikang Lila (Default)',
  colorRose: 'Rosas na Sakura',
  colorIndigo: 'Elektrikong Indigo',
  colorEmerald: 'Esmeraldang Jade',
  colorAmber: 'Amber ng Dapithapon',
  colorCyan: 'Cyan na Cyber',
  customColorTitle: 'Custom na Hex na Kulay',
  customColorDesc: 'Pumili ng kahit anong pangunahing accent na kulay na gusto mo.',

  // Font tab
  fontLabel: 'Typography at Font ng Site',
  fontDinNextName: 'DIN Next (Opisyal)',
  fontDinNextDesc: 'Moderno at heometrikong DIN typography — malinaw, malinis at may awtoridad',
  fontActive: 'Aktibo',
  fontSample: 'Mabilis na tumalon ang kayumangging soro sa ibabaw ng tamad na aso • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Pangalan ng Logo at Teksto ng Subtitle',
  logoTitleLabel: 'Pangunahing Pamagat ng Logo',
  logoSubtitleLabel: 'Subtitle / Tagline',
  logoSubtitlePlaceholder: 'Portal ng mga Miyembro ng Komunidad',
  emblemLabel: 'Pumili ng Built-in na Emblem',
  emblemKitsune: 'Maskarang Kitsune (Opisyal na KCC)',
  emblemCrown: 'Maharlikang Korona',
  emblemShield: 'Kalasag ng Komunidad',
  emblemHeart: 'Puso ng Pagkakaibigan',
  emblemSparkle: 'Kislap ng Mahiwagang Bituin',
  customLogoLabel: 'O Gumamit ng Custom na Logo (URL ng Larawan)',
  customLogoHint: 'Maglagay ng link sa transparent na PNG/SVG na logo, o iwan itong blangko para gamitin ang opisyal na emblem.',
};

export default siteEditor;
