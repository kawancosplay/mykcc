import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'MyKCC 로그인',
  signUpTitle: 'MyKCC 새 계정 만들기',
  orContinueWith: '또는 다른 방법으로 계속하기',
  emailLabel: '사용 중인 이메일 주소',
  passwordLabel: '비밀번호',

  // AuthModal
  forgotPasswordTitle: '비밀번호 찾기',
  portalSubtitle: 'MyKCC 공식 커뮤니티 포털 (16자리 사용자 ID)',
  loginTab: '로그인',
  signUpTab: '회원가입',
  nameLabel: '이름 (코스네임 / 닉네임)',
  namePlaceholder: '예: Rian_Cos / Alya / Ken',
  nameHint: '계정을 만들 때는 선택 사항이에요. 이름과 코스네임은 나중에 커뮤니티 신청서에서 추가할 수 있어요.',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: '비밀번호를 잊으셨나요?',
  passwordPlaceholder: '6자 이상',
  signUpSubmit: '계정 만들고 16자리 ID 받기',
  sendResetEmail: '재설정 이메일 보내기',
  backToLogin: '로그인으로 돌아가기',
  continueWithGoogle: 'Google로 계속하기',
  emailRequired: '이메일은 필수예요.',
  signUpRequirements: '유효한 이메일과 6자 이상의 비밀번호가 필요해요.',
  resetEmailSent: '비밀번호 재설정 이메일을 보냈어요.',
  authFailed: '로그인 중에 문제가 발생했어요. 다시 시도해 주세요.',
  googleLoginFailed: 'Google 로그인이 취소되었거나 문제가 발생했어요.',
};

export default auth;
