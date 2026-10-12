import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Profil Ahli Saya',
  updateProfile: 'Kemas Kini Maklumat Profil Secara Masa Nyata',

  // Hero
  changeAvatar: 'Tukar foto profil',
  verifiedActive: 'Disahkan & Aktif',
  kccIdLabel: 'KCC ID (16 DIGIT)',
  copyKccId: 'Salin KCC ID',
  viewIdCard: 'Lihat Kad ID Ahli',

  // Profile form
  infoTitle: 'Maklumat Profil Ahli',
  infoDesc: 'Anda boleh menukar maklumat ini pada bila-bila masa; ia disimpan secara masa nyata ke pangkalan data MyKCC.',
  savedRealtime: 'Disimpan Secara Masa Nyata!',
  ageCategoryLabel: 'Kategori Umur',
  ageLabel: 'Umur / Tarikh Lahir (Pilihan)',
  agePlaceholder: 'cth. 21 tahun atau 15 Mei',
  whatsappLabel: 'Nombor WhatsApp Aktif',
  backupPhoneLabel: 'Nombor WhatsApp Kedua / Simpanan',
  backupPhonePlaceholder: 'cth. 012... atau +60 12...',
  discordPlaceholder: 'cth. alyachan_cos atau user#0001',
  roleLabel: 'Peranan Utama dalam Komuniti',
  customRolePlaceholder: 'Taip peranan / kepakaran lain anda...',
  socialMediaPlaceholder: '@namapengguna (Instagram / X / TikTok)',
  reasonLabel: 'Sebab Menyertai & Catatan Profil',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Peminat Idol / Wota',
  roleOtaku: 'Otaku Anime, Manga & Permainan',
  roleGeneralEnthusiast: 'Peminat Umum / Penyokong',
  rolePropMaker: 'Pembuat Prop / Pengraf',
  roleCostumeMaker: 'Pembuat Kostum / Tukang Jahit',
  roleEventCrew: 'Krew & Petugas Acara',
};

export default profile;
