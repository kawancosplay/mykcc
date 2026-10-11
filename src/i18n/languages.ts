export type LanguageCode =
  | 'en'
  | 'id'
  | 'ms'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'ja'
  | 'ko'
  | 'ar'
  | 'ta'
  | 'fr'
  | 'es'
  | 'pt'
  | 'jv'
  | 'jv-Jawa'
  | 'su'
  | 'su-Sund'
  | 'de'
  | 'tl'
  | 'th'
  | 'vi';

/** A Google Fonts family that a language needs to render its script. Loaded on demand by the I18nProvider. */
export interface LanguageFont {
  /** Google Fonts family name, e.g. 'Noto Sans Javanese'. */
  family: string;
  /** Optional css2 axis spec appended to the family, e.g. 'wght@400;600;700'. */
  axes?: string;
}

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  nativeName: string;
  isRtl?: boolean;
  /** Web font for this language's script (none = the default site font covers it). */
  font?: LanguageFont;
}

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu' },
  {
    code: 'zh-Hans',
    label: 'Chinese (Simplified)',
    nativeName: '简体中文',
    font: { family: 'Noto Sans SC', axes: 'wght@400;600;700' },
  },
  {
    code: 'zh-Hant',
    label: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    font: { family: 'Noto Sans TC', axes: 'wght@400;600;700' },
  },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', font: { family: 'Noto Sans JP', axes: 'wght@400;600;700' } },
  { code: 'ko', label: 'Korean', nativeName: '한국어', font: { family: 'Noto Sans KR', axes: 'wght@400;600;700' } },
  {
    code: 'ar',
    label: 'Arabic',
    nativeName: 'العربية',
    isRtl: true,
    font: { family: 'Noto Sans Arabic', axes: 'wght@400;600;700' },
  },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', font: { family: 'Noto Sans Tamil', axes: 'wght@400;600;700' } },
  { code: 'fr', label: 'French', nativeName: 'Français' },
  { code: 'es', label: 'Spanish', nativeName: 'Español' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português' },
  { code: 'jv', label: 'Javanese (Latin)', nativeName: 'Basa Jawa' },
  { code: 'jv-Jawa', label: 'Javanese (Hanacaraka)', nativeName: 'ꦧꦱꦗꦮ', font: { family: 'Noto Sans Javanese' } },
  { code: 'su', label: 'Sundanese (Latin)', nativeName: 'Basa Sunda' },
  { code: 'su-Sund', label: 'Sundanese (Aksara)', nativeName: 'ᮘᮞ ᮞᮥᮔ᮪ᮓ', font: { family: 'Noto Sans Sundanese' } },
  { code: 'de', label: 'German', nativeName: 'Deutsch' },
  { code: 'tl', label: 'Tagalog', nativeName: 'Filipino / Tagalog' },
  { code: 'th', label: 'Thai', nativeName: 'ภาษาไทย', font: { family: 'Noto Sans Thai', axes: 'wght@400;600;700' } },
  { code: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

const LANGUAGE_CODES = new Set<string>(LANGUAGES.map((l) => l.code));

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && LANGUAGE_CODES.has(value);
}

export function getLanguageMeta(code: LanguageCode): LanguageMeta {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

/** Stylesheet URL (Google Fonts css2 API) for one language font. */
export function googleFontHref(font: LanguageFont): string {
  const family = font.family.trim().replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}${font.axes ? `:${font.axes}` : ''}&display=swap`;
}

/**
 * Maps a BCP 47 tag from the browser (navigator.language / navigator.languages) to a supported language.
 * zh-TW / zh-HK / zh-MO (and zh-Hant) → zh-Hant, any other zh → zh-Hans, fil → tl. Returns null when unsupported.
 */
export function matchLanguageTag(tag: string | null | undefined): LanguageCode | null {
  if (!tag) return null;
  const [base, ...rest] = tag.toLowerCase().split(/[-_]/);
  switch (base) {
    case 'en':
      return 'en';
    case 'id':
    case 'in': // legacy code for Indonesian (older Android / Java)
      return 'id';
    case 'ms':
      return 'ms';
    case 'ja':
      return 'ja';
    case 'ko':
      return 'ko';
    case 'zh':
      if (rest.includes('hans')) return 'zh-Hans';
      if (rest.includes('hant') || rest.some((p) => p === 'tw' || p === 'hk' || p === 'mo')) return 'zh-Hant';
      return 'zh-Hans';
    case 'ar':
      return 'ar';
    case 'ta':
      return 'ta';
    case 'fr':
      return 'fr';
    case 'es':
      return 'es';
    case 'pt':
      return 'pt';
    case 'de':
      return 'de';
    case 'tl':
    case 'fil':
      return 'tl';
    case 'th':
      return 'th';
    case 'vi':
      return 'vi';
    default:
      return null;
  }
}
