import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Sandbox para sa Pag-test ng Demo Form',
  sandboxBadge: 'Sandbox Mode',
  description:
    'Isang click para awtomatikong punan ang preset at i-test ang pagbuo ng KCC ID (Timestamp UID, Admin UID 0001-0100, Main Account 0000).',
  randomizeTitle: 'Gumawa ng Random na Persona',
  randomize: 'I-random',

  // KCC ID allocation rules
  rulesTitle: 'Mga Patakaran sa User ID ng KawanCosplay:',
  ruleMainAccount: 'Main Account ng KCC',
  ruleAdminRange: 'Saklaw ng KCC Admin',
  ruleTimestamp: 'Member UID na nakaayos ayon sa timestamp',

  // Preset cards
  previewName: 'Pangalan:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Punan ang Form',
  submitTest: 'I-submit ang Test',
  tip: 'Tip: I-click ang "{action}" para agad na i-simulate ang pag-submit at makita ang nabuong KCC ID card at ang pag-unlock ng WhatsApp.',
  presetLoaded: 'Na-load ang preset',

  // Presets
  presetCosplayerName: 'Demo na Cosplayer (Timestamp UID)',
  presetCosplayerBadge: 'Timestamp UID',
  presetCosplayerDesc: '16-digit na UID na nakaayos ayon sa timestamp ng pag-submit (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Demo na KCC Admin (UID 0001-0100)',
  presetAdminBadge: 'Saklaw ng Admin UID',
  presetAdminDesc: 'UID 0000 0000 0000 0001 hanggang 0000 0000 0000 0100 para sa KCC Admin',
  presetMainAccountName: 'Demo na KCC Main Account (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 para lamang sa main account na cosplaysehat@gmail.com',
  presetPropMakerName: 'Demo na Prop Maker / Crafter',
  presetPropMakerBadge: 'Crafter (Timestamp)',
  presetPropMakerDesc: 'Gumagawa ng props at armor, may UID batay sa timestamp',
  presetPhotographerName: 'Demo na Cosplay Photographer',
  presetPhotographerBadge: 'Litratista',
  presetPhotographerDesc: 'Photographer at videographer na may UID batay sa timestamp',
  presetOthersName: 'Demo na Iba Pa / Custom na Role',
  presetOthersBadge: 'Ibang Role',
  presetOthersDesc: 'Custom na role na "Iba Pa" na espesyalista sa Cosplay Makeup at Wig Styling',
  presetDuplicateName: 'Test ng Iisang KCC ID (Katugma: {name})',
  presetDuplicateBadge: 'Check ng Iisang KCC ID',
  presetDuplicateDesc: 'Sinusuri na pinapanatili ng katugmang WhatsApp ang KCC ID: {id}',
  presetSecondaryPhoneName: 'Test ng Pangalawang Numero (2 Numero: {name})',
  presetSecondaryPhoneBadge: 'Check ng 2 WA Number',
  presetSecondaryPhoneDesc: 'Nagdadagdag ng pangalawang numero at pinapanatili ang KCC ID: {id}',
};

export default demo;
