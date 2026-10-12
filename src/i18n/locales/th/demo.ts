import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'แซนด์บ็อกซ์ทดสอบแบบฟอร์มเดโม',
  sandboxBadge: 'โหมดแซนด์บ็อกซ์',
  description:
    'กรอกข้อมูลสำเร็จรูปอัตโนมัติในคลิกเดียว เพื่อทดสอบการสร้าง KCC ID (UID ตามเวลา, UID ผู้ดูแล 0001-0100, บัญชีหลัก 0000)',
  randomizeTitle: 'สร้างตัวตนแบบสุ่ม',
  randomize: 'สุ่ม',

  // KCC ID allocation rules
  rulesTitle: 'กฎ User ID ของ KawanCosplay:',
  ruleMainAccount: 'บัญชีหลัก KCC',
  ruleAdminRange: 'ช่วง ID ผู้ดูแล KCC',
  ruleTimestamp: 'UID สมาชิกเรียงตามเวลา',

  // Preset cards
  previewName: 'ชื่อ:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'กรอกแบบฟอร์ม',
  submitTest: 'ส่งทดสอบ',
  tip: 'เคล็ดลับ: คลิก "{action}" เพื่อจำลองการส่งทันที และดูบัตร KCC ID ที่สร้างขึ้นพร้อมการปลดล็อก WhatsApp',
  presetLoaded: 'โหลดค่าสำเร็จรูปแล้ว',

  // Presets
  presetCosplayerName: 'คอสเพลเยอร์เดโม (UID ตามเวลา)',
  presetCosplayerBadge: 'UID ตามเวลา',
  presetCosplayerDesc: 'UID 16 หลักเรียงตามเวลาที่ส่ง (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'ผู้ดูแล KCC เดโม (UID 0001-0100)',
  presetAdminBadge: 'ช่วง UID ผู้ดูแล',
  presetAdminDesc: 'UID 0000 0000 0000 0001 ถึง 0000 0000 0000 0100 สำหรับผู้ดูแล KCC',
  presetMainAccountName: 'บัญชีหลัก KCC เดโม (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 สงวนไว้สำหรับบัญชีหลัก cosplaysehat@gmail.com เท่านั้น',
  presetPropMakerName: 'ช่างทำพร็อพ / นักประดิษฐ์เดโม',
  presetPropMakerBadge: 'นักประดิษฐ์ (ตามเวลา)',
  presetPropMakerDesc: 'ช่างฝีมือทำพร็อพและชุดเกราะ พร้อม UID ตามเวลา',
  presetPhotographerName: 'ช่างภาพคอสเพลย์เดโม',
  presetPhotographerBadge: 'ช่างภาพ',
  presetPhotographerDesc: 'ช่างภาพและช่างวิดีโอ พร้อม UID ตามเวลา',
  presetOthersName: 'บทบาทอื่น ๆ / กำหนดเองเดโม',
  presetOthersBadge: 'บทบาทอื่น ๆ',
  presetOthersDesc: 'บทบาทกำหนดเอง "อื่น ๆ" ที่เชี่ยวชาญด้านแต่งหน้าคอสเพลย์และทำวิก',
  presetDuplicateName: 'ทดสอบ KCC ID เดียว (ตรงกับ: {name})',
  presetDuplicateBadge: 'ตรวจสอบ KCC ID เดียว',
  presetDuplicateDesc: 'ตรวจสอบว่า WhatsApp ที่ตรงกันยังคงใช้ KCC ID: {id}',
  presetSecondaryPhoneName: 'ทดสอบเบอร์สำรอง (2 เบอร์: {name})',
  presetSecondaryPhoneBadge: 'ตรวจสอบ 2 เบอร์ WA',
  presetSecondaryPhoneDesc: 'เพิ่มเบอร์สำรองและคง KCC ID: {id}',
};

export default demo;
