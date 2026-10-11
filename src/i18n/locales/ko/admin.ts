import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: '관리자 대시보드',
  dashboardDesc: '회원 정보 보호 및 데이터 동기화 관리',
  loginPrompt: '관리자 키 또는 공식 이메일로 로그인하세요.',
  privacyRestrictedNotice: '회원 보호를 위해 회원 명단은 관리자에게만 제한 공개됩니다.',
  exportCsv: 'CSV 내보내기',
  totalMembers: '전체 등록 회원',
  resetFilter: '필터 초기화',
};

export default admin;
