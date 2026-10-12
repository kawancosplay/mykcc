import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'Cộng đồng Pop Culture, Cosplay & Wota toàn cầu (100% SFW)',
  navForm: 'Đơn đăng ký',
  navCard: 'Thẻ số của tôi',
  navGallery: 'Thư viện ảnh Cosplay',
  navProfile: 'Hồ sơ của tôi',
  navAdmin: 'Bảng quản trị',
  navLogin: 'Đăng nhập / Đăng ký',
  navLogout: 'Đăng xuất',
  userId16Label: 'KCC ID chính thức',
  officialBannerText: 'Trang web chính thức của KawanCosplay',
  howYouKnow: 'Cách nhận biết trang web chính thức',
  aboutKccTitle: 'Cộng đồng quốc tế chính thức (100% SFW)',
  aboutKccDesc:
    'KawanCosplay là cộng đồng sáng tạo quốc tế về văn hóa đại chúng, hướng đến cosplay lành mạnh 100% SFW (Safe For Work), yêu mến idol, anime và mở cửa cho thành viên trên toàn thế giới.',
  secureSiteTitle: 'Trang web an toàn sử dụng HTTPS & biểu tượng ổ khóa (🔒)',
  secureSiteDesc:
    'Hãy nhìn vào thanh địa chỉ của trình duyệt. Trang web chính thức luôn bắt đầu bằng https:// và hiển thị biểu tượng ổ khóa bảo mật (🔒).',
  officialContactTitle: 'Hotline WhatsApp & Email chính thức',
  officialContactDesc:
    'Mọi liên hệ chính thức chỉ được xử lý qua Hotline WhatsApp +62 857-1103-2782 và cosplaysehat@gmail.com.',
  whatsappHotline: 'Hotline WhatsApp chính thức: +62 857-1103-2782',

  // Generic
  close: 'Đóng',
  optional: '(Tùy chọn)',
  tryAgain: 'Thử lại',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'Đang tải ứng dụng...',
  loadingAdmin: 'Đang tải trang quản trị...',

  // Navbar & app shell
  navFormShort: 'Đăng ký',
  navCardShort: 'KCC ID',
  navGalleryShort: 'Thư viện',
  openMenu: 'Mở menu',
  closeMenu: 'Đóng menu',
  chooseLanguage: 'Chọn ngôn ngữ ({language})',
  siteEditorShort: 'Chỉnh sửa trang',
  themeEditor: 'Chỉnh sửa giao diện',
  whatsappCommunity: 'Cộng đồng WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'Email: cosplaysehat@gmail.com',
  userFallbackName: 'Người dùng',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'Logo KawanCosplay',
  officialBadge: 'Chính thức',

  // PWA install
  pwaInstall: 'Cài đặt ứng dụng',
  pwaIosTitle: 'Cài đặt trên iPhone / iPad',
  pwaIosStep1: '1. Nhấn nút {share} trên thanh công cụ Safari.',
  pwaIosShare: 'Chia sẻ',
  pwaIosStep2: '2. Cuộn xuống và nhấn {addToHome}.',
  pwaIosAddToHome: 'Thêm vào Màn hình chính',

  // Admin portal shell
  backToPublicSite: 'Quay lại trang công khai',
  adminPortalTitle: 'Cổng quản trị KawanCosplay',
  googleSignInBadge: 'Đăng nhập Google',
  adminRestricted: 'Chỉ dành cho Admin',
  lockAndExitAdminTitle: 'Khóa và thoát cổng quản trị',
  lockExit: 'Khóa / Thoát',
  adminPortal: 'Cổng quản trị',
  adminPortalLinkTitle: 'Cổng chỉ dành cho admin KCC (đăng nhập Google của admin)',
  sheetsPopupClosed: 'Cửa sổ cấp quyền Google đã bị đóng trước khi hoàn tất.',
  sheetsWrongAccount: 'Hãy chọn cùng tài khoản Google với tài khoản admin đang đăng nhập.',
  sheetsPopupBlocked:
    'Trình duyệt đã chặn cửa sổ đăng nhập Google. Hãy cho phép cửa sổ bật lên (pop-up) cho trang này rồi thử lại.',
  sheetsConnectFailed:
    'Không thể kết nối Google Sheets. Hãy chọn tài khoản admin (cosplaysehat@gmail.com) và cho phép quyền đọc Google Sheets.',

  // KCC ID lookup page
  cardPageBadge: 'Thẻ thành viên MyKCC',
  cardPageTitle: 'Thẻ thành viên & KCC ID',
  cardPageDesc:
    'Để bảo vệ quyền riêng tư của tất cả thành viên, danh sách thành viên đầy đủ chỉ có trong cổng quản trị. Nhập KCC ID 16 chữ số của bạn (ví dụ: 2026 1008 0715 3001) để hiển thị thẻ số chính thức của bạn.',
  connectedProfile: 'Hồ sơ đã kết nối',
  openPass: 'Mở thẻ',
  lookupPlaceholder: 'KCC ID 16 chữ số, ví dụ: 2026 1008 0715 3001',
  lookupSubmit: 'Tìm & xem thẻ thành viên',
  searching: 'Đang tìm...',
  passFound: 'Đã tìm thấy thẻ!',
  notRegisteredYet: 'Chưa đăng ký?',
  fillRegistrationForm: 'Điền đơn đăng ký →',
  lookupInvalidId: 'Vui lòng nhập KCC ID 16 chữ số của bạn (chỉ gồm chữ số, được phép có dấu cách).',
  lookupNotFound: 'Không tìm thấy thẻ thành viên nào với KCC ID này. Vui lòng kiểm tra lại 16 chữ số.',
  lookupPermissionDenied:
    'Tính năng tra cứu thẻ hiện không khả dụng (cơ sở dữ liệu từ chối truy cập). Vui lòng thử lại sau hoặc liên hệ admin KCC.',

  // Profile tab states
  profileLoadFailed: 'Không thể tải hồ sơ thành viên của bạn.',
  checkConnectionRetry: 'Hãy kiểm tra kết nối internet rồi thử lại.',
  preparingProfile: 'Đang chuẩn bị hồ sơ thành viên...',
  preparingProfileDesc: 'Đang kết nối tài khoản với danh tính KCC số của bạn.',
  pleaseSignIn: 'Vui lòng đăng nhập',
  clickToSignIn: 'Nhấn vào đây để đăng nhập',

  // Footer
  footerPlatform: 'Nền tảng văn hóa đại chúng quốc tế 100% SFW.',
  copyright: '© 2026 MyKCC. Bảo lưu mọi quyền.',
  privacyShieldActive: 'Hệ thống danh tính 16 chữ số & lá chắn quyền riêng tư đang hoạt động',
};

export default common;
