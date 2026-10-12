import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    '데이터베이스가 접근을 거부했어요(permission denied). 아무것도 저장되지 않았어요. 모든 항목이 글자 수 제한 안에 있는지 확인하거나, 권한이 있는 계정으로 로그인한 후 다시 시도해 주세요.',
  signInRequired: '계속하려면 먼저 로그인해 주세요.',
  databaseUnavailable: '데이터베이스에 연결할 수 없어요. 인터넷 연결을 확인하고 다시 시도해 주세요.',
  saveFailed: '저장하는 중에 문제가 발생했어요. 다시 시도해 주세요.',

  // firestoreService.ts
  profilePhotoTooLarge: '프로필 사진이 너무 커요. 다른 사진을 선택해 주세요.',
  nameRequired: '이름은 필수예요.',
  invalidCardId: '회원증의 KCC ID가 올바르지 않아요: {id}',
  uniqueIdFailed: '고유한 KCC ID를 만들지 못했어요. 다시 시도해 주세요.',
  mergeAdminOnly: '회원 기록은 관리자만 병합할 수 있어요.',
  mergeSameRecord: '기록을 자기 자신에게 병합할 수 없어요.',
  memberRecordMissing: '이 회원 기록은 더 이상 존재하지 않아요(병합되었거나 삭제되었을 수 있어요).',
  mergeDifferentAccounts: '두 기록이 서로 다른 로그인 계정에 연결되어 있어서 병합할 수 없어요.',
  repairAdminOnly: '복구는 관리자만 실행할 수 있어요.',
  repairIdUpdateFailed: 'KCC ID 업데이트 실패 ({ids}): {detail}',
  repairCardWriteFailed: '회원증 저장 실패 ({ids}): {detail}',
  repairCardDeleteFailed: '회원증 삭제 실패 ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: '사진을 업로드하려면 먼저 로그인해 주세요.',
  photoTooLarge: '사진이 너무 커요. 다른 사진을 선택해 주세요.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Google 로그인에서 액세스 토큰을 받지 못했어요.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets API {label} 오류 ({status}): {detail}',
  sheetsApiRequestFailed: 'Sheets API {label} 요청 실패: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC 메인 계정 (0000)',
  badgeAdmin: 'KCC 관리자 #{number}',
  badgeMember: '회원 (타임스탬프)',
};

export default errors;
