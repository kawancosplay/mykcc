import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'لوحة تحكم المسؤول',
  dashboardDesc: 'بوابة الإدارة لحماية بيانات الأعضاء.',
  loginPrompt: 'أدخل مفتاح المسؤول أو سجل دخولك بالبريد الرسمي.',
  privacyRestrictedNotice: 'حمايةً لخصوصية الأعضاء، لا يمكن لأحد استعراض قائمة الأعضاء سوى الإدارة.',
  exportCsv: 'تصدير كملف CSV',
  totalMembers: 'إجمالي الأعضاء',
  resetFilter: 'إعادة التعيين',
};

export default admin;
