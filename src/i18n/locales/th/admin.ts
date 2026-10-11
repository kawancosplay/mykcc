import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'แดชบอร์ดผู้ดูแลระบบ',
  dashboardDesc: 'พอร์ทัลเฉพาะผู้ดูแลเพื่อความปลอดภัยของข้อมูลสมาชิก',
  loginPrompt: 'กรอกรหัสผู้ดูแลหรือเข้าสู่ระบบด้วยอีเมลทางการ',
  privacyRestrictedNotice: 'เพื่อความเป็นส่วนตัวของสมาชิก รายชื่อสมาชิกจะสงวนสิทธิ์เฉพาะผู้ดูแลเท่านั้น',
  exportCsv: 'ส่งออก CSV',
  totalMembers: 'สมาชิกทั้งหมด',
  resetFilter: 'ล้างตัวกรอง',
};

export default admin;
