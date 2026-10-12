import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Cơ sở dữ liệu đã từ chối truy cập (permission denied). Chưa có gì được lưu. Hãy đảm bảo mọi trường đều nằm trong giới hạn ký tự, hoặc đăng nhập bằng tài khoản được ủy quyền, rồi thử lại.',
  signInRequired: 'Vui lòng đăng nhập trước để tiếp tục.',
  databaseUnavailable: 'Không thể kết nối tới cơ sở dữ liệu. Hãy kiểm tra kết nối internet rồi thử lại.',
  saveFailed: 'Đã xảy ra lỗi khi lưu. Vui lòng thử lại.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Ảnh đại diện quá lớn. Vui lòng chọn ảnh khác.',
  nameRequired: 'Vui lòng nhập tên.',
  invalidCardId: 'KCC ID không hợp lệ cho thẻ thành viên: {id}',
  uniqueIdFailed: 'Không thể tạo KCC ID duy nhất. Vui lòng thử lại.',
  mergeAdminOnly: 'Chỉ admin mới có thể gộp hồ sơ thành viên.',
  mergeSameRecord: 'Không thể gộp một hồ sơ vào chính nó.',
  memberRecordMissing: 'Hồ sơ thành viên này không còn tồn tại (có thể đã được gộp hoặc bị xóa).',
  mergeDifferentAccounts: 'Hai hồ sơ được liên kết với các tài khoản đăng nhập khác nhau nên không thể gộp.',
  repairAdminOnly: 'Chỉ admin mới có thể chạy sửa chữa.',
  repairIdUpdateFailed: 'Cập nhật KCC ID thất bại ({ids}): {detail}',
  repairCardWriteFailed: 'Ghi thẻ thành viên thất bại ({ids}): {detail}',
  repairCardDeleteFailed: 'Xóa thẻ thành viên thất bại ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Vui lòng đăng nhập trước để tải ảnh lên.',
  photoTooLarge: 'Ảnh quá lớn. Vui lòng chọn ảnh khác.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Không thể lấy mã truy cập (access token) từ đăng nhập Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Lỗi Sheets API {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Yêu cầu Sheets API {label} thất bại: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Tài khoản chính KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Thành viên (theo thời gian)',
};

export default errors;
