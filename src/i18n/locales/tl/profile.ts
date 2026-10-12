import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Aking Profile',
  updateProfile: 'I-update ang Profile nang Real-Time',

  // Hero
  changeAvatar: 'Palitan ang profile photo',
  verifiedActive: 'Verified at Aktibo',
  kccIdLabel: 'KCC ID (16 NA DIGIT)',
  copyKccId: 'Kopyahin ang KCC ID',
  viewIdCard: 'Tingnan ang ID Card ng Miyembro',

  // Profile form
  infoTitle: 'Impormasyon ng Member Profile',
  infoDesc: 'Puwede mong baguhin ang impormasyong ito anumang oras; real-time itong sine-save sa database ng MyKCC.',
  savedRealtime: 'Na-save nang Real-Time!',
  ageCategoryLabel: 'Kategorya ng Edad',
  ageLabel: 'Edad / Kaarawan (Opsyonal)',
  agePlaceholder: 'hal. 21 taong gulang o Mayo 15',
  whatsappLabel: 'Aktibong WhatsApp Number',
  backupPhoneLabel: 'Pangalawa / Backup na WhatsApp Number',
  backupPhonePlaceholder: 'hal. 0812... o +62 857...',
  discordPlaceholder: 'hal. alyachan_cos o user#0001',
  roleLabel: 'Pangunahing Role sa Komunidad',
  customRolePlaceholder: 'I-type ang iba mong role / espesyalidad...',
  socialMediaPlaceholder: '@username mo (Instagram / X / TikTok)',
  reasonLabel: 'Dahilan ng Pagsali at Mga Tala sa Profile',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Fan ng Idol / Wota',
  roleOtaku: 'Otaku ng Anime, Manga at Gaming',
  roleGeneralEnthusiast: 'Pangkalahatang Fan / Tagasuporta',
  rolePropMaker: 'Gumagawa ng Props / Crafter',
  roleCostumeMaker: 'Gumagawa ng Costume / Mananahi',
  roleEventCrew: 'Crew at Staff ng Event',
};

export default profile;
