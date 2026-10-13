import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Comunidade Global de Cultura Pop, Cosplay & Wota (100% SFW)',
  navForm: 'Formulário de Inscrição',
  navCard: 'Meu Passe Digital',
  navGallery: 'Galeria de Cosplay',
  navProfile: 'Meu Perfil',
  navAdmin: 'Painel de Admin',
  navLogin: 'Entrar / Cadastrar',
  navLogout: 'Sair',
  userId16Label: 'KCC ID Oficial',
  officialBannerText: 'Site oficial da KawanCosplay',
  howYouKnow: 'Saiba como verificar',
  aboutKccTitle: 'Comunidade Internacional Oficial (100% SFW)',
  aboutKccDesc: 'A KawanCosplay é uma comunidade criativa internacional de cultura pop dedicada ao cosplay saudável 100% SFW (Safe For Work), à apreciação de idols e ao anime, aberta a membros do mundo todo.',
  secureSiteTitle: 'Sites seguros usam HTTPS e o ícone de cadeado (🔒)',
  secureSiteDesc: 'Olhe a barra de endereços do seu navegador. Sites oficiais sempre começam com https:// e exibem um ícone de cadeado de segurança (🔒).',
  officialContactTitle: 'Linha Direta Oficial no WhatsApp & E-mail',
  officialContactDesc: 'Contatos oficiais são atendidos exclusivamente pela Linha Direta no WhatsApp +62 857-1103-2782 e por cosplaysehat@gmail.com.',
  whatsappHotline: 'Linha Direta Oficial no WhatsApp: +62 857-1103-2782',

  // Generic
  close: 'Fechar',
  optional: '(Opcional)',
  tryAgain: 'Tentar Novamente',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'Carregando o app...',
  loadingAdmin: 'Carregando o admin...',

  // Navbar & app shell
  navFormShort: 'Inscrição',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Galeria',
  openMenu: 'Abrir menu',
  closeMenu: 'Fechar menu',
  chooseLanguage: 'Escolher idioma ({language})',
  siteEditorShort: 'Editor do Site',
  themeEditor: 'Editor de Tema',
  whatsappCommunity: 'Comunidade no WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'E-mail: cosplaysehat@gmail.com',
  userFallbackName: 'Usuário',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'Logo da KawanCosplay',
  officialBadge: 'Oficial',

  // PWA install
  pwaInstall: 'Instalar App',
  pwaIosTitle: 'Instalar no iPhone / iPad',
  pwaIosStep1: '1. Toque no botão {share} na barra de ferramentas do Safari.',
  pwaIosShare: 'Compartilhar',
  pwaIosStep2: '2. Role para baixo e toque em {addToHome}.',
  pwaIosAddToHome: 'Adicionar à Tela de Início',

  // Admin portal shell
  backToPublicSite: 'Voltar ao Site Público',
  adminPortalTitle: 'Portal de Admin KawanCosplay',
  googleSignInBadge: 'Login com Google',
  adminRestricted: 'Restrito a Admins',
  lockAndExitAdminTitle: 'Bloquear e sair do portal de admin',
  lockExit: 'Bloquear / Sair',
  adminPortal: 'Portal de Admin',
  adminPortalLinkTitle: 'Portal exclusivo para admins do KCC (login Google de admin)',
  sheetsPopupClosed: 'A janela de autorização do Google foi fechada antes de concluir.',
  sheetsWrongAccount: 'Escolha a mesma conta Google da conta de admin conectada.',
  sheetsPopupBlocked: 'O navegador bloqueou a janela de login do Google. Permita pop-ups para este site e tente novamente.',
  sheetsConnectFailed:
    'Não foi possível conectar o Google Sheets. Escolha a conta de admin (cosplaysehat@gmail.com) e permita o acesso de leitura ao Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'Cartão de Membro MyKCC',
  cardPageTitle: 'Cartão de Membro & KCC ID',
  cardPageDesc:
    'Para proteger a privacidade de todos os membros, a lista completa de membros fica restrita ao portal de admin. Digite seu KCC ID de 16 dígitos (ex.: 2026 1008 0715 3001) para exibir seu Passe Digital oficial.',
  connectedProfile: 'Perfil Conectado',
  openPass: 'Abrir Passe',
  lookupPlaceholder: 'KCC ID de 16 dígitos, ex.: 2026 1008 0715 3001',
  lookupSubmit: 'Buscar e Ver Cartão de Membro',
  searching: 'Buscando...',
  passFound: 'Passe Encontrado!',
  notRegisteredYet: 'Ainda não se inscreveu?',
  fillRegistrationForm: 'Preencher Formulário de Inscrição →',
  lookupInvalidId: 'Digite seu KCC ID de 16 dígitos (apenas números, espaços são permitidos).',
  lookupNotFound: 'Nenhum Cartão de Membro encontrado para esse KCC ID. Confira os 16 dígitos.',
  lookupPermissionDenied:
    'A busca de cartões está indisponível no momento (acesso ao banco de dados negado). Tente novamente mais tarde ou fale com um admin do KCC.',

  // Profile tab states
  profileLoadFailed: 'Não foi possível carregar seu perfil de membro.',
  checkConnectionRetry: 'Verifique sua conexão com a internet e tente novamente.',
  preparingProfile: 'Preparando o Perfil de Membro...',
  preparingProfileDesc: 'Conectando a conta à sua identidade digital no KCC.',
  pleaseSignIn: 'Por favor, faça login',
  clickToSignIn: 'Clique aqui para entrar',

  // Footer
  footerPlatform: 'Plataforma Internacional de Cultura Pop 100% SFW.',
  copyright: '© 2026 MyKCC. Todos os direitos reservados.',
  privacyShieldActive: 'Sistema de Identidade de 16 Dígitos e Escudo de Privacidade Ativo',
};

export default common;
