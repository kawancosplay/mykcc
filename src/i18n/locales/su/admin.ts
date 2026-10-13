import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Dashboard Admin KawanCosplay',
  dashboardDesc: 'Portal administrasi husus kanggo daptar anggota komunitas sareng singkronisasi Google Sheets.',
  privacyRestrictedNotice: 'Pikeun ngajaga privasi anggota, daptar anggota ngan ukur tiasa diaksés ku Admin KawanCosplay.',
  exportCsv: 'Ékspor CSV',
  totalMembers: 'Total Anggota Daptar',
  resetFilter: 'Reset Saringan',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Nuju mariksa aksés admin...',
  signedInNotAdmin: 'Asup salaku {account} — akun ieu sanés admin KCC.',
  emailNotVerified: 'Surélék teu acan kavérifikasi — anggo asup nganggo Google.',
  signInWithAdminGoogleEmail: 'Asup nganggo Akun Google Admin ({email})',
  signOutThisAccount: 'Kaluar',
  whatsappAdminHelp: 'Bantosan admin ngalangkungan WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portal Pangurus KawanCosplay',
  verifiedAccessBadge: 'Aksés Kavérifikasi',
  dashboardPrivacyNote: 'Privasi anggota dijagi pisan: ngan ukur admin kadaptar anu tiasa ningali wasta & kontak.',
  whatsappHotlineShort: 'Hotline WA: {phone}',
  signOutAdmin: 'Kaluar tina Akun Admin',
  statusStat: 'Kaayaan: {status}',
  statusVerified: 'Kavérifikasi',
  statusActive: 'Aktif',
  statusPending: 'Ngantosan',
  tabMembers: 'Daptar & Roster Anggota ({count})',
  tabSync: 'Singkronisasi Google Sheets & Formulir',
  tabStats: 'Statistik Komunitas',

  // Member list states
  permissionDeniedTitle: 'Aksés Ditolak',
  permissionDeniedDesc:
    'Database nolak aksés ka daptar anggota kanggo akun ieu. Asup nganggo akun Google admin ({email}) atanapi akun anu kadaptar dina koléksi admins, teras muat deui kacana. Pastikeun ogé Firestore Rules panganyarna parantos dipublikasikeun ka database {database}.',
  signInWithAdminGoogle: 'Asup nganggo Akun Google Admin',
  reloadPage: 'Muat Deui Kaca',
  loadMembersFailedTitle: 'Daptar Anggota Teu Tiasa Dimuat',
  loadMembersFailedDesc: 'Daptar anggota teu tiasa dimuat. Pariksa sambungan anjeun, teras muat deui kacana.',
  loadingMembers: 'Nuju ngamuat data anggota...',

  // Member status & delete
  statusUpdateFailed: 'Kaayaan anggota teu tiasa diénggalkeun: {error}',
  deleteMemberConfirm: 'Hapus anggota "{name}" (KCC ID: {id}) tina database Firestore?',
  deleteMemberFailed: 'Anggota teu tiasa dihapus: {error}',

  // KCC ID & public card repair
  repairTitle: 'Perbaikan KCC ID & Kartu Umum',
  repairDesc:
    'Masihan KCC ID unik ka anggota anu ID-na duplikat (pendaftaran pangheulana tetep nganggo ID lami), nyimpen KCC ID anu teu acan disimpen, sareng ngawangun deui koléksi umum memberCards anu dianggo pikeun milarian kartu. Aman dijalankeun sababaraha kali.',
  repairDuplicatesDetected: 'Kapendak {count} anggota kalayan KCC ID duplikat — pencét "{action}".',
  allIdsUnique: 'Sadaya KCC ID unik.',
  runRepair: 'Jalankeun Perbaikan',
  repairRunning: 'Nuju ngalereskeun...',
  repairRunningProgress: 'Nuju ngalereskeun ({done}/{total})...',
  repairConfirm:
    'Jalankeun perbaikan KCC ID & kartu umum kanggo sadaya anggota?\n\n- Anggota kalayan KCC ID duplikat bakal kénging ID énggal (pendaftaran pangheulana tetep nganggo ID lami).\n- KCC ID anu teu acan disimpen bakal disimpen.\n- Koléksi umum memberCards diwangun deui.\n\nAman dijalankeun sababaraha kali. Teraskeun?',
  repairFailed: 'Perbaikan gagal: {error}',
  repairDone: 'Perbaikan réngsé.',
  repairStatScanned: 'Anggota dipindai',
  repairStatDuplicateGroups: 'Grup ID duplikat',
  repairStatCardsWritten: 'Kartu diserat',
  repairStatCardsDeleted: 'Kartu dihapus',
  reassignedListTitle: 'KCC ID anu dirobih / disimpen ({count}):',
  repairReasonDuplicate: 'ID duplikat',
  repairReasonMissing: 'ID teu acan disimpen',
  repairReasonMainAccount: 'ID Akun Utama dianggo ku anggota sanés',
  noIdsChanged: 'Teu aya KCC ID anu kedah dirobih.',
  issuesCount: 'Kasalahan ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID Cadangan Admin / Akun Utama ({range})',
  reservedIdsDesc:
    'ID dina rentang ieu ngan ukur kanggo akun utama & admin KCC. Anggota di handap kénging ID éta tina peran/surélék anu dilebetkeun dina formulir umum (sistem lami). Pencét "{action}" pikeun masihan KCC ID kronologis anu unik.',
  noReservedHolders: 'Teu aya anggota anu gaduh KCC ID husus admin.',
  reservedHolderMeta: 'Sumber: {source} • Peran: {role}',
  processing: 'Nuju ngolah...',
  assignNewId: 'Pasihan ID Énggal',
  reassignConfirm: 'Pasihan KCC ID énggal ka "{name}" (ayeuna {id})?',
  reassignMainAccountWarning:
    'PÉPÉLING: ieu ID Akun Utama. Ulah diteraskeun upami anggota ieu mangrupikeun akun resmi {email}.',
  resultSuccess: 'Suksés: {message}',
  resultFailed: 'Gagal: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Pendaftaran Ganda (Jalmi anu Sami)',
  duplicatesDesc:
    'Anggota anu ngeusian formulir langkung ti sakali (nomer WhatsApp, Discord, surélék, atanapi média sosial anu sami). "Gabungkeun" nyimpen data panganyarna sareng sadaya nomer WhatsApp dina pendaftaran pangheulana (KCC ID-na tetep), teras ngahapus duplikatna babarengan sareng kartuna. Pariksa heula sateuacan ngagabungkeun.',
  scanDuplicates: 'Pindai Pendaftaran Ganda',
  mergeConfirm:
    'Gabungkeun "{duplicate}" ({duplicateId}) ka "{keeper}" ({keeperId})?\n\nData panganyarna & nomer WhatsApp ditiron ka pendaftaran pangheulana, teras duplikatna dihapus permanén. Teraskeun?',
  mergeSuccess: '"{duplicate}" parantos digabungkeun ka "{keeper}" — KCC ID {id} tetep.',
  bulkMergeIdenticalConfirm:
    'Gabungkeun {groups} grup duplikat anu IDÉNTIK ({records} data duplikat)?\n\nNgan ukur grup kalayan cosname sareng nomer WhatsApp utama anu sami, anu didamel kalayan bédana paling lami {seconds} detik (tiron persis / impor ganda).\nData panganyarna & sadaya nomer WhatsApp dipindahkeun ka pendaftaran pangheulana (KCC ID-na tetep), teras duplikatna dihapus permanén. Teraskeun?',
  bulkMergeAllConfirm:
    'Gabungkeun SADAYA {groups} grup hasil pindaian ({records} data duplikat)?\n\nIeu kalebet grup anu cocog ngan ukur ku nomer WhatsApp, Discord, surélék, média sosial, atanapi wasta anu sami — pastikeun anjeun parantos mariksa daptar di handap.\nData panganyarna & sadaya nomer WhatsApp dipindahkeun ka pendaftaran pangheulana (KCC ID-na tetep), teras duplikatna dihapus permanén. Ieu teu tiasa dibolaykeun. Teraskeun?',
  bulkMergeDone: 'Ngagabungkeun masal réngsé ({mode}).',
  bulkModeIdentical: 'grup idéntik',
  bulkModeAll: 'sadaya hasil pindaian',
  bulkStatGroups: 'Grup diolah',
  bulkStatMergedGroups: 'Grup digabungkeun',
  bulkStatMergedRecords: 'Duplikat digabungkeun',
  bulkStatFailedGroups: 'Grup gagal',
  bulkMoreErrors: '…sareng {count} deui (tingali konsol panyungsi).',
  scanSummary:
    'Kapendak {groups} grup duplikat ({records} data duplikat), kalebet {identical} grup idéntik (cosname & nomer WhatsApp utama sami, didamel kalayan bédana paling lami {seconds} detik).',
  mergeAllIdentical: 'Gabungkeun sadaya anu idéntik ({count})',
  mergeAllScanned: 'Gabungkeun sadaya hasil pindaian ({count})',
  bulkMergeProgress: 'Nuju ngagabungkeun {done}/{total} grup…',
  noDuplicatesFound: 'Teu aya pendaftaran ganda anu kapendak.',
  keeperBadge: 'Dijaga (KCC ID tetep)',
  merging: 'Nuju ngagabungkeun...',
  mergeInto: 'Gabungkeun ka {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Milarian...',
  filterAllRoles: 'Sadaya Peran ({count})',
  filterAllCities: 'Sadaya Lokasi',
  filterAllAges: 'Sadaya Umur',
  filterLegalAge: 'Sawawa (18+)',
  filterMinor: 'Handapeun Umur (<18)',
  filterPreferNotToSay: 'Teu disebatkeun',
  sortNewest: '🕒 Waktos: Panganyarna',
  sortNameAsc: '🔤 Wasta: A → Z',
  purgeButtonTitle: 'Beresihan sadaya data anggota di Firestore',
  purgeButton: 'Beresihan Data Anggota',
  purging: 'Nuju meresihan...',
  purgePrompt:
    'PÉPÉLING SERIUS: Ieu bakal NGAHAPUS SADAYA DATA ANGGOTA tina database Firestore sacara permanén.\n\nSerat \'{keyword}\' (hurup ageung) pikeun mastikeun ngahapus database:',
  purgeCancelled: 'Konfirmasi dibolaykeun (kecap anu diserat teu cocog).',
  purgeSuccess: 'Beberesih réngsé: {count} data anggota parantos dihapus tina database.',
  purgeFailed: 'Data anggota teu tiasa dihapus: {error}',
  exportNoData: 'Teu aya data kanggo diékspor.',
  showingMembers: 'Nembongkeun {shown} ti {total} anggota',

  // CSV export column headers
  csvKccId: 'KCC ID (16 Digit)',
  csvCosname: 'Cosname / Sandiasma',
  csvLegalName: 'Wasta Legal',
  csvPrimaryWhatsapp: 'WhatsApp Utama',
  csvBackupWhatsapp: 'WhatsApp Cadangan',
  csvDiscord: 'Wasta Pangguna Discord',
  csvEmail: 'Surélék',
  csvAgeCategory: 'Kategori Umur',
  csvAge: 'Umur / Tanggal Lahir',
  csvCountry: 'Nagara',
  csvProvince: 'Provinsi',
  csvCity: 'Kota',
  csvPrimaryRole: 'Peran Utama',
  csvFandom: 'Fandom Karesep',
  csvExperience: 'Pangalaman',
  csvStatus: 'Kaayaan',
  csvRegisteredAt: 'Tanggal Daptar',

  // Members table
  colMember: 'Anggota / Cosname',
  colKccId: 'KCC ID 16-Digit',
  colContact: 'WhatsApp & Kontak',
  colDiscord: 'Wasta Pangguna Discord',
  colRole: 'Peran & Minat',
  colAge: 'Umur',
  colLocation: 'Lokasi',
  colStatus: 'Kaayaan',
  colRegistered: 'Kadaptar',
  colActions: 'Tindakan',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Pangngorana',
  sortAgeOldest: '▼ Pangkolotna',
  sortStatusAsc: '▲ Vérif',
  sortStatusDesc: '▼ Antos',
  sortTimeNewest: '▼ Panganyarna',
  sortTimeOldest: '▲ Pangheulana',
  legalNameValue: 'Wasta legal: {name}',
  mainAccountBadge: 'Akun Utama KCC',
  adminIdBadge: 'Admin KCC #{number}',
  timestampIdBadge: 'ID Timestamp',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Tingali KCC ID',
  deleteMemberTitle: 'Hapus Anggota',
  emptyDatabaseTitle: 'Database Anggota Kosong',
  emptyDatabaseDesc:
    'Teu acan aya data anggota dina database. Impor tina spreadsheet Google Form atanapi antosan pendaftaran énggal.',
  noResultsTitle: 'Teu Aya Hasil',
  noResultsDesc: 'Teu aya data anggota anu cocog sareng kecap pamilarian atanapi saringan anu dipilih.',
  openSheetsSync: 'Buka Singkronisasi Google Sheets & Formulir',
};

export default admin;
