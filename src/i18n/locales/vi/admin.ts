import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Bảng quản trị KawanCosplay',
  dashboardDesc: 'Cổng quản trị giới hạn dành cho danh sách thành viên cộng đồng và đồng bộ Google Sheets.',
  loginPrompt: 'Nhập mã khóa Admin hoặc đăng nhập bằng cosplaysehat@gmail.com',
  privacyRestrictedNotice:
    'Để bảo vệ quyền riêng tư của thành viên, danh sách thành viên được giới hạn nghiêm ngặt, chỉ admin KawanCosplay mới được xem.',
  exportCsv: 'Xuất file CSV',
  totalMembers: 'Tổng số thành viên đã đăng ký',
  resetFilter: 'Đặt lại bộ lọc',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Đang kiểm tra quyền admin...',
  signedInNotAdmin: 'Đã đăng nhập với {account} — tài khoản này không phải admin KCC.',
  emailNotVerified: 'Email chưa được xác minh — hãy dùng đăng nhập Google.',
  signInWithAdminGoogleEmail: 'Đăng nhập bằng tài khoản Google của Admin ({email})',
  signOutThisAccount: 'Đăng xuất',
  whatsappAdminHelp: 'Hỗ trợ từ admin qua WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Cổng quản lý KawanCosplay',
  verifiedAccessBadge: 'Quyền truy cập đã xác minh',
  dashboardPrivacyNote:
    'Quyền riêng tư của thành viên được bảo vệ nghiêm ngặt: chỉ admin đã đăng ký mới xem được tên & thông tin liên hệ.',
  whatsappHotlineShort: 'Hotline WA: {phone}',
  signOutAdmin: 'Đăng xuất tài khoản admin',
  statusStat: 'Trạng thái: {status}',
  statusVerified: 'Đã xác minh',
  statusActive: 'Đang hoạt động',
  statusPending: 'Đang chờ',
  tabMembers: 'Danh sách & hồ sơ thành viên ({count})',
  tabSync: 'Đồng bộ Google Sheets & Form',
  tabStats: 'Thống kê cộng đồng',

  // Member list states
  permissionDeniedTitle: 'Truy cập bị từ chối',
  permissionDeniedDesc:
    'Cơ sở dữ liệu đã từ chối quyền truy cập danh sách thành viên đối với tài khoản này. Hãy đăng nhập bằng tài khoản Google của admin ({email}) hoặc tài khoản có trong collection admins, rồi tải lại trang. Đồng thời đảm bảo Firestore Rules mới nhất đã được xuất bản lên cơ sở dữ liệu {database}.',
  signInWithAdminGoogle: 'Đăng nhập bằng tài khoản Google của Admin',
  reloadPage: 'Tải lại trang',
  loadMembersFailedTitle: 'Không thể tải danh sách thành viên',
  loadMembersFailedDesc: 'Không thể tải danh sách thành viên. Hãy kiểm tra kết nối rồi tải lại trang.',
  loadingMembers: 'Đang tải dữ liệu thành viên...',

  // Member status & delete
  statusUpdateFailed: 'Không thể cập nhật trạng thái thành viên: {error}',
  deleteMemberConfirm: 'Xóa thành viên "{name}" (KCC ID: {id}) khỏi cơ sở dữ liệu Firestore?',
  deleteMemberFailed: 'Không thể xóa thành viên: {error}',

  // KCC ID & public card repair
  repairTitle: 'Sửa chữa KCC ID & thẻ công khai',
  repairDesc:
    'Cấp KCC ID duy nhất cho các thành viên có ID bị trùng (người đăng ký sớm nhất giữ ID cũ), lưu các KCC ID chưa được lưu, và dựng lại collection công khai memberCards dùng để tra cứu thẻ. Có thể chạy lại nhiều lần một cách an toàn.',
  repairDuplicatesDetected: 'Phát hiện {count} thành viên có KCC ID trùng lặp — hãy nhấn "{action}".',
  allIdsUnique: 'Tất cả KCC ID đều là duy nhất.',
  runRepair: 'Chạy sửa chữa',
  repairRunning: 'Đang sửa chữa...',
  repairRunningProgress: 'Đang sửa chữa ({done}/{total})...',
  repairConfirm:
    'Chạy sửa chữa KCC ID & thẻ công khai cho tất cả thành viên?\n\n- Thành viên có KCC ID trùng lặp sẽ nhận ID mới (người đăng ký sớm nhất giữ ID cũ).\n- Các KCC ID chưa được lưu sẽ được lưu.\n- Collection công khai memberCards sẽ được dựng lại.\n\nCó thể chạy lại nhiều lần một cách an toàn. Tiếp tục?',
  repairFailed: 'Sửa chữa thất bại: {error}',
  repairDone: 'Đã sửa chữa xong.',
  repairStatScanned: 'Thành viên đã quét',
  repairStatDuplicateGroups: 'Nhóm ID trùng lặp',
  repairStatCardsWritten: 'Thẻ đã ghi',
  repairStatCardsDeleted: 'Thẻ đã xóa',
  reassignedListTitle: 'KCC ID đã thay đổi / lưu ({count}):',
  repairReasonDuplicate: 'ID trùng lặp',
  repairReasonMissing: 'ID chưa được lưu',
  repairReasonMainAccount: 'ID tài khoản chính đang bị thành viên khác dùng',
  noIdsChanged: 'Không có KCC ID nào cần thay đổi.',
  issuesCount: 'Lỗi ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID dành riêng cho Admin / Tài khoản chính ({range})',
  reservedIdsDesc:
    'Các ID trong khoảng này chỉ dành cho tài khoản chính & admin của KCC. Các thành viên dưới đây đã nhận một ID như vậy từ vai trò/email họ nhập trong đơn công khai (hệ thống cũ). Nhấn "{action}" để cấp cho họ KCC ID duy nhất theo thứ tự thời gian.',
  noReservedHolders: 'Không có thành viên nào giữ KCC ID dành riêng cho admin.',
  reservedHolderMeta: 'Nguồn: {source} • Vai trò: {role}',
  processing: 'Đang xử lý...',
  assignNewId: 'Cấp ID mới',
  reassignConfirm: 'Cấp KCC ID mới cho "{name}" (hiện tại là {id})?',
  reassignMainAccountWarning:
    'CẢNH BÁO: đây là ID của tài khoản chính. Đừng tiếp tục nếu thành viên này là tài khoản chính thức {email}.',
  resultSuccess: 'Thành công: {message}',
  resultFailed: 'Thất bại: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Đăng ký trùng lặp (cùng một người)',
  duplicatesDesc:
    'Các thành viên đã điền đơn nhiều lần (cùng số WhatsApp, Discord, email hoặc mạng xã hội). "Gộp" sẽ giữ dữ liệu mới nhất và mọi số WhatsApp trên lần đăng ký sớm nhất (KCC ID của bản đó được giữ nguyên), sau đó xóa bản trùng lặp cùng với thẻ của nó. Hãy kiểm tra trước khi gộp.',
  scanDuplicates: 'Quét đăng ký trùng lặp',
  mergeConfirm:
    'Gộp "{duplicate}" ({duplicateId}) vào "{keeper}" ({keeperId})?\n\nDữ liệu mới nhất & các số WhatsApp sẽ được sao chép sang lần đăng ký sớm nhất, sau đó bản trùng lặp sẽ bị xóa vĩnh viễn. Tiếp tục?',
  mergeSuccess: 'Đã gộp "{duplicate}" vào "{keeper}" — KCC ID {id} được giữ nguyên.',
  bulkMergeIdenticalConfirm:
    'Gộp {groups} nhóm trùng lặp GIỐNG HỆT NHAU ({records} bản ghi trùng lặp)?\n\nChỉ gồm các nhóm có cùng cosname và số WhatsApp chính, được tạo cách nhau tối đa {seconds} giây (bản sao y hệt / nhập hai lần).\nDữ liệu mới nhất & mọi số WhatsApp sẽ được chuyển sang lần đăng ký sớm nhất (KCC ID của bản đó được giữ nguyên), sau đó các bản trùng lặp sẽ bị xóa vĩnh viễn. Tiếp tục?',
  bulkMergeAllConfirm:
    'Gộp TẤT CẢ {groups} nhóm đã quét ({records} bản ghi trùng lặp)?\n\nBao gồm cả các nhóm chỉ khớp do cùng số WhatsApp, Discord, email, mạng xã hội hoặc tên — hãy chắc chắn bạn đã kiểm tra danh sách bên dưới.\nDữ liệu mới nhất & mọi số WhatsApp sẽ được chuyển sang lần đăng ký sớm nhất (KCC ID của bản đó được giữ nguyên), sau đó các bản trùng lặp sẽ bị xóa vĩnh viễn. Không thể hoàn tác thao tác này. Tiếp tục?',
  bulkMergeDone: 'Đã gộp hàng loạt xong ({mode}).',
  bulkModeIdentical: 'các nhóm giống hệt nhau',
  bulkModeAll: 'tất cả kết quả quét',
  bulkStatGroups: 'Nhóm đã xử lý',
  bulkStatMergedGroups: 'Nhóm đã gộp',
  bulkStatMergedRecords: 'Bản trùng lặp đã gộp',
  bulkStatFailedGroups: 'Nhóm thất bại',
  bulkMoreErrors: '…và {count} lỗi khác (xem console của trình duyệt).',
  scanSummary:
    'Tìm thấy {groups} nhóm trùng lặp ({records} bản ghi trùng lặp), trong đó có {identical} nhóm giống hệt nhau (cùng cosname & số WhatsApp chính, được tạo cách nhau tối đa {seconds} giây).',
  mergeAllIdentical: 'Gộp tất cả nhóm giống hệt ({count})',
  mergeAllScanned: 'Gộp tất cả kết quả quét ({count})',
  bulkMergeProgress: 'Đang gộp {done}/{total} nhóm…',
  noDuplicatesFound: 'Không phát hiện đăng ký trùng lặp nào.',
  keeperBadge: 'Được giữ lại (KCC ID giữ nguyên)',
  merging: 'Đang gộp...',
  mergeInto: 'Gộp vào {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Tìm kiếm...',
  filterAllRoles: 'Tất cả vai trò ({count})',
  filterAllCities: 'Tất cả địa điểm',
  filterAllAges: 'Mọi độ tuổi',
  filterLegalAge: 'Đã thành niên (18+)',
  filterMinor: 'Chưa thành niên (<18)',
  filterPreferNotToSay: 'Không xác định',
  sortNewest: '🕒 Thời gian: Mới nhất',
  sortNameAsc: '🔤 Tên: A → Z',
  purgeButtonTitle: 'Xóa sạch toàn bộ dữ liệu thành viên trong Firestore',
  purgeButton: 'Xóa sạch dữ liệu thành viên',
  purging: 'Đang xóa sạch...',
  purgePrompt:
    "CẢNH BÁO NGHIÊM TRỌNG: Thao tác này sẽ XÓA VĨNH VIỄN TOÀN BỘ DỮ LIỆU THÀNH VIÊN khỏi cơ sở dữ liệu Firestore.\n\nNhập '{keyword}' (viết hoa) để xác nhận xóa sạch cơ sở dữ liệu:",
  purgeCancelled: 'Đã hủy xác nhận (từ khóa không khớp).',
  purgeSuccess: 'Đã xóa sạch: {count} bản ghi thành viên đã bị xóa khỏi cơ sở dữ liệu.',
  purgeFailed: 'Không thể xóa dữ liệu thành viên: {error}',
  exportNoData: 'Không có dữ liệu để xuất.',
  showingMembers: 'Đang hiển thị {shown} / {total} thành viên',

  // CSV export column headers
  csvKccId: 'KCC ID (16 chữ số)',
  csvCosname: 'Cosname / Biệt danh',
  csvLegalName: 'Họ tên theo giấy tờ',
  csvPrimaryWhatsapp: 'WhatsApp chính',
  csvBackupWhatsapp: 'WhatsApp dự phòng',
  csvDiscord: 'Tên người dùng Discord',
  csvEmail: 'Email',
  csvAgeCategory: 'Nhóm tuổi',
  csvAge: 'Tuổi / Ngày sinh',
  csvCountry: 'Quốc gia',
  csvProvince: 'Tỉnh',
  csvCity: 'Thành phố',
  csvPrimaryRole: 'Vai trò chính',
  csvFandom: 'Fandom',
  csvExperience: 'Kinh nghiệm',
  csvStatus: 'Trạng thái',
  csvRegisteredAt: 'Ngày đăng ký',

  // Members table
  colMember: 'Thành viên / Cosname',
  colKccId: 'KCC ID 16 chữ số',
  colContact: 'WhatsApp & liên hệ',
  colDiscord: 'Tên người dùng Discord',
  colRole: 'Vai trò & sở thích',
  colAge: 'Tuổi',
  colLocation: 'Địa điểm',
  colStatus: 'Trạng thái',
  colRegistered: 'Ngày đăng ký',
  colActions: 'Thao tác',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Trẻ nhất',
  sortAgeOldest: '▼ Lớn tuổi nhất',
  sortStatusAsc: '▲ Xác minh',
  sortStatusDesc: '▼ Đang chờ',
  sortTimeNewest: '▼ Mới nhất',
  sortTimeOldest: '▲ Cũ nhất',
  legalNameValue: 'Tên giấy tờ: {name}',
  mainAccountBadge: 'Tài khoản chính KCC',
  adminIdBadge: 'Admin KCC #{number}',
  timestampIdBadge: 'ID theo thời gian',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Xem KCC ID',
  deleteMemberTitle: 'Xóa thành viên',
  emptyDatabaseTitle: 'Cơ sở dữ liệu thành viên trống',
  emptyDatabaseDesc:
    'Chưa có dữ liệu thành viên nào trong cơ sở dữ liệu. Hãy nhập từ bảng tính Google Form hoặc chờ đăng ký mới.',
  noResultsTitle: 'Không có kết quả',
  noResultsDesc: 'Không có dữ liệu thành viên nào khớp với từ khóa tìm kiếm hoặc bộ lọc đã chọn.',
  openSheetsSync: 'Mở đồng bộ Google Sheets & Form',
};

export default admin;
