import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Google Sheets & 설문지 실시간 브리지',
  bridgeSubtitle: 'Google 설문지에서 Firebase로 전환',
  pageTitle: '스프레드시트 & Google 설문지 데이터베이스 동기화',
  pageDesc:
    '기존 회원 스프레드시트를 가져오고 실시간 동기화를 켜면, 전환 기간 동안 Google 설문지를 작성한 새 회원이 자동으로 Firebase에 추가돼요.',
  connectSheets: 'Google Sheets 연결',
  renewAccess: 'Google Sheets 접근 권한 갱신',
  connectionRequiredTitle: 'Google Sheets 연결이 필요해요',
  connectionRequiredDesc:
    'Google 설문지 스프레드시트를 직접 읽으려면, 로그인한 관리자 Google 계정으로 MyKCC에 Google Sheets 읽기 권한을 허용하세요. 해당 계정은 KawanCosplay 가입 스프레드시트에 접근할 수 있어야 해요.',
  accessRequestNotice:
    '로그인한 계정에 대해 접근 권한을 요청해요. MyKCC는 Google Sheets 읽기 권한만 요청하며, Google Drive 접근 권한은 요청하지 않아요.',
  accessRequestNoticeWithEmail:
    '로그인한 계정({email})에 대해 접근 권한을 요청해요. MyKCC는 Google Sheets 읽기 권한만 요청하며, Google Drive 접근 권한은 요청하지 않아요.',

  // Step 1: spreadsheet
  step1Title: 'Google 설문지 스프레드시트',
  step1Desc: 'Google 설문지 응답 스프레드시트의 URL 또는 ID를 붙여 넣으세요.',
  spreadsheetInputLabel: 'Google 스프레드시트 URL / ID',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit 또는 ID',
  inspectButton: '확인',
  formatHint: '형식: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: '아직 URL / ID를 인식하지 못했어요.',
  sheetTabLabel: '시트 탭 선택',

  // Step 2: column mapping
  step2Title: '응답 열 매핑',
  step2Desc: 'Google 설문지에서 {count}개의 열을 감지했어요',
  autoDetectedBadge: '자동 감지됨',
  columnFullName: '성명 열',
  columnCosname: '코스네임 / 닉네임 열',
  columnEmail: '이메일 열',
  columnWhatsapp: 'WhatsApp / 전화번호 열',
  columnWhatsapp2: '예비 WhatsApp / WA 번호 2 열',
  optionalTag: '(선택)',
  columnDiscord: 'Discord 사용자명 열',
  columnCity: '도시 / 거주지 열',
  columnRole: '역할 / 관심 분야 열 (코스플레이어/크래프터 등)',
  columnFandom: '팬덤 / 좋아하는 캐릭터 열',
  columnTimestamp: '응답 타임스탬프 열',
  optionChooseColumn: '-- 열 선택 --',
  optionNone: '-- 없음 / 비움 --',
  optionDefaultIndonesia: '-- 기본값 (인도네시아) --',
  optionDefaultCosplayer: '-- 기본값 (코스플레이어) --',
  optionDefaultAnimeGames: '-- 기본값 (애니메이션 & 게임) --',
  optionCurrentTime: '-- 현재 시간 --',
  previewTitle: '스프레드시트 데이터 미리보기 (이름, WhatsApp & Discord 사용자명):',
  previewColName: '이름 / 코스네임',
  previewColDiscord: 'Discord 사용자명',
  previewColCity: '도시',
  previewPhone2: '번호 2: {phone}',

  // Import
  importing: 'Firestore로 가져오는 중 ({completed}/{total})...',
  importAllButton: '스프레드시트 응답 전체(Discord & WA 포함)를 Firebase로 가져오기',
  importResult:
    '가져오기 완료: <strong>새 회원 {added}명</strong>, 업데이트 {updated}명, 변경 없음 {unchanged}명, 실패 {skipped}명.',
  errorTip: '팁: 위 입력란에 Google 설문지 스프레드시트 URL을 붙여 넣고 "확인"을 눌러도 돼요.',
  grantAccessButton: '접근 허용 / Google 연결',

  // Real-time poller
  pollerTitle: '실시간 전환 폴러',
  pollerActive: '활성 (실시간)',
  pollerInactive: '비활성',
  pollerDesc:
    '이 기능이 켜져 있는 동안 앱이 {seconds}초마다 스프레드시트를 확인해요. 새 Google 설문지 응답은 모두 자동으로 Firebase에 추가되고 바로 KCC ID를 받아요.',
  pollIntervalLabel: '확인 간격:',
  pollEverySeconds: '{seconds}초마다',
  pollEverySecondsOptimal: '{seconds}초마다 (최적)',
  lastPollLabel: '마지막 확인:',
  lastPollNever: '아직 실행 안 됨',
  stopPoller: '실시간 폴러 중지',
  startAutoSync: '실시간 자동 동기화 시작',

  // Google Apps Script webhook
  webhookTitle: 'Google Apps Script 웹훅',
  webhookDesc:
    '폴링 간격을 기다리지 않고 <em>제출</em> 버튼을 누르는 즉시 Google 설문지 응답을 받고 싶나요? 응답 Google 스프레드시트에 이 스크립트를 설치하세요:',
  scriptCommentInstall: '설치 위치: 응답 Google 스프레드시트 -> 확장 프로그램 -> Apps Script',
  scriptCommentTrigger: '트리거: onFormSubmit -> 양식 제출 시',
  scriptCommentResponseData: '설문지 응답 데이터 읽기',
  copied: '복사했어요!',
  copyScript: '스크립트 복사',
  installStepsTitle: '빠른 설정 (1분):',
  installStep1: '1. 응답 Google 스프레드시트를 열고 > <strong>확장 프로그램</strong> 메뉴 > <strong>Apps Script</strong>를 선택하세요.',
  installStep2: '2. 위 코드를 붙여 넣고 > 저장하세요.',
  installStep3:
    '3. 왼쪽 메뉴에서 <strong>트리거</strong>를 클릭 > 트리거 추가 > 이벤트 유형 선택: <em>양식 제출 시</em>.',

  // Sync history
  recentSyncTitle: '최근 동기화 기록',
  logCount: '로그 {count}개',
  logsPermissionDenied: '동기화 로그 접근이 거부되었어요. 관리자 Google 계정으로 로그인하세요.',
  logsLoadFailed: '동기화 기록을 불러오지 못했어요. 연결을 확인한 후 페이지를 새로고침하세요.',
  logsEmpty: '아직 기록된 동기화 활동이 없어요.',
  logImportedRows: '{count}개 행 가져옴',
  logImportSummary:
    '가져오기 완료: 새 회원 {added}명, 업데이트 {updated}명, 변경 없음 {unchanged}명, 실패 {skipped}명.',
  logAutoSummary: '자동: 신규 {added}명, 업데이트 {updated}명.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Google Sheets 가져오기 도구',

  // Errors
  adminAccountFallback: '관리자 계정',
  errorUnauthorized:
    'Google Sheets 권한이 만료되었거나 더 이상 유효하지 않아요. "Google Sheets 연결"을 눌러 갱신한 후 다시 시도하세요.',
  errorScope:
    'Google Sheets 읽기 권한이 허용되지 않았어요. "Google Sheets 연결"을 누르고 Google Sheets 스프레드시트 보기 권한에 체크하세요.',
  errorNoAccess:
    '로그인한 Google 계정({account})에 이 스프레드시트에 대한 접근 권한이 없거나 스프레드시트 ID가 잘못되었어요. 해당 관리자 계정과 스프레드시트를 공유하거나(뷰어 권한이면 충분해요), URL/ID를 다시 확인하세요.',
  errorUnsupportedFile:
    '이 파일은 기본 Google Sheets 파일이 아니에요(예: 업로드된 Excel .xlsx). 파일을 열고 파일 > Google 스프레드시트로 저장을 선택한 후, 새 파일의 URL을 사용하세요.',
  errorRateLimit: 'Google Sheets API 요청 한도에 도달했어요. 1분 정도 기다린 후 다시 시도하세요.',
  errorNetwork: 'Google Sheets에 연결할 수 없어요. 인터넷 연결을 확인한 후 다시 시도하세요.',
  errorRejected: 'Google Sheets가 요청을 거부했어요: {detail}',
  errorInvalidInput:
    '스프레드시트 URL 또는 ID가 올바르지 않아요. 전체 Google Sheets URL(https://docs.google.com/spreadsheets/d/…/edit) 또는 ID만 붙여 넣으세요.',
  errorEmptyInput: '먼저 Google Sheets URL 또는 ID를 입력하세요.',
  errorNotConnected: '아직 Google Sheets 접근 권한이 허용되지 않았어요. 먼저 "Google Sheets 연결"을 누르세요.',
  errorEmptySheet: '이 스프레드시트는 비어 있거나 아직 응답이 없어요.',
  errorReadFailed: '스프레드시트를 읽지 못했어요.',
  errorInspectFirst: '먼저 Google Sheets를 연결하고 스프레드시트를 확인하세요(1단계).',
  errorNoRows: '가져올 응답 행이 없어요.',
  errorNoValidRows: '이 열 매핑으로는 유효한 행을 찾지 못했어요.',
  errorCheckFirst: '먼저 1단계에서 스프레드시트를 확인하세요.',
};

export default sheets;
