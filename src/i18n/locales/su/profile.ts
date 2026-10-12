import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Profil Anggota Abdi',
  updateProfile: 'Robih Info Profil sacara Real-Time',

  // Hero
  changeAvatar: 'Gentos poto profil',
  verifiedActive: 'Kavérifikasi & Aktif',
  kccIdLabel: 'KCC ID (16 DIGIT)',
  copyKccId: 'Tiron KCC ID',
  viewIdCard: 'Tingali Kartu ID Anggota',

  // Profile form
  infoTitle: 'Inpormasi Profil Anggota',
  infoDesc: 'Inpormasi ieu tiasa dirobih iraha waé; langsung disimpen sacara real-time ka database MyKCC.',
  savedRealtime: 'Disimpen sacara Real-Time!',
  ageCategoryLabel: 'Kategori Umur',
  ageLabel: 'Umur / Tanggal Lahir (Opsional)',
  agePlaceholder: 'conto: 21 taun atanapi 15 Méi',
  whatsappLabel: 'Nomer WhatsApp Aktif',
  backupPhoneLabel: 'Nomer WhatsApp Kadua / Cadangan',
  backupPhonePlaceholder: 'conto: 0812... atanapi +62 857...',
  discordPlaceholder: 'conto: alyachan_cos atanapi user#0001',
  roleLabel: 'Peran Utama di Komunitas',
  customRolePlaceholder: 'Serat peran / kaahlian sanés anjeun...',
  socialMediaPlaceholder: '@wasta_pangguna (Instagram / X / TikTok)',
  reasonLabel: 'Alesan Ngagabung & Catetan Profil',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Pangagum Idol / Wota',
  roleOtaku: 'Otaku Anime, Manga & Game',
  roleGeneralEnthusiast: 'Baraya Umum / Pendukung',
  rolePropMaker: 'Pangrajin Prop / Crafter',
  roleCostumeMaker: 'Pangrajin Kostum / Tukang Jait',
  roleEventCrew: 'Kru & Staf Acara',
};

export default profile;
