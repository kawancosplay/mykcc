import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Cầu nối thời gian thực Google Sheets & Form',
  bridgeSubtitle: 'Chuyển đổi từ Google Form sang Firebase',
  pageTitle: 'Đồng bộ cơ sở dữ liệu bảng tính & Google Form',
  pageDesc:
    'Nhập bảng tính hiện có của các thành viên hiện tại và bật đồng bộ thời gian thực, để mọi thành viên mới điền Google Form trong giai đoạn chuyển đổi đều được tự động thêm vào Firebase.',
  connectSheets: 'Kết nối Google Sheets',
  renewAccess: 'Gia hạn quyền truy cập Google Sheets',
  connectionRequiredTitle: 'Cần kết nối Google Sheets',
  connectionRequiredDesc:
    'Để đọc trực tiếp bảng tính Google Form, hãy cấp cho MyKCC quyền đọc Google Sheets đối với tài khoản Google admin đang đăng nhập. Tài khoản đó phải có quyền truy cập bảng tính đăng ký của KawanCosplay.',
  accessRequestNotice:
    'Quyền được yêu cầu cho tài khoản đang đăng nhập. MyKCC chỉ yêu cầu quyền đọc Google Sheets, không truy cập Google Drive.',
  accessRequestNoticeWithEmail:
    'Quyền được yêu cầu cho tài khoản đang đăng nhập ({email}). MyKCC chỉ yêu cầu quyền đọc Google Sheets, không truy cập Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Bảng tính Google Form',
  step1Desc: 'Dán URL hoặc ID của bảng tính câu trả lời Google Form.',
  spreadsheetInputLabel: 'URL / ID Google Spreadsheet',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit hoặc ID',
  inspectButton: 'Kiểm tra',
  formatHint: 'Định dạng: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'Chưa nhận diện được URL / ID.',
  sheetTabLabel: 'Chọn trang tính (tab)',

  // Step 2: column mapping
  step2Title: 'Ánh xạ cột câu trả lời',
  step2Desc: 'Đã phát hiện {count} cột trong Google Form của bạn',
  autoDetectedBadge: 'Tự động phát hiện',
  columnFullName: 'Cột Họ tên',
  columnCosname: 'Cột Cosname / Biệt danh',
  columnEmail: 'Cột Email',
  columnWhatsapp: 'Cột WhatsApp / Số điện thoại',
  columnWhatsapp2: 'Cột WhatsApp dự phòng / Số WA 2',
  optionalTag: '(Tùy chọn)',
  columnDiscord: 'Cột Tên người dùng Discord',
  columnCity: 'Cột Thành phố / Nơi cư trú',
  columnRole: 'Cột Vai trò / Sở thích (Cosplayer/Crafter/v.v.)',
  columnFandom: 'Cột Fandom / Nhân vật yêu thích',
  columnTimestamp: 'Cột Dấu thời gian câu trả lời',
  optionChooseColumn: '-- Chọn cột --',
  optionNone: '-- Không có / Để trống --',
  optionDefaultIndonesia: '-- Mặc định (Indonesia) --',
  optionDefaultCosplayer: '-- Mặc định (Cosplayer) --',
  optionDefaultAnimeGames: '-- Mặc định (Anime & Game) --',
  optionCurrentTime: '-- Thời gian hiện tại --',
  previewTitle: 'Xem trước dữ liệu bảng tính (Tên, WhatsApp & Tên người dùng Discord):',
  previewColName: 'Tên / Cosname',
  previewColDiscord: 'Tên người dùng Discord',
  previewColCity: 'Thành phố',
  previewPhone2: 'Số 2: {phone}',

  // Import
  importing: 'Đang nhập vào Firestore ({completed}/{total})...',
  importAllButton: 'Nhập toàn bộ câu trả lời trong bảng tính (gồm Discord & WA) vào Firebase',
  importResult:
    'Đã nhập xong: <strong>{added} thành viên mới</strong>, {updated} đã cập nhật, {unchanged} không đổi, {skipped} thất bại.',
  errorTip: 'Mẹo: bạn cũng có thể dán URL bảng tính Google Form vào ô nhập ở trên và nhấn "Kiểm tra".',
  grantAccessButton: 'Cấp quyền / Kết nối Google',

  // Real-time poller
  pollerTitle: 'Trình kiểm tra chuyển tiếp thời gian thực',
  pollerActive: 'Đang hoạt động (Live)',
  pollerInactive: 'Không hoạt động',
  pollerDesc:
    'Khi bật, ứng dụng sẽ kiểm tra bảng tính mỗi {seconds} giây. Mỗi câu trả lời Google Form mới sẽ được tự động thêm vào Firebase và nhận KCC ID ngay lập tức.',
  pollIntervalLabel: 'Chu kỳ kiểm tra:',
  pollEverySeconds: 'Mỗi {seconds} giây',
  pollEverySecondsOptimal: 'Mỗi {seconds} giây (Tối ưu)',
  lastPollLabel: 'Lần kiểm tra gần nhất:',
  lastPollNever: 'Chưa chạy',
  stopPoller: 'Dừng kiểm tra trực tiếp',
  startAutoSync: 'Bắt đầu tự động đồng bộ thời gian thực',

  // Google Apps Script webhook
  webhookTitle: 'Webhook Google Apps Script',
  webhookDesc:
    'Muốn câu trả lời Google Form đến ngay lập tức khi nhấn nút <em>Submit</em> mà không phải chờ chu kỳ kiểm tra? Hãy cài đặt script này trong Google Sheet câu trả lời của bạn:',
  scriptCommentInstall: 'Cài đặt tại: Google Sheet câu trả lời -> Tiện ích mở rộng -> Apps Script',
  scriptCommentTrigger: 'Trình kích hoạt: onFormSubmit -> Khi gửi biểu mẫu',
  scriptCommentResponseData: 'Đọc dữ liệu câu trả lời của biểu mẫu',
  copied: 'Đã sao chép!',
  copyScript: 'Sao chép script',
  installStepsTitle: 'Thiết lập nhanh (1 phút):',
  installStep1:
    '1. Mở Google Sheet câu trả lời của bạn > menu <strong>Tiện ích mở rộng</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. Dán đoạn mã ở trên > Lưu.',
  installStep3:
    '3. Ở menu bên trái, nhấn <strong>Trình kích hoạt</strong> > Thêm trình kích hoạt > Chọn loại sự kiện: <em>Khi gửi biểu mẫu</em>.',

  // Sync history
  recentSyncTitle: 'Lịch sử đồng bộ gần đây',
  logCount: '{count} nhật ký',
  logsPermissionDenied: 'Truy cập nhật ký đồng bộ bị từ chối. Hãy đăng nhập bằng tài khoản Google của admin.',
  logsLoadFailed: 'Không thể tải lịch sử đồng bộ. Hãy kiểm tra kết nối rồi tải lại trang.',
  logsEmpty: 'Chưa có hoạt động đồng bộ nào được ghi lại.',
  logImportedRows: 'Đã nhập {count} hàng',
  logImportSummary:
    'Đã nhập xong: {added} thành viên mới, {updated} đã cập nhật, {unchanged} không đổi, {skipped} thất bại.',
  logAutoSummary: 'Tự động: {added} mới, {updated} đã cập nhật.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Trình nhập Google Sheets',

  // Errors
  adminAccountFallback: 'tài khoản admin',
  errorUnauthorized:
    'Quyền Google Sheets đã hết hạn hoặc không còn hợp lệ. Nhấn "Kết nối Google Sheets" để gia hạn, rồi thử lại.',
  errorScope:
    'Chưa được cấp quyền đọc Google Sheets. Nhấn "Kết nối Google Sheets" và đánh dấu quyền xem các bảng tính Google Sheets của bạn.',
  errorNoAccess:
    'Tài khoản Google đang đăng nhập ({account}) không có quyền truy cập bảng tính này, hoặc ID bảng tính bị sai. Hãy chia sẻ bảng tính với tài khoản admin đó (quyền Người xem là đủ), hoặc kiểm tra lại URL/ID.',
  errorUnsupportedFile:
    'Tệp này không phải tệp Google Sheets gốc (ví dụ: tệp Excel .xlsx được tải lên). Hãy mở tệp, chọn Tệp > Lưu dưới dạng Google Trang tính, rồi dùng URL của tệp mới.',
  errorRateLimit: 'Đã đạt giới hạn yêu cầu Google Sheets API. Hãy chờ khoảng một phút rồi thử lại.',
  errorNetwork: 'Không thể kết nối tới Google Sheets. Hãy kiểm tra kết nối internet rồi thử lại.',
  errorRejected: 'Google Sheets đã từ chối yêu cầu: {detail}',
  errorInvalidInput:
    'URL hoặc ID bảng tính không hợp lệ. Hãy dán URL Google Sheets đầy đủ (https://docs.google.com/spreadsheets/d/…/edit) hoặc chỉ ID của nó.',
  errorEmptyInput: 'Hãy nhập URL hoặc ID Google Sheets trước.',
  errorNotConnected: 'Chưa được cấp quyền truy cập Google Sheets. Hãy nhấn "Kết nối Google Sheets" trước.',
  errorEmptySheet: 'Bảng tính này trống hoặc chưa có câu trả lời nào.',
  errorReadFailed: 'Không thể đọc bảng tính.',
  errorInspectFirst: 'Hãy kết nối Google Sheets và kiểm tra một bảng tính trước (Bước 1).',
  errorNoRows: 'Không có hàng câu trả lời nào để nhập.',
  errorNoValidRows: 'Không tìm thấy hàng hợp lệ nào với cách ánh xạ cột này.',
  errorCheckFirst: 'Hãy kiểm tra một bảng tính ở Bước 1 trước.',
};

export default sheets;
