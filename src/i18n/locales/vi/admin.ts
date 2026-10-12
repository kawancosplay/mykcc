import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'Bảng Quản trị viên',
  dashboardDesc: 'Khu vực quản lý bảo mật danh sách thành viên và đồng bộ dữ liệu.',
  loginPrompt: 'Nhập mã khóa Admin hoặc đăng nhập bằng email chính thức.',
  privacyRestrictedNotice: 'Để bảo vệ quyền riêng tư của thành viên, danh sách thành viên chỉ dành riêng cho Quản trị viên.',
  exportCsv: 'Xuất file CSV',
  totalMembers: 'Tổng số thành viên',
  resetFilter: 'Đặt lại bộ lọc',
};

export default admin;
