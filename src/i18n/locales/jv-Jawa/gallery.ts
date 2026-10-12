import type { LocaleNamespace } from '../../types';

const gallery: LocaleNamespace<'gallery'> = {
  title: 'ꦒꦭꦺꦫꦶꦥ꦳ꦺꦴꦠꦺꦴ',
  description: 'ꦥꦩꦺꦫꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦉꦱ꧀ꦩꦶ ꦏꦂꦪ ꦲꦁꦒꦺꦴꦠ KawanCosplay ꦱꦏꦶꦁ ꦏꦺꦴꦤ꧀ꦮ꦳ꦺꦤ꧀ꦱꦶ꧈ ꦏꦺꦴꦥ꧀ꦢꦂ꧈ ꦭꦤ꧀ ꦱꦺꦱꦶ ꦥ꦳ꦺꦴꦠꦺꦴ',
  uploadPhoto: 'ꦲꦸꦁꦒꦃꦥ꦳ꦺꦴꦠꦺꦴ',
  allCharacters: 'ꦏꦧꦺꦃꦏꦫꦏ꧀ꦠꦼꦂ',
  allEvents: 'ꦏꦧꦺꦃꦲꦢꦶꦕꦫ',

  // PhotoGallery
  photosAvailableOne: '{count} ꦥ꦳ꦺꦴꦠꦺꦴ ꦏꦱꦼꦝꦶꦪ',
  photosAvailableOther: '{count} ꦥ꦳ꦺꦴꦠꦺꦴ ꦏꦱꦼꦝꦶꦪ',
  showcaseHeading: 'ꦥꦩꦺꦫꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ KawanCosplay',
  searchPlaceholder: 'ꦥꦢꦺꦴꦱ꧀ ꦩꦶꦠꦸꦫꦸꦠ꧀ ꦏꦫꦏ꧀ꦠꦼꦂ꧈ ꦱꦺꦫꦶ꧈ ꦥ꦳ꦺꦴꦠꦺꦴꦒꦿꦥ꦳ꦼꦂ꧈ ꦲꦸꦠꦮꦶ ꦲꦕꦫ...',
  filterOptionWithCount: '{label} ({count})',
  showingCountOne: 'ꦤꦩ꧀ꦥꦶꦭꦏꦼꦤ꧀ {count} ꦏꦂꦪ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀',
  showingCountOther: 'ꦤꦩ꧀ꦥꦶꦭꦏꦼꦤ꧀ {count} ꦏꦂꦪ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀',
  emptyTitle: 'ꦢꦺꦫꦺꦁ ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦲꦶꦁ ꦏꦠꦺꦒꦺꦴꦫꦶ ꦥꦸꦤꦶꦏ',
  emptyDesc: 'ꦢꦢꦺꦴꦱ꧀ ꦲꦶꦁꦏꦁ ꦏꦥꦶꦱꦤ꧀ ꦔꦸꦁꦒꦃ ꦥ꦳ꦺꦴꦠꦺꦴ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀ ꦏꦁꦒꦺ ꦏꦫꦏ꧀ꦠꦼꦂ ꦲꦸꦠꦮꦶ ꦲꦕꦫ ꦥꦸꦤꦶꦏ!',
  uploadNow: 'ꦲꦸꦁꦒꦃ ꦥ꦳ꦺꦴꦠꦺꦴ ꦱꦥꦸꦤꦶꦏ',
  downloadPhoto: 'ꦲꦸꦤ꧀ꦝꦸꦃ ꦥ꦳ꦺꦴꦠꦺꦴ',
  byAuthor: 'ꦢꦺꦤꦶꦁ: {name}',
  detailCosplayer: 'ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪꦼꦂ:',
  detailKccId: 'ID 16 ꦢꦶꦒꦶꦠ꧀:',
  detailEvent: 'ꦲꦕꦫ / ꦥꦁꦒꦺꦴꦤꦤ꧀:',
  detailPhotographer: 'ꦥ꦳ꦺꦴꦠꦺꦴꦒꦿꦥ꦳ꦼꦂ:',
  shootNotes: 'ꦕꦛꦼꦠꦤ꧀ ꦱꦺꦱꦶ ꦥ꦳ꦺꦴꦠꦺꦴ',
  likeWithCount: 'ꦉꦩꦼꦤ꧀ ({count})',
  download: 'ꦲꦸꦤ꧀ꦝꦸꦃ',
  // Shown for photos saved with the "Other" event but no custom name
  eventOtherShort: 'ꦱꦤꦺꦱꦶꦥꦸꦤ꧀',

  // UploadPhotoModal
  photoTooLarge: 'ꦲꦸꦏꦸꦫꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦥꦭꦶꦁ ꦲꦒꦼꦁ {maxMb} MB.',
  imageProcessFailed: 'ꦒꦩ꧀ꦧꦂ ꦩ꧀ꦧꦺꦴꦠꦼꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦤ꧀ꦥꦿꦺꦴꦱꦺꦱ꧀꧉ ꦩꦁꦒ ꦕꦺꦴꦧꦶ ꦥ꦳ꦻꦭ꧀ ꦱꦤꦺꦱ꧀꧉',
  photoRequired: 'ꦩꦁꦒ ꦲꦸꦁꦒꦃ ꦥ꦳ꦻꦭ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀ ꦲꦸꦠꦮꦶ ꦊꦧꦼꦠꦏꦼꦤ꧀ URL ꦒꦩ꧀ꦧꦂ꧉',
  requiredFieldsMissing: 'ꦗꦼꦤꦼꦁ ꦏꦫꦏ꧀ꦠꦼꦂ꧈ ꦱꦺꦫꦶ ꦲꦤꦶꦩꦺ/ꦒꦺꦩ꧀꧈ ꦭꦤ꧀ ꦗꦸꦝꦸꦭ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦮꦗꦶꦧ꧀ ꦢꦶꦥꦸꦤꦶꦱꦶ꧉',
  uploadBadge: 'ꦒꦭꦺꦫꦶ ꦏꦺꦴꦩꦸꦤꦶꦠꦱ꧀ MyKCC',
  uploadTitle: 'ꦲꦸꦁꦒꦃ ꦥ꦳ꦺꦴꦠꦺꦴ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀',
  uploadDesc: 'ꦥ꦳ꦺꦴꦠꦺꦴ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀ ꦧꦝꦺ ꦠꦩ꧀ꦥꦶꦭ꧀ ꦲꦶꦁ ꦒꦭꦺꦫꦶ ꦲꦸꦩꦸꦩ꧀ ꦭꦤ꧀ ꦱꦒꦼꦢ꧀ ꦢꦶꦥꦸꦤ꧀ꦥꦢꦺꦴꦱꦶ ꦩꦶꦠꦸꦫꦸꦠ꧀ ꦏꦫꦏ꧀ꦠꦼꦂ ꦭꦤ꧀ ꦲꦕꦫ꧉',
  photoFileLabel: 'ꦥ꦳ꦻꦭ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀',
  previewAlt: 'ꦠꦶꦭꦶꦏꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ',
  changePhoto: 'ꦒꦤ꧀ꦠꦺꦴꦱ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ',
  chooseFileHint: 'ꦥꦶꦭꦶꦃ ꦒꦩ꧀ꦧꦂ ꦱꦏꦶꦁ ꦥꦶꦫꦤ꧀ꦠꦶ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀ (JPG, PNG, WebP)',
  chooseFileButton: 'ꦥꦶꦭꦶꦃ ꦥ꦳ꦻꦭ꧀ ꦒꦩ꧀ꦧꦂ',
  photoTitleLabel: 'ꦗꦸꦝꦸꦭ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ / ꦏꦺꦴꦤ꧀ꦱꦺꦥ꧀',
  photoTitlePlaceholder: 'ꦠꦸꦭꦝ: Raiden Shogun - Inazuma Castle',
  characterLabel: 'ꦏꦫꦏ꧀ꦠꦼꦂ ꦲꦶꦁꦏꦁ ꦢꦶꦥꦸꦤ꧀ꦕꦺꦴꦱ꧀ꦥ꧀ꦭꦪ꧀',
  characterPlaceholder: 'ꦠꦸꦭꦝ: Frieren, Furina, Gojo Satoru',
  seriesLabel: 'ꦱꦺꦫꦶ ꦲꦤꦶꦩꦺ / ꦒꦺꦩ꧀ / ꦥ꦳ꦤ꧀ꦢꦺꦴꦩ꧀',
  seriesPlaceholder: 'ꦠꦸꦭꦝ: Genshin Impact, Sousou no Frieren',
  eventLabel: 'ꦲꦕꦫ / ꦥꦁꦒꦺꦴꦤꦤ꧀ ꦥ꦳ꦺꦴꦠꦺꦴ',
  // Event option labels (the saved Firestore value stays the English preset text)
  eventMonthlyGathering: 'ꦏꦺꦴꦥ꧀ꦢꦂ ꦱꦧꦼꦤ꧀ ꦮꦸꦭꦤ꧀ KawanCosplay',
  eventOutdoorShoot: 'ꦱꦺꦱꦶ ꦥ꦳ꦺꦴꦠꦺꦴ ꦲꦭꦩ꧀ ꦲꦶꦁ ꦚ꧀ꦗꦮꦶ',
  eventIndoorStudio: 'ꦱꦺꦱꦶ ꦥ꦳ꦺꦴꦠꦺꦴ ꦲꦶꦁ ꦱ꧀ꦠꦸꦢꦶꦪꦺꦴ',
  eventMatsuri: 'ꦩꦠ꧀ꦱꦸꦫꦶ ꦗꦼꦥꦁ / ꦥ꦳ꦺꦱ꧀ꦠꦶꦮ꦳ꦭ꧀ ꦧꦸꦢꦪ',
  eventOther: 'ꦱꦤꦺꦱꦶꦥꦸꦤ꧀ (ꦱꦼꦫꦠ꧀ ꦥꦶꦪꦩ꧀ꦧꦏ꧀)',
  customEventPlaceholder: 'ꦱꦼꦫꦠ꧀ ꦗꦼꦤꦼꦁ ꦲꦕꦫ / ꦥꦁꦒꦺꦴꦤꦤ꧀',
  photographerLabel: 'ꦏꦿꦺꦢꦶꦠ꧀ ꦥ꦳ꦺꦴꦠꦺꦴꦒꦿꦥ꦳ꦼꦂ / ꦏꦿꦸ',
  photographerPlaceholder: '@jeneng_fotografer ꦲꦸꦠꦮꦶ ꦗꦼꦤꦼꦁ ꦱ꧀ꦠꦸꦢꦶꦪꦺꦴ',
  captionLabel: 'ꦏꦠꦿꦔꦤ꧀ / ꦕꦿꦶꦠ ꦲꦶꦁ ꦱꦮꦶꦁꦏꦶꦔꦶꦁ ꦏꦺꦴꦱ꧀ꦠꦸꦩ꧀',
  captionPlaceholder:
    'ꦕꦫꦶꦪꦺꦴꦱꦏꦼꦤ꧀ ꦏꦢꦺꦴꦱ꧀ ꦥꦸꦤ꧀ꦢꦶ ꦥꦚ꧀ꦗꦼꦤꦼꦔꦤ꧀ ꦢꦩꦼꦭ꧀ ꦏꦺꦴꦱ꧀ꦠꦸꦩ꧀ ꦭꦤ꧀ ꦥꦿꦺꦴꦥ꧀꧈ ꦲꦸꦠꦮꦶ ꦥꦸꦤꦥ ꦲꦶꦁꦏꦁ ꦤ꧀ꦢꦢꦺꦴꦱꦏꦼꦤ꧀ ꦲꦕꦫꦤꦶꦥꦸꦤ꧀ ꦚꦼꦤꦼꦔꦏꦼꦤ꧀...',
  cancel: 'ꦧꦠꦭ꧀',
  submitUpload: 'ꦲꦸꦁꦒꦃ ꦝꦠꦼꦁ ꦒꦭꦺꦫꦶ',
};

export default gallery;
