import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Dashboard Admin KawanCosplay',
  dashboardDesc: 'Portal administrasi mligi kangge dhaptar anggota komunitas lan sinkron Google Sheets.',
  privacyRestrictedNotice:
    'Kangge njagi privasi anggota, dhaptar anggota namung saged dipunbikak dening administrator KawanCosplay.',
  exportCsv: 'Undhuh CSV',
  totalMembers: 'Gunggunge Anggota Kadhaftar',
  resetFilter: 'Wangsulaken Filter',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Mriksa akses admin...',
  signedInNotAdmin: 'Mlebet minangka {account} — akun punika sanes admin KCC.',
  emailNotVerified: 'Email dereng kaverifikasi — agem mlebet nganggo Google.',
  signInWithAdminGoogleEmail: 'Mlebet nganggo Akun Google Admin ({email})',
  signOutThisAccount: 'Medal',
  whatsappAdminHelp: 'Pitulungan admin lumantar WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portal Pangurusan KawanCosplay',
  verifiedAccessBadge: 'Akses Kaverifikasi',
  dashboardPrivacyNote:
    'Privasi anggota dipunjagi kanthi ketat: namung admin kadhaftar ingkang saged ningali jeneng & kontak.',
  whatsappHotlineShort: 'Hotline WA: {phone}',
  signOutAdmin: 'Medal saking Akun Admin',
  statusStat: 'Kawontenan: {status}',
  statusVerified: 'Kaverifikasi',
  statusActive: 'Aktif',
  statusPending: 'Ngentosi',
  tabMembers: 'Dhaptar & Data Anggota ({count})',
  tabSync: 'Sinkron Google Sheets & Formulir',
  tabStats: 'Statistik Komunitas',

  // Member list states
  permissionDeniedTitle: 'Akses Dipuntolak',
  permissionDeniedDesc:
    'Database nolak akses dhaptar anggota kangge akun punika. Mlebet nganggo akun Google admin ({email}) utawi akun ingkang kacathet ing koleksi admins, lajeng emot ulang kaca. Pesthekaken ugi Firestore Rules paling anyar sampun dipunpublikasikaken dhateng database {database}.',
  signInWithAdminGoogle: 'Mlebet nganggo Akun Google Admin',
  reloadPage: 'Emot Ulang Kaca',
  loadMembersFailedTitle: 'Dhaptar Anggota Mboten Saged Dipunemot',
  loadMembersFailedDesc: 'Dhaptar anggota mboten saged dipunemot. Priksa sambungan, lajeng emot ulang kaca.',
  loadingMembers: 'Ngemot data anggota...',

  // Member status & delete
  statusUpdateFailed: 'Mboten saged nganyari status anggota: {error}',
  deleteMemberConfirm: 'Busak anggota "{name}" (KCC ID: {id}) saking database Firestore?',
  deleteMemberFailed: 'Mboten saged mbusak anggota: {error}',

  // KCC ID & public card repair
  repairTitle: 'Pandandosan KCC ID & Kertu Umum',
  repairDesc:
    'Maringi KCC ID unik dhateng anggota ingkang ID-nipun dobel (pandhaftaran paling rumiyin tetep ngagem ID lami), nyimpen KCC ID ingkang dereng kasimpen, lan mbangun malih koleksi umum memberCards ingkang dipunagem kangge madosi kertu. Aman dipunlampahaken bola-bali.',
  repairDuplicatesDetected: 'Kadeteksi {count} anggota kanthi KCC ID dobel — pencet "{action}".',
  allIdsUnique: 'Sedaya KCC ID sampun unik.',
  runRepair: 'Lampahaken Pandandosan',
  repairRunning: 'Saweg ndandosi...',
  repairRunningProgress: 'Saweg ndandosi ({done}/{total})...',
  repairConfirm:
    'Lampahaken pandandosan KCC ID & kertu umum kangge sedaya anggota?\n\n- Anggota kanthi KCC ID dobel pikantuk ID enggal (pandhaftaran paling rumiyin tetep ngagem ID lami).\n- KCC ID ingkang dereng kasimpen badhe dipunsimpen.\n- Koleksi umum memberCards dipunbangun malih.\n\nAman dipunlampahaken bola-bali. Lajengaken?',
  repairFailed: 'Pandandosan gagal: {error}',
  repairDone: 'Pandandosan rampung.',
  repairStatScanned: 'Anggota dipunpriksa',
  repairStatDuplicateGroups: 'Klompok ID dobel',
  repairStatCardsWritten: 'Kertu dipunserat',
  repairStatCardsDeleted: 'Kertu dipunbusak',
  reassignedListTitle: 'KCC ID ingkang dipungantos / dipunsimpen ({count}):',
  repairReasonDuplicate: 'ID dobel',
  repairReasonMissing: 'ID dereng kasimpen',
  repairReasonMainAccount: 'ID Akun Utama dipunagem anggota sanes',
  noIdsChanged: 'Mboten wonten KCC ID ingkang perlu dipungantos.',
  issuesCount: 'Kalepatan ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID Mligi Admin / Akun Utama ({range})',
  reservedIdsDesc:
    'ID ing rentang punika namung kangge akun utama & admin KCC. Anggota ing ngandhap punika pikantuk ID kasebut saking peran/email ingkang dipunisi ing formulir umum (sistem lami). Pencet "{action}" kangge maringi KCC ID kronologis ingkang unik.',
  noReservedHolders: 'Mboten wonten anggota ingkang gadhah KCC ID mligi admin.',
  reservedHolderMeta: 'Sumber: {source} • Peran: {role}',
  processing: 'Saweg dipunproses...',
  assignNewId: 'Paringi ID Enggal',
  reassignConfirm: 'Paringi KCC ID enggal dhateng "{name}" (sapunika {id})?',
  reassignMainAccountWarning:
    'PENGET: punika ID Akun Utama. Ampun dipunlajengaken menawi anggota punika akun resmi {email}.',
  resultSuccess: 'Kasil: {message}',
  resultFailed: 'Gagal: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Pandhaftaran Dobel (Tiyang ingkang Sami)',
  duplicatesDesc:
    'Anggota ingkang ngisi formulir langkung saking sepisan (nomer WhatsApp, Discord, email utawi media sosial ingkang sami). "Gabungaken" nyimpen data paling anyar lan sedaya nomer WhatsApp ing pandhaftaran paling rumiyin (KCC ID-nipun tetep), lajeng mbusak data dobel sakkertunipun. Priksa rumiyin saderengipun nggabungaken.',
  scanDuplicates: 'Pados Pandhaftaran Dobel',
  mergeConfirm:
    'Gabungaken "{duplicate}" ({duplicateId}) dhateng "{keeper}" ({keeperId})?\n\nData paling anyar & nomer WhatsApp dipunsalin dhateng pandhaftaran paling rumiyin, lajeng data dobel dipunbusak permanen. Lajengaken?',
  mergeSuccess: '"{duplicate}" sampun dipungabungaken dhateng "{keeper}" — KCC ID {id} tetep.',
  bulkMergeIdenticalConfirm:
    'Gabungaken {groups} klompok dobel ingkang IDENTIK ({records} data dobel)?\n\nNamung klompok kanthi cosname lan nomer WhatsApp utama ingkang sami, ingkang wekdal damelipun benten paling kathah {seconds} detik (salinan persis / impor dobel).\nData paling anyar & sedaya nomer WhatsApp dipunpindhah dhateng pandhaftaran paling rumiyin (KCC ID-nipun tetep), lajeng data dobel dipunbusak permanen. Lajengaken?',
  bulkMergeAllConfirm:
    'Gabungaken SEDAYA {groups} klompok asil panelusuran ({records} data dobel)?\n\nPunika kalebet klompok ingkang namung cocog lumantar nomer WhatsApp, Discord, email, media sosial utawi jeneng ingkang sami — pesthekaken panjenengan sampun mriksa dhaptar ing ngandhap.\nData paling anyar & sedaya nomer WhatsApp dipunpindhah dhateng pandhaftaran paling rumiyin (KCC ID-nipun tetep), lajeng data dobel dipunbusak permanen. Tindakan punika mboten saged dipunwangsulaken. Lajengaken?',
  bulkMergeDone: 'Panggabungan massal rampung ({mode}).',
  bulkModeIdentical: 'klompok identik',
  bulkModeAll: 'sedaya asil panelusuran',
  bulkStatGroups: 'Klompok dipunproses',
  bulkStatMergedGroups: 'Klompok dipungabungaken',
  bulkStatMergedRecords: 'Data dobel dipungabungaken',
  bulkStatFailedGroups: 'Klompok gagal',
  bulkMoreErrors: '…lan {count} sanesipun (tingali console browser).',
  scanSummary:
    'Kapanggih {groups} klompok dobel ({records} data dobel), kalebet {identical} klompok identik (cosname & nomer WhatsApp utama sami, wekdal damelipun benten paling kathah {seconds} detik).',
  mergeAllIdentical: 'Gabungaken sedaya ingkang identik ({count})',
  mergeAllScanned: 'Gabungaken sedaya asil panelusuran ({count})',
  bulkMergeProgress: 'Nggabungaken {done}/{total} klompok…',
  noDuplicatesFound: 'Mboten wonten pandhaftaran dobel ingkang kadeteksi.',
  keeperBadge: 'Dipunjagi (KCC ID tetep)',
  merging: 'Saweg nggabungaken...',
  mergeInto: 'Gabungaken dhateng {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Pados...',
  filterAllRoles: 'Sedaya Peran ({count})',
  filterAllCities: 'Sedaya Panggonan',
  filterAllAges: 'Sedaya Umur',
  filterLegalAge: 'Diwasa (18+)',
  filterMinor: 'Dereng Diwasa (<18)',
  filterPreferNotToSay: 'Mboten dipunsebutaken',
  sortNewest: '🕒 Wekdal: Paling Anyar',
  sortNameAsc: '🔤 Jeneng: A → Z',
  purgeButtonTitle: 'Busak sedaya data anggota ing Firestore',
  purgeButton: 'Resiki Data Anggota',
  purging: 'Saweg ngresiki...',
  purgePrompt:
    'PENGET SANGET: Punika badhe MBUSAK SEDAYA DATA ANGGOTA saking database Firestore kanthi permanen.\n\nSerat \'{keyword}\' (aksara ageng) kangge ngonfirmasi ngresiki database:',
  purgeCancelled: 'Konfirmasi dipunbatalaken (tembung kunci mboten cocog).',
  purgeSuccess: 'Pambusakan rampung: {count} data anggota sampun dipunbusak saking database.',
  purgeFailed: 'Mboten saged mbusak data anggota: {error}',
  exportNoData: 'Mboten wonten data ingkang saged dipunekspor.',
  showingMembers: 'Nampilaken {shown} saking {total} anggota',

  // CSV export column headers
  csvKccId: 'KCC ID (16 Digit)',
  csvCosname: 'Cosname / Samaran',
  csvLegalName: 'Jeneng Asli',
  csvPrimaryWhatsapp: 'WhatsApp Utama',
  csvBackupWhatsapp: 'WhatsApp Cadhangan',
  csvDiscord: 'Username Discord',
  csvEmail: 'Email',
  csvAgeCategory: 'Kategori Umur',
  csvAge: 'Umur / Tanggal Lair',
  csvCountry: 'Negari',
  csvProvince: 'Provinsi',
  csvCity: 'Kutha',
  csvPrimaryRole: 'Peran Utama',
  csvFandom: 'Fandom',
  csvExperience: 'Pengalaman',
  csvStatus: 'Kawontenan',
  csvRegisteredAt: 'Tanggal Ndhaftar',

  // Members table
  colMember: 'Anggota / Cosname',
  colKccId: 'KCC ID 16 Digit',
  colContact: 'WhatsApp & Kontak',
  colDiscord: 'Username Discord',
  colRole: 'Peran & Minat',
  colAge: 'Umur',
  colLocation: 'Panggonan',
  colStatus: 'Kawontenan',
  colRegistered: 'Ndhaftar',
  colActions: 'Tindakan',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Paling Anem',
  sortAgeOldest: '▼ Paling Sepuh',
  sortStatusAsc: '▲ Verif',
  sortStatusDesc: '▼ Ngentosi',
  sortTimeNewest: '▼ Paling Anyar',
  sortTimeOldest: '▲ Paling Lami',
  legalNameValue: 'Jeneng asli: {name}',
  mainAccountBadge: 'Akun Utama KCC',
  adminIdBadge: 'Admin KCC #{number}',
  timestampIdBadge: 'ID Timestamp',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Tingali KCC ID',
  deleteMemberTitle: 'Busak Anggota',
  emptyDatabaseTitle: 'Database Anggota Kosong',
  emptyDatabaseDesc:
    'Dereng wonten data anggota ing database. Impor saking spreadsheet Google Form utawi entosi pandhaftaran enggal.',
  noResultsTitle: 'Mboten Wonten Asil',
  noResultsDesc: 'Mboten wonten data anggota ingkang cocog kaliyan tembung panelusuran utawi filter ingkang dipunpilih.',
  openSheetsSync: 'Bikak Sinkron Google Sheets & Formulir',
};

export default admin;
