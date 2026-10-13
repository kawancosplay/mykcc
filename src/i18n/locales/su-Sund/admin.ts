import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'ᮓᮞ᮪ᮘᮧᮁᮓ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪',
  dashboardDesc: 'ᮕᮧᮁᮒᮜ᮪ ᮃᮓ᮪ᮙᮤᮔᮤᮞ᮪ᮒᮢᮞᮤ ᮠᮥᮞᮥᮞ᮪ ᮊᮀᮌᮧ ᮓᮕ᮪ᮒᮁ ᮃᮀᮌᮧᮒ ᮊᮧᮙᮥᮔᮤᮒᮞ᮪ ᮞᮛᮨᮀ ᮞᮤᮀᮊᮢᮧᮔᮤᮞᮞᮤ Google Sheets.',
  privacyRestrictedNotice: 'ᮕᮤᮊᮩᮔ᮪ ᮍᮏᮌ ᮕᮢᮤᮗᮞᮤ ᮃᮀᮌᮧᮒ, ᮓᮕ᮪ᮒᮁ ᮃᮀᮌᮧᮒ ᮍᮔ᮪ ᮅᮊᮥᮁ ᮒᮤᮃᮞ ᮓᮤᮃᮊ᮪ᮞᮦᮞ᮪ ᮊᮥ ᮃᮓ᮪ᮙᮤᮔ᮪ KawanCosplay.',
  exportCsv: 'ᮆᮊ᮪ᮞ᮪ᮕᮧᮁ CSV',
  totalMembers: 'ᮒᮧᮒᮜ᮪ ᮃᮀᮌᮧᮒ ᮓᮕ᮪ᮒᮁ',
  resetFilter: 'ᮛᮤᮞᮦᮒ᮪ ᮞᮛᮤᮍᮔ᮪',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'ᮔᮥᮏᮥ ᮙᮛᮤᮊ᮪ᮞ ᮃᮊ᮪ᮞᮦᮞ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪...',
  signedInNotAdmin: 'ᮃᮞᮥᮕ᮪ ᮞᮜᮊᮥ {account} — ᮃᮊᮥᮔ᮪ ᮄᮉ ᮞᮔᮦᮞ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪ KCC.',
  emailNotVerified: 'ᮞᮥᮛᮦᮜᮦᮊ᮪ ᮒᮩ ᮃᮎᮔ᮪ ᮊᮗᮦᮛᮤᮖᮤᮊᮞᮤ — ᮃᮀᮌᮧ ᮃᮞᮥᮕ᮪ ᮍᮀᮌᮧ Google.',
  signInWithAdminGoogleEmail: 'ᮃᮞᮥᮕ᮪ ᮍᮀᮌᮧ ᮃᮊᮥᮔ᮪ Google ᮃᮓ᮪ᮙᮤᮔ᮪ ({email})',
  signOutThisAccount: 'ᮊᮜᮥᮃᮁ',
  whatsappAdminHelp: 'ᮘᮔ᮪ᮒᮧᮞᮔ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪ ᮍᮜᮀᮊᮥᮍᮔ᮪ WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'ᮕᮧᮁᮒᮜ᮪ ᮕᮍᮥᮛᮥᮞ᮪ KawanCosplay',
  verifiedAccessBadge: 'ᮃᮊ᮪ᮞᮦᮞ᮪ ᮊᮗᮦᮛᮤᮖᮤᮊᮞᮤ',
  dashboardPrivacyNote: 'ᮕᮢᮤᮗᮞᮤ ᮃᮀᮌᮧᮒ ᮓᮤᮏᮌᮤ ᮕᮤᮞᮔ᮪: ᮍᮔ᮪ ᮅᮊᮥᮁ ᮃᮓ᮪ᮙᮤᮔ᮪ ᮊᮓᮕ᮪ᮒᮁ ᮃᮔᮥ ᮒᮤᮃᮞ ᮔᮤᮍᮜᮤ ᮝᮞ᮪ᮒ & ᮊᮧᮔ᮪ᮒᮊ᮪.',
  whatsappHotlineShort: 'ᮠᮧᮒ᮪ᮜᮄᮔ᮪ WA: {phone}',
  signOutAdmin: 'ᮊᮜᮥᮃᮁ ᮒᮤᮔ ᮃᮊᮥᮔ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪',
  statusStat: 'ᮊᮃᮚᮃᮔ᮪: {status}',
  statusVerified: 'ᮊᮗᮦᮛᮤᮖᮤᮊᮞᮤ',
  statusActive: 'ᮃᮊ᮪ᮒᮤᮖ᮪',
  statusPending: 'ᮍᮔ᮪ᮒᮧᮞᮔ᮪',
  tabMembers: 'ᮓᮕ᮪ᮒᮁ & ᮛᮧᮞ᮪ᮒᮨᮁ ᮃᮀᮌᮧᮒ ({count})',
  tabSync: 'ᮞᮤᮀᮊᮢᮧᮔᮤᮞᮞᮤ Google Sheets & ᮖᮧᮁᮙᮥᮜᮤᮁ',
  tabStats: 'ᮞ᮪ᮒᮒᮤᮞ᮪ᮒᮤᮊ᮪ ᮊᮧᮙᮥᮔᮤᮒᮞ᮪',

  // Member list states
  permissionDeniedTitle: 'ᮃᮊ᮪ᮞᮦᮞ᮪ ᮓᮤᮒᮧᮜᮊ᮪',
  permissionDeniedDesc:
    'ᮓᮒᮘᮦᮞ᮪ ᮔᮧᮜᮊ᮪ ᮃᮊ᮪ᮞᮦᮞ᮪ ᮊ ᮓᮕ᮪ᮒᮁ ᮃᮀᮌᮧᮒ ᮊᮀᮌᮧ ᮃᮊᮥᮔ᮪ ᮄᮉ. ᮃᮞᮥᮕ᮪ ᮍᮀᮌᮧ ᮃᮊᮥᮔ᮪ Google ᮃᮓ᮪ᮙᮤᮔ᮪ ({email}) ᮃᮒᮔᮕᮤ ᮃᮊᮥᮔ᮪ ᮃᮔᮥ ᮊᮓᮕ᮪ᮒᮁ ᮓᮤᮔ ᮊᮧᮜᮦᮊ᮪ᮞᮤ admins, ᮒᮨᮛᮞ᮪ ᮙᮥᮃᮒ᮪ ᮓᮩᮄ ᮊᮎᮔ. ᮕᮞ᮪ᮒᮤᮊᮩᮔ᮪ ᮇᮌᮦ Firestore Rules ᮕᮍᮑᮁᮔ ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮓᮤᮕᮥᮘ᮪ᮜᮤᮊᮞᮤᮊᮩᮔ᮪ ᮊ ᮓᮒᮘᮦᮞ᮪ {database}.',
  signInWithAdminGoogle: 'ᮃᮞᮥᮕ᮪ ᮍᮀᮌᮧ ᮃᮊᮥᮔ᮪ Google ᮃᮓ᮪ᮙᮤᮔ᮪',
  reloadPage: 'ᮙᮥᮃᮒ᮪ ᮓᮩᮄ ᮊᮎ',
  loadMembersFailedTitle: 'ᮓᮕ᮪ᮒᮁ ᮃᮀᮌᮧᮒ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮙᮥᮃᮒ᮪',
  loadMembersFailedDesc: 'ᮓᮕ᮪ᮒᮁ ᮃᮀᮌᮧᮒ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮙᮥᮃᮒ᮪. ᮕᮛᮤᮊ᮪ᮞ ᮞᮙ᮪ᮘᮥᮍᮔ᮪ ᮃᮔ᮪ᮏᮩᮔ᮪, ᮒᮨᮛᮞ᮪ ᮙᮥᮃᮒ᮪ ᮓᮩᮄ ᮊᮎᮔ.',
  loadingMembers: 'ᮔᮥᮏᮥ ᮍᮙᮥᮃᮒ᮪ ᮓᮒ ᮃᮀᮌᮧᮒ...',

  // Member status & delete
  statusUpdateFailed: 'ᮊᮃᮚᮃᮔ᮪ ᮃᮀᮌᮧᮒ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮆᮀᮌᮜ᮪ᮊᮩᮔ᮪: {error}',
  deleteMemberConfirm: 'ᮠᮕᮥᮞ᮪ ᮃᮀᮌᮧᮒ "{name}" (KCC ID: {id}) ᮒᮤᮔ ᮓᮒᮘᮦᮞ᮪ Firestore?',
  deleteMemberFailed: 'ᮃᮀᮌᮧᮒ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮠᮕᮥᮞ᮪: {error}',

  // KCC ID & public card repair
  repairTitle: 'ᮕᮨᮁᮘᮄᮊᮔ᮪ KCC ID & ᮊᮁᮒᮥ ᮅᮙᮥᮙ᮪',
  repairDesc:
    'ᮙᮞᮤᮠᮔ᮪ KCC ID ᮅᮔᮤᮊ᮪ ᮊ ᮃᮀᮌᮧᮒ ᮃᮔᮥ ID-ᮔ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ (ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮕᮀᮠᮩᮜᮔ ᮒᮨᮒᮨᮕ᮪ ᮍᮀᮌᮧ ID ᮜᮙᮤ), ᮑᮤᮙ᮪ᮕᮨᮔ᮪ KCC ID ᮃᮔᮥ ᮒᮩ ᮃᮎᮔ᮪ ᮓᮤᮞᮤᮙ᮪ᮕᮨᮔ᮪, ᮞᮛᮨᮀ ᮍᮝᮍᮥᮔ᮪ ᮓᮩᮄ ᮊᮧᮜᮦᮊ᮪ᮞᮤ ᮅᮙᮥᮙ᮪ memberCards ᮃᮔᮥ ᮓᮤᮃᮀᮌᮧ ᮕᮤᮊᮩᮔ᮪ ᮙᮤᮜᮛᮤᮃᮔ᮪ ᮊᮁᮒᮥ. ᮃᮙᮔ᮪ ᮓᮤᮏᮜᮔ᮪ᮊᮩᮔ᮪ ᮞᮘᮘᮛᮠ ᮊᮜᮤ.',
  repairDuplicatesDetected: 'ᮊᮕᮨᮔ᮪ᮓᮊ᮪ {count} ᮃᮀᮌᮧᮒ ᮊᮜᮚᮔ᮪ KCC ID ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ — ᮕᮨᮔ᮪ᮎᮦᮒ᮪ "{action}".',
  allIdsUnique: 'ᮞᮓᮚ KCC ID ᮅᮔᮤᮊ᮪.',
  runRepair: 'ᮏᮜᮔ᮪ᮊᮩᮔ᮪ ᮕᮨᮁᮘᮄᮊᮔ᮪',
  repairRunning: 'ᮔᮥᮏᮥ ᮍᮜᮨᮛᮨᮞ᮪ᮊᮩᮔ᮪...',
  repairRunningProgress: 'ᮔᮥᮏᮥ ᮍᮜᮨᮛᮨᮞ᮪ᮊᮩᮔ᮪ ({done}/{total})...',
  repairConfirm:
    'ᮏᮜᮔ᮪ᮊᮩᮔ᮪ ᮕᮨᮁᮘᮄᮊᮔ᮪ KCC ID & ᮊᮁᮒᮥ ᮅᮙᮥᮙ᮪ ᮊᮀᮌᮧ ᮞᮓᮚ ᮃᮀᮌᮧᮒ?\n\n- ᮃᮀᮌᮧᮒ ᮊᮜᮚᮔ᮪ KCC ID ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ ᮘᮊᮜ᮪ ᮊᮦᮍᮤᮀ ID ᮆᮀᮌᮜ᮪ (ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮕᮀᮠᮩᮜᮔ ᮒᮨᮒᮨᮕ᮪ ᮍᮀᮌᮧ ID ᮜᮙᮤ).\n- KCC ID ᮃᮔᮥ ᮒᮩ ᮃᮎᮔ᮪ ᮓᮤᮞᮤᮙ᮪ᮕᮨᮔ᮪ ᮘᮊᮜ᮪ ᮓᮤᮞᮤᮙ᮪ᮕᮨᮔ᮪.\n- ᮊᮧᮜᮦᮊ᮪ᮞᮤ ᮅᮙᮥᮙ᮪ memberCards ᮓᮤᮝᮍᮥᮔ᮪ ᮓᮩᮄ.\n\nᮃᮙᮔ᮪ ᮓᮤᮏᮜᮔ᮪ᮊᮩᮔ᮪ ᮞᮘᮘᮛᮠ ᮊᮜᮤ. ᮒᮨᮛᮞ᮪ᮊᮩᮔ᮪?',
  repairFailed: 'ᮕᮨᮁᮘᮄᮊᮔ᮪ ᮌᮌᮜ᮪: {error}',
  repairDone: 'ᮕᮨᮁᮘᮄᮊᮔ᮪ ᮛᮦᮀᮞᮦ.',
  repairStatScanned: 'ᮃᮀᮌᮧᮒ ᮓᮤᮕᮤᮔ᮪ᮓᮄ',
  repairStatDuplicateGroups: 'ᮌᮢᮥᮕ᮪ ID ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪',
  repairStatCardsWritten: 'ᮊᮁᮒᮥ ᮓᮤᮞᮨᮛᮒ᮪',
  repairStatCardsDeleted: 'ᮊᮁᮒᮥ ᮓᮤᮠᮕᮥᮞ᮪',
  reassignedListTitle: 'KCC ID ᮃᮔᮥ ᮓᮤᮛᮧᮘᮤᮂ / ᮓᮤᮞᮤᮙ᮪ᮕᮨᮔ᮪ ({count}):',
  repairReasonDuplicate: 'ID ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪',
  repairReasonMissing: 'ID ᮒᮩ ᮃᮎᮔ᮪ ᮓᮤᮞᮤᮙ᮪ᮕᮨᮔ᮪',
  repairReasonMainAccount: 'ID ᮃᮊᮥᮔ᮪ ᮅᮒᮙ ᮓᮤᮃᮀᮌᮧ ᮊᮥ ᮃᮀᮌᮧᮒ ᮞᮔᮦᮞ᮪',
  noIdsChanged: 'ᮒᮩ ᮃᮚ KCC ID ᮃᮔᮥ ᮊᮨᮓᮂ ᮓᮤᮛᮧᮘᮤᮂ.',
  issuesCount: 'ᮊᮞᮜᮠᮔ᮪ ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID ᮎᮓᮍᮔ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪ / ᮃᮊᮥᮔ᮪ ᮅᮒᮙ ({range})',
  reservedIdsDesc:
    'ID ᮓᮤᮔ ᮛᮨᮔ᮪ᮒᮀ ᮄᮉ ᮍᮔ᮪ ᮅᮊᮥᮁ ᮊᮀᮌᮧ ᮃᮊᮥᮔ᮪ ᮅᮒᮙ & ᮃᮓ᮪ᮙᮤᮔ᮪ KCC. ᮃᮀᮌᮧᮒ ᮓᮤ ᮠᮔ᮪ᮓᮕ᮪ ᮊᮦᮍᮤᮀ ID ᮆᮒ ᮒᮤᮔ ᮕᮨᮛᮔ᮪/ᮞᮥᮛᮦᮜᮦᮊ᮪ ᮃᮔᮥ ᮓᮤᮜᮨᮘᮨᮒ᮪ᮊᮩᮔ᮪ ᮓᮤᮔ ᮖᮧᮁᮙᮥᮜᮤᮁ ᮅᮙᮥᮙ᮪ (ᮞᮤᮞ᮪ᮒᮨᮙ᮪ ᮜᮙᮤ). ᮕᮨᮔ᮪ᮎᮦᮒ᮪ "{action}" ᮕᮤᮊᮩᮔ᮪ ᮙᮞᮤᮠᮔ᮪ KCC ID ᮊᮢᮧᮔᮧᮜᮧᮌᮤᮞ᮪ ᮃᮔᮥ ᮅᮔᮤᮊ᮪.',
  noReservedHolders: 'ᮒᮩ ᮃᮚ ᮃᮀᮌᮧᮒ ᮃᮔᮥ ᮌᮓᮥᮂ KCC ID ᮠᮥᮞᮥᮞ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪.',
  reservedHolderMeta: 'ᮞᮥᮙ᮪ᮘᮨᮁ: {source} • ᮕᮨᮛᮔ᮪: {role}',
  processing: 'ᮔᮥᮏᮥ ᮍᮧᮜᮂ...',
  assignNewId: 'ᮕᮞᮤᮠᮔ᮪ ID ᮆᮀᮌᮜ᮪',
  reassignConfirm: 'ᮕᮞᮤᮠᮔ᮪ KCC ID ᮆᮀᮌᮜ᮪ ᮊ "{name}" (ᮃᮚᮩᮔ {id})?',
  reassignMainAccountWarning:
    'ᮕᮦᮕᮦᮜᮤᮀ: ᮄᮉ ID ᮃᮊᮥᮔ᮪ ᮅᮒᮙ. ᮅᮜᮂ ᮓᮤᮒᮨᮛᮞ᮪ᮊᮩᮔ᮪ ᮅᮕᮙᮤ ᮃᮀᮌᮧᮒ ᮄᮉ ᮙᮀᮛᮥᮕᮤᮊᮩᮔ᮪ ᮃᮊᮥᮔ᮪ ᮛᮨᮞ᮪ᮙᮤ {email}.',
  resultSuccess: 'ᮞᮥᮊ᮪ᮞᮦᮞ᮪: {message}',
  resultFailed: 'ᮌᮌᮜ᮪: {message}',

  // Duplicate registrations
  duplicatesTitle: 'ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮌᮔ᮪ᮓ (ᮏᮜ᮪ᮙᮤ ᮃᮔᮥ ᮞᮙᮤ)',
  duplicatesDesc:
    'ᮃᮀᮌᮧᮒ ᮃᮔᮥ ᮍᮩᮞᮤᮃᮔ᮪ ᮖᮧᮁᮙᮥᮜᮤᮁ ᮜᮀᮊᮥᮀ ᮒᮤ ᮞᮊᮜᮤ (ᮔᮧᮙᮨᮁ WhatsApp, Discord, ᮞᮥᮛᮦᮜᮦᮊ᮪, ᮃᮒᮔᮕᮤ ᮙᮦᮓᮤᮃ ᮞᮧᮞᮤᮃᮜ᮪ ᮃᮔᮥ ᮞᮙᮤ). "ᮌᮘᮥᮀᮊᮩᮔ᮪" ᮑᮤᮙ᮪ᮕᮨᮔ᮪ ᮓᮒ ᮕᮍᮑᮁᮔ ᮞᮛᮨᮀ ᮞᮓᮚ ᮔᮧᮙᮨᮁ WhatsApp ᮓᮤᮔ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮕᮀᮠᮩᮜᮔ (KCC ID-ᮔ ᮒᮨᮒᮨᮕ᮪), ᮒᮨᮛᮞ᮪ ᮍᮠᮕᮥᮞ᮪ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ᮔ ᮘᮘᮛᮨᮍᮔ᮪ ᮞᮛᮨᮀ ᮊᮁᮒᮥᮔ. ᮕᮛᮤᮊ᮪ᮞ ᮠᮩᮜ ᮞᮒᮩᮃᮎᮔ᮪ ᮍᮌᮘᮥᮀᮊᮩᮔ᮪.',
  scanDuplicates: 'ᮕᮤᮔ᮪ᮓᮄ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮌᮔ᮪ᮓ',
  mergeConfirm:
    'ᮌᮘᮥᮀᮊᮩᮔ᮪ "{duplicate}" ({duplicateId}) ᮊ "{keeper}" ({keeperId})?\n\nᮓᮒ ᮕᮍᮑᮁᮔ & ᮔᮧᮙᮨᮁ WhatsApp ᮓᮤᮒᮤᮛᮧᮔ᮪ ᮊ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮕᮀᮠᮩᮜᮔ, ᮒᮨᮛᮞ᮪ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ᮔ ᮓᮤᮠᮕᮥᮞ᮪ ᮕᮨᮁᮙᮔᮦᮔ᮪. ᮒᮨᮛᮞ᮪ᮊᮩᮔ᮪?',
  mergeSuccess: '"{duplicate}" ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮓᮤᮌᮘᮥᮀᮊᮩᮔ᮪ ᮊ "{keeper}" — KCC ID {id} ᮒᮨᮒᮨᮕ᮪.',
  bulkMergeIdenticalConfirm:
    'ᮌᮘᮥᮀᮊᮩᮔ᮪ {groups} ᮌᮢᮥᮕ᮪ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ ᮃᮔᮥ ᮄᮓᮦᮔ᮪ᮒᮤᮊ᮪ ({records} ᮓᮒ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪)?\n\nᮍᮔ᮪ ᮅᮊᮥᮁ ᮌᮢᮥᮕ᮪ ᮊᮜᮚᮔ᮪ ᮎᮧᮞ᮪ᮔᮦᮙ᮪ ᮞᮛᮨᮀ ᮔᮧᮙᮨᮁ WhatsApp ᮅᮒᮙ ᮃᮔᮥ ᮞᮙᮤ, ᮃᮔᮥ ᮓᮤᮓᮙᮨᮜ᮪ ᮊᮜᮚᮔ᮪ ᮘᮦᮓᮔ ᮕᮜᮤᮀ ᮜᮙᮤ {seconds} ᮓᮨᮒᮤᮊ᮪ (ᮒᮤᮛᮧᮔ᮪ ᮕᮨᮁᮞᮤᮞ᮪ / ᮄᮙ᮪ᮕᮧᮁ ᮌᮔ᮪ᮓ).\nᮓᮒ ᮕᮍᮑᮁᮔ & ᮞᮓᮚ ᮔᮧᮙᮨᮁ WhatsApp ᮓᮤᮕᮤᮔ᮪ᮓᮂᮊᮩᮔ᮪ ᮊ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮕᮀᮠᮩᮜᮔ (KCC ID-ᮔ ᮒᮨᮒᮨᮕ᮪), ᮒᮨᮛᮞ᮪ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ᮔ ᮓᮤᮠᮕᮥᮞ᮪ ᮕᮨᮁᮙᮔᮦᮔ᮪. ᮒᮨᮛᮞ᮪ᮊᮩᮔ᮪?',
  bulkMergeAllConfirm:
    'ᮌᮘᮥᮀᮊᮩᮔ᮪ ᮞᮓᮚ {groups} ᮌᮢᮥᮕ᮪ ᮠᮞᮤᮜ᮪ ᮕᮤᮔ᮪ᮓᮄᮃᮔ᮪ ({records} ᮓᮒ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪)?\n\nᮄᮉ ᮊᮜᮨᮘᮨᮒ᮪ ᮌᮢᮥᮕ᮪ ᮃᮔᮥ ᮎᮧᮎᮧᮌ᮪ ᮍᮔ᮪ ᮅᮊᮥᮁ ᮊᮥ ᮔᮧᮙᮨᮁ WhatsApp, Discord, ᮞᮥᮛᮦᮜᮦᮊ᮪, ᮙᮦᮓᮤᮃ ᮞᮧᮞᮤᮃᮜ᮪, ᮃᮒᮔᮕᮤ ᮝᮞ᮪ᮒ ᮃᮔᮥ ᮞᮙᮤ — ᮕᮞ᮪ᮒᮤᮊᮩᮔ᮪ ᮃᮔ᮪ᮏᮩᮔ᮪ ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮙᮛᮤᮊ᮪ᮞ ᮓᮕ᮪ᮒᮁ ᮓᮤ ᮠᮔ᮪ᮓᮕ᮪.\nᮓᮒ ᮕᮍᮑᮁᮔ & ᮞᮓᮚ ᮔᮧᮙᮨᮁ WhatsApp ᮓᮤᮕᮤᮔ᮪ᮓᮂᮊᮩᮔ᮪ ᮊ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮕᮀᮠᮩᮜᮔ (KCC ID-ᮔ ᮒᮨᮒᮨᮕ᮪), ᮒᮨᮛᮞ᮪ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ᮔ ᮓᮤᮠᮕᮥᮞ᮪ ᮕᮨᮁᮙᮔᮦᮔ᮪. ᮄᮉ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮘᮧᮜᮚ᮪ᮊᮩᮔ᮪. ᮒᮨᮛᮞ᮪ᮊᮩᮔ᮪?',
  bulkMergeDone: 'ᮍᮌᮘᮥᮀᮊᮩᮔ᮪ ᮙᮞᮜ᮪ ᮛᮦᮀᮞᮦ ({mode}).',
  bulkModeIdentical: 'ᮌᮢᮥᮕ᮪ ᮄᮓᮦᮔ᮪ᮒᮤᮊ᮪',
  bulkModeAll: 'ᮞᮓᮚ ᮠᮞᮤᮜ᮪ ᮕᮤᮔ᮪ᮓᮄᮃᮔ᮪',
  bulkStatGroups: 'ᮌᮢᮥᮕ᮪ ᮓᮤᮇᮜᮂ',
  bulkStatMergedGroups: 'ᮌᮢᮥᮕ᮪ ᮓᮤᮌᮘᮥᮀᮊᮩᮔ᮪',
  bulkStatMergedRecords: 'ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ ᮓᮤᮌᮘᮥᮀᮊᮩᮔ᮪',
  bulkStatFailedGroups: 'ᮌᮢᮥᮕ᮪ ᮌᮌᮜ᮪',
  bulkMoreErrors: '…ᮞᮛᮨᮀ {count} ᮓᮩᮄ (ᮒᮤᮍᮜᮤ ᮊᮧᮔ᮪ᮞᮧᮜ᮪ ᮕᮑᮥᮀᮞᮤ).',
  scanSummary:
    'ᮊᮕᮨᮔ᮪ᮓᮊ᮪ {groups} ᮌᮢᮥᮕ᮪ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪ ({records} ᮓᮒ ᮓᮥᮕ᮪ᮜᮤᮊᮒ᮪), ᮊᮜᮨᮘᮨᮒ᮪ {identical} ᮌᮢᮥᮕ᮪ ᮄᮓᮦᮔ᮪ᮒᮤᮊ᮪ (ᮎᮧᮞ᮪ᮔᮦᮙ᮪ & ᮔᮧᮙᮨᮁ WhatsApp ᮅᮒᮙ ᮞᮙᮤ, ᮓᮤᮓᮙᮨᮜ᮪ ᮊᮜᮚᮔ᮪ ᮘᮦᮓᮔ ᮕᮜᮤᮀ ᮜᮙᮤ {seconds} ᮓᮨᮒᮤᮊ᮪).',
  mergeAllIdentical: 'ᮌᮘᮥᮀᮊᮩᮔ᮪ ᮞᮓᮚ ᮃᮔᮥ ᮄᮓᮦᮔ᮪ᮒᮤᮊ᮪ ({count})',
  mergeAllScanned: 'ᮌᮘᮥᮀᮊᮩᮔ᮪ ᮞᮓᮚ ᮠᮞᮤᮜ᮪ ᮕᮤᮔ᮪ᮓᮄᮃᮔ᮪ ({count})',
  bulkMergeProgress: 'ᮔᮥᮏᮥ ᮍᮌᮘᮥᮀᮊᮩᮔ᮪ {done}/{total} ᮌᮢᮥᮕ᮪…',
  noDuplicatesFound: 'ᮒᮩ ᮃᮚ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮌᮔ᮪ᮓ ᮃᮔᮥ ᮊᮕᮨᮔ᮪ᮓᮊ᮪.',
  keeperBadge: 'ᮓᮤᮏᮌ (KCC ID ᮒᮨᮒᮨᮕ᮪)',
  merging: 'ᮔᮥᮏᮥ ᮍᮌᮘᮥᮀᮊᮩᮔ᮪...',
  mergeInto: 'ᮌᮘᮥᮀᮊᮩᮔ᮪ ᮊ {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'ᮙᮤᮜᮛᮤᮃᮔ᮪...',
  filterAllRoles: 'ᮞᮓᮚ ᮕᮨᮛᮔ᮪ ({count})',
  filterAllCities: 'ᮞᮓᮚ ᮜᮧᮊᮞᮤ',
  filterAllAges: 'ᮞᮓᮚ ᮅᮙᮥᮁ',
  filterLegalAge: 'ᮞᮝᮝ (18+)',
  filterMinor: 'ᮠᮔ᮪ᮓᮕᮩᮔ᮪ ᮅᮙᮥᮁ (<18)',
  filterPreferNotToSay: 'ᮒᮩ ᮓᮤᮞᮨᮘᮒ᮪ᮊᮩᮔ᮪',
  sortNewest: '🕒 ᮝᮊ᮪ᮒᮧᮞ᮪: ᮕᮍᮑᮁᮔ',
  sortNameAsc: '🔤 ᮝᮞ᮪ᮒ: A → Z',
  purgeButtonTitle: 'ᮘᮨᮛᮨᮞᮤᮠᮔ᮪ ᮞᮓᮚ ᮓᮒ ᮃᮀᮌᮧᮒ ᮓᮤ Firestore',
  purgeButton: 'ᮘᮨᮛᮨᮞᮤᮠᮔ᮪ ᮓᮒ ᮃᮀᮌᮧᮒ',
  purging: 'ᮔᮥᮏᮥ ᮙᮨᮛᮨᮞᮤᮠᮔ᮪...',
  purgePrompt:
    'ᮕᮦᮕᮦᮜᮤᮀ ᮞᮨᮛᮤᮅᮞ᮪: ᮄᮉ ᮘᮊᮜ᮪ ᮍᮠᮕᮥᮞ᮪ ᮞᮓᮚ ᮓᮒ ᮃᮀᮌᮧᮒ ᮒᮤᮔ ᮓᮒᮘᮦᮞ᮪ Firestore ᮞᮎᮛ ᮕᮨᮁᮙᮔᮦᮔ᮪.\n\nᮞᮨᮛᮒ᮪ \'{keyword}\' (ᮠᮥᮛᮥᮕ᮪ ᮃᮌᮩᮀ) ᮕᮤᮊᮩᮔ᮪ ᮙᮞ᮪ᮒᮤᮊᮩᮔ᮪ ᮍᮠᮕᮥᮞ᮪ ᮓᮒᮘᮦᮞ᮪:',
  purgeCancelled: 'ᮊᮧᮔ᮪ᮖᮤᮁᮙᮞᮤ ᮓᮤᮘᮧᮜᮚ᮪ᮊᮩᮔ᮪ (ᮊᮨᮎᮕ᮪ ᮃᮔᮥ ᮓᮤᮞᮨᮛᮒ᮪ ᮒᮩ ᮎᮧᮎᮧᮌ᮪).',
  purgeSuccess: 'ᮘᮨᮘᮨᮛᮨᮞᮤᮂ ᮛᮦᮀᮞᮦ: {count} ᮓᮒ ᮃᮀᮌᮧᮒ ᮕᮛᮔ᮪ᮒᮧᮞ᮪ ᮓᮤᮠᮕᮥᮞ᮪ ᮒᮤᮔ ᮓᮒᮘᮦᮞ᮪.',
  purgeFailed: 'ᮓᮒ ᮃᮀᮌᮧᮒ ᮒᮩ ᮒᮤᮃᮞ ᮓᮤᮠᮕᮥᮞ᮪: {error}',
  exportNoData: 'ᮒᮩ ᮃᮚ ᮓᮒ ᮊᮀᮌᮧ ᮓᮤᮆᮊ᮪ᮞ᮪ᮕᮧᮁ.',
  showingMembers: 'ᮔᮨᮙ᮪ᮘᮧᮀᮊᮩᮔ᮪ {shown} ᮒᮤ {total} ᮃᮀᮌᮧᮒ',

  // CSV export column headers
  csvKccId: 'KCC ID (16 ᮓᮤᮌᮤᮒ᮪)',
  csvCosname: 'ᮎᮧᮞ᮪ᮔᮦᮙ᮪ / ᮞᮔ᮪ᮓᮤᮃᮞ᮪ᮙ',
  csvLegalName: 'ᮝᮞ᮪ᮒ ᮜᮦᮌᮜ᮪',
  csvPrimaryWhatsapp: 'WhatsApp ᮅᮒᮙ',
  csvBackupWhatsapp: 'WhatsApp ᮎᮓᮍᮔ᮪',
  csvDiscord: 'ᮝᮞ᮪ᮒ ᮕᮀᮌᮥᮔ Discord',
  csvEmail: 'ᮞᮥᮛᮦᮜᮦᮊ᮪',
  csvAgeCategory: 'ᮊᮒᮨᮌᮧᮛᮤ ᮅᮙᮥᮁ',
  csvAge: 'ᮅᮙᮥᮁ / ᮒᮀᮌᮜ᮪ ᮜᮠᮤᮁ',
  csvCountry: 'ᮔᮌᮛ',
  csvProvince: 'ᮕᮢᮧᮕᮤᮔ᮪ᮞᮤ',
  csvCity: 'ᮊᮧᮒ',
  csvPrimaryRole: 'ᮕᮨᮛᮔ᮪ ᮅᮒᮙ',
  csvFandom: 'ᮖᮔ᮪ᮓᮧᮙ᮪ ᮊᮛᮨᮞᮨᮕ᮪',
  csvExperience: 'ᮕᮍᮜᮙᮔ᮪',
  csvStatus: 'ᮊᮃᮚᮃᮔ᮪',
  csvRegisteredAt: 'ᮒᮀᮌᮜ᮪ ᮓᮕ᮪ᮒᮁ',

  // Members table
  colMember: 'ᮃᮀᮌᮧᮒ / ᮎᮧᮞ᮪ᮔᮦᮙ᮪',
  colKccId: 'KCC ID 16-ᮓᮤᮌᮤᮒ᮪',
  colContact: 'WhatsApp & ᮊᮧᮔ᮪ᮒᮊ᮪',
  colDiscord: 'ᮝᮞ᮪ᮒ ᮕᮀᮌᮥᮔ Discord',
  colRole: 'ᮕᮨᮛᮔ᮪ & ᮙᮤᮔᮒ᮪',
  colAge: 'ᮅᮙᮥᮁ',
  colLocation: 'ᮜᮧᮊᮞᮤ',
  colStatus: 'ᮊᮃᮚᮃᮔ᮪',
  colRegistered: 'ᮊᮓᮕ᮪ᮒᮁ',
  colActions: 'ᮒᮤᮔ᮪ᮓᮊᮔ᮪',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ ᮕᮀᮍᮧᮛᮔ',
  sortAgeOldest: '▼ ᮕᮀᮊᮧᮜᮧᮒ᮪ᮔ',
  sortStatusAsc: '▲ ᮗᮦᮛᮤᮖ᮪',
  sortStatusDesc: '▼ ᮃᮔ᮪ᮒᮧᮞ᮪',
  sortTimeNewest: '▼ ᮕᮍᮑᮁᮔ',
  sortTimeOldest: '▲ ᮕᮀᮠᮩᮜᮔ',
  legalNameValue: 'ᮝᮞ᮪ᮒ ᮜᮦᮌᮜ᮪: {name}',
  mainAccountBadge: 'ᮃᮊᮥᮔ᮪ ᮅᮒᮙ KCC',
  adminIdBadge: 'ᮃᮓ᮪ᮙᮤᮔ᮪ KCC #{number}',
  timestampIdBadge: 'ID ᮒᮄᮙ᮪ᮞ᮪ᮒᮦᮙ᮪ᮕ᮪',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'ᮒᮤᮍᮜᮤ KCC ID',
  deleteMemberTitle: 'ᮠᮕᮥᮞ᮪ ᮃᮀᮌᮧᮒ',
  emptyDatabaseTitle: 'ᮓᮒᮘᮦᮞ᮪ ᮃᮀᮌᮧᮒ ᮊᮧᮞᮧᮀ',
  emptyDatabaseDesc:
    'ᮒᮩ ᮃᮎᮔ᮪ ᮃᮚ ᮓᮒ ᮃᮀᮌᮧᮒ ᮓᮤᮔ ᮓᮒᮘᮦᮞ᮪. ᮄᮙ᮪ᮕᮧᮁ ᮒᮤᮔ ᮞ᮪ᮕᮢᮦᮓ᮪ᮞᮤᮒ᮪ Google Form ᮃᮒᮔᮕᮤ ᮃᮔ᮪ᮒᮧᮞᮔ᮪ ᮕᮨᮔ᮪ᮓᮕ᮪ᮒᮛᮔ᮪ ᮆᮀᮌᮜ᮪.',
  noResultsTitle: 'ᮒᮩ ᮃᮚ ᮠᮞᮤᮜ᮪',
  noResultsDesc: 'ᮒᮩ ᮃᮚ ᮓᮒ ᮃᮀᮌᮧᮒ ᮃᮔᮥ ᮎᮧᮎᮧᮌ᮪ ᮞᮛᮨᮀ ᮊᮨᮎᮕ᮪ ᮕᮙᮤᮜᮛᮤᮃᮔ᮪ ᮃᮒᮔᮕᮤ ᮞᮛᮤᮍᮔ᮪ ᮃᮔᮥ ᮓᮤᮕᮤᮜᮤᮂ.',
  openSheetsSync: 'ᮘᮥᮊ ᮞᮤᮀᮊᮢᮧᮔᮤᮞᮞᮤ Google Sheets & ᮖᮧᮁᮙᮥᮜᮤᮁ',
};

export default admin;
