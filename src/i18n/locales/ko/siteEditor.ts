import type { LocaleNamespace } from '../../types';

const siteEditor: LocaleNamespace<'siteEditor'> = {
  editorTitle: '사이트 디자인 편집기',
  editorDesc: '레이아웃, 색상, 배경, 글꼴, 로고를 실시간으로 꾸며 보세요.',
  resetTitle: '기본 디자인으로 초기화',
  resetDefault: '기본값으로 초기화',
  saveFailed: '디자인 변경 사항을 저장하지 못했어요: {error}',
  autoSaveNotice: '변경 사항은 사이트 데이터베이스에 자동으로 저장돼요(관리자 전용).',
  doneClose: '완료 & 닫기',

  // Tabs
  tabLayout: '레이아웃',
  tabBackground: '배경',
  tabColors: '색상',
  tabFont: '글꼴 & 타이포그래피',
  tabLogo: '로고 & 아이덴티티',

  // Layout tab
  layoutWidthLabel: '페이지 콘텐츠 너비',
  widthNormal: '기본 너비 (7XL - 1280px)',
  widthNormalDesc: '데스크톱과 모바일 모두에 잘 맞는 표준 크기',
  widthCompact: '좁게 (6XL - 1152px)',
  widthCompactDesc: '더 좁게, 가운데 콘텐츠에 집중',
  widthFull: '전체 너비',
  widthFullDesc: '화면 전체 너비로 펼쳐져요',
  navbarStyleLabel: '내비게이션 바 스타일',
  navbarGlassBar: '풀 글래스 바',
  navbarGlassBarDesc: '블러 효과와 함께 상단에 고정돼요',
  navbarFloatingPill: '플로팅 필',
  navbarFloatingPillDesc: '상단 가운데에 깔끔하게 떠 있어요',
  navbarMinimal: '클린 미니멀',
  navbarMinimalDesc: '단순하고 공간을 절약해요',
  cardRadiusLabel: '카드 모서리 둥글기',
  radius3xl: '아주 둥글게 (3XL)',
  radius2xl: '모던하게 둥글게 (2XL)',
  radiusXl: '기본 (XL)',
  radiusLg: '테크니컬 / 슬림 (LG)',

  // Background tab (theme labels)
  backgroundPresetsLabel: 'Fluent 배경 프리셋',
  bgBrightPurpleName: '브라이트 퍼플 Fluent (기본)',
  bgBrightPurpleDesc: '부드러운 깊이감이 있는 Fluent 퍼플·바이올렛의 빛나는 글래스 오라',
  bgCyberPurpleName: '사이버펑크 네온 바이올렛',
  bgCyberPurpleDesc: '핫 마젠타 포인트가 들어간 고대비 일렉트릭 바이올렛',
  bgCosmicDarkName: '코즈믹 미드나잇',
  bgCosmicDarkDesc: '보랏빛 성운이 감도는 깊은 우주의 네이비와 흑요석',
  bgFluentLavenderName: '소프트 Fluent 라벤더',
  bgFluentLavenderDesc: '은은한 반투명 유리에 빛나는 파스텔 퍼플 글로우',
  bgDarkOnyxName: '옵시디언 오닉스',
  bgDarkOnyxDesc: '은은한 보랏빛 테두리 광택이 도는 매끈한 초다크 그래파이트',
  customGradientTitle: '사용자 지정 CSS 그라데이션',
  customGradientDesc: '직접 만든 CSS background 또는 linear-gradient 코드를 입력하세요.',
  useCustom: '사용자 지정 적용',

  // Colors tab (theme labels)
  accentColorLabel: '테마 포인트 색상',
  colorPurple: '로열 퍼플 (기본)',
  colorRose: '사쿠라 로즈',
  colorIndigo: '일렉트릭 인디고',
  colorEmerald: '에메랄드 제이드',
  colorAmber: '선셋 앰버',
  colorCyan: '사이버 시안',
  customColorTitle: '사용자 지정 HEX 색상',
  customColorDesc: '원하는 기본 포인트 색상을 골라 보세요.',

  // Font tab
  fontLabel: '사이트 타이포그래피 & 글꼴',
  fontDinNextName: 'DIN Next (공식)',
  fontDinNextDesc: '모던한 기하학적 DIN 타이포그래피 — 선명하고 깔끔하며 신뢰감 있는 글꼴',
  fontActive: '사용 중',
  fontSample: '다람쥐 헌 쳇바퀴에 타고파 • 0123456789 • KawanCosplay 2026',

  // Logo tab
  logoTextLabel: '로고 이름 & 부제 텍스트',
  logoTitleLabel: '메인 로고 제목',
  logoSubtitleLabel: '부제 / 태그라인',
  logoSubtitlePlaceholder: '커뮤니티 회원 포털',
  emblemLabel: '기본 엠블럼 선택',
  emblemKitsune: '여우 가면 (KCC 공식)',
  emblemCrown: '왕관',
  emblemShield: '커뮤니티 방패',
  emblemHeart: '우정의 하트',
  emblemSparkle: '마법의 별 반짝이',
  customLogoLabel: '또는 사용자 지정 로고 이미지 사용 (이미지 URL)',
  customLogoHint: '투명 배경 PNG/SVG 로고 링크를 입력하거나, 비워 두면 공식 엠블럼이 사용돼요.',
};

export default siteEditor;
