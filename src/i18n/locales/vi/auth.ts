import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'Đăng nhập MyKCC',
  signUpTitle: 'Tạo tài khoản MyKCC mới',
  orContinueWith: 'Hoặc tiếp tục với nhà cung cấp khác',
  emailLabel: 'Địa chỉ Email đang hoạt động',
  passwordLabel: 'Mật khẩu',

  // AuthModal
  forgotPasswordTitle: 'Quên mật khẩu',
  portalSubtitle: 'Cổng cộng đồng MyKCC chính thức (ID người dùng 16 chữ số)',
  loginTab: 'Đăng nhập',
  signUpTab: 'Đăng ký',
  nameLabel: 'Tên (Cosname / Biệt danh)',
  namePlaceholder: 'Ví dụ: Rian_Cos / Alya / Ken',
  nameHint:
    'Không bắt buộc khi tạo tài khoản. Bạn có thể thêm họ tên đầy đủ & cosname sau trong đơn đăng ký cộng đồng.',
  emailPlaceholder: 'ten@gmail.com',
  forgotPasswordLink: 'Quên mật khẩu?',
  passwordPlaceholder: 'Ít nhất 6 ký tự',
  signUpSubmit: 'Tạo tài khoản & nhận ID 16 chữ số',
  sendResetEmail: 'Gửi email đặt lại',
  backToLogin: 'Quay lại đăng nhập',
  continueWithGoogle: 'Tiếp tục với Google',
  emailRequired: 'Vui lòng nhập email.',
  signUpRequirements: 'Cần có email hợp lệ và mật khẩu ít nhất 6 ký tự.',
  resetEmailSent: 'Email đặt lại mật khẩu đã được gửi.',
  authFailed: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.',
  googleLoginFailed: 'Đăng nhập Google đã bị hủy hoặc gặp sự cố.',
};

export default auth;
