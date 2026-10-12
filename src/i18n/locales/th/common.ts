import type { LocaleNamespace } from '../../types';

const common: LocaleNamespace<'common'> = {
  appName: 'MyKCC',
  tagline: 'ชุมชนป็อปคัลเจอร์ คอสเพลย์ และแฟนไอดอลระดับโลก (100% SFW)',
  navForm: 'แบบฟอร์มลงทะเบียน',
  navCard: 'บัตรดิจิทัลของฉัน',
  navGallery: 'แกลเลอรีคอสเพลย์',
  navProfile: 'โปรไฟล์ของฉัน',
  navAdmin: 'แดชบอร์ดผู้ดูแล',
  navLogin: 'เข้าสู่ระบบ / สมัคร',
  navLogout: 'ออกจากระบบ',
  userId16Label: 'KCC ID อย่างเป็นทางการ',
  officialBannerText: 'เว็บไซต์อย่างเป็นทางการของ KawanCosplay',
  howYouKnow: 'วิธีตรวจสอบความถูกต้อง',
  aboutKccTitle: 'ชุมชนสากลอย่างเป็นทางการ (100% SFW)',
  aboutKccDesc:
    'KawanCosplay เป็นชุมชนป็อปคัลเจอร์เชิงสร้างสรรค์ระดับนานาชาติ ที่มุ่งเน้นคอสเพลย์ที่ดีต่อใจแบบ 100% SFW (Safe For Work) การชื่นชมไอดอล และอนิเมะ โดยเปิดรับสมาชิกจากทั่วโลก',
  secureSiteTitle: 'เว็บไซต์ปลอดภัยใช้ HTTPS และสัญลักษณ์แม่กุญแจ (🔒)',
  secureSiteDesc:
    'ดูที่แถบที่อยู่ของเบราว์เซอร์ เว็บไซต์ทางการจะขึ้นต้นด้วย https:// เสมอ และแสดงไอคอนแม่กุญแจ (🔒)',
  officialContactTitle: 'สายด่วน WhatsApp ทางการและอีเมล',
  officialContactDesc:
    'การติดต่ออย่างเป็นทางการทำได้ผ่านสายด่วน WhatsApp +62 857-1103-2782 และ cosplaysehat@gmail.com เท่านั้น',
  whatsappHotline: 'สายด่วน WhatsApp ทางการ: +62 857-1103-2782',

  // Generic
  close: 'ปิด',
  optional: '(ไม่บังคับ)',
  tryAgain: 'ลองอีกครั้ง',
  errorWithDetail: '{message} ({detail})',
  loadingApp: 'กำลังโหลดแอป...',
  loadingAdmin: 'กำลังโหลดหน้าผู้ดูแล...',

  // Navbar & app shell
  navFormShort: 'ลงทะเบียน',
  navCardShort: 'KCC ID',
  navGalleryShort: 'แกลเลอรี',
  openMenu: 'เปิดเมนู',
  closeMenu: 'ปิดเมนู',
  chooseLanguage: 'เลือกภาษา ({language})',
  siteEditorShort: 'แก้ไขเว็บไซต์',
  themeEditor: 'แก้ไขธีม',
  whatsappCommunity: 'ชุมชน WhatsApp',
  whatsappContact: 'WhatsApp: +62 857-1103-2782',
  emailContact: 'อีเมล: cosplaysehat@gmail.com',
  userFallbackName: 'ผู้ใช้',
  idValue: 'ID: {id}',
  kccIdValue: 'KCC ID: {id}',
  logoAlt: 'โลโก้ KawanCosplay',
  officialBadge: 'ทางการ',

  // PWA install
  pwaInstall: 'ติดตั้งแอป',
  pwaIosTitle: 'ติดตั้งบน iPhone / iPad',
  pwaIosStep1: '1. แตะปุ่ม {share} ในแถบเครื่องมือของ Safari',
  pwaIosShare: 'แชร์',
  pwaIosStep2: '2. เลื่อนลงแล้วแตะ {addToHome}',
  pwaIosAddToHome: 'เพิ่มไปยังหน้าจอโฮม',

  // Admin portal shell
  backToPublicSite: 'กลับสู่เว็บไซต์หลัก',
  adminPortalTitle: 'พอร์ทัลผู้ดูแล KawanCosplay',
  googleSignInBadge: 'เข้าสู่ระบบด้วย Google',
  adminRestricted: 'เฉพาะผู้ดูแล',
  lockAndExitAdminTitle: 'ล็อกและออกจากพอร์ทัลผู้ดูแล',
  lockExit: 'ล็อก / ออก',
  adminPortal: 'พอร์ทัลผู้ดูแล',
  adminPortalLinkTitle: 'พอร์ทัลเฉพาะผู้ดูแล KCC (เข้าสู่ระบบด้วย Google ของผู้ดูแล)',
  sheetsPopupClosed: 'หน้าต่างการให้สิทธิ์ของ Google ถูกปิดก่อนดำเนินการเสร็จ',
  sheetsWrongAccount: 'โปรดเลือกบัญชี Google เดียวกับบัญชีผู้ดูแลที่เข้าสู่ระบบอยู่',
  sheetsPopupBlocked: 'เบราว์เซอร์บล็อกหน้าต่างเข้าสู่ระบบ Google โปรดอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้แล้วลองอีกครั้ง',
  sheetsConnectFailed:
    'ไม่สามารถเชื่อมต่อ Google Sheets ได้ โปรดเลือกบัญชีผู้ดูแล (cosplaysehat@gmail.com) และอนุญาตสิทธิ์อ่าน Google Sheets',

  // KCC ID lookup page
  cardPageBadge: 'บัตรสมาชิก MyKCC',
  cardPageTitle: 'บัตรสมาชิกและ KCC ID',
  cardPageDesc:
    'เพื่อปกป้องความเป็นส่วนตัวของสมาชิกทุกคน รายชื่อสมาชิกทั้งหมดจะเข้าถึงได้เฉพาะในพอร์ทัลผู้ดูแลเท่านั้น กรอก KCC ID 16 หลักของคุณ (เช่น 2026 1008 0715 3001) เพื่อแสดงบัตรดิจิทัลอย่างเป็นทางการของคุณ',
  connectedProfile: 'โปรไฟล์ที่เชื่อมต่อ',
  openPass: 'เปิดบัตร',
  lookupPlaceholder: 'KCC ID 16 หลัก เช่น 2026 1008 0715 3001',
  lookupSubmit: 'ค้นหาและดูบัตรสมาชิก',
  searching: 'กำลังค้นหา...',
  passFound: 'พบบัตรแล้ว!',
  notRegisteredYet: 'ยังไม่ได้ลงทะเบียนใช่ไหม?',
  fillRegistrationForm: 'กรอกแบบฟอร์มลงทะเบียน →',
  lookupInvalidId: 'โปรดกรอก KCC ID 16 หลักของคุณ (ตัวเลขเท่านั้น เว้นวรรคได้)',
  lookupNotFound: 'ไม่พบบัตรสมาชิกสำหรับ KCC ID นี้ โปรดตรวจสอบตัวเลข 16 หลักอีกครั้ง',
  lookupPermissionDenied:
    'ขณะนี้ไม่สามารถค้นหาบัตรได้ (ฐานข้อมูลปฏิเสธการเข้าถึง) โปรดลองอีกครั้งภายหลังหรือติดต่อผู้ดูแล KCC',

  // Profile tab states
  profileLoadFailed: 'ไม่สามารถโหลดโปรไฟล์สมาชิกของคุณได้',
  checkConnectionRetry: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง',
  preparingProfile: 'กำลังเตรียมโปรไฟล์สมาชิก...',
  preparingProfileDesc: 'กำลังเชื่อมต่อบัญชีกับตัวตนดิจิทัล KCC ของคุณ',
  pleaseSignIn: 'โปรดเข้าสู่ระบบ',
  clickToSignIn: 'คลิกที่นี่เพื่อเข้าสู่ระบบ',

  // Footer
  footerPlatform: 'แพลตฟอร์มป็อปคัลเจอร์นานาชาติ 100% SFW',
  copyright: '© 2026 MyKCC สงวนลิขสิทธิ์',
  privacyShieldActive: 'ระบบตัวตน 16 หลักและเกราะป้องกันความเป็นส่วนตัวทำงานอยู่',
};

export default common;
