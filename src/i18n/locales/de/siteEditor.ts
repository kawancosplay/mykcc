import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Editor für das Seitendesign',
  editorDesc: 'Passe Layout, Farben, Hintergrund, Schrift und Logo in Echtzeit an.',
  resetTitle: 'Auf das Standarddesign zurücksetzen',
  resetDefault: 'Zurücksetzen',
  saveFailed: 'Die Designänderungen konnten nicht gespeichert werden: {error}',
  autoSaveNotice: 'Änderungen werden automatisch in der Seitendatenbank gespeichert (nur für Admins).',
  doneClose: 'Fertig & schließen',

  // Tabs
  tabLayout: 'Layout',
  tabBackground: 'Hintergrund',
  tabColors: 'Farben',
  tabFont: 'Schrift & Typografie',
  tabLogo: 'Logo & Identität',

  // Layout tab
  layoutWidthLabel: 'Breite des Seiteninhalts',
  widthNormal: 'Normale Breite (7XL - 1280px)',
  widthNormalDesc: 'Standardgröße, die auf Desktop & Handy gut funktioniert',
  widthCompact: 'Kompakt (6XL - 1152px)',
  widthCompactDesc: 'Schmaler, mit Fokus auf den Inhalt in der Mitte',
  widthFull: 'Volle Breite',
  widthFullDesc: 'Erstreckt sich über die gesamte Bildschirmbreite',
  navbarStyleLabel: 'Stil der Navigationsleiste',
  navbarGlassBar: 'Volle Glasleiste',
  navbarGlassBarDesc: 'Bleibt oben fixiert, mit Blur-Effekt',
  navbarFloatingPill: 'Schwebende Pille',
  navbarFloatingPillDesc: 'Schwebt sauber oben in der Mitte',
  navbarMinimal: 'Schlicht & minimal',
  navbarMinimalDesc: 'Einfach und platzsparend',
  cardRadiusLabel: 'Eckenradius der Karten',
  radius3xl: 'Extra rund (3XL)',
  radius2xl: 'Modern rund (2XL)',
  radiusXl: 'Standard (XL)',
  radiusLg: 'Technisch / schmal (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fluent-Hintergrundvorlagen',
  bgBrightPurpleName: 'Helles Fluent-Lila (Standard)',
  bgBrightPurpleDesc: 'Leuchtende Glas-Aura in Fluent-Lila-Violett mit sanfter Tiefe',
  bgCyberPurpleName: 'Cyberpunk-Neonviolett',
  bgCyberPurpleDesc: 'Kontrastreiches Elektroviolett mit knalligen Magenta-Akzenten',
  bgCosmicDarkName: 'Kosmische Mitternacht',
  bgCosmicDarkDesc: 'Tiefes Weltraum-Marineblau und Obsidian mit lila Nebeln',
  bgFluentLavenderName: 'Sanftes Fluent-Lavendel',
  bgFluentLavenderDesc: 'Leuchtendes Pastell-Lila mit zartem Milchglas',
  bgDarkOnyxName: 'Obsidian-Onyx',
  bgDarkOnyxDesc: 'Ultradunkles, elegantes Graphit mit dezentem lila Glanzrand',
  customGradientTitle: 'Eigener CSS-Verlauf',
  customGradientDesc: 'Gib deinen eigenen CSS-Code für background oder linear-gradient ein.',
  useCustom: 'Eigenen nutzen',

  // Colors tab (theme labels)
  accentColorLabel: 'Akzentfarbe des Themes',
  colorPurple: 'Königslila (Standard)',
  colorRose: 'Sakura-Rosé',
  colorIndigo: 'Elektro-Indigo',
  colorEmerald: 'Smaragd-Jade',
  colorAmber: 'Abendrot-Bernstein',
  colorCyan: 'Cyber-Cyan',
  customColorTitle: 'Eigene Hex-Farbe',
  customColorDesc: 'Wähle eine beliebige primäre Akzentfarbe.',

  // Font tab
  fontLabel: 'Typografie & Schrift der Seite',
  fontDinNextName: 'DIN Next (offiziell)',
  fontDinNextDesc: 'Moderne geometrische DIN-Typografie – klar, sauber und souverän',
  fontActive: 'Aktiv',
  fontSample: 'Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Logoname & Untertitel',
  logoTitleLabel: 'Haupttitel des Logos',
  logoSubtitleLabel: 'Untertitel / Slogan',
  logoSubtitlePlaceholder: 'Mitgliederportal der Community',
  emblemLabel: 'Integriertes Emblem wählen',
  emblemKitsune: 'Kitsune-Maske (offiziell KCC)',
  emblemCrown: 'Königskrone',
  emblemShield: 'Community-Schild',
  emblemHeart: 'Freundschaftsherz',
  emblemSparkle: 'Magischer Sternenglanz',
  customLogoLabel: 'Oder eigenes Logobild verwenden (Bild-URL)',
  customLogoHint:
    'Gib einen Link zu einem transparenten PNG-/SVG-Logo ein oder lass das Feld leer, um das offizielle Emblem zu verwenden.',
};

export default siteEditor;
