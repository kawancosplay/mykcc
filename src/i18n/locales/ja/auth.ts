import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'MyKCC にログイン',
  signUpTitle: 'MyKCC の新規アカウントを作成',
  orContinueWith: 'または他のサービスで続ける',
  emailLabel: '使用中のメールアドレス',
  passwordLabel: 'パスワード',

  // AuthModal
  forgotPasswordTitle: 'パスワードの再設定',
  portalSubtitle: 'MyKCC 公式コミュニティポータル（16桁ユーザー ID）',
  loginTab: 'ログイン',
  signUpTab: '新規登録',
  nameLabel: '名前（コスネーム / 別名）',
  namePlaceholder: '例: Rian_Cos / Alya / Ken',
  nameHint: 'アカウント作成時は任意です。氏名とコスネームは、後からコミュニティフォームで追加できます。',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: 'パスワードをお忘れですか？',
  passwordPlaceholder: '6文字以上',
  signUpSubmit: 'アカウント作成＆16桁 ID を取得',
  sendResetEmail: '再設定メールを送信',
  backToLogin: 'ログインに戻る',
  continueWithGoogle: 'Google で続ける',
  emailRequired: 'メールアドレスは必須です。',
  signUpRequirements: '有効なメールアドレスと6文字以上のパスワードが必要です。',
  resetEmailSent: 'パスワード再設定メールを送信しました。',
  authFailed: 'ログイン中に問題が発生しました。もう一度お試しください。',
  googleLoginFailed: 'Google ログインがキャンセルされたか、問題が発生しました。',
};

export default auth;
