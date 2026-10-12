import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'ポップカルチャー・コスプレ・オタク国際コミュニティ (100% SFW)',
  navForm: '登録フォーム',
  navCard: 'デジタル会員証',
  navGallery: 'コスプレギャラリー',
  navProfile: 'マイページ',
  navAdmin: '管理者ダッシュボード',
  navLogin: 'ログイン / 登録',
  navLogout: 'ログアウト',
  userId16Label: '公式 KCC ID',
  officialBannerText: 'KawanCosplay 公式ウェブサイト',
  howYouKnow: '公式サイトの確認方法',
  aboutKccTitle: '公式国際コミュニティ (100% SFW)',
  aboutKccDesc: 'KawanCosplay は、100% SFW（Safe For Work）の健全なコスプレ、アイドル応援、アニメを楽しむ国際的なクリエイティブ・ポップカルチャーコミュニティです。世界中のメンバーに開かれています。',
  secureSiteTitle: '安全なサイトは HTTPS と鍵アイコン (🔒) を使用しています',
  secureSiteDesc: 'ブラウザのアドレスバーをご確認ください。公式サイトは必ず https:// で始まり、安全を示す鍵アイコン（🔒）が表示されます。',
  officialContactTitle: '公式 WhatsApp ホットライン＆メール',
  officialContactDesc: '公式のお問い合わせは、WhatsApp ホットライン +62 857-1103-2782 および cosplaysehat@gmail.com でのみ受け付けています。',
  whatsappHotline: '公式 WhatsApp ホットライン: +62 857-1103-2782',

  // Generic
  close: '閉じる',
  optional: '（任意）',
  tryAgain: '再試行',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'アプリを読み込み中...',
  loadingAdmin: '管理画面を読み込み中...',

  // Navbar & app shell
  navFormShort: '登録',
  navCardShort: 'KCC ID',
  navGalleryShort: 'ギャラリー',
  openMenu: 'メニューを開く',
  closeMenu: 'メニューを閉じる',
  chooseLanguage: '言語を選択 ({language})',
  siteEditorShort: 'サイト編集',
  themeEditor: 'テーマ編集',
  whatsappCommunity: 'WhatsApp コミュニティ',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'メール: cosplaysehat@gmail.com',
  userFallbackName: 'ユーザー',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'KawanCosplay ロゴ',
  officialBadge: '公式',

  // PWA install
  pwaInstall: 'アプリをインストール',
  pwaIosTitle: 'iPhone / iPad にインストール',
  pwaIosStep1: '1. Safari のツールバーにある {share} ボタンをタップします。',
  pwaIosShare: '共有',
  pwaIosStep2: '2. 下にスクロールして {addToHome} をタップします。',
  pwaIosAddToHome: 'ホーム画面に追加',

  // Admin portal shell
  backToPublicSite: '公開サイトに戻る',
  adminPortalTitle: 'KawanCosplay 管理者ポータル',
  googleSignInBadge: 'Google ログイン',
  adminRestricted: '管理者専用',
  lockAndExitAdminTitle: '管理者ポータルをロックして終了',
  lockExit: 'ロック / 終了',
  adminPortal: '管理者ポータル',
  adminPortalLinkTitle: 'KCC 管理者専用ポータル（管理者の Google ログイン）',
  sheetsPopupClosed: '完了する前に Google の認証ウィンドウが閉じられました。',
  sheetsWrongAccount: 'ログイン中の管理者アカウントと同じ Google アカウントを選択してください。',
  sheetsPopupBlocked: 'ブラウザが Google ログインウィンドウをブロックしました。このサイトのポップアップを許可して、もう一度お試しください。',
  sheetsConnectFailed:
    'Google Sheets に接続できませんでした。管理者アカウント（cosplaysehat@gmail.com）を選択し、Google Sheets への読み取りアクセスを許可してください。',

  // KCC ID lookup page
  cardPageBadge: 'MyKCC 会員証',
  cardPageTitle: '会員証と KCC ID',
  cardPageDesc:
    'すべてのメンバーのプライバシーを守るため、メンバー一覧の閲覧は管理者ポータルに限定されています。16桁の KCC ID（例: 2026 1008 0715 3001）を入力すると、公式デジタル会員証が表示されます。',
  connectedProfile: '連携中のプロフィール',
  openPass: '会員証を開く',
  lookupPlaceholder: '16桁の KCC ID（例: 2026 1008 0715 3001）',
  lookupSubmit: '会員証を検索・表示',
  searching: '検索中...',
  passFound: '会員証が見つかりました！',
  notRegisteredYet: 'まだ登録していませんか？',
  fillRegistrationForm: '登録フォームに記入 →',
  lookupInvalidId: '16桁の KCC ID を入力してください（数字のみ、スペース可）。',
  lookupNotFound: 'その KCC ID の会員証は見つかりませんでした。16桁の数字をもう一度ご確認ください。',
  lookupPermissionDenied:
    '現在、会員証の検索はご利用いただけません（データベースへのアクセスが拒否されました）。しばらくしてからもう一度お試しいただくか、KCC 管理者にお問い合わせください。',

  // Profile tab states
  profileLoadFailed: 'メンバープロフィールを読み込めませんでした。',
  checkConnectionRetry: 'インターネット接続を確認してから、もう一度お試しください。',
  preparingProfile: 'メンバープロフィールを準備中...',
  preparingProfileDesc: 'アカウントをあなたのデジタル KCC ID に接続しています。',
  pleaseSignIn: 'ログインしてください',
  clickToSignIn: 'ここをクリックしてログイン',

  // Footer
  footerPlatform: '100% SFW の国際ポップカルチャー・プラットフォーム。',
  copyright: '© 2026 MyKCC. All rights reserved.',
  privacyShieldActive: '16桁 ID・プライバシー保護システム稼働中',
};

export default common;
