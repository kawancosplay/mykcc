import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'データベースによりアクセスが拒否されました（permission denied）。何も保存されていません。各項目が文字数制限内であることを確認するか、権限のあるアカウントでログインしてから、もう一度お試しください。',
  signInRequired: '続けるには、まずログインしてください。',
  databaseUnavailable: 'データベースに接続できませんでした。インターネット接続を確認して、もう一度お試しください。',
  saveFailed: '保存中に問題が発生しました。もう一度お試しください。',

  // firestoreService.ts
  profilePhotoTooLarge: 'プロフィール写真が大きすぎます。別の写真を選んでください。',
  nameRequired: '名前は必須です。',
  invalidCardId: '会員証の KCC ID が無効です: {id}',
  uniqueIdFailed: '一意の KCC ID を作成できませんでした。もう一度お試しください。',
  mergeAdminOnly: 'メンバー記録を統合できるのは管理者のみです。',
  mergeSameRecord: '記録をそれ自身に統合することはできません。',
  memberRecordMissing: 'このメンバー記録はすでに存在しません（統合または削除された可能性があります）。',
  mergeDifferentAccounts: '2つの記録がそれぞれ別のログインアカウントに紐づいているため、統合できません。',
  repairAdminOnly: '修復を実行できるのは管理者のみです。',
  repairIdUpdateFailed: 'KCC ID の更新に失敗しました ({ids}): {detail}',
  repairCardWriteFailed: '会員証の書き込みに失敗しました ({ids}): {detail}',
  repairCardDeleteFailed: '会員証の削除に失敗しました ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: '写真を投稿するには、まずログインしてください。',
  photoTooLarge: '写真が大きすぎます。別の写真を選んでください。',

  // googleAuth.ts
  googleAccessTokenMissing: 'Google ログインからアクセストークンを取得できませんでした。',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets API {label} エラー ({status}): {detail}',
  sheetsApiRequestFailed: 'Sheets API {label} リクエストに失敗しました: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC メインアカウント (0000)',
  badgeAdmin: 'KCC 管理者 #{number}',
  badgeMember: 'メンバー（タイムスタンプ）',
};

export default errors;
