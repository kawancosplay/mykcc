import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Google Sheets & フォーム リアルタイムブリッジ',
  bridgeSubtitle: 'Google フォームから Firebase への移行',
  pageTitle: 'スプレッドシート & Google フォーム データベース同期',
  pageDesc:
    '現在のメンバーの既存スプレッドシートをインポートしてリアルタイム同期をオンにすると、移行期間中に Google フォームに記入した新しいメンバーが自動的に Firebase に追加されます。',
  connectSheets: 'Google Sheets に接続',
  renewAccess: 'Google Sheets のアクセスを更新',
  connectionRequiredTitle: 'Google Sheets への接続が必要です',
  connectionRequiredDesc:
    'Google フォームのスプレッドシートを直接読み込むには、ログイン中の管理者 Google アカウントで MyKCC に Google Sheets への読み取りアクセスを許可してください。そのアカウントは KawanCosplay の登録スプレッドシートへのアクセス権を持っている必要があります。',
  accessRequestNotice:
    'アクセスはログイン中のアカウントに対してリクエストされます。MyKCC がリクエストするのは Google Sheets の読み取りアクセスのみで、Google Drive へのアクセスは求めません。',
  accessRequestNoticeWithEmail:
    'アクセスはログイン中のアカウント（{email}）に対してリクエストされます。MyKCC がリクエストするのは Google Sheets の読み取りアクセスのみで、Google Drive へのアクセスは求めません。',

  // Step 1: spreadsheet
  step1Title: 'Google フォームのスプレッドシート',
  step1Desc: 'Google フォームの回答スプレッドシートの URL または ID を貼り付けてください。',
  spreadsheetInputLabel: 'Google スプレッドシートの URL / ID',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit または ID',
  inspectButton: '確認',
  formatHint: '形式: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID をまだ認識できません。',
  sheetTabLabel: 'シートタブを選択',

  // Step 2: column mapping
  step2Title: '回答列のマッピング',
  step2Desc: 'Google フォームで {count} 列を検出しました',
  autoDetectedBadge: '自動検出',
  columnFullName: '氏名の列',
  columnCosname: 'コスネーム / 別名の列',
  columnEmail: 'メールアドレスの列',
  columnWhatsapp: 'WhatsApp / 電話番号の列',
  columnWhatsapp2: '予備 WhatsApp / WA 番号 2 の列',
  optionalTag: '（任意）',
  columnDiscord: 'Discord ユーザー名の列',
  columnCity: '都市 / 居住地の列',
  columnRole: '役割 / 関心の列（コスプレイヤー / クラフターなど）',
  columnFandom: 'ジャンル / 好きなキャラクターの列',
  columnTimestamp: '回答タイムスタンプの列',
  optionChooseColumn: '-- 列を選択 --',
  optionNone: '-- なし / 空欄 --',
  optionDefaultIndonesia: '-- デフォルト（インドネシア） --',
  optionDefaultCosplayer: '-- デフォルト（コスプレイヤー） --',
  optionDefaultAnimeGames: '-- デフォルト（アニメ＆ゲーム） --',
  optionCurrentTime: '-- 現在時刻 --',
  previewTitle: 'スプレッドシートデータのプレビュー（名前、WhatsApp、Discord ユーザー名）:',
  previewColName: '名前 / コスネーム',
  previewColDiscord: 'Discord ユーザー名',
  previewColCity: '都市',
  previewPhone2: '番号 2: {phone}',

  // Import
  importing: 'Firestore にインポート中 ({completed}/{total})...',
  importAllButton: 'スプレッドシートの全回答（Discord・WA を含む）を Firebase にインポート',
  importResult:
    'インポート完了: <strong>新規メンバー {added} 人</strong>、更新 {updated} 件、変更なし {unchanged} 件、失敗 {skipped} 件。',
  errorTip: 'ヒント: 上の入力欄に Google フォームのスプレッドシートの URL を貼り付けて「確認」をクリックすることもできます。',
  grantAccessButton: 'アクセスを許可 / Google に接続',

  // Real-time poller
  pollerTitle: 'リアルタイム移行ポーラー',
  pollerActive: '有効（ライブ）',
  pollerInactive: '無効',
  pollerDesc:
    'オンの間、アプリは {seconds} 秒ごとにスプレッドシートを確認します。Google フォームの新しい回答は自動的に Firebase に追加され、すぐに KCC ID が付与されます。',
  pollIntervalLabel: '確認間隔:',
  pollEverySeconds: '{seconds} 秒ごと',
  pollEverySecondsOptimal: '{seconds} 秒ごと（最適）',
  lastPollLabel: '最終確認:',
  lastPollNever: '未実行',
  stopPoller: 'ライブポーラーを停止',
  startAutoSync: 'リアルタイム自動同期を開始',

  // Google Apps Script webhook
  webhookTitle: 'Google Apps Script の Webhook',
  webhookDesc:
    '<em>送信</em> ボタンが押された瞬間に、ポーリング間隔を待たずに Google フォームの回答を受け取りたいですか？回答用の Google スプレッドシートにこのスクリプトをインストールしてください:',
  scriptCommentInstall: 'インストール先: 回答用 Google スプレッドシート -> 拡張機能 -> Apps Script',
  scriptCommentTrigger: 'トリガー: onFormSubmit -> フォーム送信時',
  scriptCommentResponseData: 'フォームの回答データを読み取る',
  copied: 'コピーしました！',
  copyScript: 'スクリプトをコピー',
  installStepsTitle: 'かんたん設定（1分）:',
  installStep1: '1. 回答用 Google スプレッドシートを開き、<strong>拡張機能</strong> メニュー > <strong>Apps Script</strong> を選択します。',
  installStep2: '2. 上のコードを貼り付けて保存します。',
  installStep3:
    '3. 左のメニューで <strong>トリガー</strong> をクリック > トリガーを追加 > イベントの種類を選択: <em>フォーム送信時</em>。',

  // Sync history
  recentSyncTitle: '最近の同期履歴',
  logCount: '{count} 件のログ',
  logsPermissionDenied: '同期ログへのアクセスが拒否されました。管理者の Google アカウントでログインしてください。',
  logsLoadFailed: '同期履歴を読み込めませんでした。接続を確認してから、ページを再読み込みしてください。',
  logsEmpty: '同期アクティビティはまだ記録されていません。',
  logImportedRows: '{count} 行をインポートしました',
  logImportSummary:
    'インポート完了: 新規メンバー {added} 人、更新 {updated} 件、変更なし {unchanged} 件、失敗 {skipped} 件。',
  logAutoSummary: '自動: 新規 {added} 件、更新 {updated} 件。',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Google Sheets インポーター',

  // Errors
  adminAccountFallback: '管理者アカウント',
  errorUnauthorized:
    'Google Sheets の権限の有効期限が切れたか、無効になりました。「Google Sheets に接続」をクリックして更新してから、もう一度お試しください。',
  errorScope:
    'Google Sheets への読み取りアクセスが許可されていません。「Google Sheets に接続」をクリックし、Google Sheets のスプレッドシートを表示する権限にチェックを入れてください。',
  errorNoAccess:
    'ログイン中の Google アカウント（{account}）にこのスプレッドシートへのアクセス権がないか、スプレッドシート ID が間違っています。スプレッドシートをその管理者アカウントと共有する（閲覧者の権限で十分です）か、URL / ID をもう一度ご確認ください。',
  errorUnsupportedFile:
    'このファイルはネイティブの Google Sheets ファイルではありません（例: アップロードされた Excel .xlsx）。ファイルを開いて [ファイル] > [Google スプレッドシートとして保存] を選択し、新しいファイルの URL を使用してください。',
  errorRateLimit: 'Google Sheets API のリクエスト上限に達しました。1分ほど待ってから、もう一度お試しください。',
  errorNetwork: 'Google Sheets に接続できませんでした。インターネット接続を確認してから、もう一度お試しください。',
  errorRejected: 'Google Sheets がリクエストを拒否しました: {detail}',
  errorInvalidInput:
    'スプレッドシートの URL または ID が無効です。Google Sheets の完全な URL（https://docs.google.com/spreadsheets/d/…/edit）または ID のみを貼り付けてください。',
  errorEmptyInput: '先に Google Sheets の URL または ID を入力してください。',
  errorNotConnected: 'Google Sheets へのアクセスがまだ許可されていません。先に「Google Sheets に接続」をクリックしてください。',
  errorEmptySheet: 'このスプレッドシートは空か、まだ回答がありません。',
  errorReadFailed: 'スプレッドシートを読み込めませんでした。',
  errorInspectFirst: '先に Google Sheets に接続し、スプレッドシートを確認してください（ステップ 1）。',
  errorNoRows: 'インポートする回答行がありません。',
  errorNoValidRows: 'この列のマッピングでは有効な行が見つかりませんでした。',
  errorCheckFirst: '先にステップ 1 でスプレッドシートを確認してください。',
};

export default sheets;
