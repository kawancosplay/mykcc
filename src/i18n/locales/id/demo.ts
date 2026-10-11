import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Mode Pengujian Formulir Demo (Demo Form Testing)',
  sandboxBadge: 'Mode Sandbox',
  description:
    'Klik 1-tombol untuk auto-fill data demo dan menguji pembuatan KCC ID (Timestamp UID, Admin UID 0001-0100, Main Account 0000).',
  randomizeTitle: 'Buat Persona Acak',
  randomize: 'Acak Data',

  // KCC ID allocation rules
  rulesTitle: 'Aturan Alokasi User ID KawanCosplay:',
  ruleMainAccount: 'KCC Main Account (cosplaysehat@gmail.com)',
  ruleAdminRange: 'KCC Admin (Pengurus Inti)',
  ruleTimestamp: 'Member Reguler berdasar Timestamp pengisian',

  // Preset cards
  previewName: 'Nama:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Isi Form',
  submitTest: 'Kirim Tes',
  tip: 'Tip: Tekan "{action}" untuk langsung mensimulasikan penyimpanan data & memeriksa kartu KCC ID serta unlock grup WA.',
  presetLoaded: 'Preset dimuat',

  // Presets
  presetCosplayerName: 'Demo Cosplayer (Timestamp UID)',
  presetCosplayerBadge: 'UID Timestamp',
  presetCosplayerDesc: 'UID 16-digit diatur berdasar tanggal & jam submit (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Demo KCC Admin (UID 0001-0100)',
  presetAdminBadge: 'Rentang UID Admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 s/d 0000 0000 0000 0100 khusus KCC Admin',
  presetMainAccountName: 'Demo KCC Main Account (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 khusus akun utama cosplaysehat@gmail.com',
  presetPropMakerName: 'Demo Prop Maker / Crafter',
  presetPropMakerBadge: 'Crafter (Timestamp)',
  presetPropMakerDesc: 'Pengrajin kostum / prop dengan UID berbasis timestamp',
  presetPhotographerName: 'Demo Fotografer Cosplay',
  presetPhotographerBadge: 'Fotografer',
  presetPhotographerDesc: 'Fotografer & videografer dengan UID berbasis timestamp',
  presetOthersName: 'Demo Peran Lainnya / Others',
  presetOthersBadge: 'Peran Lainnya',
  presetOthersDesc: 'Peran kustom "Lainnya / Others" dengan spesialisasi Makeup & Wig Stylist',
  presetDuplicateName: 'Uji Akun Tunggal (Duplikat: {name})',
  presetDuplicateBadge: 'Cek KCC ID Tunggal',
  presetDuplicateDesc: 'Memverifikasi nomor WA sama mempertahankan KCC ID: {id}',
  presetSecondaryPhoneName: 'Uji 2 Nomor (Cadangan: {name})',
  presetSecondaryPhoneBadge: 'Cek 2 Nomor WA',
  presetSecondaryPhoneDesc: 'Menambah nomor WA cadangan & mempertahankan KCC ID: {id}',
};

export default demo;
