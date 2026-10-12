import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: 'Analitik Komunitas',
  subtitle: 'Demografi & Minat KawanCosplay',
  title: 'Statistik & Demografi Komunitas',
  description: 'Gambaran komunitas anggota KawanCosplay miturut divisi keahlian, kutha asal, lan fandom favorit.',
  allVerifiedActive: '100% Kaverifikasi Aktif',
  webFormLabel: 'Formulir Pandhaftaran Web',
  webFormDesc: 'Ndhaftar lumantar sistem enggal',
  googleFormLabel: 'Sinkron Google Form',
  googleFormDesc: 'Saking Sinkron Transisi Langsung',
  citiesLabel: 'Kutha Asal',
  citiesDesc: 'Kutha-kutha ing saindhenging Indonesia',
  rolesTitle: 'Peran ing Komunitas',
  rolesDesc: 'Campuran cosplayer, pangrajin, fotografer, makeup artist, lan kru',
  regionsTitle: 'Sebaran Wilayah / Kutha',
  regionsDesc: 'Kutha asal anggota, kangge ngrancang kopdar wilayah & sesi foto',
  fandomsTitle: 'Fandom Paling Populer & Minat Karakter',
  fandomsDesc: 'Judhul anime, game, lan seri paling populer kangge proyek cosplay grup',
  fandomInterest: 'Minat Proyek Cosplay',
  countWithPercent: '{count} ({percent})',
  memberCountOne: '{count} anggota',
  memberCountOther: '{count} anggota',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: 'Sanesipun',
  fandomAnimeGames: 'Anime & Game',
};

export default stats;
