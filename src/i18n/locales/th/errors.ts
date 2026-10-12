import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'ฐานข้อมูลปฏิเสธการเข้าถึง (permission denied) ยังไม่มีการบันทึกข้อมูลใด ๆ โปรดตรวจสอบว่าทุกช่องไม่เกินจำนวนตัวอักษรที่กำหนด หรือเข้าสู่ระบบด้วยบัญชีที่ได้รับอนุญาต แล้วลองอีกครั้ง',
  signInRequired: 'โปรดเข้าสู่ระบบก่อนเพื่อดำเนินการต่อ',
  databaseUnavailable: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง',
  saveFailed: 'เกิดข้อผิดพลาดระหว่างบันทึก โปรดลองอีกครั้ง',

  // firestoreService.ts
  profilePhotoTooLarge: 'รูปโปรไฟล์มีขนาดใหญ่เกินไป โปรดเลือกรูปอื่น',
  nameRequired: 'ต้องระบุชื่อ',
  invalidCardId: 'KCC ID สำหรับบัตรสมาชิกไม่ถูกต้อง: {id}',
  uniqueIdFailed: 'ไม่สามารถสร้าง KCC ID ที่ไม่ซ้ำได้ โปรดลองอีกครั้ง',
  mergeAdminOnly: 'เฉพาะผู้ดูแลเท่านั้นที่รวมข้อมูลสมาชิกได้',
  mergeSameRecord: 'ไม่สามารถรวมรายการเข้ากับตัวเองได้',
  memberRecordMissing: 'ไม่มีข้อมูลสมาชิกนี้อีกต่อไป (อาจถูกรวมหรือลบไปแล้ว)',
  mergeDifferentAccounts: 'ทั้งสองรายการเชื่อมโยงกับบัญชีเข้าสู่ระบบที่ต่างกัน จึงไม่สามารถรวมกันได้',
  repairAdminOnly: 'เฉพาะผู้ดูแลเท่านั้นที่เรียกใช้การซ่อมแซมได้',
  repairIdUpdateFailed: 'อัปเดต KCC ID ล้มเหลว ({ids}): {detail}',
  repairCardWriteFailed: 'เขียนบัตรสมาชิกล้มเหลว ({ids}): {detail}',
  repairCardDeleteFailed: 'ลบบัตรสมาชิกล้มเหลว ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'โปรดเข้าสู่ระบบก่อนอัปโหลดรูป',
  photoTooLarge: 'รูปมีขนาดใหญ่เกินไป โปรดเลือกรูปอื่น',

  // googleAuth.ts
  googleAccessTokenMissing: 'ไม่สามารถรับโทเค็นการเข้าถึงจากการเข้าสู่ระบบ Google ได้',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'ข้อผิดพลาด Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'คำขอ Sheets API {label} ล้มเหลว: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'บัญชีหลัก KCC (0000)',
  badgeAdmin: 'ผู้ดูแล KCC #{number}',
  badgeMember: 'สมาชิก (ตามเวลา)',
};

export default errors;
