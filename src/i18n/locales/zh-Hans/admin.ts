import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: '管理员工作台',
  dashboardDesc: '受限管理界面，保护成员隐私及数据维护。',
  loginPrompt: '请输入管理员密匙或使用管理员邮箱登录。',
  privacyRestrictedNotice: '为保护全体成员隐私，成员名单仅向社团管理员开放。',
  exportCsv: '导出 CSV',
  totalMembers: '已登记成员总数',
  resetFilter: '重置筛选',
};

export default admin;
