export default {
  // Sandbox header
  title: 'Demo Form Testing Sandbox',
  sandboxBadge: 'Sandbox Mode',
  description:
    '1-click preset auto-fill to test KCC ID generation (running 8-digit number, admin range 0000 0001–0000 0100, main account 0000 0000).',
  randomizeTitle: 'Generate Random Persona',
  randomize: 'Randomize',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay User ID Rules:',
  ruleMainAccount: 'KCC Main Account',
  ruleAdminRange: 'KCC Admin Range',
  ruleTimestamp: 'Members: running number in order of registration',

  // Preset cards
  previewName: 'Name:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Fill Form',
  submitTest: 'Submit Test',
  tip: 'Tip: Click "{action}" to instantly simulate submission and view the generated KCC ID card and WhatsApp unlock.',
  presetLoaded: 'Preset loaded',

  // Presets
  presetCosplayerName: 'Demo Cosplayer (running number)',
  presetCosplayerBadge: 'Running number',
  presetCosplayerDesc: 'Next 8-digit KCC ID in order of registration (members start at 0000 0101)',
  presetAdminName: 'Demo KCC Admin (UID 0001-0100)',
  presetAdminBadge: 'Admin UID Range',
  presetAdminDesc: 'ID 0000 0001 to 0000 0100 for KCC admins',
  presetMainAccountName: 'Demo KCC Main Account (UID 0000)',
  presetMainAccountDesc: 'ID 0000 0000 strictly for the main account cosplaysehat@gmail.com',
  presetPropMakerName: 'Demo Prop Maker / Crafter',
  presetPropMakerBadge: 'Crafter (running number)',
  presetPropMakerDesc: 'Prop & armor artisan with a running-number KCC ID',
  presetPhotographerName: 'Demo Cosplay Photographer',
  presetPhotographerBadge: 'Photographer',
  presetPhotographerDesc: 'Photographer & videographer with a running-number KCC ID',
  presetOthersName: 'Demo Others / Custom Role',
  presetOthersBadge: 'Others Role',
  presetOthersDesc: 'Custom role "Others" with specialized Cosplay Makeup & Wig Stylist',
  presetDuplicateName: 'Single KCC ID Test (Match: {name})',
  presetDuplicateBadge: 'Single KCC ID Check',
  presetDuplicateDesc: 'Verifies matching WhatsApp maintains KCC ID: {id}',
  presetSecondaryPhoneName: 'Secondary Phone Test (2 Numbers: {name})',
  presetSecondaryPhoneBadge: '2 WA Numbers Check',
  presetSecondaryPhoneDesc: 'Adds secondary phone & preserves KCC ID: {id}',
} as const;
