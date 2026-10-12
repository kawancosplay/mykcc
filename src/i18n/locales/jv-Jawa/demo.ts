import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'ꦱꦤ꧀ꦢ꧀ꦧꦺꦴꦏ꧀ꦱ꧀ ꦥꦕꦺꦴꦧꦤ꧀ ꦥ꦳ꦺꦴꦂꦩꦸꦭꦶꦂ ꦢꦺꦩꦺꦴ',
  sandboxBadge: 'ꦩꦺꦴꦢꦺ ꦱꦤ꧀ꦢ꧀ꦧꦺꦴꦏ꧀ꦱ꧀',
  description:
    'ꦲꦶꦱꦶ ꦲꦺꦴꦠꦺꦴꦩꦠꦶꦱ꧀ ꦥꦿꦺꦱꦺꦠ꧀ 1-ꦏ꧀ꦭꦶꦏ꧀ ꦏꦁꦒꦺ ꦔꦸꦗꦶ ꦢꦩꦼꦭꦤ꧀ KCC ID (ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀ UID, ꦲꦢ꧀ꦩꦶꦤ꧀ UID 0001-0100, ꦲꦏꦸꦤ꧀ ꦲꦸꦠꦩ 0000).',
  randomizeTitle: 'ꦢꦩꦼꦭ꧀ ꦥꦼꦂꦱꦺꦴꦤ ꦲꦕꦏ꧀',
  randomize: 'ꦲꦕꦏ꧀',

  // KCC ID allocation rules
  rulesTitle: 'ꦥꦲꦸꦒꦼꦫꦤ꧀ ꦪꦸꦱꦼꦂ ID KawanCosplay:',
  ruleMainAccount: 'ꦲꦏꦸꦤ꧀ ꦲꦸꦠꦩ KCC',
  ruleAdminRange: 'ꦉꦤ꧀ꦠꦁ ꦲꦢ꧀ꦩꦶꦤ꧀ KCC',
  ruleTimestamp: 'UID ꦲꦁꦒꦺꦴꦠ ꦩꦶꦠꦸꦫꦸꦠ꧀ ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀',

  // Preset cards
  previewName: 'ꦗꦼꦤꦼꦁ:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'ꦲꦶꦱꦶ ꦥ꦳ꦺꦴꦂꦩꦸꦭꦶꦂ',
  submitTest: 'ꦏꦶꦫꦶꦩ꧀ ꦥꦕꦺꦴꦧꦤ꧀',
  tip: 'ꦠꦶꦥ꧀ꦱ꧀: ꦏ꧀ꦭꦶꦏ꧀ "{action}" ꦏꦁꦒꦺ ꦭꦁꦱꦸꦁ ꦚꦶꦩꦸꦭꦱꦶꦏꦏꦼꦤ꧀ ꦥꦔꦶꦫꦶꦩꦤ꧀ ꦭꦤ꧀ ꦤꦶꦔꦭꦶ ꦏꦼꦂꦠꦸ KCC ID ꦲꦶꦁꦏꦁ ꦢꦶꦥꦸꦤ꧀ꦢꦩꦼꦭ꧀ ꦱꦲ ꦭꦶꦤ꧀ꦏ꧀ WhatsApp ꦲꦶꦁꦏꦁ ꦏꦧꦶꦏꦏ꧀꧉',
  presetLoaded: 'ꦥꦿꦺꦱꦺꦠ꧀ ꦱꦩ꧀ꦥꦸꦤ꧀ ꦏꦲꦼꦩꦺꦴꦠ꧀',

  // Presets
  presetCosplayerName: 'ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪꦼꦂ ꦢꦺꦩꦺꦴ (ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀ UID)',
  presetCosplayerBadge: 'UID ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀',
  presetCosplayerDesc: 'UID 16 ꦢꦶꦒꦶꦠ꧀ ꦩꦶꦠꦸꦫꦸꦠ꧀ ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀ ꦥꦔꦶꦫꦶꦩꦤ꧀ (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'ꦲꦢ꧀ꦩꦶꦤ꧀ KCC ꦢꦺꦩꦺꦴ (UID 0001-0100)',
  presetAdminBadge: 'ꦉꦤ꧀ꦠꦁ UID ꦲꦢ꧀ꦩꦶꦤ꧀',
  presetAdminDesc: 'UID 0000 0000 0000 0001 ꦢꦸꦩꦸꦒꦶ 0000 0000 0000 0100 ꦏꦁꦒꦺ ꦲꦢ꧀ꦩꦶꦤ꧀ KCC',
  presetMainAccountName: 'ꦲꦏꦸꦤ꧀ ꦲꦸꦠꦩ KCC ꦢꦺꦩꦺꦴ (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 ꦤꦩꦸꦁ ꦏꦁꦒꦺ ꦲꦏꦸꦤ꧀ ꦲꦸꦠꦩ cosplaysehat@gmail.com',
  presetPropMakerName: 'ꦥꦿꦺꦴꦥ꧀ ꦩꦏꦼꦂ / ꦥꦔꦿꦗꦶꦤ꧀ ꦢꦺꦩꦺꦴ',
  presetPropMakerBadge: 'ꦥꦔꦿꦗꦶꦤ꧀ (ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀)',
  presetPropMakerDesc: 'ꦥꦔꦿꦗꦶꦤ꧀ ꦥꦿꦺꦴꦥ꧀ & ꦲꦂꦩꦺꦴꦂ ꦏꦤ꧀ꦛꦶ UID ꦲꦝꦼꦝꦱꦂ ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀',
  presetPhotographerName: 'ꦥ꦳ꦺꦴꦠꦺꦴꦒꦿꦥ꦳ꦼꦂ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀ ꦢꦺꦩꦺꦴ',
  presetPhotographerBadge: 'ꦥ꦳ꦺꦴꦠꦺꦴꦒꦿꦥ꦳ꦼꦂ',
  presetPhotographerDesc: 'ꦥ꦳ꦺꦴꦠꦺꦴꦒꦿꦥ꦳ꦼꦂ & ꦮ꦳ꦶꦢꦺꦲꦺꦴꦒꦿꦥ꦳ꦼꦂ ꦏꦤ꧀ꦛꦶ UID ꦲꦝꦼꦝꦱꦂ ꦠꦻꦩ꧀ꦱ꧀ꦠꦺꦩ꧀ꦥ꧀',
  presetOthersName: 'ꦢꦺꦩꦺꦴ ꦱꦤꦺꦱꦶꦥꦸꦤ꧀ / ꦥꦼꦫꦤ꧀ ꦏꦸꦱ꧀ꦠꦺꦴꦩ꧀',
  presetOthersBadge: 'ꦥꦼꦫꦤ꧀ ꦱꦤꦺꦱꦶꦥꦸꦤ꧀',
  presetOthersDesc: 'ꦥꦼꦫꦤ꧀ ꦏꦸꦱ꧀ꦠꦺꦴꦩ꧀ "ꦱꦤꦺꦱꦶꦥꦸꦤ꧀" ꦏꦤ꧀ꦛꦶ ꦏꦼꦲꦃꦭꦶꦪꦤ꧀ ꦩꦺꦏꦥ꧀ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀ & ꦥꦼꦤꦠ ꦮꦶꦒ꧀',
  presetDuplicateName: 'ꦲꦸꦗꦶ KCC ID ꦠꦸꦁꦒꦭ꧀ (ꦕꦺꦴꦕꦺꦴꦒ꧀: {name})',
  presetDuplicateBadge: 'ꦥꦿꦶꦏ꧀ꦱ KCC ID ꦠꦸꦁꦒꦭ꧀',
  presetDuplicateDesc: 'ꦩꦼꦱ꧀ꦛꦺꦏꦏꦼꦤ꧀ WhatsApp ꦲꦶꦁꦏꦁ ꦕꦺꦴꦕꦺꦴꦒ꧀ ꦠꦼꦠꦼꦥ꧀ ꦔꦒꦼꦩ꧀ KCC ID: {id}',
  presetSecondaryPhoneName: 'ꦲꦸꦗꦶ ꦤꦺꦴꦩꦼꦂ ꦏꦥꦶꦁ ꦏꦭꦶꦃ (2 ꦤꦺꦴꦩꦼꦂ: {name})',
  presetSecondaryPhoneBadge: 'ꦥꦿꦶꦏ꧀ꦱ 2 ꦤꦺꦴꦩꦼꦂ WA',
  presetSecondaryPhoneDesc: 'ꦤꦩ꧀ꦧꦲꦏꦼꦤ꧀ ꦤꦺꦴꦩꦼꦂ ꦏꦥꦶꦁ ꦏꦭꦶꦃ & ꦚ꧀ꦗꦒꦶ KCC ID: {id}',
};

export default demo;
