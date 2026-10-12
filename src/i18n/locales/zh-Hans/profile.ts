import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: '我的会员资料',
  updateProfile: '实时更新资料信息',

  // Hero
  changeAvatar: '更换头像',
  verifiedActive: '已认证且活跃',
  kccIdLabel: 'KCC ID（16 位）',
  copyKccId: '复制 KCC ID',
  viewIdCard: '查看会员证',

  // Profile form
  infoTitle: '会员资料信息',
  infoDesc: '您可以随时修改这些信息，修改会实时保存到 MyKCC 数据库。',
  savedRealtime: '已实时保存！',
  ageCategoryLabel: '年龄类别',
  ageLabel: '年龄 / 生日（选填）',
  agePlaceholder: '例如 21 岁 或 5 月 15 日',
  whatsappLabel: '常用 WhatsApp 号码',
  backupPhoneLabel: '第二个 / 备用 WhatsApp 号码',
  backupPhonePlaceholder: '例如 0812... 或 +62 857...',
  discordPlaceholder: '例如 alyachan_cos 或 user#0001',
  roleLabel: '在社区中的主要身份',
  customRolePlaceholder: '请输入您的其他身份 / 专长...',
  socialMediaPlaceholder: '@用户名（Instagram / X / TikTok）',
  reasonLabel: '加入原因与资料备注',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: '偶像粉丝 / Wota',
  roleOtaku: '动漫与游戏宅',
  roleGeneralEnthusiast: '泛爱好者 / 支持者',
  rolePropMaker: '道具师 / 手作者',
  roleCostumeMaker: '服装制作 / 裁缝',
  roleEventCrew: '活动工作人员',
};

export default profile;
