import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'KawanCosplay நிர்வாகி டாஷ்போர்டு',
  dashboardDesc: 'சமூக உறுப்பினர் பட்டியல் மற்றும் Google Sheets ஒத்திசைவுக்கான கட்டுப்படுத்தப்பட்ட நிர்வாக போர்டல்.',
  privacyRestrictedNotice: 'உறுப்பினர் தனியுரிமையைப் பாதுகாக்க, உறுப்பினர் பட்டியல் KawanCosplay நிர்வாகிகளுக்கு மட்டுமே கண்டிப்பாகக் கட்டுப்படுத்தப்பட்டுள்ளது.',
  exportCsv: 'CSV ஏற்றுமதி',
  totalMembers: 'மொத்தப் பதிவுசெய்த உறுப்பினர்கள்',
  resetFilter: 'வடிப்பான்களை மீட்டமை',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'நிர்வாகி அணுகல் சரிபார்க்கப்படுகிறது...',
  signedInNotAdmin: '{account} ஆக உள்நுழைந்துள்ளீர்கள் — இந்தக் கணக்கு KCC நிர்வாகி அல்ல.',
  emailNotVerified: 'மின்னஞ்சல் சரிபார்க்கப்படவில்லை — Google உள்நுழைவைப் பயன்படுத்தவும்.',
  signInWithAdminGoogleEmail: 'நிர்வாகி Google கணக்கில் ({email}) உள்நுழை',
  signOutThisAccount: 'வெளியேறு',
  whatsappAdminHelp: 'WhatsApp வழியாக நிர்வாகி உதவி: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'KawanCosplay மேலாண்மை போர்டல்',
  verifiedAccessBadge: 'சரிபார்க்கப்பட்ட அணுகல்',
  dashboardPrivacyNote: 'உறுப்பினர் தனியுரிமை கண்டிப்பாகப் பாதுகாக்கப்படுகிறது: பதிவுசெய்யப்பட்ட நிர்வாகிகள் மட்டுமே பெயர்களையும் தொடர்பு விவரங்களையும் பார்க்க முடியும்.',
  whatsappHotlineShort: 'WA ஹாட்லைன்: {phone}',
  signOutAdmin: 'நிர்வாகிக் கணக்கிலிருந்து வெளியேறு',
  statusStat: 'நிலை: {status}',
  statusVerified: 'சரிபார்க்கப்பட்டது',
  statusActive: 'செயலில்',
  statusPending: 'நிலுவையில்',
  tabMembers: 'உறுப்பினர் பட்டியல் ({count})',
  tabSync: 'Google Sheets & Form ஒத்திசைவு',
  tabStats: 'சமூகப் புள்ளிவிவரங்கள்',

  // Member list states
  permissionDeniedTitle: 'அணுகல் மறுக்கப்பட்டது',
  permissionDeniedDesc:
    'இந்தக் கணக்கிற்கு உறுப்பினர் பட்டியலுக்கான அணுகலைத் தரவுத்தளம் மறுத்துவிட்டது. நிர்வாகி Google கணக்கில் ({email}) அல்லது admins தொகுப்பில் பட்டியலிடப்பட்ட கணக்கில் உள்நுழைந்து, பக்கத்தை மீண்டும் ஏற்றவும். மேலும், சமீபத்திய Firestore Rules தரவுத்தளம் {database}-இல் வெளியிடப்பட்டுள்ளதா என்பதையும் உறுதிசெய்யவும்.',
  signInWithAdminGoogle: 'நிர்வாகி Google கணக்கில் உள்நுழை',
  reloadPage: 'பக்கத்தை மீண்டும் ஏற்று',
  loadMembersFailedTitle: 'உறுப்பினர் பட்டியலை ஏற்ற முடியவில்லை',
  loadMembersFailedDesc: 'உறுப்பினர் பட்டியலை ஏற்ற முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து, பக்கத்தை மீண்டும் ஏற்றவும்.',
  loadingMembers: 'உறுப்பினர் தரவு ஏற்றப்படுகிறது...',

  // Member status & delete
  statusUpdateFailed: 'உறுப்பினர் நிலையைப் புதுப்பிக்க முடியவில்லை: {error}',
  deleteMemberConfirm: '"{name}" (KCC ID: {id}) என்ற உறுப்பினரை Firestore தரவுத்தளத்திலிருந்து நீக்கவா?',
  deleteMemberFailed: 'உறுப்பினரை நீக்க முடியவில்லை: {error}',

  // KCC ID & public card repair
  repairTitle: 'KCC ID & பொது அட்டை சரிசெய்தல்',
  repairDesc:
    'நகல் ID உள்ள உறுப்பினர்களுக்குத் தனித்துவமான KCC ID-ஐ வழங்குகிறது (முதலில் பதிவுசெய்தவர் பழைய ID-ஐத் தக்கவைப்பார்), இன்னும் சேமிக்கப்படாத KCC ID-களைச் சேமிக்கிறது, மேலும் அட்டைத் தேடலுக்குப் பயன்படும் பொது memberCards தொகுப்பை மீண்டும் உருவாக்குகிறது. மீண்டும் மீண்டும் இயக்கினாலும் பாதுகாப்பானது.',
  repairDuplicatesDetected: 'நகல் KCC ID கொண்ட {count} உறுப்பினர்கள் கண்டறியப்பட்டனர் — "{action}" என்பதை அழுத்தவும்.',
  allIdsUnique: 'அனைத்து KCC ID-களும் தனித்துவமானவை.',
  runRepair: 'சரிசெய்தலை இயக்கு',
  repairRunning: 'சரிசெய்யப்படுகிறது...',
  repairRunningProgress: 'சரிசெய்யப்படுகிறது ({done}/{total})...',
  repairConfirm:
    'அனைத்து உறுப்பினர்களுக்கும் KCC ID & பொது அட்டை சரிசெய்தலை இயக்கவா?\n\n- நகல் KCC ID உள்ள உறுப்பினர்களுக்குப் புதிய ID வழங்கப்படும் (முதலில் பதிவுசெய்தவர் பழைய ID-ஐத் தக்கவைப்பார்).\n- இன்னும் சேமிக்கப்படாத KCC ID-கள் சேமிக்கப்படும்.\n- பொது memberCards தொகுப்பு மீண்டும் உருவாக்கப்படும்.\n\nமீண்டும் மீண்டும் இயக்கினாலும் பாதுகாப்பானது. தொடரவா?',
  repairFailed: 'சரிசெய்தல் தோல்வியடைந்தது: {error}',
  repairDone: 'சரிசெய்தல் முடிந்தது.',
  repairStatScanned: 'ஸ்கேன் செய்யப்பட்ட உறுப்பினர்கள்',
  repairStatDuplicateGroups: 'நகல் ID குழுக்கள்',
  repairStatCardsWritten: 'சேமிக்கப்பட்ட அட்டைகள்',
  repairStatCardsDeleted: 'நீக்கப்பட்ட அட்டைகள்',
  reassignedListTitle: 'மாற்றப்பட்ட / சேமிக்கப்பட்ட KCC ID-கள் ({count}):',
  repairReasonDuplicate: 'நகல் ID',
  repairReasonMissing: 'ID இன்னும் சேமிக்கப்படவில்லை',
  repairReasonMainAccount: 'முதன்மைக் கணக்கு ID-ஐ வேறொரு உறுப்பினர் பயன்படுத்தினார்',
  noIdsChanged: 'எந்த KCC ID-யையும் மாற்ற வேண்டியதில்லை.',
  issuesCount: 'பிழைகள் ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'நிர்வாகி / முதன்மைக் கணக்கிற்கு ஒதுக்கப்பட்ட KCC ID-கள் ({range})',
  reservedIdsDesc:
    'இந்த வரம்பில் உள்ள ID-கள் KCC முதன்மைக் கணக்கு & நிர்வாகிகளுக்கு மட்டுமே. கீழே உள்ள உறுப்பினர்கள், பொதுப் படிவத்தில் (பழைய அமைப்பு) தாங்கள் உள்ளிட்ட பங்கு/மின்னஞ்சல் காரணமாக இவற்றில் ஒன்றைப் பெற்றனர். அவர்களுக்குத் தனித்துவமான, காலவரிசைப்படியான KCC ID-ஐ வழங்க "{action}" என்பதை அழுத்தவும்.',
  noReservedHolders: 'நிர்வாகிகளுக்கு மட்டுமான KCC ID எந்த உறுப்பினரிடமும் இல்லை.',
  reservedHolderMeta: 'மூலம்: {source} • பங்கு: {role}',
  processing: 'செயலாக்கப்படுகிறது...',
  assignNewId: 'புதிய ID-ஐ வழங்கு',
  reassignConfirm: '"{name}"-க்கு (தற்போது {id}) புதிய KCC ID-ஐ வழங்கவா?',
  reassignMainAccountWarning:
    'எச்சரிக்கை: இது முதன்மைக் கணக்கு ID. இந்த உறுப்பினர் அதிகாரப்பூர்வ {email} கணக்காக இருந்தால் தொடர வேண்டாம்.',
  resultSuccess: 'வெற்றி: {message}',
  resultFailed: 'தோல்வி: {message}',

  // Duplicate registrations
  duplicatesTitle: 'நகல் பதிவுகள் (ஒரே நபர்)',
  duplicatesDesc:
    'படிவத்தை ஒன்றுக்கு மேற்பட்ட முறை நிரப்பிய உறுப்பினர்கள் (அதே WhatsApp எண், Discord, மின்னஞ்சல் அல்லது சமூக ஊடகம்). "ஒன்றிணை" என்பது புதிய தரவையும் ஒவ்வொரு WhatsApp எண்ணையும் முதல் பதிவில் வைக்கும் (அதன் KCC ID மாறாது), பிறகு நகலை அதன் அட்டையுடன் சேர்த்து நீக்கும். ஒன்றிணைப்பதற்கு முன் சரிபார்க்கவும்.',
  scanDuplicates: 'நகல் பதிவுகளை ஸ்கேன் செய்',
  mergeConfirm:
    '"{duplicate}" ({duplicateId}) பதிவை "{keeper}" ({keeperId}) உடன் ஒன்றிணைக்கவா?\n\nபுதிய தரவு & WhatsApp எண்கள் முதல் பதிவுக்கு நகலெடுக்கப்படும், பிறகு நகல் பதிவு நிரந்தரமாக நீக்கப்படும். தொடரவா?',
  mergeSuccess: '"{duplicate}", "{keeper}" உடன் ஒன்றிணைக்கப்பட்டது — KCC ID {id} மாறாது.',
  bulkMergeIdenticalConfirm:
    '{groups} முற்றிலும் ஒரேமாதிரியான நகல் குழுக்களை ({records} நகல் பதிவுகள்) ஒன்றிணைக்கவா?\n\nஅதே cosname மற்றும் முதன்மை WhatsApp எண் கொண்ட, அதிகபட்சம் {seconds} வினாடி இடைவெளியில் உருவாக்கப்பட்ட குழுக்கள் மட்டுமே (சரியான நகல்கள் / இரட்டை இறக்குமதிகள்).\nபுதிய தரவு & ஒவ்வொரு WhatsApp எண்ணும் முதல் பதிவுக்குச் செல்லும் (அதன் KCC ID மாறாது), பிறகு நகல்கள் நிரந்தரமாக நீக்கப்படும். தொடரவா?',
  bulkMergeAllConfirm:
    'ஸ்கேன் செய்யப்பட்ட அனைத்து {groups} குழுக்களையும் ({records} நகல் பதிவுகள்) ஒன்றிணைக்கவா?\n\nஅதே WhatsApp எண், Discord, மின்னஞ்சல், சமூக ஊடகம் அல்லது பெயரால் மட்டுமே பொருந்திய குழுக்களும் இதில் அடங்கும் — கீழே உள்ள பட்டியலைச் சரிபார்த்துவிட்டீர்கள் என்பதை உறுதிசெய்யவும்.\nபுதிய தரவு & ஒவ்வொரு WhatsApp எண்ணும் முதல் பதிவுக்குச் செல்லும் (அதன் KCC ID மாறாது), பிறகு நகல்கள் நிரந்தரமாக நீக்கப்படும். இதைத் திரும்பப் பெற முடியாது. தொடரவா?',
  bulkMergeDone: 'மொத்த ஒன்றிணைப்பு முடிந்தது ({mode}).',
  bulkModeIdentical: 'ஒரேமாதிரியான குழுக்கள்',
  bulkModeAll: 'அனைத்து ஸ்கேன் முடிவுகள்',
  bulkStatGroups: 'செயலாக்கப்பட்ட குழுக்கள்',
  bulkStatMergedGroups: 'ஒன்றிணைக்கப்பட்ட குழுக்கள்',
  bulkStatMergedRecords: 'ஒன்றிணைக்கப்பட்ட நகல்கள்',
  bulkStatFailedGroups: 'தோல்வியடைந்த குழுக்கள்',
  bulkMoreErrors: '…மேலும் {count} (உலாவி console-ஐப் பார்க்கவும்).',
  scanSummary:
    '{groups} நகல் குழுக்கள் ({records} நகல் பதிவுகள்) கண்டறியப்பட்டன; இவற்றில் {identical} ஒரேமாதிரியான குழுக்கள் (அதே cosname & முதன்மை WhatsApp எண், அதிகபட்சம் {seconds} வினாடி இடைவெளியில் உருவாக்கப்பட்டவை).',
  mergeAllIdentical: 'ஒரேமாதிரியானவை அனைத்தையும் ஒன்றிணை ({count})',
  mergeAllScanned: 'அனைத்து ஸ்கேன் முடிவுகளையும் ஒன்றிணை ({count})',
  bulkMergeProgress: '{done}/{total} குழுக்கள் ஒன்றிணைக்கப்படுகின்றன…',
  noDuplicatesFound: 'நகல் பதிவுகள் எதுவும் கண்டறியப்படவில்லை.',
  keeperBadge: 'தக்கவைக்கப்பட்டது (KCC ID மாறாது)',
  merging: 'ஒன்றிணைக்கப்படுகிறது...',
  mergeInto: '{id}-இல் ஒன்றிணை',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'தேடு...',
  filterAllRoles: 'அனைத்துப் பங்குகள் ({count})',
  filterAllCities: 'அனைத்து இடங்கள்',
  filterAllAges: 'அனைத்து வயதினர்',
  filterLegalAge: 'வயது வந்தோர் (18+)',
  filterMinor: 'சிறார் (<18)',
  filterPreferNotToSay: 'குறிப்பிடப்படவில்லை',
  sortNewest: '🕒 நேரம்: புதியவை முதலில்',
  sortNameAsc: '🔤 பெயர்: A → Z',
  purgeButtonTitle: 'Firestore-இல் உள்ள அனைத்து உறுப்பினர் தரவையும் அழி',
  purgeButton: 'உறுப்பினர் தரவை அழி',
  purging: 'அழிக்கப்படுகிறது...',
  purgePrompt:
    "கடும் எச்சரிக்கை: இது Firestore தரவுத்தளத்திலிருந்து அனைத்து உறுப்பினர் தரவையும் நிரந்தரமாக நீக்கும்.\n\nதரவுத்தளத்தை முழுவதுமாக அழிப்பதை உறுதிப்படுத்த '{keyword}' (பெரிய எழுத்துகளில்) என்று தட்டச்சு செய்யவும்:",
  purgeCancelled: 'உறுதிப்படுத்தல் ரத்துசெய்யப்பட்டது (முக்கியச் சொல் பொருந்தவில்லை).',
  purgeSuccess: 'அழித்தல் முடிந்தது: {count} உறுப்பினர் பதிவுகள் தரவுத்தளத்திலிருந்து நீக்கப்பட்டன.',
  purgeFailed: 'உறுப்பினர் தரவை நீக்க முடியவில்லை: {error}',
  exportNoData: 'ஏற்றுமதி செய்யத் தரவு எதுவும் இல்லை.',
  showingMembers: '{total} உறுப்பினர்களில் {shown} பேர் காட்டப்படுகின்றனர்',

  // CSV export column headers
  csvKccId: 'KCC ID (16 இலக்கங்கள்)',
  csvCosname: 'Cosname / புனைப்பெயர்',
  csvLegalName: 'சட்டப்பூர்வப் பெயர்',
  csvPrimaryWhatsapp: 'முதன்மை WhatsApp',
  csvBackupWhatsapp: 'மாற்று WhatsApp',
  csvDiscord: 'Discord பயனர்பெயர்',
  csvEmail: 'மின்னஞ்சல்',
  csvAgeCategory: 'வயதுப் பிரிவு',
  csvAge: 'வயது / பிறந்தநாள்',
  csvCountry: 'நாடு',
  csvProvince: 'மாகாணம்',
  csvCity: 'நகரம்',
  csvPrimaryRole: 'முதன்மைப் பங்கு',
  csvFandom: 'Fandom',
  csvExperience: 'அனுபவம்',
  csvStatus: 'நிலை',
  csvRegisteredAt: 'பதிவு தேதி',

  // Members table
  colMember: 'உறுப்பினர் / Cosname',
  colKccId: '16 இலக்க KCC ID',
  colContact: 'WhatsApp & தொடர்பு',
  colDiscord: 'Discord பயனர்பெயர்',
  colRole: 'பங்கு & ஆர்வங்கள்',
  colAge: 'வயது',
  colLocation: 'இடம்',
  colStatus: 'நிலை',
  colRegistered: 'பதிவுசெய்தது',
  colActions: 'செயல்கள்',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ இளையவர்',
  sortAgeOldest: '▼ மூத்தவர்',
  sortStatusAsc: '▲ சரிபார்த்தவை',
  sortStatusDesc: '▼ நிலுவை',
  sortTimeNewest: '▼ புதியவை',
  sortTimeOldest: '▲ பழையவை',
  legalNameValue: 'சட்டப்பூர்வப் பெயர்: {name}',
  mainAccountBadge: 'KCC முதன்மைக் கணக்கு',
  adminIdBadge: 'KCC நிர்வாகி #{number}',
  timestampIdBadge: 'நேரமுத்திரை ID',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'KCC ID-ஐக் காண்க',
  deleteMemberTitle: 'உறுப்பினரை நீக்கு',
  emptyDatabaseTitle: 'உறுப்பினர் தரவுத்தளம் காலியாக உள்ளது',
  emptyDatabaseDesc:
    'தரவுத்தளத்தில் இன்னும் உறுப்பினர் தரவு எதுவும் இல்லை. Google Form விரிதாளிலிருந்து இறக்குமதி செய்யவும் அல்லது புதிய பதிவுகளுக்காகக் காத்திருக்கவும்.',
  noResultsTitle: 'முடிவுகள் இல்லை',
  noResultsDesc: 'தேடல் சொல்லுடனோ தேர்ந்தெடுத்த வடிப்பான்களுடனோ பொருந்தும் உறுப்பினர் தரவு எதுவும் இல்லை.',
  openSheetsSync: 'Google Sheets & Form ஒத்திசைவைத் திற',
};

export default admin;
