import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: '演示表单测试沙盒',
  sandboxBadge: '沙盒模式',
  description:
    '一键自动填充预设，测试 KCC ID 生成（时间戳 UID、管理员 UID 0001-0100、主账号 0000）。',
  randomizeTitle: '生成随机人设',
  randomize: '随机生成',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay 用户 ID 规则：',
  ruleMainAccount: 'KCC 主账号',
  ruleAdminRange: 'KCC 管理员号段',
  ruleTimestamp: '按时间戳编排的成员 UID',

  // Preset cards
  previewName: '名称：',
  previewWhatsapp: 'WA：',
  previewDiscord: 'DC：',
  fillForm: '填写表单',
  submitTest: '提交测试',
  tip: '提示：点击“{action}”即可立即模拟提交，并查看生成的 KCC ID 会员证和 WhatsApp 解锁效果。',
  presetLoaded: '预设已加载',

  // Presets
  presetCosplayerName: '演示 Cosplayer（时间戳 UID）',
  presetCosplayerBadge: '时间戳 UID',
  presetCosplayerDesc: '按提交时间戳编排的 16 位 UID（YYYYMMDDHHmmssSeq）',
  presetAdminName: '演示 KCC 管理员（UID 0001-0100）',
  presetAdminBadge: '管理员 UID 号段',
  presetAdminDesc: 'KCC 管理员专用 UID：0000 0000 0000 0001 至 0000 0000 0000 0100',
  presetMainAccountName: '演示 KCC 主账号（UID 0000）',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 仅限主账号 cosplaysehat@gmail.com 使用',
  presetPropMakerName: '演示道具师 / 手作者',
  presetPropMakerBadge: '手作者（时间戳）',
  presetPropMakerDesc: '道具与盔甲制作者，使用基于时间戳的 UID',
  presetPhotographerName: '演示 Cosplay 摄影师',
  presetPhotographerBadge: '摄影师',
  presetPhotographerDesc: '摄影师与摄像师，使用基于时间戳的 UID',
  presetOthersName: '演示其他 / 自定义身份',
  presetOthersBadge: '其他身份',
  presetOthersDesc: '自定义身份“其他”，专长为 Cosplay 化妆与假发造型',
  presetDuplicateName: '唯一 KCC ID 测试（匹配：{name}）',
  presetDuplicateBadge: '唯一 KCC ID 检查',
  presetDuplicateDesc: '验证相同的 WhatsApp 号码会保留 KCC ID：{id}',
  presetSecondaryPhoneName: '备用号码测试（2 个号码：{name}）',
  presetSecondaryPhoneBadge: '2 个 WA 号码检查',
  presetSecondaryPhoneDesc: '添加备用号码并保留 KCC ID：{id}',
};

export default demo;
