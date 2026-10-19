import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: '網站外觀編輯器',
  editorDesc: '即時自訂版面、色彩、背景、字型與標誌。',
  resetTitle: '還原為預設外觀',
  resetDefault: '還原預設',
  saveFailed: '無法儲存外觀變更：{error}',
  autoSaveNotice: '變更會自動儲存到網站資料庫（僅限管理員）。',
  doneClose: '完成並關閉',

  // Tabs
  tabLayout: '版面',
  tabBackground: '背景',
  tabColors: '色彩',
  tabFont: '字型與排版',
  tabLogo: '標誌與識別',

  // Layout tab
  layoutWidthLabel: '頁面內容寬度',
  widthNormal: '標準寬度（7XL - 1280px）',
  widthNormalDesc: '在電腦與手機上都合適的標準尺寸',
  widthCompact: '緊湊（6XL - 1152px）',
  widthCompactDesc: '更緊湊，聚焦於中央內容',
  widthFull: '全寬',
  widthFullDesc: '延展至整個螢幕寬度',
  navbarStyleLabel: '導覽列樣式',
  navbarGlassBar: '全寬毛玻璃列',
  navbarGlassBarDesc: '固定於頂端，帶有模糊效果',
  navbarFloatingPill: '浮動膠囊',
  navbarFloatingPillDesc: '整齊地浮在頂端中央',
  navbarMinimal: '簡潔極簡',
  navbarMinimalDesc: '簡單且節省空間',
  cardRadiusLabel: '卡片圓角',
  radius3xl: '超圓潤（3XL）',
  radius2xl: '現代圓角（2XL）',
  radiusXl: '標準（XL）',
  radiusLg: '俐落 / 纖細（LG）',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fluent 背景預設集',
  bgBrightPurpleName: '亮紫 Fluent（預設）',
  bgBrightPurpleDesc: 'Fluent 紫羅蘭色發光玻璃光暈，層次柔和',
  bgCyberPurpleName: '賽博龐克霓虹紫',
  bgCyberPurpleDesc: '高對比電光紫，搭配亮洋紅點綴',
  bgCosmicDarkName: '宇宙午夜',
  bgCosmicDarkDesc: '深空藏青與黑曜石色，點綴紫色星雲',
  bgFluentLavenderName: '柔和 Fluent 薰衣草',
  bgFluentLavenderDesc: '明亮的粉紫色光暈，搭配柔和霧面玻璃',
  bgDarkOnyxName: '黑曜縞瑪瑙',
  bgDarkOnyxDesc: '極暗的光滑石墨色，帶有細微的紫色高光邊緣',
  customGradientTitle: '自訂 CSS 漸層',
  customGradientDesc: '輸入您自己的 CSS 背景或 linear-gradient 程式碼。',
  useCustom: '使用自訂',

  // Colors tab (theme labels)
  accentColorLabel: '主題強調色',
  colorPurple: '皇家紫（預設）',
  colorRose: '櫻花玫瑰',
  colorIndigo: '電光靛藍',
  colorEmerald: '翡翠綠',
  colorAmber: '夕陽琥珀',
  colorCyan: '賽博青',
  customColorTitle: '自訂十六進位色碼',
  customColorDesc: '選擇任何您喜歡的主要強調色。',

  // Font tab
  fontLabel: '網站字型與排版',
  fontDinNextName: 'DIN Next（官方）',
  fontDinNextDesc: '現代幾何風格的 DIN 字體——清晰、簡潔、穩重',
  fontActive: '使用中',
  fontSample: '敏捷的棕色狐狸跳過了懶狗 • The quick brown fox • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: '標誌名稱與副標題文字',
  logoTitleLabel: '標誌主標題',
  logoSubtitleLabel: '副標題 / 標語',
  logoSubtitlePlaceholder: '社群成員入口網站',
  emblemLabel: '選擇內建徽章',
  emblemKitsune: '狐狸面具（KCC 官方）',
  emblemCrown: '皇冠',
  emblemShield: '社群盾牌',
  emblemHeart: '友誼之心',
  emblemSparkle: '魔法星光',
  customLogoLabel: '或使用自訂標誌圖片（圖片網址）',
  customLogoHint: '輸入透明背景 PNG/SVG 標誌的連結，或留空以使用官方徽章。',
};

export default siteEditor;
