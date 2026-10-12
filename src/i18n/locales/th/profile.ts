import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'โปรไฟล์สมาชิกของฉัน',
  updateProfile: 'อัปเดตข้อมูลโปรไฟล์แบบเรียลไทม์',

  // Hero
  changeAvatar: 'เปลี่ยนรูปโปรไฟล์',
  verifiedActive: 'ยืนยันแล้วและใช้งานอยู่',
  kccIdLabel: 'KCC ID (16 หลัก)',
  copyKccId: 'คัดลอก KCC ID',
  viewIdCard: 'ดูบัตรสมาชิก',

  // Profile form
  infoTitle: 'ข้อมูลโปรไฟล์สมาชิก',
  infoDesc: 'คุณเปลี่ยนแปลงข้อมูลนี้ได้ทุกเมื่อ ระบบจะบันทึกลงฐานข้อมูล MyKCC แบบเรียลไทม์',
  savedRealtime: 'บันทึกแบบเรียลไทม์แล้ว!',
  ageCategoryLabel: 'ช่วงอายุ',
  ageLabel: 'อายุ / วันเกิด (ไม่บังคับ)',
  agePlaceholder: 'เช่น อายุ 21 ปี หรือ 15 พฤษภาคม',
  whatsappLabel: 'เบอร์ WhatsApp ที่ใช้งานอยู่',
  backupPhoneLabel: 'เบอร์ WhatsApp ที่สอง / สำรอง',
  backupPhonePlaceholder: 'เช่น 0812... หรือ +62 857...',
  discordPlaceholder: 'เช่น alyachan_cos หรือ user#0001',
  roleLabel: 'บทบาทหลักในชุมชน',
  customRolePlaceholder: 'พิมพ์บทบาท / ความถนัดอื่นของคุณ...',
  socialMediaPlaceholder: '@ชื่อผู้ใช้ (Instagram / X / TikTok)',
  reasonLabel: 'เหตุผลในการเข้าร่วมและบันทึกโปรไฟล์',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'แฟนไอดอล / โอตะ',
  roleOtaku: 'โอตาคุอนิเมะ มังงะ และเกม',
  roleGeneralEnthusiast: 'ผู้ชื่นชอบทั่วไป / ผู้สนับสนุน',
  rolePropMaker: 'ช่างทำพร็อพ / นักประดิษฐ์',
  roleCostumeMaker: 'ช่างทำชุด / ช่างตัดเย็บ',
  roleEventCrew: 'ทีมงานและสต๊าฟอีเวนต์',
};

export default profile;
