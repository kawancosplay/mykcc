import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: 'ᮃᮔᮜᮤᮒᮤᮊ᮪ ᮊᮧᮙᮥᮔᮤᮒᮞ᮪',
  subtitle: 'ᮓᮦᮙᮧᮌᮢᮖᮤ & ᮙᮤᮔᮒ᮪ KawanCosplay',
  title: 'ᮞ᮪ᮒᮒᮤᮞ᮪ᮒᮤᮊ᮪ & ᮓᮦᮙᮧᮌᮢᮖᮤ ᮊᮧᮙᮥᮔᮤᮒᮞ᮪',
  description: 'ᮌᮙ᮪ᮘᮛᮔ᮪ ᮅᮙᮥᮙ᮪ ᮊᮧᮙᮥᮔᮤᮒᮞ᮪ ᮃᮀᮌᮧᮒ KawanCosplay ᮓᮥᮙᮞᮁ ᮊᮔ ᮓᮤᮗᮤᮞᮤ ᮊᮃᮂᮜᮤᮃᮔ᮪, ᮊᮧᮒ ᮓᮥᮙᮥᮊ᮪, ᮞᮛᮨᮀ ᮖᮔ᮪ᮓᮧᮙ᮪ ᮊᮛᮨᮞᮨᮕ᮪.',
  allVerifiedActive: '100% ᮊᮗᮦᮛᮤᮖᮤᮊᮞᮤ ᮃᮊ᮪ᮒᮤᮖ᮪',
  webFormLabel: 'ᮖᮧᮁᮙᮥᮜᮤᮁ ᮓᮕ᮪ᮒᮁ ᮝᮦᮘ᮪',
  webFormDesc: 'ᮓᮕ᮪ᮒᮁ ᮍᮜᮀᮊᮥᮍᮔ᮪ ᮞᮤᮞ᮪ᮒᮨᮙ᮪ ᮆᮀᮌᮜ᮪',
  googleFormLabel: 'ᮞᮤᮀᮊᮢᮧᮔᮤᮞᮞᮤ Google Form',
  googleFormDesc: 'ᮒᮤ Live Transition Sync',
  citiesLabel: 'ᮊᮧᮒ ᮓᮥᮙᮥᮊ᮪',
  citiesDesc: 'ᮊᮧᮒ-ᮊᮧᮒ ᮓᮤ ᮞᮊᮥᮜᮤᮃᮂ ᮄᮔ᮪ᮓᮧᮔᮦᮞᮤᮃ',
  rolesTitle: 'ᮕᮨᮛᮔ᮪ ᮓᮤ ᮊᮧᮙᮥᮔᮤᮒᮞ᮪',
  rolesDesc: 'ᮎᮙ᮪ᮕᮥᮛᮔ᮪ ᮎᮧᮞ᮪ᮕᮣᮚᮨᮁ, ᮕᮀᮛᮏᮤᮔ᮪, ᮖᮧᮒᮧᮌᮢᮖᮨᮁ, ᮙᮦᮊᮕ᮪ ᮃᮁᮒᮤᮞ᮪, ᮞᮛᮨᮀ ᮊᮢᮥ',
  regionsTitle: 'ᮞᮥᮙᮨᮘᮁᮔ ᮝᮨᮝᮨᮀᮊᮧᮔ᮪ / ᮊᮧᮒ',
  regionsDesc: 'ᮊᮧᮒ ᮓᮥᮙᮥᮊ᮪ ᮃᮀᮌᮧᮒ, ᮊᮀᮌᮧ ᮍᮛᮨᮔ᮪ᮎᮔᮊᮩᮔ᮪ ᮛᮤᮅᮍᮔ᮪ & ᮞᮦᮞᮤ ᮕᮧᮒᮧ ᮓᮤ ᮝᮨᮝᮨᮀᮊᮧᮔ᮪',
  fandomsTitle: 'ᮖᮔ᮪ᮓᮧᮙ᮪ & ᮙᮤᮔᮒ᮪ ᮊᮛᮊ᮪ᮒᮨᮁ ᮕᮀᮕᮧᮕᮥᮜᮦᮁᮔ',
  fandomsDesc: 'ᮏᮥᮓᮥᮜ᮪ ᮃᮔᮤᮙᮦ, ᮌᮦᮙ᮪, ᮞᮛᮨᮀ ᮞᮦᮛᮤ ᮃᮔᮥ ᮕᮀᮕᮧᮕᮥᮜᮦᮁᮔ ᮊᮀᮌᮧ ᮕᮢᮧᮚᮦᮊ᮪ ᮎᮧᮞ᮪ᮕᮣᮚ᮪ ᮛᮧᮙ᮪ᮘᮧᮍᮔ᮪',
  fandomInterest: 'ᮙᮤᮔᮒ᮪ ᮕᮢᮧᮚᮦᮊ᮪ ᮎᮧᮞ᮪ᮕᮣᮚ᮪',
  countWithPercent: '{count} ({percent})',
  memberCountOne: '{count} ᮃᮀᮌᮧᮒ',
  memberCountOther: '{count} ᮃᮀᮌᮧᮒ',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: 'ᮞᮔᮦᮞ᮪',
  fandomAnimeGames: 'ᮃᮔᮤᮙᮦ & ᮌᮦᮙ᮪',
};

export default stats;
