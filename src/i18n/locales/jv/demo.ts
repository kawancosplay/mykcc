import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Sandbox Pacoban Formulir Demo',
  sandboxBadge: 'Mode Sandbox',
  description:
    'Isi otomatis preset 1-klik kangge nguji damelan KCC ID (Timestamp UID, Admin UID 0001-0100, Main Account 0000).',
  randomizeTitle: 'Damel Persona Acak',
  randomize: 'Acak',

  // KCC ID allocation rules
  rulesTitle: 'Paugeran User ID KawanCosplay:',
  ruleMainAccount: 'Akun Utama KCC',
  ruleAdminRange: 'Rentang Admin KCC',
  ruleTimestamp: 'UID Anggota miturut Timestamp',

  // Preset cards
  previewName: 'Jeneng:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Isi Formulir',
  submitTest: 'Kirim Pacoban',
  tip: 'Tips: Klik "{action}" kangge langsung nyimulasikaken pangiriman lan ningali kertu KCC ID ingkang dipundamel saha link WhatsApp ingkang kabikak.',
  presetLoaded: 'Preset sampun kaemot',

  // Presets
  presetCosplayerName: 'Cosplayer Demo (Timestamp UID)',
  presetCosplayerBadge: 'UID Timestamp',
  presetCosplayerDesc: 'UID 16 digit miturut timestamp pangiriman (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Admin KCC Demo (UID 0001-0100)',
  presetAdminBadge: 'Rentang UID Admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 dumugi 0000 0000 0000 0100 kangge Admin KCC',
  presetMainAccountName: 'Akun Utama KCC Demo (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 namung kangge akun utama cosplaysehat@gmail.com',
  presetPropMakerName: 'Prop Maker / Pangrajin Demo',
  presetPropMakerBadge: 'Pangrajin (Timestamp)',
  presetPropMakerDesc: 'Pangrajin prop & armor kanthi UID adhedhasar timestamp',
  presetPhotographerName: 'Fotografer Cosplay Demo',
  presetPhotographerBadge: 'Fotografer',
  presetPhotographerDesc: 'Fotografer & videografer kanthi UID adhedhasar timestamp',
  presetOthersName: 'Demo Sanesipun / Peran Kustom',
  presetOthersBadge: 'Peran Sanesipun',
  presetOthersDesc: 'Peran kustom "Sanesipun" kanthi keahlian Makeup Cosplay & Penata Wig',
  presetDuplicateName: 'Uji KCC ID Tunggal (Cocog: {name})',
  presetDuplicateBadge: 'Priksa KCC ID Tunggal',
  presetDuplicateDesc: 'Mesthekaken WhatsApp ingkang cocog tetep ngagem KCC ID: {id}',
  presetSecondaryPhoneName: 'Uji Nomer Kaping Kalih (2 Nomer: {name})',
  presetSecondaryPhoneBadge: 'Priksa 2 Nomer WA',
  presetSecondaryPhoneDesc: 'Nambahaken nomer kaping kalih & njagi KCC ID: {id}',
};

export default demo;
