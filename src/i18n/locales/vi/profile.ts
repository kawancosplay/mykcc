import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Hồ sơ thành viên của tôi',
  updateProfile: 'Cập nhật thông tin hồ sơ theo thời gian thực',

  // Hero
  changeAvatar: 'Đổi ảnh đại diện',
  verifiedActive: 'Đã xác minh & đang hoạt động',
  kccIdLabel: 'KCC ID (16 CHỮ SỐ)',
  copyKccId: 'Sao chép KCC ID',
  viewIdCard: 'Xem thẻ thành viên',

  // Profile form
  infoTitle: 'Thông tin hồ sơ thành viên',
  infoDesc:
    'Bạn có thể thay đổi thông tin này bất cứ lúc nào; thông tin được lưu theo thời gian thực vào cơ sở dữ liệu MyKCC.',
  savedRealtime: 'Đã lưu theo thời gian thực!',
  ageCategoryLabel: 'Nhóm tuổi',
  ageLabel: 'Tuổi / Ngày sinh (Tùy chọn)',
  agePlaceholder: 'Ví dụ: 21 tuổi hoặc 15 tháng 5',
  whatsappLabel: 'Số WhatsApp đang hoạt động',
  backupPhoneLabel: 'Số WhatsApp thứ hai / dự phòng',
  backupPhonePlaceholder: 'Ví dụ: 0812... hoặc +62 857...',
  discordPlaceholder: 'Ví dụ: alyachan_cos hoặc user#0001',
  roleLabel: 'Vai trò chính trong cộng đồng',
  customRolePlaceholder: 'Nhập vai trò / chuyên môn khác của bạn...',
  socialMediaPlaceholder: '@tên_tài_khoản (Instagram / X / TikTok)',
  reasonLabel: 'Lý do tham gia & ghi chú hồ sơ',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Fan idol / Wota',
  roleOtaku: 'Otaku Anime, Manga & Game',
  roleGeneralEnthusiast: 'Người yêu thích chung / Người ủng hộ',
  rolePropMaker: 'Thợ làm đạo cụ / Crafter',
  roleCostumeMaker: 'Người làm trang phục / Thợ may',
  roleEventCrew: 'Ekip & nhân viên sự kiện',
};

export default profile;
