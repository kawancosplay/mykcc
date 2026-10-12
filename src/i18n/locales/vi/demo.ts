import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Sandbox thử nghiệm biểu mẫu demo',
  sandboxBadge: 'Chế độ Sandbox',
  description:
    'Tự động điền mẫu bằng 1 cú nhấp để thử nghiệm việc tạo KCC ID (UID theo thời gian, UID Admin 0001-0100, Tài khoản chính 0000).',
  randomizeTitle: 'Tạo hồ sơ ngẫu nhiên',
  randomize: 'Ngẫu nhiên',

  // KCC ID allocation rules
  rulesTitle: 'Quy tắc User ID của KawanCosplay:',
  ruleMainAccount: 'Tài khoản chính KCC',
  ruleAdminRange: 'Dải ID Admin KCC',
  ruleTimestamp: 'UID thành viên sắp xếp theo thời gian',

  // Preset cards
  previewName: 'Tên:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Điền biểu mẫu',
  submitTest: 'Gửi thử',
  tip: 'Mẹo: Nhấn "{action}" để mô phỏng việc gửi ngay lập tức và xem thẻ KCC ID được tạo cùng việc mở khóa WhatsApp.',
  presetLoaded: 'Đã tải mẫu',

  // Presets
  presetCosplayerName: 'Cosplayer demo (UID theo thời gian)',
  presetCosplayerBadge: 'UID theo thời gian',
  presetCosplayerDesc: 'UID 16 chữ số sắp xếp theo thời điểm gửi (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Admin KCC demo (UID 0001-0100)',
  presetAdminBadge: 'Dải UID Admin',
  presetAdminDesc: 'UID từ 0000 0000 0000 0001 đến 0000 0000 0000 0100 dành cho Admin KCC',
  presetMainAccountName: 'Tài khoản chính KCC demo (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 chỉ dành riêng cho tài khoản chính cosplaysehat@gmail.com',
  presetPropMakerName: 'Thợ làm đạo cụ / Crafter demo',
  presetPropMakerBadge: 'Crafter (theo thời gian)',
  presetPropMakerDesc: 'Thợ chế tác đạo cụ & giáp với UID theo thời gian',
  presetPhotographerName: 'Nhiếp ảnh gia cosplay demo',
  presetPhotographerBadge: 'Nhiếp ảnh gia',
  presetPhotographerDesc: 'Nhiếp ảnh gia & quay phim với UID theo thời gian',
  presetOthersName: 'Vai trò khác / Tùy chỉnh demo',
  presetOthersBadge: 'Vai trò khác',
  presetOthersDesc: 'Vai trò tùy chỉnh "Khác" chuyên về trang điểm cosplay & tạo kiểu wig',
  presetDuplicateName: 'Thử KCC ID duy nhất (Khớp: {name})',
  presetDuplicateBadge: 'Kiểm tra KCC ID duy nhất',
  presetDuplicateDesc: 'Xác minh số WhatsApp trùng khớp vẫn giữ KCC ID: {id}',
  presetSecondaryPhoneName: 'Thử số điện thoại phụ (2 số: {name})',
  presetSecondaryPhoneBadge: 'Kiểm tra 2 số WA',
  presetSecondaryPhoneDesc: 'Thêm số điện thoại phụ & giữ nguyên KCC ID: {id}',
};

export default demo;
