import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Profil Anggota Saya',
  updateProfile: 'Perbarui Data Profil Real-Time',

  // Hero
  changeAvatar: 'Ganti foto profil',
  verifiedActive: 'Terverifikasi Aktif',
  kccIdLabel: 'KCC ID (16 DIGIT)',
  copyKccId: 'Salin KCC ID',
  viewIdCard: "Lihat Member's ID Card",

  // Profile form
  infoTitle: 'Informasi Profil Anggota',
  infoDesc: 'Data ini dapat kamu ubah kapan saja dan tersimpan secara real-time ke database MyKCC',
  savedRealtime: 'Tersimpan Real-Time!',
  ageCategoryLabel: 'Kategori Usia',
  ageLabel: 'Usia / Tanggal Lahir (Opsional)',
  agePlaceholder: 'Contoh: 21 tahun atau 15 Mei',
  whatsappLabel: 'Nomor WhatsApp Aktif',
  backupPhoneLabel: 'Nomor WhatsApp Kedua / Cadangan',
  backupPhonePlaceholder: 'Contoh: 0812... atau +62 857...',
  discordPlaceholder: 'Contoh: alyachan_cos atau user#0001',
  roleLabel: 'Peran Utama di Komunitas',
  customRolePlaceholder: 'Ketik peran / spesialisasi Anda lainnya...',
  socialMediaPlaceholder: '@username (Instagram / X / TikTok)',
  reasonLabel: 'Alasan Bergabung & Catatan Profil',

  // Short primary role labels for the profile dropdown
  roleIdolFan: 'Idol Fan / Wota',
  roleOtaku: 'Anime, Manga & Gaming Otaku',
  roleGeneralEnthusiast: 'Sahabat Umum / General Enthusiast',
  rolePropMaker: 'Prop Maker / Crafter',
  roleCostumeMaker: 'Costume Maker / Seamstress',
  roleEventCrew: 'Event Crew & Staff',
};

export default profile;
