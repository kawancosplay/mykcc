import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Profil Anggota Kula',
  updateProfile: 'Anyari Info Profil kanthi Langsung',

  // Hero
  changeAvatar: 'Gantos foto profil',
  verifiedActive: 'Kaverifikasi & Aktif',
  kccIdLabel: 'KCC ID (16 DIGIT)',
  copyKccId: 'Salin KCC ID',
  viewIdCard: 'Tingali Kertu ID Anggota',

  // Profile form
  infoTitle: 'Informasi Profil Anggota',
  infoDesc: 'Informasi punika saged panjenengan gantos sawanci-wanci; langsung kasimpen ing database MyKCC.',
  savedRealtime: 'Kasimpen Langsung!',
  ageCategoryLabel: 'Kategori Umur',
  ageLabel: 'Umur / Tanggal Lair (Opsional)',
  agePlaceholder: 'tuladha: 21 taun utawi 15 Mei',
  whatsappLabel: 'Nomer WhatsApp Aktif',
  backupPhoneLabel: 'Nomer WhatsApp Kaping Kalih / Cadhangan',
  backupPhonePlaceholder: 'tuladha: 0812... utawi +62 857...',
  discordPlaceholder: 'tuladha: alyachan_cos utawi user#0001',
  roleLabel: 'Peran Utama ing Komunitas',
  customRolePlaceholder: 'Serat peran / keahlian sanesipun...',
  socialMediaPlaceholder: '@username (Instagram / X / TikTok)',
  reasonLabel: 'Alesan Gabung & Cathetan Profil',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Penggemar Idol / Wota',
  roleOtaku: 'Otaku Anime, Manga & Game',
  roleGeneralEnthusiast: 'Penggemar Umum / Panyengkuyung',
  rolePropMaker: 'Prop Maker / Pangrajin',
  roleCostumeMaker: 'Pandamel Kostum / Tukang Jait',
  roleEventCrew: 'Kru Acara & Staf',
};

export default profile;
