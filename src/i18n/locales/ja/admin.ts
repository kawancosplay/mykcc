import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'KawanCosplay 管理者ダッシュボード',
  dashboardDesc: 'コミュニティメンバー名簿と Google Sheets 同期のための、アクセス制限付き管理者ポータルです。',
  privacyRestrictedNotice: 'メンバーのプライバシーを守るため、メンバー名簿の閲覧は KawanCosplay の管理者のみに厳しく制限されています。',
  exportCsv: 'CSV 出力',
  totalMembers: '登録メンバー総数',
  resetFilter: 'フィルターをリセット',

  // Lock screen (not signed in as an admin)
  checkingAccess: '管理者権限を確認中...',
  signedInNotAdmin: '{account} としてログイン中 — このアカウントは KCC 管理者ではありません。',
  emailNotVerified: 'メールアドレスが未確認です — Google ログインを使用してください。',
  signInWithAdminGoogleEmail: '管理者の Google アカウント（{email}）でログイン',
  signOutThisAccount: 'ログアウト',
  whatsappAdminHelp: 'WhatsApp で管理者に問い合わせ: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'KawanCosplay 管理ポータル',
  verifiedAccessBadge: '認証済みアクセス',
  dashboardPrivacyNote: 'メンバーのプライバシーは厳重に保護されています。名前と連絡先を閲覧できるのは登録済みの管理者のみです。',
  whatsappHotlineShort: 'WA ホットライン: {phone}',
  signOutAdmin: '管理者アカウントからログアウト',
  statusStat: 'ステータス: {status}',
  statusVerified: '認証済み',
  statusActive: 'アクティブ',
  statusPending: '保留中',
  tabMembers: 'メンバー一覧・名簿 ({count})',
  tabSync: 'Google Sheets・フォーム同期',
  tabStats: 'コミュニティ統計',

  // Member list states
  permissionDeniedTitle: 'アクセスが拒否されました',
  permissionDeniedDesc:
    'データベースが、このアカウントからのメンバー一覧へのアクセスを拒否しました。管理者の Google アカウント（{email}）または admins コレクションに登録されているアカウントでログインしてから、ページを再読み込みしてください。また、最新の Firestore Rules がデータベース {database} に公開されていることも確認してください。',
  signInWithAdminGoogle: '管理者の Google アカウントでログイン',
  reloadPage: 'ページを再読み込み',
  loadMembersFailedTitle: 'メンバー一覧を読み込めませんでした',
  loadMembersFailedDesc: 'メンバー一覧を読み込めませんでした。接続を確認してから、ページを再読み込みしてください。',
  loadingMembers: 'メンバーデータを読み込み中...',

  // Member status & delete
  statusUpdateFailed: 'メンバーのステータスを更新できませんでした: {error}',
  deleteMemberConfirm: 'メンバー「{name}」（KCC ID: {id}）を Firestore データベースから削除しますか？',
  deleteMemberFailed: 'メンバーを削除できませんでした: {error}',

  // KCC ID & public card repair
  repairTitle: 'KCC ID・公開会員証の修復',
  repairDesc:
    'ID が重複しているメンバーに一意の KCC ID を割り当て（最も早い登録が元の ID を保持します）、まだ保存されていない KCC ID を保存し、会員証の検索に使われる公開 memberCards コレクションを再構築します。何度実行しても安全です。',
  repairDuplicatesDetected: 'KCC ID が重複しているメンバーが {count} 人見つかりました —「{action}」を押してください。',
  allIdsUnique: 'すべての KCC ID は一意です。',
  runRepair: '修復を実行',
  repairRunning: '修復中...',
  repairRunningProgress: '修復中 ({done}/{total})...',
  repairConfirm:
    'すべてのメンバーに対して KCC ID・公開会員証の修復を実行しますか？\n\n- KCC ID が重複しているメンバーには新しい ID が割り当てられます（最も早い登録が元の ID を保持します）。\n- まだ保存されていない KCC ID が保存されます。\n- 公開 memberCards コレクションが再構築されます。\n\n何度実行しても安全です。続行しますか？',
  repairFailed: '修復に失敗しました: {error}',
  repairDone: '修復が完了しました。',
  repairStatScanned: 'スキャンしたメンバー',
  repairStatDuplicateGroups: '重複 ID グループ',
  repairStatCardsWritten: '書き込んだ会員証',
  repairStatCardsDeleted: '削除した会員証',
  reassignedListTitle: '変更 / 保存された KCC ID ({count}):',
  repairReasonDuplicate: 'ID の重複',
  repairReasonMissing: 'ID 未保存',
  repairReasonMainAccount: 'メインアカウントの ID が他のメンバーに使われている',
  noIdsChanged: '変更が必要な KCC ID はありませんでした。',
  issuesCount: 'エラー ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: '管理者 / メインアカウント用の予約 KCC ID ({range})',
  reservedIdsDesc:
    'この範囲の ID は KCC メインアカウントと管理者専用です。以下のメンバーは、公開フォームで入力した役割 / メールアドレスによって（旧システムで）この範囲の ID を付与されました。「{action}」を押すと、時系列順の一意の KCC ID が割り当てられます。',
  noReservedHolders: '管理者専用の KCC ID を持つメンバーはいません。',
  reservedHolderMeta: '登録元: {source} • 役割: {role}',
  processing: '処理中...',
  assignNewId: '新しい ID を割り当て',
  reassignConfirm: '「{name}」（現在 {id}）に新しい KCC ID を割り当てますか？',
  reassignMainAccountWarning:
    '警告: これはメインアカウントの ID です。このメンバーが公式の {email} アカウントである場合は、続行しないでください。',
  resultSuccess: '成功: {message}',
  resultFailed: '失敗: {message}',

  // Duplicate registrations
  duplicatesTitle: '重複登録（同一人物）',
  duplicatesDesc:
    'フォームを複数回送信したメンバーです（同じ WhatsApp 番号、Discord、メールアドレス、または SNS）。「統合」を行うと、最新のデータとすべての WhatsApp 番号が最も早い登録に残り（その KCC ID は維持されます）、重複した登録はその会員証とともに削除されます。統合する前に内容を確認してください。',
  scanDuplicates: '重複登録をスキャン',
  mergeConfirm:
    '「{duplicate}」({duplicateId}) を「{keeper}」({keeperId}) に統合しますか？\n\n最新のデータと WhatsApp 番号が最も早い登録にコピーされ、その後、重複した登録は完全に削除されます。続行しますか？',
  mergeSuccess: '「{duplicate}」を「{keeper}」に統合しました — KCC ID {id} は維持されます。',
  bulkMergeIdenticalConfirm:
    '【完全一致】の重複グループ {groups} 件（重複記録 {records} 件）を統合しますか？\n\n対象は、コスネームとメインの WhatsApp 番号が同じで、作成時刻の差が {seconds} 秒以内のグループのみです（完全なコピー / 二重インポート）。\n最新のデータとすべての WhatsApp 番号が最も早い登録に移され（その KCC ID は維持されます）、その後、重複した記録は完全に削除されます。続行しますか？',
  bulkMergeAllConfirm:
    'スキャンした【すべて】のグループ {groups} 件（重複記録 {records} 件）を統合しますか？\n\nこれには、同じ WhatsApp 番号、Discord、メールアドレス、SNS、または名前だけで一致したグループも含まれます。下の一覧を確認済みであることを確かめてください。\n最新のデータとすべての WhatsApp 番号が最も早い登録に移され（その KCC ID は維持されます）、その後、重複した記録は完全に削除されます。この操作は元に戻せません。続行しますか？',
  bulkMergeDone: '一括統合が完了しました（{mode}）。',
  bulkModeIdentical: '完全一致グループ',
  bulkModeAll: 'すべてのスキャン結果',
  bulkStatGroups: '処理したグループ',
  bulkStatMergedGroups: '統合したグループ',
  bulkStatMergedRecords: '統合した重複',
  bulkStatFailedGroups: '失敗したグループ',
  bulkMoreErrors: '…ほか {count} 件（ブラウザのコンソールを確認してください）。',
  scanSummary:
    '重複グループが {groups} 件（重複記録 {records} 件）見つかりました。そのうち {identical} 件は完全一致グループです（コスネームとメインの WhatsApp 番号が同じで、作成時刻の差が {seconds} 秒以内）。',
  mergeAllIdentical: '完全一致をすべて統合 ({count})',
  mergeAllScanned: 'スキャン結果をすべて統合 ({count})',
  bulkMergeProgress: '{done}/{total} グループを統合中…',
  noDuplicatesFound: '重複登録は見つかりませんでした。',
  keeperBadge: '保持（KCC ID 維持）',
  merging: '統合中...',
  mergeInto: '{id} に統合',

  // Search, filters, sorting, export & purge
  searchPlaceholder: '検索...',
  filterAllRoles: 'すべての役割 ({count})',
  filterAllCities: 'すべての地域',
  filterAllAges: 'すべての年齢',
  filterLegalAge: '成人 (18歳以上)',
  filterMinor: '未成年 (18歳未満)',
  filterPreferNotToSay: '未回答',
  sortNewest: '🕒 日時: 新しい順',
  sortNameAsc: '🔤 名前: A → Z',
  purgeButtonTitle: 'Firestore のメンバーデータをすべて消去',
  purgeButton: 'メンバーデータを消去',
  purging: '消去中...',
  purgePrompt:
    '重大な警告: Firestore データベースからすべてのメンバーデータが完全に削除されます。\n\nデータベースの消去を確定するには「{keyword}」（大文字）と入力してください:',
  purgeCancelled: '確認がキャンセルされました（キーワードが一致しませんでした）。',
  purgeSuccess: '消去が完了しました: {count} 件のメンバー記録がデータベースから削除されました。',
  purgeFailed: 'メンバーデータを削除できませんでした: {error}',
  exportNoData: 'エクスポートするデータがありません。',
  showingMembers: '{total} 人中 {shown} 人のメンバーを表示',

  // CSV export column headers
  csvKccId: 'KCC ID（16桁）',
  csvCosname: 'コスネーム / 別名',
  csvLegalName: '本名',
  csvPrimaryWhatsapp: 'メイン WhatsApp',
  csvBackupWhatsapp: '予備 WhatsApp',
  csvDiscord: 'Discord ユーザー名',
  csvEmail: 'メールアドレス',
  csvAgeCategory: '年齢区分',
  csvAge: '年齢 / 誕生日',
  csvCountry: '国',
  csvProvince: '州 / 都道府県',
  csvCity: '都市',
  csvPrimaryRole: '主な役割',
  csvFandom: 'ジャンル',
  csvExperience: '経験',
  csvStatus: 'ステータス',
  csvRegisteredAt: '登録日',

  // Members table
  colMember: 'メンバー / コスネーム',
  colKccId: '16桁 KCC ID',
  colContact: 'WhatsApp・連絡先',
  colDiscord: 'Discord ユーザー名',
  colRole: '役割・関心',
  colAge: '年齢',
  colLocation: '地域',
  colStatus: 'ステータス',
  colRegistered: '登録日',
  colActions: '操作',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ 若い順',
  sortAgeOldest: '▼ 年上順',
  sortStatusAsc: '▲ 認証',
  sortStatusDesc: '▼ 保留',
  sortTimeNewest: '▼ 新しい順',
  sortTimeOldest: '▲ 古い順',
  legalNameValue: '本名: {name}',
  mainAccountBadge: 'KCC メインアカウント',
  adminIdBadge: 'KCC 管理者 #{number}',
  timestampIdBadge: 'タイムスタンプ ID',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'KCC ID を表示',
  deleteMemberTitle: 'メンバーを削除',
  emptyDatabaseTitle: 'メンバーデータベースは空です',
  emptyDatabaseDesc:
    'データベースにはまだメンバーデータがありません。Google フォームのスプレッドシートからインポートするか、新しい登録をお待ちください。',
  noResultsTitle: '結果なし',
  noResultsDesc: '検索キーワードまたは選択したフィルターに一致するメンバーデータはありません。',
  openSheetsSync: 'Google Sheets・フォーム同期を開く',
};

export default admin;
