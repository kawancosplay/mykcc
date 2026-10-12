import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: '管理員後台',
  dashboardDesc: '受保護的管理員專區，維護名冊與試算表同步。',
  loginPrompt: '請輸入管理員密鑰或以管理員信箱登入。',
  privacyRestrictedNotice: '為尊重會員個人隱私，名冊僅供管理團隊調閱。',
  exportCsv: '匯出 CSV',
  totalMembers: '已登錄會員總數',
  resetFilter: '重設篩選',
};

export default admin;
