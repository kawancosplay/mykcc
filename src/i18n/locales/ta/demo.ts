import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'டெமோ படிவச் சோதனை Sandbox',
  sandboxBadge: 'Sandbox பயன்முறை',
  description:
    'KCC ID உருவாக்கத்தைச் சோதிக்க 1-கிளிக் முன்னமைவு தானியங்கு நிரப்புதல் (நேரமுத்திரை UID, நிர்வாகி UID 0001-0100, முதன்மைக் கணக்கு 0000).',
  randomizeTitle: 'சீரற்ற மாதிரி நபரை உருவாக்கு',
  randomize: 'சீரற்றதாக்கு',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay பயனர் ID விதிகள்:',
  ruleMainAccount: 'KCC முதன்மைக் கணக்கு',
  ruleAdminRange: 'KCC நிர்வாகி வரம்பு',
  ruleTimestamp: 'நேரமுத்திரைப்படி அமைக்கப்பட்ட உறுப்பினர் UID',

  // Preset cards
  previewName: 'பெயர்:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'படிவத்தை நிரப்பு',
  submitTest: 'சோதனைச் சமர்ப்பிப்பு',
  tip: 'உதவிக்குறிப்பு: சமர்ப்பிப்பை உடனடியாக உருவகப்படுத்தி, உருவாக்கப்பட்ட KCC ID அட்டையையும் WhatsApp அணுகல் திறக்கப்படுவதையும் காண "{action}" என்பதைக் கிளிக் செய்யவும்.',
  presetLoaded: 'முன்னமைவு ஏற்றப்பட்டது',

  // Presets
  presetCosplayerName: 'டெமோ காஸ்ப்ளேயர் (நேரமுத்திரை UID)',
  presetCosplayerBadge: 'நேரமுத்திரை UID',
  presetCosplayerDesc: 'சமர்ப்பித்த நேரமுத்திரைப்படி அமைக்கப்பட்ட 16 இலக்க UID (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'டெமோ KCC நிர்வாகி (UID 0001-0100)',
  presetAdminBadge: 'நிர்வாகி UID வரம்பு',
  presetAdminDesc: 'KCC நிர்வாகிகளுக்கு UID 0000 0000 0000 0001 முதல் 0000 0000 0000 0100 வரை',
  presetMainAccountName: 'டெமோ KCC முதன்மைக் கணக்கு (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 கண்டிப்பாக முதன்மைக் கணக்கு cosplaysehat@gmail.com-க்கு மட்டுமே',
  presetPropMakerName: 'டெமோ ப்ராப் தயாரிப்பாளர் / கைவினைஞர்',
  presetPropMakerBadge: 'கைவினைஞர் (நேரமுத்திரை)',
  presetPropMakerDesc: 'நேரமுத்திரை அடிப்படையிலான UID கொண்ட ப்ராப் & கவசக் கைவினைஞர்',
  presetPhotographerName: 'டெமோ காஸ்ப்ளே புகைப்படக் கலைஞர்',
  presetPhotographerBadge: 'புகைப்படக் கலைஞர்',
  presetPhotographerDesc: 'நேரமுத்திரை அடிப்படையிலான UID கொண்ட புகைப்படக் கலைஞர் & வீடியோ கலைஞர்',
  presetOthersName: 'டெமோ பிற / தனிப்பயன் பங்கு',
  presetOthersBadge: 'பிற பங்கு',
  presetOthersDesc: 'காஸ்ப்ளே ஒப்பனை & விக் ஸ்டைலிஸ்ட் சிறப்புத் திறனுடன் கூடிய "பிற" தனிப்பயன் பங்கு',
  presetDuplicateName: 'ஒற்றை KCC ID சோதனை (பொருத்தம்: {name})',
  presetDuplicateBadge: 'ஒற்றை KCC ID சரிபார்ப்பு',
  presetDuplicateDesc: 'பொருந்தும் WhatsApp எண் அதே KCC ID-ஐத் தக்கவைக்கிறதா எனச் சரிபார்க்கிறது: {id}',
  presetSecondaryPhoneName: 'இரண்டாம் தொலைபேசி சோதனை (2 எண்கள்: {name})',
  presetSecondaryPhoneBadge: '2 WA எண்கள் சரிபார்ப்பு',
  presetSecondaryPhoneDesc: 'இரண்டாம் தொலைபேசி எண்ணைச் சேர்த்து KCC ID-ஐத் தக்கவைக்கிறது: {id}',
};

export default demo;
