import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Admin Dashboard ng KawanCosplay',
  dashboardDesc: 'Nakalaang portal ng admin para sa talaan ng mga miyembro ng komunidad at sync ng Google Sheets.',
  loginPrompt: 'Ilagay ang Admin Passkey o mag-sign in bilang cosplaysehat@gmail.com',
  privacyRestrictedNotice: 'Para protektahan ang privacy ng mga miyembro, ang talaan ng miyembro ay para lamang sa mga admin ng KawanCosplay.',
  exportCsv: 'I-export ang CSV',
  totalMembers: 'Kabuuang Rehistradong Miyembro',
  resetFilter: 'I-reset ang Filter',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Sinusuri ang admin access...',
  signedInNotAdmin: 'Naka-sign in bilang {account} — hindi admin ng KCC ang account na ito.',
  emailNotVerified: 'Hindi pa verified ang email — gamitin ang Google sign-in.',
  signInWithAdminGoogleEmail: 'Mag-sign in gamit ang Admin Google Account ({email})',
  signOutThisAccount: 'Mag-sign out',
  whatsappAdminHelp: 'Tulong mula sa admin sa WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Management Portal ng KawanCosplay',
  verifiedAccessBadge: 'Verified na Access',
  dashboardPrivacyNote: 'Mahigpit na pinoprotektahan ang privacy ng mga miyembro: ang mga rehistradong admin lang ang nakakakita ng mga pangalan at contact.',
  whatsappHotlineShort: 'WA Hotline: {phone}',
  signOutAdmin: 'Mag-sign out sa Admin Account',
  statusStat: 'Katayuan: {status}',
  statusVerified: 'Verified na',
  statusActive: 'Aktibo',
  statusPending: 'Nakabinbin',
  tabMembers: 'Listahan ng Miyembro ({count})',
  tabSync: 'Sync ng Google Sheets at Form',
  tabStats: 'Stats ng Komunidad',

  // Member list states
  permissionDeniedTitle: 'Tinanggihan ang Access',
  permissionDeniedDesc:
    'Tinanggihan ng database ang access sa listahan ng miyembro para sa account na ito. Mag-sign in gamit ang admin Google account ({email}) o isang account na nakalista sa admins collection, pagkatapos ay i-reload ang page. Siguraduhin ding naka-publish ang pinakabagong Firestore Rules sa database na {database}.',
  signInWithAdminGoogle: 'Mag-sign in gamit ang Admin Google Account',
  reloadPage: 'I-reload ang Page',
  loadMembersFailedTitle: 'Hindi Ma-load ang Listahan ng Miyembro',
  loadMembersFailedDesc: 'Hindi ma-load ang listahan ng miyembro. Suriin ang iyong koneksyon, pagkatapos ay i-reload ang page.',
  loadingMembers: 'Nilo-load ang data ng mga miyembro...',

  // Member status & delete
  statusUpdateFailed: 'Hindi ma-update ang status ng miyembro: {error}',
  deleteMemberConfirm: 'Burahin ang miyembrong "{name}" (KCC ID: {id}) mula sa Firestore database?',
  deleteMemberFailed: 'Hindi mabura ang miyembro: {error}',

  // KCC ID & public card repair
  repairTitle: 'Pag-aayos ng KCC ID at Pampublikong Card',
  repairDesc:
    'Nagbibigay ng natatanging KCC ID sa mga miyembrong may dobleng ID (ang pinakaunang nagparehistro ang magpapanatili ng lumang ID), sine-save ang mga KCC ID na hindi pa naka-save, at binubuo muli ang pampublikong memberCards collection na ginagamit sa paghahanap ng card. Ligtas itong patakbuhin nang paulit-ulit.',
  repairDuplicatesDetected: 'May natukoy na {count} miyembrong may dobleng KCC ID — pindutin ang "{action}".',
  allIdsUnique: 'Natatangi ang lahat ng KCC ID.',
  runRepair: 'Simulan ang Pag-aayos',
  repairRunning: 'Inaayos...',
  repairRunningProgress: 'Inaayos ({done}/{total})...',
  repairConfirm:
    'Patakbuhin ang pag-aayos ng KCC ID at pampublikong card para sa lahat ng miyembro?\n\n- Ang mga miyembrong may dobleng KCC ID ay bibigyan ng bagong ID (ang pinakaunang nagparehistro ang magpapanatili ng lumang ID).\n- Ise-save ang mga KCC ID na hindi pa naka-save.\n- Bubuuin muli ang pampublikong memberCards collection.\n\nLigtas itong patakbuhin nang paulit-ulit. Ituloy?',
  repairFailed: 'Nabigo ang pag-aayos: {error}',
  repairDone: 'Tapos na ang pag-aayos.',
  repairStatScanned: 'Mga miyembrong na-scan',
  repairStatDuplicateGroups: 'Mga grupo ng dobleng ID',
  repairStatCardsWritten: 'Mga card na naisulat',
  repairStatCardsDeleted: 'Mga card na nabura',
  reassignedListTitle: 'Mga KCC ID na binago / na-save ({count}):',
  repairReasonDuplicate: 'dobleng ID',
  repairReasonMissing: 'hindi pa naka-save ang ID',
  repairReasonMainAccount: 'Ginagamit ng ibang miyembro ang Main Account ID',
  noIdsChanged: 'Walang KCC ID na kailangang baguhin.',
  issuesCount: 'Mga error ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'Mga KCC ID na Nakalaan sa Admin / Main Account ({range})',
  reservedIdsDesc:
    'Ang mga ID sa saklaw na ito ay para lamang sa main account at mga admin ng KCC. Nakakuha nito ang mga miyembro sa ibaba dahil sa role/email na inilagay nila sa pampublikong form (lumang sistema). Pindutin ang "{action}" para bigyan sila ng natatangi at sunud-sunod na KCC ID.',
  noReservedHolders: 'Walang miyembrong may hawak na KCC ID na para lang sa admin.',
  reservedHolderMeta: 'Pinagmulan: {source} • Role: {role}',
  processing: 'Pinoproseso...',
  assignNewId: 'Magbigay ng Bagong ID',
  reassignConfirm: 'Bigyan ng bagong KCC ID si "{name}" (kasalukuyang {id})?',
  reassignMainAccountWarning:
    'BABALA: ito ang Main Account ID. Huwag ituloy kung ang miyembrong ito ay ang opisyal na account na {email}.',
  resultSuccess: 'Tagumpay: {message}',
  resultFailed: 'Nabigo: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Dobleng Rehistrasyon (Iisang Tao)',
  duplicatesDesc:
    'Mga miyembrong nag-fill out ng form nang higit sa isang beses (parehong WhatsApp number, Discord, email o social media). Ang "Pagsamahin" ay inililipat ang pinakabagong data at lahat ng WhatsApp number sa pinakaunang rehistrasyon (mananatili ang KCC ID nito), pagkatapos ay binubura ang duplicate kasama ang card nito. Suriing mabuti bago pagsamahin.',
  scanDuplicates: 'I-scan ang Dobleng Rehistrasyon',
  mergeConfirm:
    'Pagsamahin ang "{duplicate}" ({duplicateId}) sa "{keeper}" ({keeperId})?\n\nKokopyahin ang pinakabagong data at mga WhatsApp number sa pinakaunang rehistrasyon, pagkatapos ay permanenteng buburahin ang duplicate. Ituloy?',
  mergeSuccess: 'Napagsama na ang "{duplicate}" sa "{keeper}" — mananatili ang KCC ID {id}.',
  bulkMergeIdenticalConfirm:
    'Pagsamahin ang {groups} na MAGKAKAPAREHONG grupo ng duplicate ({records} na dobleng record)?\n\nKasama lang ang mga grupong may parehong cosname at pangunahing WhatsApp number, na ginawa nang hindi hihigit sa {seconds} segundo ang pagitan (eksaktong kopya / dobleng import).\nMapupunta ang pinakabagong data at lahat ng WhatsApp number sa pinakaunang rehistrasyon (mananatili ang KCC ID nito), pagkatapos ay permanenteng buburahin ang mga duplicate. Ituloy?',
  bulkMergeAllConfirm:
    'Pagsamahin ang LAHAT ng {groups} na na-scan na grupo ({records} na dobleng record)?\n\nKasama rito ang mga grupong nagtugma lang dahil sa parehong WhatsApp number, Discord, email, social media o pangalan — siguraduhing nasuri mo na ang listahan sa ibaba.\nMapupunta ang pinakabagong data at lahat ng WhatsApp number sa pinakaunang rehistrasyon (mananatili ang KCC ID nito), pagkatapos ay permanenteng buburahin ang mga duplicate. Hindi na ito maaaring bawiin. Ituloy?',
  bulkMergeDone: 'Tapos na ang maramihang pagsasama ({mode}).',
  bulkModeIdentical: 'magkakaparehong grupo',
  bulkModeAll: 'lahat ng resulta ng scan',
  bulkStatGroups: 'Mga grupong naproseso',
  bulkStatMergedGroups: 'Mga grupong napagsama',
  bulkStatMergedRecords: 'Mga duplicate na napagsama',
  bulkStatFailedGroups: 'Mga grupong nabigo',
  bulkMoreErrors: '…at {count} pa (tingnan ang browser console).',
  scanSummary:
    'May nakitang {groups} na grupo ng duplicate ({records} na dobleng record), kasama ang {identical} na magkakaparehong grupo (parehong cosname at pangunahing WhatsApp number, ginawa nang hindi hihigit sa {seconds} segundo ang pagitan).',
  mergeAllIdentical: 'Pagsamahin ang lahat ng magkapareho ({count})',
  mergeAllScanned: 'Pagsamahin ang lahat ng resulta ({count})',
  bulkMergeProgress: 'Pinagsasama ang {done}/{total} na grupo…',
  noDuplicatesFound: 'Walang natukoy na dobleng rehistrasyon.',
  keeperBadge: 'Pinanatili (mananatili ang KCC ID)',
  merging: 'Pinagsasama...',
  mergeInto: 'Isama sa {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Maghanap...',
  filterAllRoles: 'Lahat ng Role ({count})',
  filterAllCities: 'Lahat ng Lokasyon',
  filterAllAges: 'Lahat ng Edad',
  filterLegalAge: 'Nasa Hustong Gulang (18+)',
  filterMinor: 'Menor de Edad (<18)',
  filterPreferNotToSay: 'Hindi tinukoy',
  sortNewest: '🕒 Oras: Pinakabago',
  sortNameAsc: '🔤 Pangalan: A → Z',
  purgeButtonTitle: 'Burahin ang lahat ng data ng miyembro sa Firestore',
  purgeButton: 'Burahin ang Data ng Miyembro',
  purging: 'Binubura...',
  purgePrompt:
    "MATINDING BABALA: PERMANENTENG BUBURAHIN nito ang LAHAT NG DATA NG MIYEMBRO mula sa Firestore database.\n\nI-type ang '{keyword}' (sa malalaking titik) para kumpirmahin ang pagbura sa database:",
  purgeCancelled: 'Kinansela ang kumpirmasyon (hindi tugma ang keyword).',
  purgeSuccess: 'Tapos na ang pagbura: {count} na record ng miyembro ang nabura mula sa database.',
  purgeFailed: 'Hindi mabura ang data ng miyembro: {error}',
  exportNoData: 'Walang data na maie-export.',
  showingMembers: 'Ipinapakita ang {shown} sa {total} na miyembro',

  // CSV export column headers
  csvKccId: 'KCC ID (16 na Digit)',
  csvCosname: 'Cosname / Alyas',
  csvLegalName: 'Legal na Pangalan',
  csvPrimaryWhatsapp: 'Pangunahing WhatsApp',
  csvBackupWhatsapp: 'Backup na WhatsApp',
  csvDiscord: 'Username sa Discord',
  csvEmail: 'Email',
  csvAgeCategory: 'Kategorya ng Edad',
  csvAge: 'Edad / Kaarawan',
  csvCountry: 'Bansa',
  csvProvince: 'Probinsya',
  csvCity: 'Lungsod',
  csvPrimaryRole: 'Pangunahing Role',
  csvFandom: 'Fandom',
  csvExperience: 'Karanasan',
  csvStatus: 'Katayuan',
  csvRegisteredAt: 'Petsa ng Rehistrasyon',

  // Members table
  colMember: 'Miyembro / Cosname',
  colKccId: '16-Digit na KCC ID',
  colContact: 'WhatsApp at Contact',
  colDiscord: 'Username sa Discord',
  colRole: 'Role at Interes',
  colAge: 'Edad',
  colLocation: 'Lokasyon',
  colStatus: 'Katayuan',
  colRegistered: 'Nagparehistro',
  colActions: 'Aksyon',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Pinakabata',
  sortAgeOldest: '▼ Pinakamatanda',
  sortStatusAsc: '▲ Ver',
  sortStatusDesc: '▼ Bin',
  sortTimeNewest: '▼ Pinakabago',
  sortTimeOldest: '▲ Pinakaluma',
  legalNameValue: 'Legal na pangalan: {name}',
  mainAccountBadge: 'KCC Main Account',
  adminIdBadge: 'KCC Admin #{number}',
  timestampIdBadge: 'ID mula sa Timestamp',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Tingnan ang KCC ID',
  deleteMemberTitle: 'Burahin ang Miyembro',
  emptyDatabaseTitle: 'Walang Laman ang Database ng Miyembro',
  emptyDatabaseDesc:
    'Wala pang data ng miyembro sa database. Mag-import mula sa Google Form spreadsheet o hintayin ang mga bagong rehistrasyon.',
  noResultsTitle: 'Walang Resulta',
  noResultsDesc: 'Walang data ng miyembro na tumutugma sa hinanap na keyword o sa napiling mga filter.',
  openSheetsSync: 'Buksan ang Sync ng Google Sheets at Form',
};

export default admin;
