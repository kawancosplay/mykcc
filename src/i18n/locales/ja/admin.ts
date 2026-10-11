import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: '管理者ダッシュボード',
  dashboardDesc: '名簿保護およびスプレッドシート連携管理用ポータル。',
  loginPrompt: '管理者パスキーを入力するか公式アドレスでログインしてください。',
  privacyRestrictedNotice: 'プライバシー保護のため、名簿一覧は管理者のみに制限されています。',
  exportCsv: 'CSV出力',
  totalMembers: '登録メンバー総数',
  resetFilter: 'リセット',
};

export default admin;
