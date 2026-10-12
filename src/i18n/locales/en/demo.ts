export default {
  // Sandbox header
  title: 'Demo Form Testing Sandbox',
  sandboxBadge: 'Sandbox Mode',
  description:
    '1-click preset auto-fill to test KCC ID generation (Timestamp UID, Admin UID 0001-0100, Main Account 0000).',
  randomizeTitle: 'Generate Random Persona',
  randomize: 'Randomize',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay User ID Rules:',
  ruleMainAccount: 'KCC Main Account',
  ruleAdminRange: 'KCC Admin Range',
  ruleTimestamp: 'Timestamp-arranged Member UID',

  // Preset cards
  previewName: 'Name:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Fill Form',
  submitTest: 'Submit Test',
  tip: 'Tip: Click "{action}" to instantly simulate submission and view the generated KCC ID card and WhatsApp unlock.',
  presetLoaded: 'Preset loaded',

  // Presets
  presetCosplayerName: 'Demo Cosplayer (Timestamp UID)',
  presetCosplayerBadge: 'Timestamp UID',
  presetCosplayerDesc: '16-digit UID arranged by submission timestamp (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Demo KCC Admin (UID 0001-0100)',
  presetAdminBadge: 'Admin UID Range',
  presetAdminDesc: 'UID 0000 0000 0000 0001 to 0000 0000 0000 0100 for KCC Admin',
  presetMainAccountName: 'Demo KCC Main Account (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 strictly for main account cosplaysehat@gmail.com',
  presetPropMakerName: 'Demo Prop Maker / Crafter',
  presetPropMakerBadge: 'Crafter (Timestamp)',
  presetPropMakerDesc: 'Prop & armor artisan with timestamp-based UID',
  presetPhotographerName: 'Demo Cosplay Photographer',
  presetPhotographerBadge: 'Photographer',
  presetPhotographerDesc: 'Photographer & videographer with timestamp-based UID',
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
