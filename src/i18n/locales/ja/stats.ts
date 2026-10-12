import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: 'コミュニティ分析',
  subtitle: 'KawanCosplay の属性と関心',
  title: 'コミュニティ統計と属性',
  description: 'スキル部門、居住都市、好きなジャンル別に見た KawanCosplay メンバーの概要です。',
  allVerifiedActive: '100% 認証済み・アクティブ',
  webFormLabel: 'Web 登録フォーム',
  webFormDesc: '新システムで登録',
  googleFormLabel: 'Google フォーム同期',
  googleFormDesc: 'ライブ移行同期から',
  citiesLabel: '居住都市',
  citiesDesc: 'インドネシア各地の都市',
  rolesTitle: 'コミュニティでの役割',
  rolesDesc: 'コスプレイヤー、クラフター、カメラマン、メイクアップアーティスト、クルーの構成',
  regionsTitle: '地域・都市別の分布',
  regionsDesc: 'メンバーの居住都市（地域ごとのオフ会や撮影会の計画用）',
  fandomsTitle: '人気ジャンル・キャラクター',
  fandomsDesc: '併せ（グループコスプレ）企画で人気のアニメ・ゲーム・シリーズ作品',
  fandomInterest: 'コスプレ企画への関心',
  countWithPercent: '{count} ({percent})',
  memberCountOne: 'メンバー {count} 人',
  memberCountOther: 'メンバー {count} 人',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: 'その他',
  fandomAnimeGames: 'アニメ＆ゲーム',
};

export default stats;
