import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: 'ตัวแก้ไขรูปลักษณ์เว็บไซต์',
  editorDesc: 'ปรับแต่งเลย์เอาต์ สี พื้นหลัง ฟอนต์ และโลโก้ได้แบบเรียลไทม์',
  resetTitle: 'รีเซ็ตเป็นรูปลักษณ์เริ่มต้น',
  resetDefault: 'รีเซ็ตค่าเริ่มต้น',
  saveFailed: 'ไม่สามารถบันทึกการเปลี่ยนแปลงรูปลักษณ์ได้: {error}',
  autoSaveNotice: 'การเปลี่ยนแปลงจะถูกบันทึกลงฐานข้อมูลเว็บไซต์โดยอัตโนมัติ (เฉพาะผู้ดูแล)',
  doneClose: 'เสร็จสิ้นและปิด',

  // Tabs
  tabLayout: 'เลย์เอาต์',
  tabBackground: 'พื้นหลัง',
  tabColors: 'สี',
  tabFont: 'ฟอนต์และตัวอักษร',
  tabLogo: 'โลโก้และอัตลักษณ์',

  // Layout tab
  layoutWidthLabel: 'ความกว้างของเนื้อหาหน้า',
  widthNormal: 'ความกว้างปกติ (7XL - 1280px)',
  widthNormalDesc: 'ขนาดมาตรฐานที่ใช้งานได้ดีทั้งบนเดสก์ท็อปและมือถือ',
  widthCompact: 'กะทัดรัด (6XL - 1152px)',
  widthCompactDesc: 'แคบลง เน้นเนื้อหาตรงกลาง',
  widthFull: 'เต็มความกว้าง',
  widthFullDesc: 'ขยายเต็มความกว้างของหน้าจอ',
  navbarStyleLabel: 'สไตล์แถบนำทาง',
  navbarGlassBar: 'แถบกระจกเต็มความกว้าง',
  navbarGlassBarDesc: 'ติดอยู่ด้านบนพร้อมเอฟเฟกต์เบลอ',
  navbarFloatingPill: 'แคปซูลลอย',
  navbarFloatingPillDesc: 'ลอยอยู่ตรงกลางด้านบนอย่างเรียบร้อย',
  navbarMinimal: 'มินิมอลเรียบง่าย',
  navbarMinimalDesc: 'เรียบง่ายและประหยัดพื้นที่',
  cardRadiusLabel: 'ความโค้งมุมการ์ด',
  radius3xl: 'โค้งมนพิเศษ (3XL)',
  radius2xl: 'โค้งมนทันสมัย (2XL)',
  radiusXl: 'มาตรฐาน (XL)',
  radiusLg: 'เทคนิค / บาง (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'พื้นหลัง Fluent สำเร็จรูป',
  bgBrightPurpleName: 'ม่วงสดใส Fluent (ค่าเริ่มต้น)',
  bgBrightPurpleDesc: 'ออร่ากระจกเรืองแสงโทนม่วง-ไวโอเล็ตสไตล์ Fluent พร้อมมิติที่นุ่มนวล',
  bgCyberPurpleName: 'ไวโอเล็ตนีออนไซเบอร์พังก์',
  bgCyberPurpleDesc: 'ไวโอเล็ตไฟฟ้าคอนทราสต์สูง พร้อมสีแมเจนตาสดเป็นจุดเด่น',
  bgCosmicDarkName: 'เที่ยงคืนแห่งจักรวาล',
  bgCosmicDarkDesc: 'สีกรมท่าห้วงอวกาศและออบซิเดียน พร้อมเนบิวลาสีม่วง',
  bgFluentLavenderName: 'ลาเวนเดอร์ Fluent นุ่มนวล',
  bgFluentLavenderDesc: 'แสงม่วงพาสเทลเรืองรอง พร้อมกระจกฝ้าแบบนุ่มนวล',
  bgDarkOnyxName: 'ออนิกซ์ออบซิเดียน',
  bgDarkOnyxDesc: 'กราไฟต์มืดสนิทแบบเรียบหรู พร้อมขอบสะท้อนแสงสีม่วงจาง ๆ',
  customGradientTitle: 'ไล่สี CSS แบบกำหนดเอง',
  customGradientDesc: 'ใส่โค้ด CSS background หรือ linear-gradient ของคุณเอง',
  useCustom: 'ใช้แบบกำหนดเอง',

  // Colors tab (theme labels)
  accentColorLabel: 'สีเน้นของธีม',
  colorPurple: 'ม่วงรอยัล (ค่าเริ่มต้น)',
  colorRose: 'ชมพูซากุระ',
  colorIndigo: 'อินดิโกไฟฟ้า',
  colorEmerald: 'หยกมรกต',
  colorAmber: 'อำพันยามเย็น',
  colorCyan: 'ฟ้าไซเบอร์',
  customColorTitle: 'สี Hex แบบกำหนดเอง',
  customColorDesc: 'เลือกสีเน้นหลักที่คุณชอบได้ตามใจ',

  // Font tab
  fontLabel: 'ตัวอักษรและฟอนต์ของเว็บไซต์',
  fontDinNextName: 'DIN Next (ทางการ)',
  fontDinNextDesc: 'ตัวอักษร DIN แบบเรขาคณิตทันสมัย — คมชัด สะอาดตา และน่าเชื่อถือ',
  fontActive: 'ใช้งานอยู่',
  fontSample: 'สุนัขจิ้งจอกสีน้ำตาลกระโดดข้ามสุนัขขี้เกียจ • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: 'ข้อความชื่อโลโก้และคำบรรยายรอง',
  logoTitleLabel: 'ชื่อหลักของโลโก้',
  logoSubtitleLabel: 'คำบรรยายรอง / สโลแกน',
  logoSubtitlePlaceholder: 'พอร์ทัลสมาชิกชุมชน',
  emblemLabel: 'เลือกตราสัญลักษณ์ในตัว',
  emblemKitsune: 'หน้ากากคิตสึเนะ (KCC ทางการ)',
  emblemCrown: 'มงกุฎราชวงศ์',
  emblemShield: 'โล่ชุมชน',
  emblemHeart: 'หัวใจมิตรภาพ',
  emblemSparkle: 'ประกายดาววิเศษ',
  customLogoLabel: 'หรือใช้รูปโลโก้ของคุณเอง (URL รูปภาพ)',
  customLogoHint: 'ใส่ลิงก์โลโก้ PNG/SVG พื้นหลังโปร่งใส หรือเว้นว่างไว้เพื่อใช้ตราสัญลักษณ์ทางการ',
};

export default siteEditor;
