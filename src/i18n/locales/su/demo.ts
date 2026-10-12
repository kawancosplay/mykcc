import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Sandbox Uji Coba Formulir Démo',
  sandboxBadge: 'Mode Sandbox',
  description:
    'Eusian otomatis ku 1 klik pikeun nguji ngadamel KCC ID (UID Timestamp, UID Admin 0001-0100, Akun Utama 0000).',
  randomizeTitle: 'Damel Persona Acak',
  randomize: 'Acak Data',

  // KCC ID allocation rules
  rulesTitle: 'Aturan User ID KawanCosplay:',
  ruleMainAccount: 'Akun Utama KCC',
  ruleAdminRange: 'Rentang Admin KCC',
  ruleTimestamp: 'UID Anggota dumasar kana timestamp',

  // Preset cards
  previewName: 'Wasta:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Eusian Formulir',
  submitTest: 'Kintun Uji Coba',
  tip: 'Tip: Klik "{action}" pikeun langsung nyimulasikeun pangiriman sareng ningali kartu KCC ID anu didamel ogé tumbu WhatsApp anu dibuka.',
  presetLoaded: 'Preset parantos dimuat',

  // Presets
  presetCosplayerName: 'Démo Cosplayer (UID Timestamp)',
  presetCosplayerBadge: 'UID Timestamp',
  presetCosplayerDesc: 'UID 16-digit disusun dumasar kana timestamp pangiriman (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Démo Admin KCC (UID 0001-0100)',
  presetAdminBadge: 'Rentang UID Admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 dugi ka 0000 0000 0000 0100 kanggo Admin KCC',
  presetMainAccountName: 'Démo Akun Utama KCC (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 ngan ukur kanggo akun utama cosplaysehat@gmail.com',
  presetPropMakerName: 'Démo Prop Maker / Pangrajin',
  presetPropMakerBadge: 'Pangrajin (Timestamp)',
  presetPropMakerDesc: 'Pangrajin prop & armor kalayan UID dumasar timestamp',
  presetPhotographerName: 'Démo Fotografer Cosplay',
  presetPhotographerBadge: 'Fotografer',
  presetPhotographerDesc: 'Fotografer & vidéografer kalayan UID dumasar timestamp',
  presetOthersName: 'Démo Peran Sanés / Kustom',
  presetOthersBadge: 'Peran Sanés',
  presetOthersDesc: 'Peran kustom "Sanés" kalayan kaahlian Makeup Cosplay & Wig Stylist',
  presetDuplicateName: 'Uji KCC ID Tunggal (Cocog: {name})',
  presetDuplicateBadge: 'Pariksa KCC ID Tunggal',
  presetDuplicateDesc: 'Mastikeun nomer WhatsApp anu sami tetep nganggo KCC ID: {id}',
  presetSecondaryPhoneName: 'Uji Nomer Kadua (2 Nomer: {name})',
  presetSecondaryPhoneBadge: 'Pariksa 2 Nomer WA',
  presetSecondaryPhoneDesc: 'Nambihan nomer kadua & tetep nganggo KCC ID: {id}',
};

export default demo;
