import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Editor de Aparência do Site',
  editorDesc: 'Personalize o layout, as cores, o fundo, a fonte e o logo em tempo real.',
  resetTitle: 'Restaurar a aparência padrão',
  resetDefault: 'Restaurar Padrão',
  saveFailed: 'Não foi possível salvar as alterações de aparência: {error}',
  autoSaveNotice: 'As alterações são salvas automaticamente no banco de dados do site (somente admins).',
  doneClose: 'Concluir & Fechar',

  // Tabs
  tabLayout: 'Layout',
  tabBackground: 'Fundo',
  tabColors: 'Cores',
  tabFont: 'Fonte & Tipografia',
  tabLogo: 'Logo & Identidade',

  // Layout tab
  layoutWidthLabel: 'Largura do Conteúdo da Página',
  widthNormal: 'Largura Normal (7XL - 1280px)',
  widthNormalDesc: 'Tamanho padrão que funciona bem no computador e no celular',
  widthCompact: 'Compacta (6XL - 1152px)',
  widthCompactDesc: 'Mais estreita, com foco no conteúdo central',
  widthFull: 'Largura Total',
  widthFullDesc: 'Ocupa toda a largura da tela',
  navbarStyleLabel: 'Estilo da Barra de Navegação',
  navbarGlassBar: 'Barra de Vidro Completa',
  navbarGlassBarDesc: 'Fixa no topo com efeito de desfoque',
  navbarFloatingPill: 'Pílula Flutuante',
  navbarFloatingPillDesc: 'Flutua de forma elegante no topo, ao centro',
  navbarMinimal: 'Minimalista',
  navbarMinimalDesc: 'Simples e economiza espaço',
  cardRadiusLabel: 'Arredondamento dos Cantos dos Cards',
  radius3xl: 'Extra Arredondado (3XL)',
  radius2xl: 'Arredondado Moderno (2XL)',
  radiusXl: 'Padrão (XL)',
  radiusLg: 'Técnico / Fino (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fundos Predefinidos Fluent',
  bgBrightPurpleName: 'Roxo Fluent Brilhante (Padrão)',
  bgBrightPurpleDesc: 'Aura de vidro luminosa roxo-violeta no estilo Fluent, com profundidade suave',
  bgCyberPurpleName: 'Violeta Neon Cyberpunk',
  bgCyberPurpleDesc: 'Violeta elétrico de alto contraste com detalhes em magenta vibrante',
  bgCosmicDarkName: 'Meia-Noite Cósmica',
  bgCosmicDarkDesc: 'Azul-marinho do espaço profundo e obsidiana com nebulosas roxas',
  bgFluentLavenderName: 'Lavanda Fluent Suave',
  bgFluentLavenderDesc: 'Brilho roxo pastel luminoso com vidro fosco suave',
  bgDarkOnyxName: 'Ônix Obsidiana',
  bgDarkOnyxDesc: 'Grafite elegante ultraescuro com um sutil reflexo roxo nas bordas',
  customGradientTitle: 'Gradiente CSS Personalizado',
  customGradientDesc: 'Digite seu próprio código CSS de background ou linear-gradient.',
  useCustom: 'Usar Personalizado',

  // Colors tab (theme labels)
  accentColorLabel: 'Cor de Destaque do Tema',
  colorPurple: 'Roxo Real (Padrão)',
  colorRose: 'Rosa Sakura',
  colorIndigo: 'Índigo Elétrico',
  colorEmerald: 'Jade Esmeralda',
  colorAmber: 'Âmbar do Pôr do Sol',
  colorCyan: 'Ciano Cyber',
  customColorTitle: 'Cor Hex Personalizada',
  customColorDesc: 'Escolha qualquer cor de destaque principal que quiser.',

  // Font tab
  fontLabel: 'Tipografia & Fonte do Site',
  fontDinNextName: 'DIN Next (Oficial)',
  fontDinNextDesc: 'Tipografia DIN geométrica e moderna — nítida, limpa e imponente',
  fontActive: 'Ativa',
  fontSample: 'Um pequeno jabuti xereta viu dez cegonhas felizes • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Nome do Logo & Texto do Subtítulo',
  logoTitleLabel: 'Título Principal do Logo',
  logoSubtitleLabel: 'Subtítulo / Slogan',
  logoSubtitlePlaceholder: 'Portal de Membros da Comunidade',
  emblemLabel: 'Escolha um Emblema Integrado',
  emblemKitsune: 'Máscara Kitsune (KCC Oficial)',
  emblemCrown: 'Coroa Real',
  emblemShield: 'Escudo da Comunidade',
  emblemHeart: 'Coração da Amizade',
  emblemSparkle: 'Estrela Mágica Cintilante',
  customLogoLabel: 'Ou Use uma Imagem de Logo Personalizada (URL da Imagem)',
  customLogoHint: 'Insira o link de um logo PNG/SVG transparente, ou deixe em branco para usar o emblema oficial.',
};

export default siteEditor;
