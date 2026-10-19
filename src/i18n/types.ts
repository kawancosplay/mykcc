import type en from './locales/en';
import type { LanguageCode } from './languages';

/** Shape of the English dictionary (the typed source of truth). */
export type Dictionary = typeof en;
export type Namespace = keyof Dictionary;
/** Every valid key, e.g. 'common.navForm' or 'registration.formTitle'. */
export type TranslationKey = { [N in Namespace]: `${N}.${Extract<keyof Dictionary[N], string>}` }[Namespace];
/** One namespace of a translated locale: same keys as English, any string values. */
export type LocaleNamespace<N extends Namespace> = { [K in keyof Dictionary[N]]: string };
/** A complete translated locale. */
export type LocaleDictionary = { [N in Namespace]: LocaleNamespace<N> };
/** A locale that may still miss keys (missing keys fall back to English). */
export type PartialLocaleDictionary = { [N in Namespace]?: Partial<LocaleNamespace<N>> };

/** Values for "{name}" placeholders in a translation. */
export type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: TranslationKey, vars?: TranslateVars) => string;

export interface I18nContextValue {
  /** Selected language. */
  lang: LanguageCode;
  /** Switches the language and remembers it (localStorage 'kcc_lang'). */
  setLang: (lang: LanguageCode) => void;
  /** Translates a key; falls back to English, then to the key itself. Replaces "{name}" with vars.name. */
  t: TranslateFn;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  /** Locale tag passed to Intl (jv / jv-Jawa / su / su-Sund fall back to 'id' when the browser lacks them). */
  intlLocale: string;
  formatNumber: (value: number | bigint, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
  /** Localized country / region name for an ISO 3166-1 code (e.g. 'ID'); returns fallback (or the code) if unknown. */
  countryName: (isoCode: string, fallback?: string) => string;
}
