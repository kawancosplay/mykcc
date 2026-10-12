import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: '网站外观编辑器',
  editorDesc: '实时自定义布局、颜色、背景、字体和标志。',
  resetTitle: '恢复为默认外观',
  resetDefault: '恢复默认',
  saveFailed: '无法保存外观更改：{error}',
  autoSaveNotice: '更改会自动保存到网站数据库（仅限管理员）。',
  doneClose: '完成并关闭',

  // Tabs
  tabLayout: '布局',
  tabBackground: '背景',
  tabColors: '颜色',
  tabFont: '字体与排版',
  tabLogo: '标志与标识',

  // Layout tab
  layoutWidthLabel: '页面内容宽度',
  widthNormal: '标准宽度（7XL - 1280px）',
  widthNormalDesc: '在电脑和手机上都适用的标准尺寸',
  widthCompact: '紧凑（6XL - 1152px）',
  widthCompactDesc: '更紧凑，聚焦于中间内容',
  widthFull: '全宽',
  widthFullDesc: '铺满整个屏幕宽度',
  navbarStyleLabel: '导航栏样式',
  navbarGlassBar: '全宽毛玻璃栏',
  navbarGlassBarDesc: '固定在顶部，带模糊效果',
  navbarFloatingPill: '悬浮胶囊',
  navbarFloatingPillDesc: '整齐地悬浮在顶部中央',
  navbarMinimal: '简洁极简',
  navbarMinimalDesc: '简单且节省空间',
  cardRadiusLabel: '卡片圆角',
  radius3xl: '超圆润（3XL）',
  radius2xl: '现代圆角（2XL）',
  radiusXl: '标准（XL）',
  radiusLg: '硬朗 / 纤细（LG）',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fluent 背景预设',
  bgBrightPurpleName: '亮紫 Fluent（默认）',
  bgBrightPurpleDesc: 'Fluent 紫罗兰色发光玻璃光晕，层次柔和',
  bgCyberPurpleName: '赛博朋克霓虹紫',
  bgCyberPurpleDesc: '高对比度电光紫，搭配亮洋红点缀',
  bgCosmicDarkName: '宇宙午夜',
  bgCosmicDarkDesc: '深空藏青与黑曜石色，点缀紫色星云',
  bgFluentLavenderName: '柔和 Fluent 薰衣草',
  bgFluentLavenderDesc: '明亮的粉紫色光晕，搭配柔和磨砂玻璃',
  bgDarkOnyxName: '黑曜缟玛瑙',
  bgDarkOnyxDesc: '极暗的光滑石墨色，带有细微的紫色高光边缘',
  customGradientTitle: '自定义 CSS 渐变',
  customGradientDesc: '输入您自己的 CSS 背景或 linear-gradient 代码。',
  useCustom: '使用自定义',

  // Colors tab (theme labels)
  accentColorLabel: '主题强调色',
  colorPurple: '皇家紫（默认）',
  colorRose: '樱花玫瑰',
  colorIndigo: '电光靛蓝',
  colorEmerald: '翡翠绿',
  colorAmber: '日落琥珀',
  colorCyan: '赛博青',
  customColorTitle: '自定义十六进制颜色',
  customColorDesc: '选择任意您喜欢的主强调色。',

  // Font tab
  fontLabel: '网站字体与排版',
  fontDinNextName: 'DIN Next（官方）',
  fontDinNextDesc: '现代几何风格的 DIN 字体——清晰、简洁、稳重',
  fontActive: '使用中',
  fontSample: '敏捷的棕色狐狸跳过了懒狗 • The quick brown fox • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: '标志名称与副标题文字',
  logoTitleLabel: '标志主标题',
  logoSubtitleLabel: '副标题 / 标语',
  logoSubtitlePlaceholder: '社区成员门户',
  emblemLabel: '选择内置徽标',
  emblemKitsune: '狐狸面具（KCC 官方）',
  emblemCrown: '皇冠',
  emblemShield: '社区盾牌',
  emblemHeart: '友谊之心',
  emblemSparkle: '魔法星光',
  customLogoLabel: '或使用自定义标志图片（图片 URL）',
  customLogoHint: '输入透明背景 PNG/SVG 标志的链接，或留空以使用官方徽标。',
};

export default siteEditor;
