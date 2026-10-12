import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'マイプロフィール',
  updateProfile: 'プロフィール情報をリアルタイムで更新',

  // Hero
  changeAvatar: 'プロフィール写真を変更',
  verifiedActive: '認証済み・アクティブ',
  kccIdLabel: 'KCC ID（16桁）',
  copyKccId: 'KCC ID をコピー',
  viewIdCard: '会員証を表示',

  // Profile form
  infoTitle: 'メンバープロフィール情報',
  infoDesc: 'この情報はいつでも変更できます。変更内容は MyKCC データベースにリアルタイムで保存されます。',
  savedRealtime: 'リアルタイムで保存しました！',
  ageCategoryLabel: '年齢区分',
  ageLabel: '年齢 / 誕生日（任意）',
  agePlaceholder: '例: 21歳 または 5月15日',
  whatsappLabel: '使用中の WhatsApp 番号',
  backupPhoneLabel: '2つ目 / 予備の WhatsApp 番号',
  backupPhonePlaceholder: '例: 0812... または +62 857...',
  discordPlaceholder: '例: alyachan_cos または user#0001',
  roleLabel: 'コミュニティでの主な役割',
  customRolePlaceholder: 'その他の役割・得意分野を入力...',
  socialMediaPlaceholder: '@ユーザー名（Instagram / X / TikTok）',
  reasonLabel: '参加理由・プロフィールメモ',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'アイドルファン / ヲタ',
  roleOtaku: 'アニメ・マンガ・ゲームオタク',
  roleGeneralEnthusiast: '一般ファン / サポーター',
  rolePropMaker: '小道具制作 / クラフター',
  roleCostumeMaker: '衣装制作 / 裁縫',
  roleEventCrew: 'イベントクルー＆スタッフ',
};

export default profile;
