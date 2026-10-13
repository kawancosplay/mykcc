import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Mein Mitgliedsprofil',
  updateProfile: 'Profil in Echtzeit aktualisieren',

  // Hero
  changeAvatar: 'Profilfoto ändern',
  verifiedActive: 'Verifiziert & aktiv',
  kccIdLabel: 'KCC ID (16 STELLEN)',
  copyKccId: 'KCC ID kopieren',
  viewIdCard: 'Mitgliedsausweis ansehen',

  // Profile form
  infoTitle: 'Informationen zum Mitgliedsprofil',
  infoDesc: 'Du kannst diese Angaben jederzeit ändern; sie werden in Echtzeit in der MyKCC-Datenbank gespeichert.',
  savedRealtime: 'In Echtzeit gespeichert!',
  ageCategoryLabel: 'Alterskategorie',
  ageLabel: 'Alter / Geburtstag (optional)',
  agePlaceholder: 'z. B. 21 Jahre oder 15. Mai',
  whatsappLabel: 'Aktive WhatsApp-Nummer',
  backupPhoneLabel: 'Zweite / Ersatz-WhatsApp-Nummer',
  backupPhonePlaceholder: 'z. B. 0812... oder +62 857...',
  discordPlaceholder: 'z. B. alyachan_cos oder user#0001',
  roleLabel: 'Hauptrolle in der Community',
  customRolePlaceholder: 'Gib deine andere Rolle / Spezialisierung ein...',
  socialMediaPlaceholder: '@benutzername (Instagram / X / TikTok)',
  reasonLabel: 'Beitrittsgrund & Profilnotizen',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Idol-Fan / Wota',
  roleOtaku: 'Anime-, Manga- & Gaming-Otaku',
  roleGeneralEnthusiast: 'Allgemeiner Fan / Unterstützer',
  rolePropMaker: 'Prop-Maker / Crafter',
  roleCostumeMaker: 'Kostümbau / Schneiderei',
  roleEventCrew: 'Event-Crew & Staff',
};

export default profile;
