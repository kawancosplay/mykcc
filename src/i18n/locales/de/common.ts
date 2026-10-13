import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Globale Popkultur-, Cosplay- & Wota-Community (100% SFW)',
  navForm: 'Registrierungsformular',
  navCard: 'Mein digitaler Pass',
  navGallery: 'Cosplay-Galerie',
  navProfile: 'Mein Profil',
  navAdmin: 'Admin-Dashboard',
  navLogin: 'Anmelden / Registrieren',
  navLogout: 'Abmelden',
  userId16Label: 'Offizielle KCC ID',
  officialBannerText: 'Offizielle Website von KawanCosplay',
  howYouKnow: 'So erkennst du es',
  aboutKccTitle: 'Offizielle internationale Community (100% SFW)',
  aboutKccDesc:
    'KawanCosplay ist eine internationale, kreative Popkultur-Community für gesundes Cosplay mit 100% SFW (Safe For Work), Idol-Begeisterung und Anime – offen für Mitglieder auf der ganzen Welt.',
  secureSiteTitle: 'Sichere Websites nutzen HTTPS & ein Schloss-Symbol (🔒)',
  secureSiteDesc:
    'Sieh dir die Adressleiste deines Browsers an. Offizielle Websites beginnen immer mit https:// und zeigen ein sicheres Schloss-Symbol (🔒).',
  officialContactTitle: 'Offizielle WhatsApp-Hotline & E-Mail',
  officialContactDesc:
    'Offizielle Anfragen werden ausschließlich über die WhatsApp-Hotline +62 857-1103-2782 und cosplaysehat@gmail.com bearbeitet.',
  whatsappHotline: 'Offizielle WhatsApp-Hotline: +62 857-1103-2782',

  // Generic
  close: 'Schließen',
  optional: '(optional)',
  tryAgain: 'Erneut versuchen',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'App wird geladen...',
  loadingAdmin: 'Admin wird geladen...',

  // Navbar & app shell
  navFormShort: 'Registrierung',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Galerie',
  openMenu: 'Menü öffnen',
  closeMenu: 'Menü schließen',
  chooseLanguage: 'Sprache wählen ({language})',
  siteEditorShort: 'Seiten-Editor',
  themeEditor: 'Theme-Editor',
  whatsappCommunity: 'WhatsApp-Community',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'E-Mail: cosplaysehat@gmail.com',
  userFallbackName: 'Nutzer',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'KawanCosplay-Logo',
  officialBadge: 'Offiziell',

  // PWA install
  pwaInstall: 'App installieren',
  pwaIosTitle: 'Auf iPhone / iPad installieren',
  pwaIosStep1: '1. Tippe in der Safari-Symbolleiste auf {share}.',
  pwaIosShare: 'Teilen',
  pwaIosStep2: '2. Scrolle nach unten und tippe auf {addToHome}.',
  pwaIosAddToHome: 'Zum Home-Bildschirm',

  // Admin portal shell
  backToPublicSite: 'Zurück zur öffentlichen Seite',
  adminPortalTitle: 'KawanCosplay-Admin-Portal',
  googleSignInBadge: 'Google-Anmeldung',
  adminRestricted: 'Nur für Admins',
  lockAndExitAdminTitle: 'Admin-Portal sperren und verlassen',
  lockExit: 'Sperren / Beenden',
  adminPortal: 'Admin-Portal',
  adminPortalLinkTitle: 'Portal nur für KCC-Admins (Google-Anmeldung als Admin)',
  sheetsPopupClosed: 'Das Google-Autorisierungsfenster wurde vor dem Abschluss geschlossen.',
  sheetsWrongAccount: 'Wähle dasselbe Google-Konto wie das angemeldete Admin-Konto.',
  sheetsPopupBlocked:
    'Der Browser hat das Google-Anmeldefenster blockiert. Erlaube Pop-ups für diese Website und versuche es erneut.',
  sheetsConnectFailed:
    'Google Sheets konnte nicht verbunden werden. Wähle das Admin-Konto (cosplaysehat@gmail.com) und erlaube den Lesezugriff auf Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'MyKCC-Mitgliedsausweis',
  cardPageTitle: 'Mitgliedsausweis & KCC ID',
  cardPageDesc:
    'Zum Schutz der Privatsphäre aller Mitglieder ist die vollständige Mitgliederliste nur im Admin-Portal zugänglich. Gib deine 16-stellige KCC ID ein (z. B. 2026 1008 0715 3001), um deinen offiziellen digitalen Pass anzuzeigen.',
  connectedProfile: 'Verbundenes Profil',
  openPass: 'Pass öffnen',
  lookupPlaceholder: '16-stellige KCC ID, z. B. 2026 1008 0715 3001',
  lookupSubmit: 'Mitgliedsausweis suchen & ansehen',
  searching: 'Suche läuft...',
  passFound: 'Pass gefunden!',
  notRegisteredYet: 'Noch nicht registriert?',
  fillRegistrationForm: 'Registrierungsformular ausfüllen →',
  lookupInvalidId: 'Bitte gib deine 16-stellige KCC ID ein (nur Ziffern, Leerzeichen erlaubt).',
  lookupNotFound: 'Für diese KCC ID wurde kein Mitgliedsausweis gefunden. Bitte prüfe die 16 Ziffern noch einmal.',
  lookupPermissionDenied:
    'Die Ausweissuche ist derzeit nicht verfügbar (Datenbankzugriff verweigert). Bitte versuche es später erneut oder kontaktiere einen KCC-Admin.',

  // Profile tab states
  profileLoadFailed: 'Dein Mitgliedsprofil konnte nicht geladen werden.',
  checkConnectionRetry: 'Prüfe deine Internetverbindung und versuche es dann erneut.',
  preparingProfile: 'Mitgliedsprofil wird vorbereitet...',
  preparingProfileDesc: 'Dein Konto wird mit deiner digitalen KCC-Identität verbunden.',
  pleaseSignIn: 'Bitte melde dich an',
  clickToSignIn: 'Hier klicken zum Anmelden',

  // Footer
  footerPlatform: 'Internationale Popkultur-Plattform, 100% SFW.',
  copyright: '© 2026 MyKCC. Alle Rechte vorbehalten.',
  privacyShieldActive: '16-stelliges Identitäts- & Datenschutzsystem aktiv',
};

export default common;
