import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: '社群分析',
  subtitle: 'KawanCosplay 成員組成與興趣',
  title: '社群統計與成員組成',
  description: '依技能類別、居住城市與喜愛作品，概覽 KawanCosplay 社群成員。',
  allVerifiedActive: '100% 已驗證且活躍',
  webFormLabel: '網頁入會表單',
  webFormDesc: '透過新系統註冊',
  googleFormLabel: 'Google Form 同步',
  googleFormDesc: '來自即時過渡同步',
  citiesLabel: '居住城市',
  citiesDesc: '遍及印尼各地的城市',
  rolesTitle: '社群身分分布',
  rolesDesc: 'Cosplayer、手作者、攝影師、化妝師與工作人員的組成比例',
  regionsTitle: '地區 / 城市分布',
  regionsDesc: '成員居住的城市，供規劃各地區聚會與外拍之用',
  fandomsTitle: '熱門作品與角色興趣',
  fandomsDesc: '最受歡迎、適合團體 Cosplay 企劃的動畫、遊戲與系列作品',
  fandomInterest: 'Cosplay 企劃興趣',
  countWithPercent: '{count}（{percent}）',
  memberCountOne: '{count} 位成員',
  memberCountOther: '{count} 位成員',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: '其他',
  fandomAnimeGames: '動漫與遊戲',
};

export default stats;
