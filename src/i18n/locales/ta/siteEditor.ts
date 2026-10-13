import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'தளத் தோற்ற எடிட்டர்',
  editorDesc: 'தளவமைப்பு, வண்ணங்கள், பின்னணி, எழுத்துரு, லோகோ ஆகியவற்றை நிகழ்நேரத்தில் தனிப்பயனாக்கவும்.',
  resetTitle: 'இயல்புநிலைத் தோற்றத்திற்கு மீட்டமை',
  resetDefault: 'இயல்புநிலைக்கு மீட்டமை',
  saveFailed: 'தோற்ற மாற்றங்களைச் சேமிக்க முடியவில்லை: {error}',
  autoSaveNotice: 'மாற்றங்கள் தளத் தரவுத்தளத்தில் தானாகச் சேமிக்கப்படும் (நிர்வாகிகளுக்கு மட்டும்).',
  doneClose: 'முடிந்தது & மூடு',

  // Tabs
  tabLayout: 'தளவமைப்பு',
  tabBackground: 'பின்னணி',
  tabColors: 'வண்ணங்கள்',
  tabFont: 'எழுத்துரு & அச்சுக்கலை',
  tabLogo: 'லோகோ & அடையாளம்',

  // Layout tab
  layoutWidthLabel: 'பக்க உள்ளடக்க அகலம்',
  widthNormal: 'இயல்பான அகலம் (7XL - 1280px)',
  widthNormalDesc: 'டெஸ்க்டாப் & மொபைலில் நன்றாகச் செயல்படும் நிலையான அளவு',
  widthCompact: 'கச்சிதம் (6XL - 1152px)',
  widthCompactDesc: 'குறுகலானது, நடுப்பகுதி உள்ளடக்கத்தில் கவனம் செலுத்துகிறது',
  widthFull: 'முழு அகலம்',
  widthFullDesc: 'திரையின் முழு அகலத்திற்கும் நீள்கிறது',
  navbarStyleLabel: 'வழிசெலுத்தல் பட்டி பாணி',
  navbarGlassBar: 'முழு கண்ணாடிப் பட்டி',
  navbarGlassBarDesc: 'மங்கல் விளைவுடன் மேலே ஒட்டியிருக்கும்',
  navbarFloatingPill: 'மிதக்கும் மாத்திரை வடிவம்',
  navbarFloatingPillDesc: 'மேலே நடுவில் நேர்த்தியாக மிதக்கும்',
  navbarMinimal: 'நேர்த்தியான எளிமை',
  navbarMinimalDesc: 'எளிமையானது, இடத்தைச் சேமிக்கும்',
  cardRadiusLabel: 'அட்டை மூலை வளைவு',
  radius3xl: 'மிக வட்டம் (3XL)',
  radius2xl: 'நவீன வட்டம் (2XL)',
  radiusXl: 'நிலையானது (XL)',
  radiusLg: 'தொழில்நுட்பம் / மெல்லியது (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fluent பின்னணி முன்னமைவுகள்',
  bgBrightPurpleName: 'பிரகாசமான ஊதா Fluent (இயல்புநிலை)',
  bgBrightPurpleDesc: 'மென்மையான ஆழத்துடன் கூடிய Fluent ஊதா-வயலட் ஒளிரும் கண்ணாடி ஒளிவட்டம்',
  bgCyberPurpleName: 'சைபர்பங்க் நியான் வயலட்',
  bgCyberPurpleDesc: 'பளிச்சிடும் மெஜந்தா சாயல்களுடன் கூடிய உயர் மாறுபாட்டு மின் வயலட்',
  bgCosmicDarkName: 'பிரபஞ்ச நள்ளிரவு',
  bgCosmicDarkDesc: 'ஊதா நெபுலாக்களுடன் கூடிய ஆழ்வெளி நேவி நீலம் & அப்சிடியன் கருமை',
  bgFluentLavenderName: 'மென்மையான Fluent லாவெண்டர்',
  bgFluentLavenderDesc: 'மென்மையான பனிமூட்டக் கண்ணாடியுடன் ஒளிரும் பேஸ்டல் ஊதா ஒளி',
  bgDarkOnyxName: 'அப்சிடியன் ஓனிக்ஸ்',
  bgDarkOnyxDesc: 'நுட்பமான ஊதா ஒளிரும் விளிம்புடன் கூடிய மிக அடர் நேர்த்தியான கிராஃபைட்',
  customGradientTitle: 'தனிப்பயன் CSS கிரேடியன்ட்',
  customGradientDesc: 'உங்கள் சொந்த CSS background அல்லது linear-gradient குறியீட்டை உள்ளிடவும்.',
  useCustom: 'தனிப்பயனைப் பயன்படுத்து',

  // Colors tab (theme labels)
  accentColorLabel: 'தீம் சிறப்பு வண்ணம்',
  colorPurple: 'அரச ஊதா (இயல்புநிலை)',
  colorRose: 'சகுரா ரோஜா',
  colorIndigo: 'மின்னும் இண்டிகோ',
  colorEmerald: 'மரகதப் பச்சை',
  colorAmber: 'அந்தி அம்பர்',
  colorCyan: 'சைபர் சியான்',
  customColorTitle: 'தனிப்பயன் Hex வண்ணம்',
  customColorDesc: 'நீங்கள் விரும்பும் எந்த முதன்மை வண்ணத்தையும் தேர்ந்தெடுக்கவும்.',

  // Font tab
  fontLabel: 'தள அச்சுக்கலை & எழுத்துரு',
  fontDinNextName: 'DIN Next (அதிகாரப்பூர்வம்)',
  fontDinNextDesc: 'நவீன வடிவியல் DIN அச்சுக்கலை — தெளிவானது, நேர்த்தியானது, கம்பீரமானது',
  fontActive: 'செயலில்',
  fontSample: 'விரைவான பழுப்பு நரி சோம்பேறி நாயின் மேல் தாவுகிறது • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'லோகோ பெயர் & துணைத்தலைப்பு உரை',
  logoTitleLabel: 'முதன்மை லோகோ தலைப்பு',
  logoSubtitleLabel: 'துணைத்தலைப்பு / குறிக்கோள் வாசகம்',
  logoSubtitlePlaceholder: 'சமூக உறுப்பினர் போர்டல்',
  emblemLabel: 'உள்ளமைந்த சின்னத்தைத் தேர்ந்தெடுக்கவும்',
  emblemKitsune: 'கிட்சுனே முகமூடி (அதிகாரப்பூர்வ KCC)',
  emblemCrown: 'அரச மகுடம்',
  emblemShield: 'சமூகக் கேடயம்',
  emblemHeart: 'நட்பு இதயம்',
  emblemSparkle: 'மாய நட்சத்திர மின்னல்',
  customLogoLabel: 'அல்லது தனிப்பயன் லோகோ படத்தைப் பயன்படுத்தவும் (பட URL)',
  customLogoHint: 'பின்னணி இல்லாத (transparent) PNG/SVG லோகோவுக்கான இணைப்பை உள்ளிடவும், அல்லது அதிகாரப்பூர்வச் சின்னத்தைப் பயன்படுத்த இதைக் காலியாக விடவும்.',
};

export default siteEditor;
