import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: 'Analytics ng Komunidad',
  subtitle: 'Demograpiko at Interes ng KawanCosplay',
  title: 'Estadistika at Demograpiko ng Komunidad',
  description: 'Pangkalahatang-tanaw sa komunidad ng mga miyembro ng KawanCosplay ayon sa dibisyon ng kasanayan, lungsod na tinitirhan, at paboritong fandom.',
  allVerifiedActive: '100% Verified at Aktibo',
  webFormLabel: 'Web Registration Form',
  webFormDesc: 'Nag-sign up sa bagong sistema',
  googleFormLabel: 'Sync ng Google Form',
  googleFormDesc: 'Mula sa Live Transition Sync',
  citiesLabel: 'Mga Lungsod na Tinitirhan',
  citiesDesc: 'Mga lungsod sa buong Indonesia',
  rolesTitle: 'Mga Role sa Komunidad',
  rolesDesc: 'Ang halo ng mga cosplayer, crafter, photographer, makeup artist, at crew',
  regionsTitle: 'Distribusyon ayon sa Rehiyon / Lungsod',
  regionsDesc: 'Mga lungsod na tinitirhan ng mga miyembro, para sa pagpaplano ng mga panrehiyong pagtitipon at photoshoot',
  fandomsTitle: 'Nangungunang Fandom at Interes sa Karakter',
  fandomsDesc: 'Ang pinakasikat na mga anime, game, at serye para sa mga group cosplay project',
  fandomInterest: 'Interes sa Cosplay Project',
  countWithPercent: '{count} ({percent})',
  memberCountOne: '{count} miyembro',
  memberCountOther: '{count} na miyembro',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: 'Iba pa',
  fandomAnimeGames: 'Anime at Games',
};

export default stats;
