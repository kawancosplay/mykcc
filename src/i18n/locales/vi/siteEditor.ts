import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'Trình chỉnh sửa giao diện trang',
  editorDesc: 'Tùy chỉnh bố cục, màu sắc, nền, phông chữ và logo theo thời gian thực.',
  resetTitle: 'Đặt lại giao diện mặc định',
  resetDefault: 'Khôi phục mặc định',
  saveFailed: 'Không thể lưu thay đổi giao diện: {error}',
  autoSaveNotice: 'Các thay đổi được tự động lưu vào cơ sở dữ liệu của trang (chỉ dành cho admin).',
  doneClose: 'Xong & Đóng',

  // Tabs
  tabLayout: 'Bố cục',
  tabBackground: 'Nền',
  tabColors: 'Màu sắc',
  tabFont: 'Phông chữ & kiểu chữ',
  tabLogo: 'Logo & nhận diện',

  // Layout tab
  layoutWidthLabel: 'Chiều rộng nội dung trang',
  widthNormal: 'Chiều rộng thường (7XL - 1280px)',
  widthNormalDesc: 'Kích thước tiêu chuẩn, hiển thị tốt trên máy tính & điện thoại',
  widthCompact: 'Gọn (6XL - 1152px)',
  widthCompactDesc: 'Hẹp hơn, tập trung vào nội dung chính giữa',
  widthFull: 'Toàn chiều rộng',
  widthFullDesc: 'Trải rộng hết chiều ngang màn hình',
  navbarStyleLabel: 'Kiểu thanh điều hướng',
  navbarGlassBar: 'Thanh kính toàn chiều rộng',
  navbarGlassBarDesc: 'Dính ở trên cùng với hiệu ứng làm mờ',
  navbarFloatingPill: 'Viên nang nổi',
  navbarFloatingPillDesc: 'Nổi gọn gàng ở chính giữa phía trên',
  navbarMinimal: 'Tối giản gọn gàng',
  navbarMinimalDesc: 'Đơn giản và tiết kiệm không gian',
  cardRadiusLabel: 'Bo góc thẻ',
  radius3xl: 'Bo tròn nhiều (3XL)',
  radius2xl: 'Bo tròn hiện đại (2XL)',
  radiusXl: 'Tiêu chuẩn (XL)',
  radiusLg: 'Kỹ thuật / Mảnh (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Mẫu nền Fluent có sẵn',
  bgBrightPurpleName: 'Tím sáng Fluent (Mặc định)',
  bgBrightPurpleDesc: 'Hào quang kính phát sáng tím-violet phong cách Fluent với chiều sâu mượt mà',
  bgCyberPurpleName: 'Tím neon Cyberpunk',
  bgCyberPurpleDesc: 'Tím điện tương phản cao với điểm nhấn hồng magenta rực rỡ',
  bgCosmicDarkName: 'Nửa đêm vũ trụ',
  bgCosmicDarkDesc: 'Xanh navy không gian sâu thẳm và đen obsidian với tinh vân tím',
  bgFluentLavenderName: 'Lavender Fluent dịu nhẹ',
  bgFluentLavenderDesc: 'Ánh tím pastel phát sáng với kính mờ nhẹ nhàng',
  bgDarkOnyxName: 'Đen Onyx Obsidian',
  bgDarkOnyxDesc: 'Than chì siêu tối sang trọng với viền phản chiếu tím tinh tế',
  customGradientTitle: 'Dải màu CSS tùy chỉnh',
  customGradientDesc: 'Nhập mã CSS background hoặc linear-gradient của riêng bạn.',
  useCustom: 'Dùng tùy chỉnh',

  // Colors tab (theme labels)
  accentColorLabel: 'Màu nhấn của giao diện',
  colorPurple: 'Tím hoàng gia (Mặc định)',
  colorRose: 'Hồng Sakura',
  colorIndigo: 'Chàm điện',
  colorEmerald: 'Ngọc lục bảo',
  colorAmber: 'Hổ phách hoàng hôn',
  colorCyan: 'Xanh Cyber',
  customColorTitle: 'Màu Hex tùy chỉnh',
  customColorDesc: 'Chọn bất kỳ màu nhấn chính nào bạn thích.',

  // Font tab
  fontLabel: 'Kiểu chữ & phông chữ của trang',
  fontDinNextName: 'DIN Next (Chính thức)',
  fontDinNextDesc: 'Kiểu chữ DIN hình học hiện đại — sắc nét, gọn gàng và uy tín',
  fontActive: 'Đang dùng',
  fontSample: 'Con cáo nâu nhanh nhẹn nhảy qua con chó lười • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'Tên logo & dòng phụ đề',
  logoTitleLabel: 'Tiêu đề logo chính',
  logoSubtitleLabel: 'Phụ đề / Khẩu hiệu',
  logoSubtitlePlaceholder: 'Cổng thành viên cộng đồng',
  emblemLabel: 'Chọn biểu tượng có sẵn',
  emblemKitsune: 'Mặt nạ Kitsune (KCC chính thức)',
  emblemCrown: 'Vương miện hoàng gia',
  emblemShield: 'Khiên cộng đồng',
  emblemHeart: 'Trái tim tình bạn',
  emblemSparkle: 'Ngôi sao lấp lánh kỳ diệu',
  customLogoLabel: 'Hoặc dùng ảnh logo tùy chỉnh (URL ảnh)',
  customLogoHint: 'Nhập liên kết đến logo PNG/SVG nền trong suốt, hoặc để trống để dùng biểu tượng chính thức.',
};

export default siteEditor;
