import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: '示範表單測試沙箱',
  sandboxBadge: '沙箱模式',
  description:
    '一鍵自動填入範本，測試 KCC ID 產生（時間戳記 UID、管理員 UID 0001-0100、主帳號 0000）。',
  randomizeTitle: '產生隨機人物',
  randomize: '隨機產生',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay 使用者 ID 規則：',
  ruleMainAccount: 'KCC 主帳號',
  ruleAdminRange: 'KCC 管理員號段',
  ruleTimestamp: '依時間戳記編排的成員 UID',

  // Preset cards
  previewName: '名稱：',
  previewWhatsapp: 'WA：',
  previewDiscord: 'DC：',
  fillForm: '填入表單',
  submitTest: '送出測試',
  tip: '提示：點選「{action}」即可立即模擬送出，並查看產生的 KCC ID 會員證與 WhatsApp 解鎖畫面。',
  presetLoaded: '已載入範本',

  // Presets
  presetCosplayerName: '示範 Cosplayer（時間戳記 UID）',
  presetCosplayerBadge: '時間戳記 UID',
  presetCosplayerDesc: '依送出時間戳記編排的 16 位數 UID（YYYYMMDDHHmmssSeq）',
  presetAdminName: '示範 KCC 管理員（UID 0001-0100）',
  presetAdminBadge: '管理員 UID 號段',
  presetAdminDesc: 'KCC 管理員專用 UID：0000 0000 0000 0001 至 0000 0000 0000 0100',
  presetMainAccountName: '示範 KCC 主帳號（UID 0000）',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 僅限主帳號 cosplaysehat@gmail.com 使用',
  presetPropMakerName: '示範道具師 / 手作者',
  presetPropMakerBadge: '手作者（時間戳記）',
  presetPropMakerDesc: '道具與盔甲製作者，使用以時間戳記為準的 UID',
  presetPhotographerName: '示範 Cosplay 攝影師',
  presetPhotographerBadge: '攝影師',
  presetPhotographerDesc: '攝影師與錄影師，使用以時間戳記為準的 UID',
  presetOthersName: '示範其他 / 自訂身分',
  presetOthersBadge: '其他身分',
  presetOthersDesc: '自訂身分「其他」，專長為 Cosplay 化妝與假髮造型',
  presetDuplicateName: '唯一 KCC ID 測試（相符：{name}）',
  presetDuplicateBadge: '唯一 KCC ID 檢查',
  presetDuplicateDesc: '驗證相同的 WhatsApp 號碼會保留 KCC ID：{id}',
  presetSecondaryPhoneName: '備用號碼測試（2 組號碼：{name}）',
  presetSecondaryPhoneBadge: '2 組 WA 號碼檢查',
  presetSecondaryPhoneDesc: '新增備用號碼並保留 KCC ID：{id}',
};

export default demo;
