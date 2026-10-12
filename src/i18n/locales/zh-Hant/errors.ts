import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    '資料庫拒絕存取（permission denied），未儲存任何內容。請確認每個欄位都未超過字數上限，或以已授權的帳號登入，然後再試一次。',
  signInRequired: '請先登入再繼續。',
  databaseUnavailable: '無法連線至資料庫。請檢查網路連線後再試一次。',
  saveFailed: '儲存時發生問題，請再試一次。',

  // firestoreService.ts
  profilePhotoTooLarge: '大頭貼照片太大，請選擇其他照片。',
  nameRequired: '請填寫名稱。',
  invalidCardId: '會員證的 KCC ID 無效：{id}',
  uniqueIdFailed: '無法產生唯一的 KCC ID，請再試一次。',
  mergeAdminOnly: '只有管理員可以合併成員資料。',
  mergeSameRecord: '資料無法合併到自己本身。',
  memberRecordMissing: '此成員資料已不存在（可能已被合併或刪除）。',
  mergeDifferentAccounts: '這兩筆資料連結了不同的登入帳號，因此無法合併。',
  repairAdminOnly: '只有管理員可以執行修復。',
  repairIdUpdateFailed: 'KCC ID 更新失敗（{ids}）：{detail}',
  repairCardWriteFailed: '會員證寫入失敗（{ids}）：{detail}',
  repairCardDeleteFailed: '會員證刪除失敗（{ids}）：{detail}',

  // galleryService.ts
  photoSignInRequired: '請先登入再上傳照片。',
  photoTooLarge: '照片太大，請選擇其他照片。',

  // googleAuth.ts
  googleAccessTokenMissing: '無法從 Google 登入取得存取權杖。',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets API {label} 發生錯誤（{status}）：{detail}',
  sheetsApiRequestFailed: 'Sheets API {label} 請求失敗：{detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC 主帳號（0000）',
  badgeAdmin: 'KCC 管理員 #{number}',
  badgeMember: '成員（時間戳記）',
};

export default errors;
