import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'KawanCosplay 管理员后台',
  dashboardDesc: '受限的管理门户，用于管理社区成员名单和同步 Google Sheets。',
  loginPrompt: '请输入管理员密钥，或以 cosplaysehat@gmail.com 登录',
  privacyRestrictedNotice: '为保护成员隐私，成员名单严格仅限 KawanCosplay 管理员查看。',
  exportCsv: '导出 CSV',
  totalMembers: '已注册成员总数',
  resetFilter: '重置筛选',

  // Lock screen (not signed in as an admin)
  checkingAccess: '正在检查管理员权限...',
  signedInNotAdmin: '当前登录账号为 {account}——该账号不是 KCC 管理员。',
  emailNotVerified: '邮箱未验证——请使用 Google 登录。',
  signInWithAdminGoogleEmail: '使用管理员 Google 账号登录（{email}）',
  signOutThisAccount: '退出登录',
  whatsappAdminHelp: '通过 WhatsApp 获取管理员帮助：{phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'KawanCosplay 管理门户',
  verifiedAccessBadge: '已验证访问',
  dashboardPrivacyNote: '成员隐私受到严格保护：只有已登记的管理员才能查看姓名和联系方式。',
  whatsappHotlineShort: 'WA 热线：{phone}',
  signOutAdmin: '退出管理员账号',
  statusStat: '状态：{status}',
  statusVerified: '已认证',
  statusActive: '活跃',
  statusPending: '待处理',
  tabMembers: '成员列表与名单（{count}）',
  tabSync: 'Google Sheets 与表单同步',
  tabStats: '社区统计',

  // Member list states
  permissionDeniedTitle: '访问被拒绝',
  permissionDeniedDesc:
    '数据库拒绝了该账号对成员列表的访问。请使用管理员 Google 账号（{email}）或 admins 集合中列出的账号登录，然后重新加载页面。同时请确认最新的 Firestore 规则已发布到数据库 {database}。',
  signInWithAdminGoogle: '使用管理员 Google 账号登录',
  reloadPage: '重新加载页面',
  loadMembersFailedTitle: '无法加载成员列表',
  loadMembersFailedDesc: '无法加载成员列表。请检查网络连接，然后重新加载页面。',
  loadingMembers: '正在加载成员数据...',

  // Member status & delete
  statusUpdateFailed: '无法更新成员状态：{error}',
  deleteMemberConfirm: '要从 Firestore 数据库中删除成员“{name}”（KCC ID：{id}）吗？',
  deleteMemberFailed: '无法删除该成员：{error}',

  // KCC ID & public card repair
  repairTitle: 'KCC ID 与公开会员证修复',
  repairDesc:
    '为 ID 重复的成员分配唯一的 KCC ID（最早登记者保留原 ID），保存尚未存储的 KCC ID，并重建用于会员证查询的公开 memberCards 集合。可安全地重复运行。',
  repairDuplicatesDetected: '检测到 {count} 位成员的 KCC ID 重复——请点击“{action}”。',
  allIdsUnique: '所有 KCC ID 均唯一。',
  runRepair: '运行修复',
  repairRunning: '正在修复...',
  repairRunningProgress: '正在修复（{done}/{total}）...',
  repairConfirm:
    '要为所有成员运行 KCC ID 与公开会员证修复吗？\n\n- KCC ID 重复的成员将获得新 ID（最早登记者保留原 ID）。\n- 尚未保存的 KCC ID 将被保存。\n- 公开的 memberCards 集合将被重建。\n\n可安全地重复运行。是否继续？',
  repairFailed: '修复失败：{error}',
  repairDone: '修复完成。',
  repairStatScanned: '已扫描成员',
  repairStatDuplicateGroups: '重复 ID 组',
  repairStatCardsWritten: '已写入会员证',
  repairStatCardsDeleted: '已删除会员证',
  reassignedListTitle: '已更改 / 保存的 KCC ID（{count}）：',
  repairReasonDuplicate: 'ID 重复',
  repairReasonMissing: 'ID 尚未保存',
  repairReasonMainAccount: '主账号 ID 被其他成员占用',
  noIdsChanged: '没有需要更改的 KCC ID。',
  issuesCount: '错误（{count}）：',

  // Reserved admin / main account IDs
  reservedIdsTitle: '管理员 / 主账号保留 KCC ID（{range}）',
  reservedIdsDesc:
    '此范围内的 ID 仅供 KCC 主账号和管理员使用。下列成员因在公开表单中填写的身份 / 邮箱（旧系统）而获得了此类 ID。点击“{action}”为他们分配按时间顺序排列的唯一 KCC ID。',
  noReservedHolders: '没有成员持有管理员专用的 KCC ID。',
  reservedHolderMeta: '来源：{source} • 身份：{role}',
  processing: '正在处理...',
  assignNewId: '分配新 ID',
  reassignConfirm: '要为“{name}”（当前为 {id}）分配新的 KCC ID 吗？',
  reassignMainAccountWarning:
    '警告：这是主账号 ID。如果该成员就是官方账号 {email}，请不要继续。',
  resultSuccess: '成功：{message}',
  resultFailed: '失败：{message}',

  // Duplicate registrations
  duplicatesTitle: '重复登记（同一人）',
  duplicatesDesc:
    '多次填写表单的成员（WhatsApp 号码、Discord、邮箱或社交媒体相同）。“合并”会将最新数据和所有 WhatsApp 号码保留到最早的登记记录上（其 KCC ID 不变），然后删除重复记录及其会员证。合并前请仔细核对。',
  scanDuplicates: '扫描重复登记',
  mergeConfirm:
    '要将“{duplicate}”（{duplicateId}）合并到“{keeper}”（{keeperId}）吗？\n\n最新数据和 WhatsApp 号码将复制到最早的登记记录，然后重复记录将被永久删除。是否继续？',
  mergeSuccess: '“{duplicate}”已合并到“{keeper}”——KCC ID {id} 保持不变。',
  bulkMergeIdenticalConfirm:
    '要合并 {groups} 个完全相同的重复组（{records} 条重复记录）吗？\n\n仅包括 Cosname 和主 WhatsApp 号码相同、且创建时间相差不超过 {seconds} 秒的组（完全副本 / 重复导入）。\n最新数据和所有 WhatsApp 号码将归入最早的登记记录（其 KCC ID 不变），然后重复记录将被永久删除。是否继续？',
  bulkMergeAllConfirm:
    '要合并全部 {groups} 个已扫描的组（{records} 条重复记录）吗？\n\n其中包括仅因 WhatsApp 号码、Discord、邮箱、社交媒体或名称相同而匹配的组——请确认您已核对下方列表。\n最新数据和所有 WhatsApp 号码将归入最早的登记记录（其 KCC ID 不变），然后重复记录将被永久删除。此操作无法撤销。是否继续？',
  bulkMergeDone: '批量合并已完成（{mode}）。',
  bulkModeIdentical: '完全相同的组',
  bulkModeAll: '全部扫描结果',
  bulkStatGroups: '已处理组数',
  bulkStatMergedGroups: '已合并组数',
  bulkStatMergedRecords: '已合并重复记录',
  bulkStatFailedGroups: '失败组数',
  bulkMoreErrors: '…另有 {count} 条（请查看浏览器控制台）。',
  scanSummary:
    '找到 {groups} 个重复组（{records} 条重复记录），其中 {identical} 个为完全相同的组（Cosname 和主 WhatsApp 号码相同，创建时间相差不超过 {seconds} 秒）。',
  mergeAllIdentical: '合并所有完全相同的组（{count}）',
  mergeAllScanned: '合并全部扫描结果（{count}）',
  bulkMergeProgress: '正在合并 {done}/{total} 个组…',
  noDuplicatesFound: '未检测到重复登记。',
  keeperBadge: '保留（KCC ID 不变）',
  merging: '正在合并...',
  mergeInto: '合并到 {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: '搜索...',
  filterAllRoles: '全部身份（{count}）',
  filterAllCities: '全部地区',
  filterAllAges: '全部年龄',
  filterLegalAge: '已成年（18+）',
  filterMinor: '未成年（<18）',
  filterPreferNotToSay: '未注明',
  sortNewest: '🕒 时间：最新',
  sortNameAsc: '🔤 名称：A → Z',
  purgeButtonTitle: '清除 Firestore 中的所有成员数据',
  purgeButton: '清除成员数据',
  purging: '正在清除...',
  purgePrompt:
    '严重警告：此操作将从 Firestore 数据库中永久删除所有成员数据。\n\n请输入“{keyword}”（大写）以确认清空数据库：',
  purgeCancelled: '已取消确认（关键词不匹配）。',
  purgeSuccess: '清除完成：已从数据库中删除 {count} 条成员记录。',
  purgeFailed: '无法删除成员数据：{error}',
  exportNoData: '没有可导出的数据。',
  showingMembers: '显示 {shown} / {total} 位成员',

  // CSV export column headers
  csvKccId: 'KCC ID（16 位）',
  csvCosname: 'Cosname / 昵称',
  csvLegalName: '法定姓名',
  csvPrimaryWhatsapp: '主 WhatsApp',
  csvBackupWhatsapp: '备用 WhatsApp',
  csvDiscord: 'Discord 用户名',
  csvEmail: '邮箱',
  csvAgeCategory: '年龄类别',
  csvAge: '年龄 / 生日',
  csvCountry: '国家',
  csvProvince: '省份',
  csvCity: '城市',
  csvPrimaryRole: '主要身份',
  csvFandom: '喜爱作品',
  csvExperience: '经验',
  csvStatus: '状态',
  csvRegisteredAt: '登记日期',

  // Members table
  colMember: '成员 / Cosname',
  colKccId: '16 位 KCC ID',
  colContact: 'WhatsApp 与联系方式',
  colDiscord: 'Discord 用户名',
  colRole: '身份与兴趣',
  colAge: '年龄',
  colLocation: '地区',
  colStatus: '状态',
  colRegistered: '登记时间',
  colActions: '操作',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ 最年轻',
  sortAgeOldest: '▼ 最年长',
  sortStatusAsc: '▲ 已认证',
  sortStatusDesc: '▼ 待处理',
  sortTimeNewest: '▼ 最新',
  sortTimeOldest: '▲ 最早',
  legalNameValue: '法定姓名：{name}',
  mainAccountBadge: 'KCC 主账号',
  adminIdBadge: 'KCC 管理员 #{number}',
  timestampIdBadge: '时间戳 ID',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: '查看 KCC ID',
  deleteMemberTitle: '删除成员',
  emptyDatabaseTitle: '成员数据库为空',
  emptyDatabaseDesc:
    '数据库中还没有成员数据。请从 Google Form 电子表格导入，或等待新的登记。',
  noResultsTitle: '无结果',
  noResultsDesc: '没有符合搜索关键词或所选筛选条件的成员数据。',
  openSheetsSync: '打开 Google Sheets 与表单同步',
};

export default admin;
