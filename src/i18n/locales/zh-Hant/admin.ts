import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'KawanCosplay 管理員後台',
  dashboardDesc: '受限的管理入口網站，用於管理社群成員名冊與同步 Google Sheets。',
  privacyRestrictedNotice: '為保護成員隱私，成員名冊嚴格僅限 KawanCosplay 管理員查看。',
  exportCsv: '匯出 CSV',
  totalMembers: '已註冊成員總數',
  resetFilter: '重設篩選',

  // Lock screen (not signed in as an admin)
  checkingAccess: '正在檢查管理員權限...',
  signedInNotAdmin: '目前登入的帳號為 {account}——此帳號不是 KCC 管理員。',
  emailNotVerified: '電子郵件尚未驗證——請使用 Google 登入。',
  signInWithAdminGoogleEmail: '使用管理員 Google 帳號登入（{email}）',
  signOutThisAccount: '登出',
  whatsappAdminHelp: '透過 WhatsApp 取得管理員協助：{phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'KawanCosplay 管理入口網站',
  verifiedAccessBadge: '已驗證存取',
  dashboardPrivacyNote: '成員隱私受到嚴格保護：只有已登錄的管理員才能查看姓名與聯絡方式。',
  whatsappHotlineShort: 'WA 專線：{phone}',
  signOutAdmin: '登出管理員帳號',
  statusStat: '狀態：{status}',
  statusVerified: '已驗證',
  statusActive: '活躍',
  statusPending: '待處理',
  tabMembers: '成員清單與名冊（{count}）',
  tabSync: 'Google Sheets 與表單同步',
  tabStats: '社群統計',

  // Member list states
  permissionDeniedTitle: '存取遭拒',
  permissionDeniedDesc:
    '資料庫拒絕此帳號存取成員清單。請以管理員 Google 帳號（{email}）或 admins 集合中所列的帳號登入，然後重新載入頁面。同時請確認最新的 Firestore 規則已發布到資料庫 {database}。',
  signInWithAdminGoogle: '使用管理員 Google 帳號登入',
  reloadPage: '重新載入頁面',
  loadMembersFailedTitle: '無法載入成員清單',
  loadMembersFailedDesc: '無法載入成員清單。請檢查網路連線，然後重新載入頁面。',
  loadingMembers: '正在載入成員資料...',

  // Member status & delete
  statusUpdateFailed: '無法更新成員狀態：{error}',
  deleteMemberConfirm: '要從 Firestore 資料庫中刪除成員「{name}」（KCC ID：{id}）嗎？',
  deleteMemberFailed: '無法刪除此成員：{error}',

  // KCC ID & public card repair
  repairTitle: 'KCC ID 與公開會員證修復',
  repairDesc:
    '為 ID 重複的成員指派唯一的 KCC ID（最早登記者保留原 ID），儲存尚未存入的 KCC ID，並重建供會員證查詢使用的公開 memberCards 集合。可安全地重複執行。',
  repairDuplicatesDetected: '偵測到 {count} 位成員的 KCC ID 重複——請按「{action}」。',
  allIdsUnique: '所有 KCC ID 皆為唯一。',
  runRepair: '執行修復',
  repairRunning: '修復中...',
  repairRunningProgress: '修復中（{done}/{total}）...',
  repairConfirm:
    '要為所有成員執行 KCC ID 與公開會員證修復嗎？\n\n- KCC ID 重複的成員將取得新 ID（最早登記者保留原 ID）。\n- 尚未儲存的 KCC ID 將會被儲存。\n- 公開的 memberCards 集合將會重建。\n\n可安全地重複執行。要繼續嗎？',
  repairFailed: '修復失敗：{error}',
  repairDone: '修復完成。',
  repairStatScanned: '已掃描成員',
  repairStatDuplicateGroups: '重複 ID 群組',
  repairStatCardsWritten: '已寫入會員證',
  repairStatCardsDeleted: '已刪除會員證',
  reassignedListTitle: '已變更 / 儲存的 KCC ID（{count}）：',
  repairReasonDuplicate: 'ID 重複',
  repairReasonMissing: 'ID 尚未儲存',
  repairReasonMainAccount: '主帳號 ID 被其他成員使用',
  noIdsChanged: '沒有需要變更的 KCC ID。',
  issuesCount: '錯誤（{count}）：',

  // Reserved admin / main account IDs
  reservedIdsTitle: '管理員 / 主帳號保留 KCC ID（{range}）',
  reservedIdsDesc:
    '此範圍內的 ID 僅供 KCC 主帳號與管理員使用。下列成員因在公開表單中填寫的身分 / 電子郵件（舊系統）而取得了此類 ID。按「{action}」可為他們指派依時間順序排列的唯一 KCC ID。',
  noReservedHolders: '沒有成員持有管理員專用的 KCC ID。',
  reservedHolderMeta: '來源：{source} • 身分：{role}',
  processing: '處理中...',
  assignNewId: '指派新 ID',
  reassignConfirm: '要為「{name}」（目前為 {id}）指派新的 KCC ID 嗎？',
  reassignMainAccountWarning:
    '警告：這是主帳號 ID。如果此成員就是官方 {email} 帳號，請勿繼續。',
  resultSuccess: '成功：{message}',
  resultFailed: '失敗：{message}',

  // Duplicate registrations
  duplicatesTitle: '重複登記（同一人）',
  duplicatesDesc:
    '多次填寫表單的成員（WhatsApp 號碼、Discord、電子郵件或社群媒體相同）。「合併」會將最新資料與所有 WhatsApp 號碼保留在最早的登記資料上（其 KCC ID 不變），然後刪除重複資料及其會員證。合併前請仔細檢查。',
  scanDuplicates: '掃描重複登記',
  mergeConfirm:
    '要將「{duplicate}」（{duplicateId}）合併到「{keeper}」（{keeperId}）嗎？\n\n最新資料與 WhatsApp 號碼將複製到最早的登記資料，然後重複資料將被永久刪除。要繼續嗎？',
  mergeSuccess: '「{duplicate}」已合併到「{keeper}」——KCC ID {id} 維持不變。',
  bulkMergeIdenticalConfirm:
    '要合併 {groups} 個完全相同的重複群組（{records} 筆重複資料）嗎？\n\n僅包含 Cosname 與主要 WhatsApp 號碼相同、且建立時間相差不超過 {seconds} 秒的群組（完全複本 / 重複匯入）。\n最新資料與所有 WhatsApp 號碼將歸入最早的登記資料（其 KCC ID 不變），然後重複資料將被永久刪除。要繼續嗎？',
  bulkMergeAllConfirm:
    '要合併全部 {groups} 個已掃描的群組（{records} 筆重複資料）嗎？\n\n其中包含僅因 WhatsApp 號碼、Discord、電子郵件、社群媒體或名稱相同而配對的群組——請確認您已檢查下方清單。\n最新資料與所有 WhatsApp 號碼將歸入最早的登記資料（其 KCC ID 不變），然後重複資料將被永久刪除。此操作無法復原。要繼續嗎？',
  bulkMergeDone: '批次合併已完成（{mode}）。',
  bulkModeIdentical: '完全相同的群組',
  bulkModeAll: '全部掃描結果',
  bulkStatGroups: '已處理群組',
  bulkStatMergedGroups: '已合併群組',
  bulkStatMergedRecords: '已合併重複資料',
  bulkStatFailedGroups: '失敗群組',
  bulkMoreErrors: '…另有 {count} 筆（請查看瀏覽器主控台）。',
  scanSummary:
    '找到 {groups} 個重複群組（{records} 筆重複資料），其中 {identical} 個為完全相同的群組（Cosname 與主要 WhatsApp 號碼相同，建立時間相差不超過 {seconds} 秒）。',
  mergeAllIdentical: '合併所有完全相同的群組（{count}）',
  mergeAllScanned: '合併全部掃描結果（{count}）',
  bulkMergeProgress: '正在合併 {done}/{total} 個群組…',
  noDuplicatesFound: '未偵測到重複登記。',
  keeperBadge: '保留（KCC ID 不變）',
  merging: '合併中...',
  mergeInto: '合併到 {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: '搜尋...',
  filterAllRoles: '全部身分（{count}）',
  filterAllCities: '全部地區',
  filterAllAges: '全部年齡',
  filterLegalAge: '已成年（18+）',
  filterMinor: '未成年（<18）',
  filterPreferNotToSay: '未註明',
  sortNewest: '🕒 時間：最新',
  sortNameAsc: '🔤 名稱：A → Z',
  purgeButtonTitle: '清除 Firestore 中的所有成員資料',
  purgeButton: '清除成員資料',
  purging: '清除中...',
  purgePrompt:
    '嚴重警告：此操作將從 Firestore 資料庫中永久刪除所有成員資料。\n\n請輸入「{keyword}」（大寫）以確認清空資料庫：',
  purgeCancelled: '已取消確認（關鍵字不符）。',
  purgeSuccess: '清除完成：已從資料庫中刪除 {count} 筆成員資料。',
  purgeFailed: '無法刪除成員資料：{error}',
  exportNoData: '沒有可匯出的資料。',
  showingMembers: '顯示 {shown} / {total} 位成員',

  // CSV export column headers
  csvKccId: 'KCC ID（16 位數）',
  csvCosname: 'Cosname / 暱稱',
  csvLegalName: '法定姓名',
  csvPrimaryWhatsapp: '主要 WhatsApp',
  csvBackupWhatsapp: '備用 WhatsApp',
  csvDiscord: 'Discord 使用者名稱',
  csvEmail: '電子郵件',
  csvAgeCategory: '年齡類別',
  csvAge: '年齡 / 生日',
  csvCountry: '國家',
  csvProvince: '省份',
  csvCity: '城市',
  csvPrimaryRole: '主要身分',
  csvFandom: '喜愛作品',
  csvExperience: '經驗',
  csvStatus: '狀態',
  csvRegisteredAt: '登記日期',

  // Members table
  colMember: '成員 / Cosname',
  colKccId: '16 位數 KCC ID',
  colContact: 'WhatsApp 與聯絡方式',
  colDiscord: 'Discord 使用者名稱',
  colRole: '身分與興趣',
  colAge: '年齡',
  colLocation: '地區',
  colStatus: '狀態',
  colRegistered: '登記時間',
  colActions: '操作',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ 最年輕',
  sortAgeOldest: '▼ 最年長',
  sortStatusAsc: '▲ 已驗證',
  sortStatusDesc: '▼ 待處理',
  sortTimeNewest: '▼ 最新',
  sortTimeOldest: '▲ 最早',
  legalNameValue: '法定姓名：{name}',
  mainAccountBadge: 'KCC 主帳號',
  adminIdBadge: 'KCC 管理員 #{number}',
  timestampIdBadge: '時間戳記 ID',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: '檢視 KCC ID',
  deleteMemberTitle: '刪除成員',
  emptyDatabaseTitle: '成員資料庫是空的',
  emptyDatabaseDesc:
    '資料庫中還沒有任何成員資料。請從 Google Form 試算表匯入，或等待新的登記。',
  noResultsTitle: '沒有結果',
  noResultsDesc: '沒有符合搜尋關鍵字或所選篩選條件的成員資料。',
  openSheetsSync: '開啟 Google Sheets 與表單同步',
};

export default admin;
