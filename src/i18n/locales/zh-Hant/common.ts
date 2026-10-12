import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: '全球流行文化、Cosplay 與偶像同好社群（100% SFW）',
  navForm: '入會表單',
  navCard: '我的數位通行證',
  navGallery: 'Cosplay 藝廊',
  navProfile: '我的個人檔案',
  navAdmin: '管理員後台',
  navLogin: '登入 / 註冊',
  navLogout: '登出',
  userId16Label: '官方 KCC ID',
  officialBannerText: 'KawanCosplay 官方網站',
  howYouKnow: '如何辨識官方網站',
  aboutKccTitle: '官方國際社群（100% SFW）',
  aboutKccDesc: 'KawanCosplay 是一個國際性的流行文化創作社群，致力於 100% SFW（Safe For Work，全年齡向）的健康 Cosplay、偶像應援與動漫文化，歡迎全球成員加入。',
  secureSiteTitle: '安全網站使用 HTTPS 與鎖頭圖示（🔒）',
  secureSiteDesc: '請查看瀏覽器的網址列。官方網站一律以 https:// 開頭，並顯示安全鎖頭圖示（🔒）。',
  officialContactTitle: '官方 WhatsApp 專線與電子郵件',
  officialContactDesc: '官方洽詢僅透過 WhatsApp 專線 +62 857-1103-2782 及電子郵件 cosplaysehat@gmail.com 處理。',
  whatsappHotline: '官方 WhatsApp 專線：+62 857-1103-2782',

  // Generic
  close: '關閉',
  optional: '（選填）',
  tryAgain: '再試一次',
  errorWithDetail: '{message}（{detail}）',
  loadingApp: '正在載入應用程式…',
  loadingAdmin: '正在載入管理後台…',

  // Navbar & app shell
  navFormShort: '入會登記',
  navCardShort: 'KCC ID',
  navGalleryShort: '藝廊',
  openMenu: '開啟選單',
  closeMenu: '關閉選單',
  chooseLanguage: '選擇語言（{language}）',
  siteEditorShort: '網站編輯器',
  themeEditor: '主題編輯器',
  whatsappCommunity: 'WhatsApp 社群',
  whatsappContact: 'WhatsApp：+62 857-1103-2782',
  emailContact: '電子郵件：cosplaysehat@gmail.com',
  userFallbackName: '使用者',
  idValue: 'ID：{id}',
  kccIdValue: 'KCC ID：{id}',
  logoAlt: 'KawanCosplay 標誌',
  officialBadge: '官方',

  // PWA install
  pwaInstall: '安裝 App',
  pwaIosTitle: '在 iPhone / iPad 上安裝',
  pwaIosStep1: '1. 點一下 Safari 工具列中的「{share}」按鈕。',
  pwaIosShare: '分享',
  pwaIosStep2: '2. 向下捲動並點一下「{addToHome}」。',
  pwaIosAddToHome: '加入主畫面',

  // Admin portal shell
  backToPublicSite: '返回公開網站',
  adminPortalTitle: 'KawanCosplay 管理員入口網站',
  googleSignInBadge: 'Google 登入',
  adminRestricted: '僅限管理員',
  lockAndExitAdminTitle: '鎖定並離開管理員入口網站',
  lockExit: '鎖定 / 離開',
  adminPortal: '管理員入口網站',
  adminPortalLinkTitle: 'KCC 管理員專用入口網站（管理員 Google 登入）',
  sheetsPopupClosed: 'Google 授權視窗在完成前就被關閉了。',
  sheetsWrongAccount: '請選擇與目前已登入之管理員帳號相同的 Google 帳號。',
  sheetsPopupBlocked: '瀏覽器封鎖了 Google 登入視窗。請允許此網站顯示彈出式視窗，然後再試一次。',
  sheetsConnectFailed:
    '無法連結 Google Sheets。請選擇管理員帳號（cosplaysehat@gmail.com），並允許讀取 Google Sheets。',

  // KCC ID lookup page
  cardPageBadge: 'MyKCC 會員證',
  cardPageTitle: '會員證與 KCC ID',
  cardPageDesc:
    '為保護所有成員的隱私，完整成員名單僅限在管理員入口網站中查看。請輸入您的 16 位數 KCC ID（例如 2026 1008 0715 3001），即可顯示您的官方數位通行證。',
  connectedProfile: '已連結的個人檔案',
  openPass: '開啟通行證',
  lookupPlaceholder: '16 位數 KCC ID，例如 2026 1008 0715 3001',
  lookupSubmit: '搜尋並檢視會員證',
  searching: '搜尋中…',
  passFound: '已找到通行證！',
  notRegisteredYet: '還沒註冊嗎？',
  fillRegistrationForm: '填寫入會表單 →',
  lookupInvalidId: '請輸入您的 16 位數 KCC ID（僅限數字，可包含空格）。',
  lookupNotFound: '找不到此 KCC ID 對應的會員證。請再次確認這 16 位數字。',
  lookupPermissionDenied:
    '會員證查詢目前無法使用（資料庫拒絕存取）。請稍後再試，或聯絡 KCC 管理員。',

  // Profile tab states
  profileLoadFailed: '無法載入您的會員個人檔案。',
  checkConnectionRetry: '請檢查網路連線，然後再試一次。',
  preparingProfile: '正在準備會員個人檔案…',
  preparingProfileDesc: '正在將帳號連結至您的 KCC 數位身分。',
  pleaseSignIn: '請登入',
  clickToSignIn: '點此登入',

  // Footer
  footerPlatform: '100% SFW 國際流行文化平台。',
  copyright: '© 2026 MyKCC。保留一切權利。',
  privacyShieldActive: '16 位數身分與隱私防護系統已啟用',
};

export default common;
