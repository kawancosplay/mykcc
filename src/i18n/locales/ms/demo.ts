import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Kotak Pasir Ujian Borang Demo',
  sandboxBadge: 'Mod Kotak Pasir',
  description:
    'Isi automatik pratetap dengan 1 klik untuk menguji penjanaan KCC ID (UID Cap Masa, UID Admin 0001-0100, Akaun Utama 0000).',
  randomizeTitle: 'Jana Persona Rawak',
  randomize: 'Rawakkan',

  // KCC ID allocation rules
  rulesTitle: 'Peraturan User ID KawanCosplay:',
  ruleMainAccount: 'Akaun Utama KCC',
  ruleAdminRange: 'Julat Admin KCC',
  ruleTimestamp: 'UID Ahli disusun mengikut cap masa',

  // Preset cards
  previewName: 'Nama:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Isi Borang',
  submitTest: 'Hantar Ujian',
  tip: 'Petua: Klik "{action}" untuk menyimulasikan penghantaran serta-merta dan melihat kad KCC ID yang dijana serta akses kumpulan WhatsApp.',
  presetLoaded: 'Pratetap dimuatkan',

  // Presets
  presetCosplayerName: 'Cosplayer Demo (UID Cap Masa)',
  presetCosplayerBadge: 'UID Cap Masa',
  presetCosplayerDesc: 'UID 16 digit disusun mengikut cap masa penghantaran (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Admin KCC Demo (UID 0001-0100)',
  presetAdminBadge: 'Julat UID Admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 hingga 0000 0000 0000 0100 untuk Admin KCC',
  presetMainAccountName: 'Akaun Utama KCC Demo (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 khusus untuk akaun utama cosplaysehat@gmail.com',
  presetPropMakerName: 'Pembuat Prop / Kraf Demo',
  presetPropMakerBadge: 'Pengraf (Cap Masa)',
  presetPropMakerDesc: 'Tukang prop & perisai dengan UID berasaskan cap masa',
  presetPhotographerName: 'Jurugambar Cosplay Demo',
  presetPhotographerBadge: 'Jurugambar',
  presetPhotographerDesc: 'Jurugambar & jurukamera video dengan UID berasaskan cap masa',
  presetOthersName: 'Peranan Lain / Tersuai Demo',
  presetOthersBadge: 'Peranan Lain',
  presetOthersDesc: 'Peranan tersuai "Lain-lain" dengan pengkhususan Solekan Cosplay & Penggaya Rambut Palsu',
  presetDuplicateName: 'Ujian KCC ID Tunggal (Padanan: {name})',
  presetDuplicateBadge: 'Semakan KCC ID Tunggal',
  presetDuplicateDesc: 'Mengesahkan nombor WhatsApp yang sama mengekalkan KCC ID: {id}',
  presetSecondaryPhoneName: 'Ujian Telefon Kedua (2 Nombor: {name})',
  presetSecondaryPhoneBadge: 'Semakan 2 Nombor WA',
  presetSecondaryPhoneDesc: 'Menambah nombor telefon kedua & mengekalkan KCC ID: {id}',
};

export default demo;
