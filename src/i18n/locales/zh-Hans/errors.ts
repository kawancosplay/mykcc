import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    '数据库拒绝访问（permission denied），未保存任何内容。请确认每个字段都未超出字数限制，或使用已授权的账号登录，然后重试。',
  signInRequired: '请先登录再继续。',
  databaseUnavailable: '无法连接数据库。请检查网络连接后重试。',
  saveFailed: '保存时出现问题，请重试。',

  // firestoreService.ts
  profilePhotoTooLarge: '头像照片太大，请选择其他照片。',
  nameRequired: '请填写名称。',
  invalidCardId: '会员证的 KCC ID 无效：{id}',
  uniqueIdFailed: '无法生成唯一的 KCC ID，请重试。',
  mergeAdminOnly: '只有管理员可以合并成员记录。',
  mergeSameRecord: '不能将记录合并到其自身。',
  memberRecordMissing: '该成员记录已不存在（可能已被合并或删除）。',
  mergeDifferentAccounts: '这两条记录关联了不同的登录账号，因此无法合并。',
  repairAdminOnly: '只有管理员可以执行修复。',
  repairIdUpdateFailed: 'KCC ID 更新失败（{ids}）：{detail}',
  repairCardWriteFailed: '会员证写入失败（{ids}）：{detail}',
  repairCardDeleteFailed: '会员证删除失败（{ids}）：{detail}',

  // galleryService.ts
  photoSignInRequired: '请先登录再上传照片。',
  photoTooLarge: '照片太大，请选择其他照片。',

  // googleAuth.ts
  googleAccessTokenMissing: '无法从 Google 登录中获取访问令牌。',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets API {label} 出错（{status}）：{detail}',
  sheetsApiRequestFailed: 'Sheets API {label} 请求失败：{detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC 主账号（0000）',
  badgeAdmin: 'KCC 管理员 #{number}',
  badgeMember: '成员（时间戳）',
};

export default errors;
