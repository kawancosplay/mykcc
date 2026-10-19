import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Editor de apariencia del sitio',
  editorDesc: 'Personaliza el diseño, los colores, el fondo, la fuente y el logo en tiempo real.',
  resetTitle: 'Restablecer la apariencia predeterminada',
  resetDefault: 'Restablecer',
  saveFailed: 'No se pudieron guardar los cambios de apariencia: {error}',
  autoSaveNotice: 'Los cambios se guardan automáticamente en la base de datos del sitio (solo admins).',
  doneClose: 'Listo y cerrar',

  // Tabs
  tabLayout: 'Diseño',
  tabBackground: 'Fondo',
  tabColors: 'Colores',
  tabFont: 'Fuente y tipografía',
  tabLogo: 'Logo e identidad',

  // Layout tab
  layoutWidthLabel: 'Ancho del contenido de la página',
  widthNormal: 'Ancho normal (7XL - 1280px)',
  widthNormalDesc: 'Tamaño estándar que funciona bien en escritorio y móvil',
  widthCompact: 'Compacto (6XL - 1152px)',
  widthCompactDesc: 'Más estrecho, centrado en el contenido principal',
  widthFull: 'Ancho completo',
  widthFullDesc: 'Se extiende por todo el ancho de la pantalla',
  navbarStyleLabel: 'Estilo de la barra de navegación',
  navbarGlassBar: 'Barra de cristal completa',
  navbarGlassBarDesc: 'Fija arriba con efecto de desenfoque',
  navbarFloatingPill: 'Píldora flotante',
  navbarFloatingPillDesc: 'Flota de forma ordenada arriba en el centro',
  navbarMinimal: 'Minimalista',
  navbarMinimalDesc: 'Sencilla y ahorra espacio',
  cardRadiusLabel: 'Radio de las esquinas de las tarjetas',
  radius3xl: 'Extra redondeado (3XL)',
  radius2xl: 'Redondeado moderno (2XL)',
  radiusXl: 'Estándar (XL)',
  radiusLg: 'Técnico / Fino (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fondos predefinidos Fluent',
  bgBrightPurpleName: 'Púrpura brillante Fluent (predeterminado)',
  bgBrightPurpleDesc: 'Aura de cristal luminosa púrpura-violeta Fluent con profundidad suave',
  bgCyberPurpleName: 'Violeta neón cyberpunk',
  bgCyberPurpleDesc: 'Violeta eléctrico de alto contraste con acentos magenta intenso',
  bgCosmicDarkName: 'Medianoche cósmica',
  bgCosmicDarkDesc: 'Azul marino del espacio profundo y obsidiana con nebulosas púrpura',
  bgFluentLavenderName: 'Lavanda Fluent suave',
  bgFluentLavenderDesc: 'Brillo púrpura pastel luminoso con suave cristal esmerilado',
  bgDarkOnyxName: 'Ónix obsidiana',
  bgDarkOnyxDesc: 'Grafito ultraoscuro y elegante con un sutil borde especular púrpura',
  customGradientTitle: 'Degradado CSS personalizado',
  customGradientDesc: 'Escribe tu propio código CSS de background o linear-gradient.',
  useCustom: 'Usar personalizado',

  // Colors tab (theme labels)
  accentColorLabel: 'Color de acento del tema',
  colorPurple: 'Púrpura real (predeterminado)',
  colorRose: 'Rosa sakura',
  colorIndigo: 'Índigo eléctrico',
  colorEmerald: 'Jade esmeralda',
  colorAmber: 'Ámbar atardecer',
  colorCyan: 'Cian cyber',
  customColorTitle: 'Color hexadecimal personalizado',
  customColorDesc: 'Elige el color de acento principal que más te guste.',

  // Font tab
  fontLabel: 'Tipografía y fuente del sitio',
  fontDinNextName: 'DIN Next (oficial)',
  fontDinNextDesc: 'Tipografía DIN geométrica moderna: nítida, limpia y con autoridad',
  fontActive: 'Activa',
  fontSample: 'La cigüeña tocaba cada vez mejor el saxofón y el búho pedía kiwi y queso • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Nombre del logo y texto del subtítulo',
  logoTitleLabel: 'Título principal del logo',
  logoSubtitleLabel: 'Subtítulo / Eslogan',
  logoSubtitlePlaceholder: 'Portal de miembros de la comunidad',
  emblemLabel: 'Elige un emblema incluido',
  emblemKitsune: 'Máscara kitsune (KCC oficial)',
  emblemCrown: 'Corona real',
  emblemShield: 'Escudo de la comunidad',
  emblemHeart: 'Corazón de la amistad',
  emblemSparkle: 'Destello de estrella mágica',
  customLogoLabel: 'O usa una imagen de logo personalizada (URL de imagen)',
  customLogoHint: 'Escribe el enlace a un logo PNG/SVG transparente, o déjalo vacío para usar el emblema oficial.',
};

export default siteEditor;
