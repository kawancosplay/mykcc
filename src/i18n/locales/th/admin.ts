import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'แดชบอร์ดผู้ดูแล KawanCosplay',
  dashboardDesc: 'พอร์ทัลสำหรับผู้ดูแลเท่านั้น ใช้จัดการรายชื่อสมาชิกของชุมชนและซิงค์ Google Sheets',
  privacyRestrictedNotice:
    'เพื่อปกป้องความเป็นส่วนตัวของสมาชิก รายชื่อสมาชิกจำกัดการเข้าถึงอย่างเคร่งครัดเฉพาะผู้ดูแล KawanCosplay เท่านั้น',
  exportCsv: 'ส่งออก CSV',
  totalMembers: 'สมาชิกที่ลงทะเบียนทั้งหมด',
  resetFilter: 'ล้างตัวกรอง',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'กำลังตรวจสอบสิทธิ์ผู้ดูแล...',
  signedInNotAdmin: 'เข้าสู่ระบบในชื่อ {account} — บัญชีนี้ไม่ใช่ผู้ดูแล KCC',
  emailNotVerified: 'อีเมลยังไม่ได้รับการยืนยัน — โปรดเข้าสู่ระบบด้วย Google',
  signInWithAdminGoogleEmail: 'เข้าสู่ระบบด้วยบัญชี Google ของผู้ดูแล ({email})',
  signOutThisAccount: 'ออกจากระบบ',
  whatsappAdminHelp: 'ขอความช่วยเหลือจากผู้ดูแลทาง WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'พอร์ทัลการจัดการ KawanCosplay',
  verifiedAccessBadge: 'สิทธิ์เข้าถึงที่ยืนยันแล้ว',
  dashboardPrivacyNote:
    'ความเป็นส่วนตัวของสมาชิกได้รับการปกป้องอย่างเข้มงวด: เฉพาะผู้ดูแลที่ลงทะเบียนเท่านั้นที่เห็นชื่อและข้อมูลติดต่อ',
  whatsappHotlineShort: 'สายด่วน WA: {phone}',
  signOutAdmin: 'ออกจากบัญชีผู้ดูแล',
  statusStat: 'สถานะ: {status}',
  statusVerified: 'ยืนยันแล้ว',
  statusActive: 'ใช้งานอยู่',
  statusPending: 'รอดำเนินการ',
  tabMembers: 'รายชื่อและทะเบียนสมาชิก ({count})',
  tabSync: 'ซิงค์ Google Sheets และแบบฟอร์ม',
  tabStats: 'สถิติชุมชน',

  // Member list states
  permissionDeniedTitle: 'การเข้าถึงถูกปฏิเสธ',
  permissionDeniedDesc:
    'ฐานข้อมูลปฏิเสธการเข้าถึงรายชื่อสมาชิกสำหรับบัญชีนี้ โปรดเข้าสู่ระบบด้วยบัญชี Google ของผู้ดูแล ({email}) หรือบัญชีที่อยู่ในคอลเลกชัน admins แล้วโหลดหน้าใหม่ และตรวจสอบให้แน่ใจว่าได้เผยแพร่ Firestore Rules ล่าสุดไปยังฐานข้อมูล {database} แล้ว',
  signInWithAdminGoogle: 'เข้าสู่ระบบด้วยบัญชี Google ของผู้ดูแล',
  reloadPage: 'โหลดหน้าใหม่',
  loadMembersFailedTitle: 'ไม่สามารถโหลดรายชื่อสมาชิกได้',
  loadMembersFailedDesc: 'ไม่สามารถโหลดรายชื่อสมาชิกได้ ตรวจสอบการเชื่อมต่อแล้วโหลดหน้าใหม่',
  loadingMembers: 'กำลังโหลดข้อมูลสมาชิก...',

  // Member status & delete
  statusUpdateFailed: 'ไม่สามารถอัปเดตสถานะสมาชิกได้: {error}',
  deleteMemberConfirm: 'ลบสมาชิก "{name}" (KCC ID: {id}) ออกจากฐานข้อมูล Firestore ใช่ไหม?',
  deleteMemberFailed: 'ไม่สามารถลบสมาชิกได้: {error}',

  // KCC ID & public card repair
  repairTitle: 'ซ่อมแซม KCC ID และบัตรสาธารณะ',
  repairDesc:
    'กำหนด KCC ID ที่ไม่ซ้ำให้กับสมาชิกที่มี ID ซ้ำกัน (ผู้ที่ลงทะเบียนก่อนสุดจะใช้ ID เดิม) บันทึก KCC ID ที่ยังไม่ได้จัดเก็บ และสร้างคอลเลกชันสาธารณะ memberCards ที่ใช้ค้นหาบัตรขึ้นใหม่ เรียกใช้ซ้ำได้อย่างปลอดภัย',
  repairDuplicatesDetected: 'ตรวจพบสมาชิก {count} คนที่มี KCC ID ซ้ำกัน — กด "{action}"',
  allIdsUnique: 'KCC ID ทั้งหมดไม่ซ้ำกัน',
  runRepair: 'เรียกใช้การซ่อมแซม',
  repairRunning: 'กำลังซ่อมแซม...',
  repairRunningProgress: 'กำลังซ่อมแซม ({done}/{total})...',
  repairConfirm:
    'เรียกใช้การซ่อมแซม KCC ID และบัตรสาธารณะสำหรับสมาชิกทั้งหมดใช่ไหม?\n\n- สมาชิกที่มี KCC ID ซ้ำจะได้รับ ID ใหม่ (ผู้ที่ลงทะเบียนก่อนสุดจะใช้ ID เดิม)\n- KCC ID ที่ยังไม่ได้บันทึกจะถูกบันทึก\n- คอลเลกชันสาธารณะ memberCards จะถูกสร้างขึ้นใหม่\n\nเรียกใช้ซ้ำได้อย่างปลอดภัย ดำเนินการต่อหรือไม่?',
  repairFailed: 'การซ่อมแซมล้มเหลว: {error}',
  repairDone: 'ซ่อมแซมเสร็จสิ้น',
  repairStatScanned: 'สมาชิกที่สแกน',
  repairStatDuplicateGroups: 'กลุ่ม ID ซ้ำ',
  repairStatCardsWritten: 'บัตรที่เขียน',
  repairStatCardsDeleted: 'บัตรที่ลบ',
  reassignedListTitle: 'KCC ID ที่เปลี่ยน / บันทึก ({count}):',
  repairReasonDuplicate: 'ID ซ้ำ',
  repairReasonMissing: 'ยังไม่ได้บันทึก ID',
  repairReasonMainAccount: 'ID บัญชีหลักถูกใช้โดยสมาชิกคนอื่น',
  noIdsChanged: 'ไม่มี KCC ID ที่ต้องเปลี่ยน',
  issuesCount: 'ข้อผิดพลาด ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID ที่สงวนไว้สำหรับผู้ดูแล / บัญชีหลัก ({range})',
  reservedIdsDesc:
    'ID ในช่วงนี้มีไว้สำหรับบัญชีหลักและผู้ดูแลของ KCC เท่านั้น สมาชิกด้านล่างได้รับ ID นี้จากบทบาท/อีเมลที่กรอกในแบบฟอร์มสาธารณะ (ระบบเก่า) กด "{action}" เพื่อกำหนด KCC ID ตามลำดับเวลาที่ไม่ซ้ำให้',
  noReservedHolders: 'ไม่มีสมาชิกที่ถือ KCC ID เฉพาะผู้ดูแล',
  reservedHolderMeta: 'แหล่งที่มา: {source} • บทบาท: {role}',
  processing: 'กำลังดำเนินการ...',
  assignNewId: 'กำหนด ID ใหม่',
  reassignConfirm: 'กำหนด KCC ID ใหม่ให้ "{name}" (ปัจจุบัน {id}) ใช่ไหม?',
  reassignMainAccountWarning:
    'คำเตือน: นี่คือ ID ของบัญชีหลัก อย่าดำเนินการต่อหากสมาชิกนี้คือบัญชีทางการ {email}',
  resultSuccess: 'สำเร็จ: {message}',
  resultFailed: 'ล้มเหลว: {message}',

  // Duplicate registrations
  duplicatesTitle: 'การลงทะเบียนซ้ำ (บุคคลเดียวกัน)',
  duplicatesDesc:
    'สมาชิกที่กรอกแบบฟอร์มมากกว่าหนึ่งครั้ง (เบอร์ WhatsApp, Discord, อีเมล หรือโซเชียลมีเดียเดียวกัน) "รวม" จะเก็บข้อมูลล่าสุดและเบอร์ WhatsApp ทุกเบอร์ไว้ในการลงทะเบียนครั้งแรกสุด (KCC ID ของรายการนั้นคงเดิม) จากนั้นจะลบรายการซ้ำพร้อมบัตรของรายการนั้น โปรดตรวจสอบก่อนรวม',
  scanDuplicates: 'สแกนหาการลงทะเบียนซ้ำ',
  mergeConfirm:
    'รวม "{duplicate}" ({duplicateId}) เข้ากับ "{keeper}" ({keeperId}) ใช่ไหม?\n\nข้อมูลล่าสุดและเบอร์ WhatsApp จะถูกคัดลอกไปยังการลงทะเบียนครั้งแรกสุด จากนั้นรายการซ้ำจะถูกลบอย่างถาวร ดำเนินการต่อหรือไม่?',
  mergeSuccess: 'รวม "{duplicate}" เข้ากับ "{keeper}" แล้ว — KCC ID {id} คงเดิม',
  bulkMergeIdenticalConfirm:
    'รวมกลุ่มที่ซ้ำกันแบบ "เหมือนกันทุกประการ" {groups} กลุ่ม ({records} รายการซ้ำ) ใช่ไหม?\n\nเฉพาะกลุ่มที่มี cosname และเบอร์ WhatsApp หลักเดียวกัน และสร้างห่างกันไม่เกิน {seconds} วินาที (สำเนาที่เหมือนกัน / นำเข้าซ้ำ)\nข้อมูลล่าสุดและเบอร์ WhatsApp ทุกเบอร์จะถูกย้ายไปยังการลงทะเบียนครั้งแรกสุด (KCC ID ของรายการนั้นคงเดิม) จากนั้นรายการซ้ำจะถูกลบอย่างถาวร ดำเนินการต่อหรือไม่?',
  bulkMergeAllConfirm:
    'รวมกลุ่มที่สแกนพบ "ทั้งหมด" {groups} กลุ่ม ({records} รายการซ้ำ) ใช่ไหม?\n\nรวมถึงกลุ่มที่ตรงกันเพียงเพราะมีเบอร์ WhatsApp, Discord, อีเมล, โซเชียลมีเดีย หรือชื่อเดียวกัน — โปรดตรวจสอบรายการด้านล่างให้แน่ใจก่อน\nข้อมูลล่าสุดและเบอร์ WhatsApp ทุกเบอร์จะถูกย้ายไปยังการลงทะเบียนครั้งแรกสุด (KCC ID ของรายการนั้นคงเดิม) จากนั้นรายการซ้ำจะถูกลบอย่างถาวร การดำเนินการนี้ไม่สามารถย้อนกลับได้ ดำเนินการต่อหรือไม่?',
  bulkMergeDone: 'การรวมแบบกลุ่มเสร็จสิ้น ({mode})',
  bulkModeIdentical: 'กลุ่มที่เหมือนกันทุกประการ',
  bulkModeAll: 'ผลการสแกนทั้งหมด',
  bulkStatGroups: 'กลุ่มที่ดำเนินการ',
  bulkStatMergedGroups: 'กลุ่มที่รวมแล้ว',
  bulkStatMergedRecords: 'รายการซ้ำที่รวมแล้ว',
  bulkStatFailedGroups: 'กลุ่มที่ล้มเหลว',
  bulkMoreErrors: '…และอีก {count} รายการ (ดูในคอนโซลของเบราว์เซอร์)',
  scanSummary:
    'พบกลุ่มที่ซ้ำกัน {groups} กลุ่ม ({records} รายการซ้ำ) ในจำนวนนี้มี {identical} กลุ่มที่เหมือนกันทุกประการ (cosname และเบอร์ WhatsApp หลักเดียวกัน สร้างห่างกันไม่เกิน {seconds} วินาที)',
  mergeAllIdentical: 'รวมทั้งหมดที่เหมือนกัน ({count})',
  mergeAllScanned: 'รวมผลการสแกนทั้งหมด ({count})',
  bulkMergeProgress: 'กำลังรวม {done}/{total} กลุ่ม…',
  noDuplicatesFound: 'ไม่พบการลงทะเบียนซ้ำ',
  keeperBadge: 'เก็บไว้ (KCC ID คงเดิม)',
  merging: 'กำลังรวม...',
  mergeInto: 'รวมเข้ากับ {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'ค้นหา...',
  filterAllRoles: 'ทุกบทบาท ({count})',
  filterAllCities: 'ทุกพื้นที่',
  filterAllAges: 'ทุกช่วงอายุ',
  filterLegalAge: 'ผู้ใหญ่ (18+)',
  filterMinor: 'ผู้เยาว์ (<18)',
  filterPreferNotToSay: 'ไม่ระบุ',
  sortNewest: '🕒 เวลา: ล่าสุด',
  sortNameAsc: '🔤 ชื่อ: A → Z',
  purgeButtonTitle: 'ล้างข้อมูลสมาชิกทั้งหมดใน Firestore',
  purgeButton: 'ล้างข้อมูลสมาชิก',
  purging: 'กำลังล้างข้อมูล...',
  purgePrompt:
    "คำเตือนร้ายแรง: การดำเนินการนี้จะลบข้อมูลสมาชิกทั้งหมดออกจากฐานข้อมูล Firestore อย่างถาวร\n\nพิมพ์ '{keyword}' (ตัวพิมพ์ใหญ่) เพื่อยืนยันการล้างฐานข้อมูล:",
  purgeCancelled: 'ยกเลิกการยืนยันแล้ว (คำยืนยันไม่ตรงกัน)',
  purgeSuccess: 'ล้างข้อมูลเสร็จสิ้น: ลบข้อมูลสมาชิก {count} รายการออกจากฐานข้อมูลแล้ว',
  purgeFailed: 'ไม่สามารถลบข้อมูลสมาชิกได้: {error}',
  exportNoData: 'ไม่มีข้อมูลให้ส่งออก',
  showingMembers: 'แสดงสมาชิก {shown} จาก {total} คน',

  // CSV export column headers
  csvKccId: 'KCC ID (16 หลัก)',
  csvCosname: 'Cosname / นามแฝง',
  csvLegalName: 'ชื่อตามกฎหมาย',
  csvPrimaryWhatsapp: 'WhatsApp หลัก',
  csvBackupWhatsapp: 'WhatsApp สำรอง',
  csvDiscord: 'ชื่อผู้ใช้ Discord',
  csvEmail: 'อีเมล',
  csvAgeCategory: 'ช่วงอายุ',
  csvAge: 'อายุ / วันเกิด',
  csvCountry: 'ประเทศ',
  csvProvince: 'จังหวัด',
  csvCity: 'เมือง',
  csvPrimaryRole: 'บทบาทหลัก',
  csvFandom: 'แฟนด้อม',
  csvExperience: 'ประสบการณ์',
  csvStatus: 'สถานะ',
  csvRegisteredAt: 'วันที่ลงทะเบียน',

  // Members table
  colMember: 'สมาชิก / Cosname',
  colKccId: 'KCC ID 16 หลัก',
  colContact: 'WhatsApp และช่องทางติดต่อ',
  colDiscord: 'ชื่อผู้ใช้ Discord',
  colRole: 'บทบาทและความสนใจ',
  colAge: 'อายุ',
  colLocation: 'พื้นที่',
  colStatus: 'สถานะ',
  colRegistered: 'ลงทะเบียนเมื่อ',
  colActions: 'การดำเนินการ',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ อายุน้อยสุด',
  sortAgeOldest: '▼ อายุมากสุด',
  sortStatusAsc: '▲ ยืนยัน',
  sortStatusDesc: '▼ รอ',
  sortTimeNewest: '▼ ใหม่สุด',
  sortTimeOldest: '▲ เก่าสุด',
  legalNameValue: 'ชื่อตามกฎหมาย: {name}',
  mainAccountBadge: 'บัญชีหลัก KCC',
  adminIdBadge: 'ผู้ดูแล KCC #{number}',
  timestampIdBadge: 'ID ตามเวลา',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'ดู KCC ID',
  deleteMemberTitle: 'ลบสมาชิก',
  emptyDatabaseTitle: 'ฐานข้อมูลสมาชิกว่างเปล่า',
  emptyDatabaseDesc:
    'ยังไม่มีข้อมูลสมาชิกในฐานข้อมูล นำเข้าจากสเปรดชีต Google Form หรือรอการลงทะเบียนใหม่',
  noResultsTitle: 'ไม่พบผลลัพธ์',
  noResultsDesc: 'ไม่มีข้อมูลสมาชิกที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก',
  openSheetsSync: 'เปิดการซิงค์ Google Sheets และแบบฟอร์ม',
};

export default admin;
