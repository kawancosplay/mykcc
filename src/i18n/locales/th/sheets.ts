import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'สะพานเชื่อม Google Sheets และ Form แบบเรียลไทม์',
  bridgeSubtitle: 'การย้ายจาก Google Form ไปยัง Firebase',
  pageTitle: 'ซิงค์ฐานข้อมูลสเปรดชีตและ Google Form',
  pageDesc:
    'นำเข้าสเปรดชีตเดิมของสมาชิกปัจจุบัน และเปิดการซิงค์แบบเรียลไทม์ เพื่อให้สมาชิกใหม่ทุกคนที่กรอก Google Form ในช่วงเปลี่ยนผ่านถูกเพิ่มลงใน Firebase โดยอัตโนมัติ',
  connectSheets: 'เชื่อมต่อ Google Sheets',
  renewAccess: 'ต่ออายุสิทธิ์เข้าถึง Google Sheets',
  connectionRequiredTitle: 'ต้องเชื่อมต่อ Google Sheets',
  connectionRequiredDesc:
    'หากต้องการอ่านสเปรดชีต Google Form โดยตรง โปรดให้สิทธิ์ MyKCC ในการอ่าน Google Sheets สำหรับบัญชี Google ของผู้ดูแลที่เข้าสู่ระบบอยู่ บัญชีนั้นต้องมีสิทธิ์เข้าถึงสเปรดชีตการลงทะเบียนของ KawanCosplay',
  accessRequestNotice:
    'ขอสิทธิ์สำหรับบัญชีที่เข้าสู่ระบบอยู่ MyKCC ขอเพียงสิทธิ์อ่าน Google Sheets เท่านั้น ไม่มีการเข้าถึง Google Drive',
  accessRequestNoticeWithEmail:
    'ขอสิทธิ์สำหรับบัญชีที่เข้าสู่ระบบอยู่ ({email}) MyKCC ขอเพียงสิทธิ์อ่าน Google Sheets เท่านั้น ไม่มีการเข้าถึง Google Drive',

  // Step 1: spreadsheet
  step1Title: 'สเปรดชีต Google Form',
  step1Desc: 'วาง URL หรือ ID ของสเปรดชีตคำตอบ Google Form',
  spreadsheetInputLabel: 'URL / ID ของ Google Spreadsheet',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit หรือ ID',
  inspectButton: 'ตรวจสอบ',
  formatHint: 'รูปแบบ: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'ยังไม่รู้จัก URL / ID นี้',
  sheetTabLabel: 'เลือกแท็บชีต',

  // Step 2: column mapping
  step2Title: 'การจับคู่คอลัมน์คำตอบ',
  step2Desc: 'ตรวจพบ {count} คอลัมน์ใน Google Form ของคุณ',
  autoDetectedBadge: 'ตรวจพบอัตโนมัติ',
  columnFullName: 'คอลัมน์ชื่อ-นามสกุล',
  columnCosname: 'คอลัมน์ Cosname / นามแฝง',
  columnEmail: 'คอลัมน์อีเมล',
  columnWhatsapp: 'คอลัมน์ WhatsApp / เบอร์โทรศัพท์',
  columnWhatsapp2: 'คอลัมน์ WhatsApp สำรอง / เบอร์ WA 2',
  optionalTag: '(ไม่บังคับ)',
  columnDiscord: 'คอลัมน์ชื่อผู้ใช้ Discord',
  columnCity: 'คอลัมน์เมือง / ที่อยู่อาศัย',
  columnRole: 'คอลัมน์บทบาท / ความสนใจ (คอสเพลเยอร์/นักประดิษฐ์/อื่น ๆ)',
  columnFandom: 'คอลัมน์แฟนด้อม / ตัวละครที่ชื่นชอบ',
  columnTimestamp: 'คอลัมน์เวลาประทับของคำตอบ',
  optionChooseColumn: '-- เลือกคอลัมน์ --',
  optionNone: '-- ไม่มี / ว่าง --',
  optionDefaultIndonesia: '-- ค่าเริ่มต้น (อินโดนีเซีย) --',
  optionDefaultCosplayer: '-- ค่าเริ่มต้น (คอสเพลเยอร์) --',
  optionDefaultAnimeGames: '-- ค่าเริ่มต้น (อนิเมะและเกม) --',
  optionCurrentTime: '-- เวลาปัจจุบัน --',
  previewTitle: 'ตัวอย่างข้อมูลสเปรดชีต (ชื่อ, WhatsApp และชื่อผู้ใช้ Discord):',
  previewColName: 'ชื่อ / Cosname',
  previewColDiscord: 'ชื่อผู้ใช้ Discord',
  previewColCity: 'เมือง',
  previewPhone2: 'เบอร์ 2: {phone}',

  // Import
  importing: 'กำลังนำเข้าสู่ Firestore ({completed}/{total})...',
  importAllButton: 'นำเข้าคำตอบทั้งหมดในสเปรดชีต (รวม Discord และ WA) สู่ Firebase',
  importResult:
    'นำเข้าเสร็จสิ้น: <strong>สมาชิกใหม่ {added} คน</strong>, อัปเดต {updated}, ไม่เปลี่ยนแปลง {unchanged}, ล้มเหลว {skipped}',
  errorTip: 'เคล็ดลับ: คุณสามารถวาง URL ของสเปรดชีต Google Form ในช่องด้านบนแล้วคลิก "ตรวจสอบ" ได้เช่นกัน',
  grantAccessButton: 'ให้สิทธิ์ / เชื่อมต่อ Google',

  // Real-time poller
  pollerTitle: 'ตัวตรวจสอบช่วงเปลี่ยนผ่านแบบเรียลไทม์',
  pollerActive: 'ทำงานอยู่ (สด)',
  pollerInactive: 'ไม่ทำงาน',
  pollerDesc:
    'ขณะเปิดใช้งาน แอปจะตรวจสอบสเปรดชีตทุก {seconds} วินาที คำตอบ Google Form ใหม่ทุกรายการจะถูกเพิ่มลงใน Firebase โดยอัตโนมัติและได้รับ KCC ID ทันที',
  pollIntervalLabel: 'ช่วงเวลาตรวจสอบ:',
  pollEverySeconds: 'ทุก {seconds} วินาที',
  pollEverySecondsOptimal: 'ทุก {seconds} วินาที (เหมาะสมที่สุด)',
  lastPollLabel: 'ตรวจสอบล่าสุด:',
  lastPollNever: 'ยังไม่ได้เรียกใช้',
  stopPoller: 'หยุดการตรวจสอบแบบสด',
  startAutoSync: 'เริ่มซิงค์อัตโนมัติแบบเรียลไทม์',

  // Google Apps Script webhook
  webhookTitle: 'Webhook ของ Google Apps Script',
  webhookDesc:
    'ต้องการให้คำตอบ Google Form มาถึงทันทีเมื่อกดปุ่ม <em>Submit</em> โดยไม่ต้องรอรอบการตรวจสอบใช่ไหม? ติดตั้งสคริปต์นี้ใน Google Sheet คำตอบของคุณ:',
  scriptCommentInstall: 'ติดตั้งใน: Google Sheet คำตอบ -> ส่วนขยาย -> Apps Script',
  scriptCommentTrigger: 'ทริกเกอร์: onFormSubmit -> เมื่อส่งแบบฟอร์ม',
  scriptCommentResponseData: 'อ่านข้อมูลคำตอบของแบบฟอร์ม',
  copied: 'คัดลอกแล้ว!',
  copyScript: 'คัดลอกสคริปต์',
  installStepsTitle: 'ตั้งค่าด่วน (1 นาที):',
  installStep1: '1. เปิด Google Sheet คำตอบของคุณ > เมนู <strong>ส่วนขยาย</strong> > <strong>Apps Script</strong>',
  installStep2: '2. วางโค้ดด้านบน > บันทึก',
  installStep3:
    '3. ที่เมนูด้านซ้าย คลิก <strong>ทริกเกอร์</strong> > เพิ่มทริกเกอร์ > เลือกประเภทเหตุการณ์: <em>เมื่อส่งแบบฟอร์ม</em>',

  // Sync history
  recentSyncTitle: 'ประวัติการซิงค์ล่าสุด',
  logCount: '{count} บันทึก',
  logsPermissionDenied: 'การเข้าถึงบันทึกการซิงค์ถูกปฏิเสธ โปรดเข้าสู่ระบบด้วยบัญชี Google ของผู้ดูแล',
  logsLoadFailed: 'ไม่สามารถโหลดประวัติการซิงค์ได้ ตรวจสอบการเชื่อมต่อแล้วโหลดหน้าใหม่',
  logsEmpty: 'ยังไม่มีการบันทึกกิจกรรมการซิงค์',
  logImportedRows: 'นำเข้า {count} แถว',
  logImportSummary:
    'นำเข้าเสร็จสิ้น: สมาชิกใหม่ {added} คน, อัปเดต {updated}, ไม่เปลี่ยนแปลง {unchanged}, ล้มเหลว {skipped}',
  logAutoSummary: 'อัตโนมัติ: ใหม่ {added}, อัปเดต {updated}',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'ตัวนำเข้า Google Sheets',

  // Errors
  adminAccountFallback: 'บัญชีผู้ดูแล',
  errorUnauthorized:
    'สิทธิ์ Google Sheets หมดอายุหรือใช้ไม่ได้อีกต่อไป คลิก "เชื่อมต่อ Google Sheets" เพื่อต่ออายุ แล้วลองอีกครั้ง',
  errorScope:
    'ยังไม่ได้รับสิทธิ์อ่าน Google Sheets คลิก "เชื่อมต่อ Google Sheets" และทำเครื่องหมายสิทธิ์เพื่อดูสเปรดชีต Google Sheets ของคุณ',
  errorNoAccess:
    'บัญชี Google ที่เข้าสู่ระบบอยู่ ({account}) ไม่มีสิทธิ์เข้าถึงสเปรดชีตนี้ หรือ ID สเปรดชีตไม่ถูกต้อง โปรดแชร์สเปรดชีตกับบัญชีผู้ดูแลนั้น (สิทธิ์ผู้มีสิทธิ์อ่านก็เพียงพอ) หรือตรวจสอบ URL/ID อีกครั้ง',
  errorUnsupportedFile:
    'ไฟล์นี้ไม่ใช่ไฟล์ Google Sheets โดยตรง (เช่น ไฟล์ Excel .xlsx ที่อัปโหลด) โปรดเปิดไฟล์ เลือก ไฟล์ > บันทึกเป็น Google ชีต แล้วใช้ URL ของไฟล์ใหม่',
  errorRateLimit: 'ถึงขีดจำกัดคำขอ Google Sheets API แล้ว โปรดรอประมาณหนึ่งนาทีแล้วลองอีกครั้ง',
  errorNetwork: 'ไม่สามารถเชื่อมต่อ Google Sheets ได้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง',
  errorRejected: 'Google Sheets ปฏิเสธคำขอ: {detail}',
  errorInvalidInput:
    'URL หรือ ID ของสเปรดชีตไม่ถูกต้อง โปรดวาง URL ของ Google Sheets แบบเต็ม (https://docs.google.com/spreadsheets/d/…/edit) หรือเฉพาะ ID',
  errorEmptyInput: 'โปรดใส่ URL หรือ ID ของ Google Sheets ก่อน',
  errorNotConnected: 'ยังไม่ได้ให้สิทธิ์เข้าถึง Google Sheets โปรดคลิก "เชื่อมต่อ Google Sheets" ก่อน',
  errorEmptySheet: 'สเปรดชีตนี้ว่างเปล่าหรือยังไม่มีคำตอบ',
  errorReadFailed: 'ไม่สามารถอ่านสเปรดชีตได้',
  errorInspectFirst: 'โปรดเชื่อมต่อ Google Sheets และตรวจสอบสเปรดชีตก่อน (ขั้นตอนที่ 1)',
  errorNoRows: 'ไม่มีแถวคำตอบให้นำเข้า',
  errorNoValidRows: 'ไม่พบแถวที่ถูกต้องตามการจับคู่คอลัมน์นี้',
  errorCheckFirst: 'โปรดตรวจสอบสเปรดชีตในขั้นตอนที่ 1 ก่อน',
};

export default sheets;
