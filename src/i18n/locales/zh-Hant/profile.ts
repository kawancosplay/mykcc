import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: '我的會員檔案',
  updateProfile: '即時更新個人資料',

  // Hero
  changeAvatar: '更換大頭貼',
  verifiedActive: '已驗證且活躍',
  kccIdLabel: 'KCC ID（16 位數）',
  copyKccId: '複製 KCC ID',
  viewIdCard: '檢視會員證',

  // Profile form
  infoTitle: '會員個人資料',
  infoDesc: '您可以隨時修改這些資料，變更會即時儲存到 MyKCC 資料庫。',
  savedRealtime: '已即時儲存！',
  ageCategoryLabel: '年齡類別',
  ageLabel: '年齡 / 生日（選填）',
  agePlaceholder: '例如 21 歲 或 5 月 15 日',
  whatsappLabel: '常用 WhatsApp 號碼',
  backupPhoneLabel: '第二組 / 備用 WhatsApp 號碼',
  backupPhonePlaceholder: '例如 0812... 或 +62 857...',
  discordPlaceholder: '例如 alyachan_cos 或 user#0001',
  roleLabel: '在社群中的主要身分',
  customRolePlaceholder: '請輸入您的其他身分 / 專長...',
  socialMediaPlaceholder: '@使用者名稱（Instagram / X / TikTok）',
  reasonLabel: '入會原因與個人備註',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: '偶像粉絲 / Wota',
  roleOtaku: '動漫與遊戲宅',
  roleGeneralEnthusiast: '一般愛好者 / 支持者',
  rolePropMaker: '道具師 / 手作者',
  roleCostumeMaker: '服裝製作 / 裁縫',
  roleEventCrew: '活動工作人員',
};

export default profile;
