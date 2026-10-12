import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: '커뮤니티 분석',
  subtitle: 'KawanCosplay 회원 구성 & 관심사',
  title: '커뮤니티 통계 & 회원 구성',
  description: '활동 분야, 거주 도시, 좋아하는 팬덤별로 살펴본 KawanCosplay 회원 커뮤니티 개요예요.',
  allVerifiedActive: '100% 인증된 활동 회원',
  webFormLabel: '웹 가입 신청서',
  webFormDesc: '새 시스템으로 가입',
  googleFormLabel: 'Google 설문지 동기화',
  googleFormDesc: '실시간 전환 동기화에서 가져옴',
  citiesLabel: '거주 도시',
  citiesDesc: '인도네시아 전역의 도시',
  rolesTitle: '커뮤니티 내 역할',
  rolesDesc: '코스플레이어, 크래프터, 사진작가, 메이크업 아티스트, 크루의 구성',
  regionsTitle: '지역 / 도시별 분포',
  regionsDesc: '지역 정모와 촬영 계획을 위한 회원 거주 도시',
  fandomsTitle: '인기 팬덤 & 캐릭터 관심사',
  fandomsDesc: '단체 코스프레 프로젝트에 가장 인기 있는 애니메이션, 게임, 시리즈 작품',
  fandomInterest: '코스프레 프로젝트 관심도',
  countWithPercent: '{count} ({percent})',
  memberCountOne: '회원 {count}명',
  memberCountOther: '회원 {count}명',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: '기타',
  fandomAnimeGames: '애니메이션 & 게임',
};

export default stats;
