import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'ᮞᮦᮔ᮪ᮓ᮪ᮘᮧᮊ᮪ᮞ᮪ ᮅᮏᮤ ᮎᮧᮘ ᮖᮧᮁᮙᮥᮜᮤᮁ ᮓᮦᮙᮧ',
  sandboxBadge: 'ᮙᮧᮓᮨ ᮞᮦᮔ᮪ᮓ᮪ᮘᮧᮊ᮪ᮞ᮪',
  description:
    'ᮉᮞᮤᮃᮔ᮪ ᮇᮒᮧᮙᮒᮤᮞ᮪ ᮊᮥ 1 ᮊᮣᮤᮊ᮪ ᮕᮤᮊᮩᮔ᮪ ᮍᮥᮏᮤ ᮍᮓᮙᮨᮜ᮪ KCC ID (UID ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪, UID ᮃᮓ᮪ᮙᮤᮔ᮪ 0001-0100, ᮃᮊᮥᮔ᮪ ᮅᮒᮙ 0000).',
  randomizeTitle: 'ᮓᮙᮨᮜ᮪ ᮕᮨᮁᮞᮧᮔ ᮃᮎᮊ᮪',
  randomize: 'ᮃᮎᮊ᮪ ᮓᮒ',

  // KCC ID allocation rules
  rulesTitle: 'ᮃᮒᮥᮛᮔ᮪ ᮚᮥᮞᮦᮁ ID KawanCosplay:',
  ruleMainAccount: 'ᮃᮊᮥᮔ᮪ ᮅᮒᮙ KCC',
  ruleAdminRange: 'ᮛᮨᮔ᮪ᮒᮀ ᮃᮓ᮪ᮙᮤᮔ᮪ KCC',
  ruleTimestamp: 'UID ᮃᮀᮌᮧᮒ ᮓᮥᮙᮞᮁ ᮊᮔ ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪',

  // Preset cards
  previewName: 'ᮝᮞ᮪ᮒ:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'ᮉᮞᮤᮃᮔ᮪ ᮖᮧᮁᮙᮥᮜᮤᮁ',
  submitTest: 'ᮊᮤᮔ᮪ᮒᮥᮔ᮪ ᮅᮏᮤ ᮎᮧᮘ',
  tip: 'ᮒᮤᮕ᮪: ᮊᮣᮤᮊ᮪ "{action}" ᮕᮤᮊᮩᮔ᮪ ᮜᮀᮞᮥᮀ ᮑᮤᮙᮥᮜᮞᮤᮊᮩᮔ᮪ ᮕᮍᮤᮛᮤᮙᮔ᮪ ᮞᮛᮨᮀ ᮔᮤᮍᮜᮤ ᮊᮁᮒᮥ KCC ID ᮃᮔᮥ ᮓᮤᮓᮙᮨᮜ᮪ ᮇᮌᮦ ᮒᮥᮙ᮪ᮘᮥ WhatsApp ᮃᮔᮥ ᮓᮤᮘᮥᮊ.',
  presetLoaded: 'ᮕᮢᮤᮞᮦᮒ᮪ ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮓᮤᮙᮥᮃᮒ᮪',

  // Presets
  presetCosplayerName: 'ᮓᮦᮙᮧ ᮎᮧᮞ᮪ᮕᮣᮚᮨᮁ (UID ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪)',
  presetCosplayerBadge: 'UID ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪',
  presetCosplayerDesc: 'UID 16-ᮓᮤᮌᮤᮒ᮪ ᮓᮤᮞᮥᮞᮥᮔ᮪ ᮓᮥᮙᮞᮁ ᮊᮔ ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪ ᮕᮍᮤᮛᮤᮙᮔ᮪ (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'ᮓᮦᮙᮧ ᮃᮓ᮪ᮙᮤᮔ᮪ KCC (UID 0001-0100)',
  presetAdminBadge: 'ᮛᮨᮔ᮪ᮒᮀ UID ᮃᮓ᮪ᮙᮤᮔ᮪',
  presetAdminDesc: 'UID 0000 0000 0000 0001 ᮓᮥᮌᮤ ᮊ 0000 0000 0000 0100 ᮊᮀᮌᮧ ᮃᮓ᮪ᮙᮤᮔ᮪ KCC',
  presetMainAccountName: 'ᮓᮦᮙᮧ ᮃᮊᮥᮔ᮪ ᮅᮒᮙ KCC (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 ᮍᮔ᮪ ᮅᮊᮥᮁ ᮊᮀᮌᮧ ᮃᮊᮥᮔ᮪ ᮅᮒᮙ cosplaysehat@gmail.com',
  presetPropMakerName: 'ᮓᮦᮙᮧ ᮕᮢᮧᮕ᮪ ᮙᮦᮊᮨᮁ / ᮕᮀᮛᮏᮤᮔ᮪',
  presetPropMakerBadge: 'ᮕᮀᮛᮏᮤᮔ᮪ (ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪)',
  presetPropMakerDesc: 'ᮕᮀᮛᮏᮤᮔ᮪ ᮕᮢᮧᮕ᮪ & ᮃᮁᮙᮧᮁ ᮊᮜᮚᮔ᮪ UID ᮓᮥᮙᮞᮁ ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪',
  presetPhotographerName: 'ᮓᮦᮙᮧ ᮖᮧᮒᮧᮌᮢᮖᮨᮁ ᮎᮧᮞ᮪ᮕᮣᮚ᮪',
  presetPhotographerBadge: 'ᮖᮧᮒᮧᮌᮢᮖᮨᮁ',
  presetPhotographerDesc: 'ᮖᮧᮒᮧᮌᮢᮖᮨᮁ & ᮗᮤᮓᮦᮇᮌᮢᮖᮨᮁ ᮊᮜᮚᮔ᮪ UID ᮓᮥᮙᮞᮁ ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪',
  presetOthersName: 'ᮓᮦᮙᮧ ᮕᮨᮛᮔ᮪ ᮞᮔᮦᮞ᮪ / ᮊᮥᮞ᮪ᮒᮧᮙ᮪',
  presetOthersBadge: 'ᮕᮨᮛᮔ᮪ ᮞᮔᮦᮞ᮪',
  presetOthersDesc: 'ᮕᮨᮛᮔ᮪ ᮊᮥᮞ᮪ᮒᮧᮙ᮪ "ᮞᮔᮦᮞ᮪" ᮊᮜᮚᮔ᮪ ᮊᮃᮂᮜᮤᮃᮔ᮪ ᮙᮦᮊᮕ᮪ ᮎᮧᮞ᮪ᮕᮣᮚ᮪ & ᮝᮤᮌ᮪ ᮞ᮪ᮒᮄᮜᮤᮞ᮪',
  presetDuplicateName: 'ᮅᮏᮤ KCC ID ᮒᮥᮀᮌᮜ᮪ (ᮎᮧᮎᮧᮌ᮪: {name})',
  presetDuplicateBadge: 'ᮕᮛᮤᮊ᮪ᮞ KCC ID ᮒᮥᮀᮌᮜ᮪',
  presetDuplicateDesc: 'ᮙᮞ᮪ᮒᮤᮊᮩᮔ᮪ ᮔᮧᮙᮨᮁ WhatsApp ᮃᮔᮥ ᮞᮙᮤ ᮒᮨᮒᮨᮕ᮪ ᮍᮀᮌᮧ KCC ID: {id}',
  presetSecondaryPhoneName: 'ᮅᮏᮤ ᮔᮧᮙᮨᮁ ᮊᮓᮥᮃ (2 ᮔᮧᮙᮨᮁ: {name})',
  presetSecondaryPhoneBadge: 'ᮕᮛᮤᮊ᮪ᮞ 2 ᮔᮧᮙᮨᮁ WA',
  presetSecondaryPhoneDesc: 'ᮔᮙ᮪ᮘᮤᮠᮔ᮪ ᮔᮧᮙᮨᮁ ᮊᮓᮥᮃ & ᮒᮨᮒᮨᮕ᮪ ᮍᮀᮌᮧ KCC ID: {id}',
};

export default demo;
