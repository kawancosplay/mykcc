import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'サイト外観エディター',
  editorDesc: 'レイアウト、色、背景、フォント、ロゴをリアルタイムでカスタマイズできます。',
  resetTitle: 'デフォルトの外観にリセット',
  resetDefault: 'デフォルトに戻す',
  saveFailed: '外観の変更を保存できませんでした: {error}',
  autoSaveNotice: '変更はサイトのデータベースに自動で保存されます（管理者のみ）。',
  doneClose: '完了して閉じる',

  // Tabs
  tabLayout: 'レイアウト',
  tabBackground: '背景',
  tabColors: 'カラー',
  tabFont: 'フォント・文字',
  tabLogo: 'ロゴ・アイデンティティ',

  // Layout tab
  layoutWidthLabel: 'ページコンテンツの幅',
  widthNormal: '標準幅 (7XL - 1280px)',
  widthNormalDesc: 'デスクトップでもモバイルでも見やすい標準サイズ',
  widthCompact: 'コンパクト (6XL - 1152px)',
  widthCompactDesc: '幅を絞り、中央のコンテンツに集中',
  widthFull: '全幅',
  widthFullDesc: '画面の横幅いっぱいに広がります',
  navbarStyleLabel: 'ナビゲーションバーのスタイル',
  navbarGlassBar: 'フルガラスバー',
  navbarGlassBarDesc: 'ぼかし効果付きで上部に固定',
  navbarFloatingPill: 'フローティングピル',
  navbarFloatingPillDesc: '上部中央にすっきりと浮かびます',
  navbarMinimal: 'クリーンミニマル',
  navbarMinimalDesc: 'シンプルで省スペース',
  cardRadiusLabel: 'カードの角の丸み',
  radius3xl: '特大の丸み (3XL)',
  radius2xl: 'モダンな丸み (2XL)',
  radiusXl: '標準 (XL)',
  radiusLg: 'テクニカル / スリム (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fluent 背景プリセット',
  bgBrightPurpleName: 'ブライトパープル Fluent（デフォルト）',
  bgBrightPurpleDesc: 'なめらかな奥行きのある、Fluent パープル〜バイオレットの輝くガラスオーラ',
  bgCyberPurpleName: 'サイバーパンク ネオンバイオレット',
  bgCyberPurpleDesc: 'ホットマゼンタのアクセントが映える、高コントラストのエレクトリックバイオレット',
  bgCosmicDarkName: 'コズミック ミッドナイト',
  bgCosmicDarkDesc: 'パープルの星雲が漂う、深宇宙のネイビーとオブシディアン',
  bgFluentLavenderName: 'ソフト Fluent ラベンダー',
  bgFluentLavenderDesc: 'やさしいすりガラスに、輝くパステルパープルの光',
  bgDarkOnyxName: 'オブシディアン オニキス',
  bgDarkOnyxDesc: 'かすかなパープルの縁取りが光る、超ダークで洗練されたグラファイト',
  customGradientTitle: 'カスタム CSS グラデーション',
  customGradientDesc: '独自の CSS background または linear-gradient のコードを入力してください。',
  useCustom: 'カスタムを使用',

  // Colors tab (theme labels)
  accentColorLabel: 'テーマのアクセントカラー',
  colorPurple: 'ロイヤルパープル（デフォルト）',
  colorRose: 'サクラローズ',
  colorIndigo: 'エレクトリックインディゴ',
  colorEmerald: 'エメラルドジェイド',
  colorAmber: 'サンセットアンバー',
  colorCyan: 'サイバーシアン',
  customColorTitle: 'カスタムカラー（HEX）',
  customColorDesc: 'お好きなメインのアクセントカラーを選べます。',

  // Font tab
  fontLabel: 'サイトのフォント・文字',
  fontDinNextName: 'DIN Next（公式）',
  fontDinNextDesc: 'モダンで幾何学的な DIN タイポグラフィ — くっきり、すっきり、信頼感のある書体',
  fontActive: '使用中',
  fontSample: 'いろはにほへと ちりぬるを わかよたれそ つねならむ • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'ロゴ名とサブタイトル',
  logoTitleLabel: 'メインロゴのタイトル',
  logoSubtitleLabel: 'サブタイトル / キャッチフレーズ',
  logoSubtitlePlaceholder: 'コミュニティメンバーポータル',
  emblemLabel: '内蔵エンブレムを選択',
  emblemKitsune: '狐面（KCC 公式）',
  emblemCrown: '王冠',
  emblemShield: 'コミュニティの盾',
  emblemHeart: '友情のハート',
  emblemSparkle: '魔法の星のきらめき',
  customLogoLabel: 'またはカスタムロゴ画像を使用（画像 URL）',
  customLogoHint: '背景が透明な PNG/SVG ロゴのリンクを入力してください。空欄にすると公式エンブレムが使用されます。',
};

export default siteEditor;
