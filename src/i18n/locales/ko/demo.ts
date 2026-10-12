import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: '데모 신청서 테스트 샌드박스',
  sandboxBadge: '샌드박스 모드',
  description:
    '클릭 한 번으로 프리셋을 자동 입력해 KCC ID 생성을 테스트해요 (타임스탬프 UID, 관리자 UID 0001-0100, 메인 계정 0000).',
  randomizeTitle: '무작위 페르소나 생성',
  randomize: '무작위',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay 사용자 ID 규칙:',
  ruleMainAccount: 'KCC 메인 계정',
  ruleAdminRange: 'KCC 관리자 범위',
  ruleTimestamp: '타임스탬프 순 회원 UID',

  // Preset cards
  previewName: '이름:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: '양식 채우기',
  submitTest: '테스트 제출',
  tip: '팁: "{action}" 버튼을 누르면 제출을 바로 시뮬레이션하고, 생성된 KCC ID 회원증과 WhatsApp 잠금 해제를 확인할 수 있어요.',
  presetLoaded: '프리셋을 불러왔어요',

  // Presets
  presetCosplayerName: '데모 코스플레이어 (타임스탬프 UID)',
  presetCosplayerBadge: '타임스탬프 UID',
  presetCosplayerDesc: '제출 타임스탬프 순으로 정렬된 16자리 UID (YYYYMMDDHHmmssSeq)',
  presetAdminName: '데모 KCC 관리자 (UID 0001-0100)',
  presetAdminBadge: '관리자 UID 범위',
  presetAdminDesc: 'KCC 관리자용 UID 0000 0000 0000 0001 ~ 0000 0000 0000 0100',
  presetMainAccountName: '데모 KCC 메인 계정 (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000은 메인 계정 cosplaysehat@gmail.com 전용',
  presetPropMakerName: '데모 소품 제작자 / 크래프터',
  presetPropMakerBadge: '크래프터 (타임스탬프)',
  presetPropMakerDesc: '타임스탬프 기반 UID를 가진 소품 & 갑옷 장인',
  presetPhotographerName: '데모 코스프레 사진작가',
  presetPhotographerBadge: '사진작가',
  presetPhotographerDesc: '타임스탬프 기반 UID를 가진 사진작가 & 영상 촬영자',
  presetOthersName: '데모 기타 / 직접 입력 역할',
  presetOthersBadge: '기타 역할',
  presetOthersDesc: '코스프레 메이크업 & 가발 스타일리스트가 전문인 "기타" 직접 입력 역할',
  presetDuplicateName: '단일 KCC ID 테스트 (일치: {name})',
  presetDuplicateBadge: '단일 KCC ID 확인',
  presetDuplicateDesc: 'WhatsApp 번호가 일치하면 KCC ID가 유지되는지 확인: {id}',
  presetSecondaryPhoneName: '두 번째 번호 테스트 (번호 2개: {name})',
  presetSecondaryPhoneBadge: 'WA 번호 2개 확인',
  presetSecondaryPhoneDesc: '두 번째 번호를 추가하고 KCC ID 유지: {id}',
};

export default demo;
