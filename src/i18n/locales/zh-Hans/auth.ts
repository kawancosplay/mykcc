import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: '登录 MyKCC',
  signUpTitle: '创建新的 MyKCC 账号',
  orContinueWith: '或使用其他方式继续',
  emailLabel: '常用邮箱地址',
  passwordLabel: '密码',

  // AuthModal
  forgotPasswordTitle: '忘记密码',
  portalSubtitle: 'MyKCC 官方社区门户（16 位用户 ID）',
  loginTab: '登录',
  signUpTab: '注册',
  nameLabel: '名称（Cosname / 昵称）',
  namePlaceholder: '例如 Rian_Cos / Alya / Ken',
  nameHint: '创建账号时可不填。您可以稍后在社区表单中补充全名和 Cosname。',
  emailPlaceholder: 'name@gmail.com',
  forgotPasswordLink: '忘记密码？',
  passwordPlaceholder: '至少 6 个字符',
  signUpSubmit: '创建账号并获取 16 位 ID',
  sendResetEmail: '发送重置邮件',
  backToLogin: '返回登录',
  continueWithGoogle: '使用 Google 继续',
  emailRequired: '请填写邮箱。',
  signUpRequirements: '需要填写有效的邮箱，以及至少 6 个字符的密码。',
  resetEmailSent: '密码重置邮件已发送。',
  authFailed: '登录时出现问题，请重试。',
  googleLoginFailed: 'Google 登录已取消或遇到问题。',
};

export default auth;
