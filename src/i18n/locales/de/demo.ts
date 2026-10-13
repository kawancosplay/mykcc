import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Demo-Sandbox zum Testen des Formulars',
  sandboxBadge: 'Sandbox-Modus',
  description:
    'Vorlagen mit 1 Klick automatisch ausfüllen, um die Erstellung der KCC ID zu testen (Zeitstempel-UID, Admin-UID 0001-0100, Hauptkonto 0000).',
  randomizeTitle: 'Zufällige Persona erzeugen',
  randomize: 'Zufällig',

  // KCC ID allocation rules
  rulesTitle: 'Regeln für die KawanCosplay-User-ID:',
  ruleMainAccount: 'KCC-Hauptkonto',
  ruleAdminRange: 'Bereich für KCC-Admins',
  ruleTimestamp: 'Mitglieds-UID nach Zeitstempel',

  // Preset cards
  previewName: 'Name:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Ausfüllen',
  submitTest: 'Test senden',
  tip: 'Tipp: Klicke auf „{action}“, um das Absenden sofort zu simulieren und den erzeugten Mitgliedsausweis mit KCC ID sowie die WhatsApp-Freischaltung zu sehen.',
  presetLoaded: 'Vorlage geladen',

  // Presets
  presetCosplayerName: 'Demo-Cosplayer (Zeitstempel-UID)',
  presetCosplayerBadge: 'Zeitstempel-UID',
  presetCosplayerDesc: '16-stellige UID nach Zeitpunkt des Absendens (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Demo-KCC-Admin (UID 0001-0100)',
  presetAdminBadge: 'Admin-UID-Bereich',
  presetAdminDesc: 'UID 0000 0000 0000 0001 bis 0000 0000 0000 0100 für KCC-Admins',
  presetMainAccountName: 'Demo-KCC-Hauptkonto (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 ausschließlich für das Hauptkonto cosplaysehat@gmail.com',
  presetPropMakerName: 'Demo-Prop-Maker / Crafter',
  presetPropMakerBadge: 'Crafter (Zeitstempel)',
  presetPropMakerDesc: 'Prop- & Rüstungsbauer mit Zeitstempel-UID',
  presetPhotographerName: 'Demo-Cosplay-Fotograf',
  presetPhotographerBadge: 'Fotograf',
  presetPhotographerDesc: 'Fotograf & Videograf mit Zeitstempel-UID',
  presetOthersName: 'Demo: Sonstige / eigene Rolle',
  presetOthersBadge: 'Rolle „Sonstige“',
  presetOthersDesc: 'Eigene Rolle „Sonstige“ mit Spezialisierung auf Cosplay-Make-up & Perücken-Styling',
  presetDuplicateName: 'Test: eine KCC ID (Treffer: {name})',
  presetDuplicateBadge: 'Prüfung: eine KCC ID',
  presetDuplicateDesc: 'Prüft, ob dieselbe WhatsApp-Nummer die KCC ID behält: {id}',
  presetSecondaryPhoneName: 'Test Zweitnummer (2 Nummern: {name})',
  presetSecondaryPhoneBadge: 'Prüfung: 2 WA-Nummern',
  presetSecondaryPhoneDesc: 'Fügt eine Zweitnummer hinzu & behält die KCC ID: {id}',
};

export default demo;
