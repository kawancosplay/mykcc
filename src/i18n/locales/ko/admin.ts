import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'KawanCosplay 관리자 대시보드',
  dashboardDesc: '커뮤니티 회원 명단과 Google Sheets 동기화를 위한 접근 제한 관리자 포털이에요.',
  loginPrompt: '관리자 패스키를 입력하거나 cosplaysehat@gmail.com으로 로그인하세요',
  privacyRestrictedNotice: '회원 개인정보 보호를 위해 회원 명단은 KawanCosplay 관리자만 볼 수 있도록 엄격하게 제한돼요.',
  exportCsv: 'CSV 내보내기',
  totalMembers: '전체 가입 회원',
  resetFilter: '필터 초기화',

  // Lock screen (not signed in as an admin)
  checkingAccess: '관리자 권한 확인 중...',
  signedInNotAdmin: '{account}(으)로 로그인됨 — 이 계정은 KCC 관리자가 아니에요.',
  emailNotVerified: '이메일이 인증되지 않았어요 — Google 로그인을 사용하세요.',
  signInWithAdminGoogleEmail: '관리자 Google 계정({email})으로 로그인',
  signOutThisAccount: '로그아웃',
  whatsappAdminHelp: 'WhatsApp 관리자 문의: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'KawanCosplay 관리 포털',
  verifiedAccessBadge: '인증된 접근',
  dashboardPrivacyNote: '회원 개인정보는 엄격하게 보호돼요. 이름과 연락처는 등록된 관리자만 볼 수 있어요.',
  whatsappHotlineShort: 'WA 핫라인: {phone}',
  signOutAdmin: '관리자 계정 로그아웃',
  statusStat: '상태: {status}',
  statusVerified: '인증됨',
  statusActive: '활동 중',
  statusPending: '대기 중',
  tabMembers: '회원 목록 & 명단 ({count})',
  tabSync: 'Google Sheets & 설문지 동기화',
  tabStats: '커뮤니티 통계',

  // Member list states
  permissionDeniedTitle: '접근 거부됨',
  permissionDeniedDesc:
    '데이터베이스가 이 계정의 회원 목록 접근을 거부했어요. 관리자 Google 계정({email}) 또는 admins 컬렉션에 등록된 계정으로 로그인한 후 페이지를 새로고침하세요. 또한 최신 Firestore Rules가 데이터베이스 {database}에 게시되어 있는지 확인하세요.',
  signInWithAdminGoogle: '관리자 Google 계정으로 로그인',
  reloadPage: '페이지 새로고침',
  loadMembersFailedTitle: '회원 목록을 불러올 수 없어요',
  loadMembersFailedDesc: '회원 목록을 불러오지 못했어요. 연결을 확인한 후 페이지를 새로고침하세요.',
  loadingMembers: '회원 데이터 불러오는 중...',

  // Member status & delete
  statusUpdateFailed: '회원 상태를 업데이트하지 못했어요: {error}',
  deleteMemberConfirm: '회원 "{name}"(KCC ID: {id})을(를) Firestore 데이터베이스에서 삭제할까요?',
  deleteMemberFailed: '회원을 삭제하지 못했어요: {error}',

  // KCC ID & public card repair
  repairTitle: 'KCC ID & 공개 회원증 복구',
  repairDesc:
    'ID가 중복된 회원에게 고유한 KCC ID를 부여하고(가장 먼저 가입한 기록이 기존 ID를 유지해요), 아직 저장되지 않은 KCC ID를 저장하며, 회원증 조회에 쓰이는 공개 memberCards 컬렉션을 다시 만들어요. 여러 번 실행해도 안전해요.',
  repairDuplicatesDetected: 'KCC ID가 중복된 회원 {count}명을 발견했어요 — "{action}" 버튼을 누르세요.',
  allIdsUnique: '모든 KCC ID가 고유해요.',
  runRepair: '복구 실행',
  repairRunning: '복구 중...',
  repairRunningProgress: '복구 중 ({done}/{total})...',
  repairConfirm:
    '모든 회원에 대해 KCC ID & 공개 회원증 복구를 실행할까요?\n\n- KCC ID가 중복된 회원은 새 ID를 받아요(가장 먼저 가입한 기록이 기존 ID를 유지해요).\n- 아직 저장되지 않은 KCC ID가 저장돼요.\n- 공개 memberCards 컬렉션을 다시 만들어요.\n\n여러 번 실행해도 안전해요. 계속할까요?',
  repairFailed: '복구 실패: {error}',
  repairDone: '복구가 완료되었어요.',
  repairStatScanned: '검사한 회원',
  repairStatDuplicateGroups: '중복 ID 그룹',
  repairStatCardsWritten: '저장한 회원증',
  repairStatCardsDeleted: '삭제한 회원증',
  reassignedListTitle: '변경 / 저장된 KCC ID ({count}):',
  repairReasonDuplicate: '중복 ID',
  repairReasonMissing: 'ID 미저장',
  repairReasonMainAccount: '다른 회원이 사용 중인 메인 계정 ID',
  noIdsChanged: '변경이 필요한 KCC ID가 없어요.',
  issuesCount: '오류 ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: '관리자 / 메인 계정 예약 KCC ID ({range})',
  reservedIdsDesc:
    '이 범위의 ID는 KCC 메인 계정과 관리자 전용이에요. 아래 회원들은 공개 신청서에 입력한 역할/이메일 때문에(이전 시스템) 이 범위의 ID를 받았어요. "{action}" 버튼을 누르면 시간 순서에 따른 고유 KCC ID가 부여돼요.',
  noReservedHolders: '관리자 전용 KCC ID를 가진 회원이 없어요.',
  reservedHolderMeta: '출처: {source} • 역할: {role}',
  processing: '처리 중...',
  assignNewId: '새 ID 부여',
  reassignConfirm: '"{name}"(현재 {id})에게 새 KCC ID를 부여할까요?',
  reassignMainAccountWarning:
    '경고: 이것은 메인 계정 ID예요. 이 회원이 공식 {email} 계정이라면 계속하지 마세요.',
  resultSuccess: '성공: {message}',
  resultFailed: '실패: {message}',

  // Duplicate registrations
  duplicatesTitle: '중복 가입 (동일인)',
  duplicatesDesc:
    '신청서를 두 번 이상 작성한 회원이에요(같은 WhatsApp 번호, Discord, 이메일 또는 SNS). "병합"하면 최신 데이터와 모든 WhatsApp 번호가 가장 먼저 가입한 기록에 남고(해당 KCC ID 유지), 중복 기록은 회원증과 함께 삭제돼요. 병합하기 전에 꼭 검토하세요.',
  scanDuplicates: '중복 가입 검사',
  mergeConfirm:
    '"{duplicate}"({duplicateId})을(를) "{keeper}"({keeperId})에 병합할까요?\n\n최신 데이터와 WhatsApp 번호가 가장 먼저 가입한 기록으로 복사된 후, 중복 기록은 영구 삭제돼요. 계속할까요?',
  mergeSuccess: '"{duplicate}" → "{keeper}" 병합 완료 — KCC ID {id} 유지.',
  bulkMergeIdenticalConfirm:
    '[완전히 동일한] 중복 그룹 {groups}개(중복 기록 {records}개)를 병합할까요?\n\n코스네임과 기본 WhatsApp 번호가 같고, 생성 시각 차이가 {seconds}초 이내인 그룹만 해당돼요(완전한 복사본 / 이중 가져오기).\n최신 데이터와 모든 WhatsApp 번호가 가장 먼저 가입한 기록으로 옮겨지고(해당 KCC ID 유지), 중복 기록은 영구 삭제돼요. 계속할까요?',
  bulkMergeAllConfirm:
    '검사한 [모든] 그룹 {groups}개(중복 기록 {records}개)를 병합할까요?\n\n같은 WhatsApp 번호, Discord, 이메일, SNS 또는 이름만으로 일치한 그룹도 포함돼요 — 아래 목록을 검토했는지 꼭 확인하세요.\n최신 데이터와 모든 WhatsApp 번호가 가장 먼저 가입한 기록으로 옮겨지고(해당 KCC ID 유지), 중복 기록은 영구 삭제돼요. 이 작업은 되돌릴 수 없어요. 계속할까요?',
  bulkMergeDone: '일괄 병합 완료 ({mode}).',
  bulkModeIdentical: '완전히 동일한 그룹',
  bulkModeAll: '전체 검사 결과',
  bulkStatGroups: '처리한 그룹',
  bulkStatMergedGroups: '병합한 그룹',
  bulkStatMergedRecords: '병합한 중복 기록',
  bulkStatFailedGroups: '실패한 그룹',
  bulkMoreErrors: '…외 {count}개 (브라우저 콘솔을 확인하세요).',
  scanSummary:
    '중복 그룹 {groups}개(중복 기록 {records}개)를 찾았어요. 이 중 {identical}개는 완전히 동일한 그룹이에요(코스네임과 기본 WhatsApp 번호가 같고, 생성 시각 차이가 {seconds}초 이내).',
  mergeAllIdentical: '동일 그룹 모두 병합 ({count})',
  mergeAllScanned: '검사 결과 모두 병합 ({count})',
  bulkMergeProgress: '{done}/{total}개 그룹 병합 중…',
  noDuplicatesFound: '중복 가입이 발견되지 않았어요.',
  keeperBadge: '보존 (KCC ID 유지)',
  merging: '병합 중...',
  mergeInto: '{id}에 병합',

  // Search, filters, sorting, export & purge
  searchPlaceholder: '검색...',
  filterAllRoles: '모든 역할 ({count})',
  filterAllCities: '모든 지역',
  filterAllAges: '모든 연령',
  filterLegalAge: '성인 (18세 이상)',
  filterMinor: '미성년자 (18세 미만)',
  filterPreferNotToSay: '미기재',
  sortNewest: '🕒 시간: 최신순',
  sortNameAsc: '🔤 이름: A → Z',
  purgeButtonTitle: 'Firestore의 모든 회원 데이터 삭제',
  purgeButton: '회원 데이터 전체 삭제',
  purging: '삭제 중...',
  purgePrompt:
    "심각한 경고: Firestore 데이터베이스의 모든 회원 데이터가 영구적으로 삭제돼요.\n\n데이터베이스 삭제를 확인하려면 '{keyword}'(대문자)를 입력하세요:",
  purgeCancelled: '확인이 취소되었어요(키워드가 일치하지 않아요).',
  purgeSuccess: '삭제 완료: 회원 기록 {count}개가 데이터베이스에서 삭제되었어요.',
  purgeFailed: '회원 데이터를 삭제하지 못했어요: {error}',
  exportNoData: '내보낼 데이터가 없어요.',
  showingMembers: '전체 {total}명 중 {shown}명 표시',

  // CSV export column headers
  csvKccId: 'KCC ID (16자리)',
  csvCosname: '코스네임 / 닉네임',
  csvLegalName: '실명',
  csvPrimaryWhatsapp: '기본 WhatsApp',
  csvBackupWhatsapp: '예비 WhatsApp',
  csvDiscord: 'Discord 사용자명',
  csvEmail: '이메일',
  csvAgeCategory: '연령 구분',
  csvAge: '나이 / 생일',
  csvCountry: '국가',
  csvProvince: '도 / 주',
  csvCity: '도시',
  csvPrimaryRole: '주요 역할',
  csvFandom: '팬덤',
  csvExperience: '경력',
  csvStatus: '상태',
  csvRegisteredAt: '가입일',

  // Members table
  colMember: '회원 / 코스네임',
  colKccId: '16자리 KCC ID',
  colContact: 'WhatsApp & 연락처',
  colDiscord: 'Discord 사용자명',
  colRole: '역할 & 관심사',
  colAge: '나이',
  colLocation: '지역',
  colStatus: '상태',
  colRegistered: '가입일',
  colActions: '작업',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ 어린 순',
  sortAgeOldest: '▼ 나이 많은 순',
  sortStatusAsc: '▲ 인증',
  sortStatusDesc: '▼ 대기',
  sortTimeNewest: '▼ 최신순',
  sortTimeOldest: '▲ 오래된 순',
  legalNameValue: '실명: {name}',
  mainAccountBadge: 'KCC 메인 계정',
  adminIdBadge: 'KCC 관리자 #{number}',
  timestampIdBadge: '타임스탬프 ID',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'KCC ID 보기',
  deleteMemberTitle: '회원 삭제',
  emptyDatabaseTitle: '회원 데이터베이스가 비어 있어요',
  emptyDatabaseDesc:
    '데이터베이스에 아직 회원 데이터가 없어요. Google 설문지 스프레드시트에서 가져오거나 새 가입을 기다려 주세요.',
  noResultsTitle: '결과 없음',
  noResultsDesc: '검색어나 선택한 필터와 일치하는 회원 데이터가 없어요.',
  openSheetsSync: 'Google Sheets & 설문지 동기화 열기',
};

export default admin;
