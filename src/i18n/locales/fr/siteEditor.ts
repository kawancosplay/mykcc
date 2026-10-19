import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Éditeur d’apparence du site',
  editorDesc: 'Personnalisez la mise en page, les couleurs, l’arrière-plan, la police et le logo en temps réel.',
  resetTitle: 'Rétablir l’apparence par défaut',
  resetDefault: 'Réinitialiser',
  saveFailed: 'Impossible d’enregistrer les modifications d’apparence : {error}',
  autoSaveNotice: 'Les modifications sont enregistrées automatiquement dans la base de données du site (admins uniquement).',
  doneClose: 'Terminer et fermer',

  // Tabs
  tabLayout: 'Mise en page',
  tabBackground: 'Arrière-plan',
  tabColors: 'Couleurs',
  tabFont: 'Police & typographie',
  tabLogo: 'Logo & identité',

  // Layout tab
  layoutWidthLabel: 'Largeur du contenu de la page',
  widthNormal: 'Largeur normale (7XL - 1280px)',
  widthNormalDesc: 'Taille standard adaptée à l’ordinateur et au mobile',
  widthCompact: 'Compacte (6XL - 1152px)',
  widthCompactDesc: 'Plus resserrée, centrée sur le contenu',
  widthFull: 'Pleine largeur',
  widthFullDesc: 'S’étend sur toute la largeur de l’écran',
  navbarStyleLabel: 'Style de la barre de navigation',
  navbarGlassBar: 'Barre en verre pleine largeur',
  navbarGlassBarDesc: 'Fixée en haut avec un effet de flou',
  navbarFloatingPill: 'Pilule flottante',
  navbarFloatingPillDesc: 'Flotte proprement en haut au centre',
  navbarMinimal: 'Minimal épuré',
  navbarMinimalDesc: 'Simple et peu encombrant',
  cardRadiusLabel: 'Arrondi des coins des cartes',
  radius3xl: 'Très arrondi (3XL)',
  radius2xl: 'Arrondi moderne (2XL)',
  radiusXl: 'Standard (XL)',
  radiusLg: 'Technique / fin (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Arrière-plans Fluent prédéfinis',
  bgBrightPurpleName: 'Violet lumineux Fluent (par défaut)',
  bgBrightPurpleDesc: 'Aura de verre lumineuse violet-pourpre Fluent avec une profondeur douce',
  bgCyberPurpleName: 'Violet néon cyberpunk',
  bgCyberPurpleDesc: 'Violet électrique à fort contraste avec des accents magenta vif',
  bgCosmicDarkName: 'Minuit cosmique',
  bgCosmicDarkDesc: 'Bleu marine de l’espace profond et obsidienne avec des nébuleuses violettes',
  bgFluentLavenderName: 'Lavande Fluent douce',
  bgFluentLavenderDesc: 'Lueur violet pastel lumineuse avec un verre dépoli délicat',
  bgDarkOnyxName: 'Onyx obsidienne',
  bgDarkOnyxDesc: 'Graphite ultra-sombre et élégant avec un subtil reflet violet sur les bords',
  customGradientTitle: 'Dégradé CSS personnalisé',
  customGradientDesc: 'Saisissez votre propre code CSS background ou linear-gradient.',
  useCustom: 'Appliquer',

  // Colors tab (theme labels)
  accentColorLabel: 'Couleur d’accent du thème',
  colorPurple: 'Violet royal (par défaut)',
  colorRose: 'Rose sakura',
  colorIndigo: 'Indigo électrique',
  colorEmerald: 'Jade émeraude',
  colorAmber: 'Ambre couchant',
  colorCyan: 'Cyan cyber',
  customColorTitle: 'Couleur hex personnalisée',
  customColorDesc: 'Choisissez la couleur d’accent principale de votre choix.',

  // Font tab
  fontLabel: 'Typographie & police du site',
  fontDinNextName: 'DIN Next (officielle)',
  fontDinNextDesc: 'Typographie géométrique moderne DIN — nette, épurée et affirmée',
  fontActive: 'Activée',
  fontSample: 'Voix ambiguë d’un cœur qui, au zéphyr, préfère les jattes de kiwis • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Nom du logo & sous-titre',
  logoTitleLabel: 'Titre principal du logo',
  logoSubtitleLabel: 'Sous-titre / slogan',
  logoSubtitlePlaceholder: 'Portail des membres de la communauté',
  emblemLabel: 'Choisir un emblème intégré',
  emblemKitsune: 'Masque de kitsune (KCC officiel)',
  emblemCrown: 'Couronne royale',
  emblemShield: 'Bouclier de la communauté',
  emblemHeart: 'Cœur de l’amitié',
  emblemSparkle: 'Étoile magique scintillante',
  customLogoLabel: 'Ou utiliser une image de logo personnalisée (URL de l’image)',
  customLogoHint: 'Saisissez le lien d’un logo PNG/SVG transparent, ou laissez vide pour utiliser l’emblème officiel.',
};

export default siteEditor;
