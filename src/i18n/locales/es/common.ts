import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Comunidad global de cultura pop, cosplay y wota (100% SFW)',
  navForm: 'Formulario de registro',
  navCard: 'Mi pase digital',
  navGallery: 'Galería de cosplay',
  navProfile: 'Mi perfil',
  navAdmin: 'Panel de admin',
  navLogin: 'Iniciar sesión / Registrarse',
  navLogout: 'Cerrar sesión',
  userId16Label: 'KCC ID oficial',
  officialBannerText: 'Sitio web oficial de KawanCosplay',
  howYouKnow: 'Así puedes comprobarlo',
  aboutKccTitle: 'Comunidad internacional oficial (100% SFW)',
  aboutKccDesc: 'KawanCosplay es una comunidad creativa internacional de cultura pop dedicada al cosplay sano 100% SFW (Safe For Work), la apreciación de idols y el anime, abierta a miembros de todo el mundo.',
  secureSiteTitle: 'Los sitios seguros usan HTTPS y el icono de candado (🔒)',
  secureSiteDesc: 'Mira la barra de direcciones de tu navegador. Los sitios web oficiales siempre empiezan con https:// y muestran un icono de candado de seguridad (🔒).',
  officialContactTitle: 'Línea directa oficial de WhatsApp y correo',
  officialContactDesc: 'Las consultas oficiales se atienden exclusivamente por la línea directa de WhatsApp +62 857-1103-2782 y por cosplaysehat@gmail.com.',
  whatsappHotline: 'Línea directa oficial de WhatsApp: +62 857-1103-2782',

  // Generic
  close: 'Cerrar',
  optional: '(Opcional)',
  tryAgain: 'Reintentar',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'Cargando la app...',
  loadingAdmin: 'Cargando el panel de admin...',

  // Navbar & app shell
  navFormShort: 'Registro',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Galería',
  openMenu: 'Abrir menú',
  closeMenu: 'Cerrar menú',
  chooseLanguage: 'Elegir idioma ({language})',
  siteEditorShort: 'Editor del sitio',
  themeEditor: 'Editor de tema',
  whatsappCommunity: 'Comunidad de WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'Correo: cosplaysehat@gmail.com',
  userFallbackName: 'Usuario',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'Logo de KawanCosplay',
  officialBadge: 'Oficial',

  // PWA install
  pwaInstall: 'Instalar app',
  pwaIosTitle: 'Instalar en iPhone / iPad',
  pwaIosStep1: '1. Toca el botón {share} en la barra de herramientas de Safari.',
  pwaIosShare: 'Compartir',
  pwaIosStep2: '2. Desliza hacia abajo y toca {addToHome}.',
  pwaIosAddToHome: 'Agregar a inicio',

  // Admin portal shell
  backToPublicSite: 'Volver al sitio público',
  adminPortalTitle: 'Portal de admin de KawanCosplay',
  googleSignInBadge: 'Acceso con Google',
  adminRestricted: 'Solo admins',
  lockAndExitAdminTitle: 'Bloquear y salir del portal de admin',
  lockExit: 'Bloquear / Salir',
  adminPortal: 'Portal de admin',
  adminPortalLinkTitle: 'Portal exclusivo para admins de KCC (inicio de sesión de admin con Google)',
  sheetsPopupClosed: 'La ventana de autorización de Google se cerró antes de terminar.',
  sheetsWrongAccount: 'Elige la misma cuenta de Google que la cuenta de admin con la que iniciaste sesión.',
  sheetsPopupBlocked: 'El navegador bloqueó la ventana de inicio de sesión de Google. Permite las ventanas emergentes para este sitio y vuelve a intentarlo.',
  sheetsConnectFailed:
    'No se pudo conectar Google Sheets. Elige la cuenta de admin (cosplaysehat@gmail.com) y permite el acceso de lectura a Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'Carné de miembro MyKCC',
  cardPageTitle: 'Carné de miembro y KCC ID',
  cardPageDesc:
    'Para proteger la privacidad de todos los miembros, la lista completa de miembros está restringida al portal de admin. Escribe tu KCC ID de 16 dígitos (p. ej. 2026 1008 0715 3001) para mostrar tu pase digital oficial.',
  connectedProfile: 'Perfil conectado',
  openPass: 'Abrir pase',
  lookupPlaceholder: 'KCC ID de 16 dígitos, p. ej. 2026 1008 0715 3001',
  lookupSubmit: 'Buscar y ver carné de miembro',
  searching: 'Buscando...',
  passFound: '¡Pase encontrado!',
  notRegisteredYet: '¿Todavía no te registraste?',
  fillRegistrationForm: 'Completar el formulario de registro →',
  lookupInvalidId: 'Escribe tu KCC ID de 16 dígitos (solo números; se permiten espacios).',
  lookupNotFound: 'No se encontró ningún carné de miembro con ese KCC ID. Revisa bien los 16 dígitos.',
  lookupPermissionDenied:
    'La búsqueda de carnés no está disponible en este momento (acceso a la base de datos denegado). Vuelve a intentarlo más tarde o contacta a un admin de KCC.',

  // Profile tab states
  profileLoadFailed: 'No se pudo cargar tu perfil de miembro.',
  checkConnectionRetry: 'Revisa tu conexión a internet y vuelve a intentarlo.',
  preparingProfile: 'Preparando el perfil de miembro...',
  preparingProfileDesc: 'Conectando la cuenta con tu identidad digital KCC.',
  pleaseSignIn: 'Inicia sesión',
  clickToSignIn: 'Haz clic aquí para iniciar sesión',

  // Footer
  footerPlatform: 'Plataforma internacional de cultura pop 100% SFW.',
  copyright: '© 2026 MyKCC. Todos los derechos reservados.',
  privacyShieldActive: 'Sistema de identidad de 16 dígitos y escudo de privacidad activo',
};

export default common;
