// Framework-free i18n runtime: locale loading/cache, key lookup, interpolation, Intl helpers and fonts.
// React code uses useI18n() (I18nProvider.tsx); src/lib code uses translate().
import en from './locales/en';
import { DEFAULT_LANGUAGE, getLanguageMeta, googleFontHref, isLanguageCode, matchLanguageTag } from './languages';
import type { LanguageCode } from './languages';
import type { PartialLocaleDictionary, TranslationKey, TranslateVars } from './types';

export const LANGUAGE_STORAGE_KEY = 'kcc_lang';

type LocaleModule = { default: PartialLocaleDictionary };

// Every locale except English (bundled statically as the fallback) is its own lazily loaded chunk.
const localeModules = import.meta.glob<LocaleModule>(['./locales/*/index.ts', '!./locales/en/index.ts']);

const localeLoaders: Partial<Record<LanguageCode, () => Promise<LocaleModule>>> = {};
for (const [path, loader] of Object.entries(localeModules)) {
  const code = path.split('/')[2]; // './locales/<code>/index.ts'
  if (isLanguageCode(code)) localeLoaders[code] = loader;
}

const loadedLocales: Partial<Record<LanguageCode, PartialLocaleDictionary>> = {};
const pendingLocales: Partial<Record<LanguageCode, Promise<PartialLocaleDictionary | null>>> = {};

/** The dictionary of a language if it is already available (English always is), else null. */
export function getLoadedLocale(lang: LanguageCode): PartialLocaleDictionary | null {
  if (lang === DEFAULT_LANGUAGE) return en;
  return loadedLocales[lang] ?? null;
}

/** Loads (once) the dictionary chunk of a language. Resolves null if it could not be loaded (English is used). */
export function loadLocale(lang: LanguageCode): Promise<PartialLocaleDictionary | null> {
  const loaded = getLoadedLocale(lang);
  if (loaded) return Promise.resolve(loaded);
  const pending = pendingLocales[lang];
  if (pending) return pending;
  const loader = localeLoaders[lang];
  if (!loader) return Promise.resolve(null);

  const promise = loader()
    .then((mod) => {
      loadedLocales[lang] = mod.default;
      return mod.default;
    })
    .catch((err: unknown) => {
      console.warn(`[i18n] Could not load the "${lang}" translations; showing English.`, err);
      return null;
    })
    .finally(() => {
      delete pendingLocales[lang]; // a failed load can be retried by selecting the language again
    });
  pendingLocales[lang] = promise;
  return promise;
}

function lookup(dict: PartialLocaleDictionary | null, key: string): string | undefined {
  if (!dict) return undefined;
  const dot = key.indexOf('.');
  if (dot <= 0) return undefined;
  const namespace = (dict as unknown as Record<string, Record<string, unknown> | undefined>)[key.slice(0, dot)];
  const value = namespace?.[key.slice(dot + 1)];
  return typeof value === 'string' ? value : undefined;
}

/** Replaces "{name}" placeholders with vars.name; unknown placeholders are left as they are. */
export function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

/** Looks a key up in a dictionary, falling back to English and then to the key itself. */
export function translateWith(dict: PartialLocaleDictionary | null, key: TranslationKey, vars?: TranslateVars): string {
  return interpolate(lookup(dict, key) ?? lookup(en, key) ?? key, vars);
}

// Language currently selected in the I18nProvider, for non-React callers.
let activeLanguage: LanguageCode = DEFAULT_LANGUAGE;

export function getActiveLanguage(): LanguageCode {
  return activeLanguage;
}

export function setActiveLanguage(lang: LanguageCode): void {
  activeLanguage = lang;
}

/**
 * Non-React translation (e.g. describeFirestoreError in src/lib): uses the language selected in the
 * I18nProvider and its loaded dictionary; English while that dictionary is still loading.
 */
export function translate(key: TranslationKey, vars?: TranslateVars): string {
  return translateWith(getLoadedLocale(activeLanguage), key, vars);
}

// ---- Initial language -------------------------------------------------------------------------

export function readStoredLanguage(): LanguageCode | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeLanguage(lang: LanguageCode): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode, blocked site data): the choice lasts for this visit only.
  }
}

export function detectBrowserLanguage(): LanguageCode | null {
  if (typeof navigator === 'undefined') return null;
  const tags = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const match = matchLanguageTag(tag);
    if (match) return match;
  }
  return null;
}

/** Saved choice, else the browser language, else English. */
export function getInitialLanguage(): LanguageCode {
  return readStoredLanguage() ?? detectBrowserLanguage() ?? DEFAULT_LANGUAGE;
}

// ---- Intl helpers -----------------------------------------------------------------------------

// Javanese / Sundanese are missing from many browsers' Intl data; Indonesian formats are the closest match.
const INTL_FALLBACK_LOCALE: Partial<Record<LanguageCode, string>> = {
  jv: 'id',
  'jv-Jawa': 'id',
  su: 'id',
  'su-Sund': 'id',
};
const intlLocaleCache = new Map<LanguageCode, string>();

export function getIntlLocale(lang: LanguageCode): string {
  const cached = intlLocaleCache.get(lang);
  if (cached) return cached;
  let resolved: string = lang;
  const fallback = INTL_FALLBACK_LOCALE[lang];
  if (fallback) {
    try {
      const supported =
        Intl.DateTimeFormat.supportedLocalesOf([lang]).length > 0 &&
        Intl.NumberFormat.supportedLocalesOf([lang]).length > 0;
      if (!supported) resolved = fallback;
    } catch {
      resolved = fallback;
    }
  }
  intlLocaleCache.set(lang, resolved);
  return resolved;
}

export function formatNumberIn(locale: string, value: number | bigint, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

export function formatDateIn(
  locale: string,
  value: Date | number | string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '';
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const regionNamesCache = new Map<string, Intl.DisplayNames | null>();

export function countryNameIn(locale: string, isoCode: string, fallback?: string): string {
  const code = (isoCode || '').trim().toUpperCase();
  if (!code) return fallback ?? '';
  let regionNames = regionNamesCache.get(locale);
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames([locale, 'en'], { type: 'region', fallback: 'none' });
    } catch {
      regionNames = null;
    }
    regionNamesCache.set(locale, regionNames);
  }
  try {
    const name = regionNames?.of(code);
    if (name && name !== code) return name;
  } catch {
    // Not a valid region code (RangeError): use the fallback below.
  }
  return fallback ?? code;
}

// ---- Script fonts -----------------------------------------------------------------------------

/** Adds the Google Fonts stylesheet a language needs (one <link> per family, created once). */
export function ensureLanguageFont(lang: LanguageCode): void {
  if (typeof document === 'undefined') return;
  const font = getLanguageMeta(lang).font;
  if (!font) return;
  const existing = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[data-i18n-font]')).some(
    (link) => link.dataset.i18nFont === font.family
  );
  if (existing) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = googleFontHref(font);
  link.dataset.i18nFont = font.family;
  document.head.appendChild(link);
}

/**
 * index.css renders all text with `var(--font-din)` (marked !important), so a web font is only used if it is
 * part of that stack: append the language font after DIN Next (Latin keeps DIN, the script uses the Noto font).
 */
export function applyLanguageFontStack(lang: LanguageCode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const font = getLanguageMeta(lang).font;
  if (font) {
    root.style.setProperty('--font-din', `'DIN Next', '${font.family}', sans-serif`);
  } else {
    root.style.removeProperty('--font-din');
  }
}
