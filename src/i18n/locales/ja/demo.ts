import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'デモフォームのテスト用サンドボックス',
  sandboxBadge: 'サンドボックスモード',
  description:
    'ワンクリックのプリセット自動入力で KCC ID の生成をテストできます（タイムスタンプ UID、管理者 UID 0001-0100、メインアカウント 0000）。',
  randomizeTitle: 'ランダムなペルソナを生成',
  randomize: 'ランダム',

  // KCC ID allocation rules
  rulesTitle: 'KawanCosplay ユーザー ID のルール:',
  ruleMainAccount: 'KCC メインアカウント',
  ruleAdminRange: 'KCC 管理者の範囲',
  ruleTimestamp: 'タイムスタンプ順のメンバー UID',

  // Preset cards
  previewName: '名前:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'フォームに入力',
  submitTest: 'テスト送信',
  tip: 'ヒント:「{action}」をクリックすると送信をすぐにシミュレーションでき、生成された KCC ID 会員証と WhatsApp の解放を確認できます。',
  presetLoaded: 'プリセットを読み込みました',

  // Presets
  presetCosplayerName: 'デモ コスプレイヤー（タイムスタンプ UID）',
  presetCosplayerBadge: 'タイムスタンプ UID',
  presetCosplayerDesc: '送信時のタイムスタンプ順に並ぶ16桁 UID (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'デモ KCC 管理者（UID 0001-0100）',
  presetAdminBadge: '管理者 UID 範囲',
  presetAdminDesc: 'KCC 管理者用の UID 0000 0000 0000 0001〜0000 0000 0000 0100',
  presetMainAccountName: 'デモ KCC メインアカウント（UID 0000）',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 はメインアカウント cosplaysehat@gmail.com 専用',
  presetPropMakerName: 'デモ 小道具制作 / クラフター',
  presetPropMakerBadge: 'クラフター（タイムスタンプ）',
  presetPropMakerDesc: 'タイムスタンプ方式 UID の小道具・鎧職人',
  presetPhotographerName: 'デモ コスプレカメラマン',
  presetPhotographerBadge: 'カメラマン',
  presetPhotographerDesc: 'タイムスタンプ方式 UID のカメラマン・ビデオグラファー',
  presetOthersName: 'デモ その他 / カスタム役割',
  presetOthersBadge: 'その他の役割',
  presetOthersDesc: '「その他」のカスタム役割（専門: コスプレメイク＆ウィッグスタイリスト）',
  presetDuplicateName: '単一 KCC ID テスト（一致: {name}）',
  presetDuplicateBadge: '単一 KCC ID チェック',
  presetDuplicateDesc: 'WhatsApp 番号が一致すると KCC ID が維持されることを確認: {id}',
  presetSecondaryPhoneName: '2つ目の電話番号テスト（2つの番号: {name}）',
  presetSecondaryPhoneBadge: 'WA 番号2件チェック',
  presetSecondaryPhoneDesc: '2つ目の電話番号を追加し、KCC ID を維持: {id}',
};

export default demo;
