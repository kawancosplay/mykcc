import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLanguageMeta, isLanguageCode } from './languages';
import type { LanguageCode } from './languages';
import {
  applyLanguageFontStack,
  countryNameIn,
  ensureLanguageFont,
  formatDateIn,
  formatNumberIn,
  getInitialLanguage,
  getIntlLocale,
  getLoadedLocale,
  loadLocale,
  setActiveLanguage,
  storeLanguage,
  translateWith,
} from './runtime';
import type { I18nContextValue, TranslateFn } from './types';

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>(getInitialLanguage);
  // Bumped when a locale chunk finishes loading so the new dictionary is picked up.
  const [, setLoadedCount] = useState(0);

  // Kept in sync during render so non-React callers (translate()) use the same language as this render.
  setActiveLanguage(lang);

  // English is used while the selected locale is still loading (or if it failed to load).
  const dictionary = getLoadedLocale(lang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = getLanguageMeta(lang).isRtl ? 'rtl' : 'ltr';
    ensureLanguageFont(lang);
    applyLanguageFontStack(lang);

    if (getLoadedLocale(lang)) return;
    let cancelled = false;
    loadLocale(lang).then(() => {
      if (!cancelled) setLoadedCount((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((next: LanguageCode) => {
    if (!isLanguageCode(next)) return;
    storeLanguage(next);
    setLangState(next);
    void loadLocale(next); // start fetching the chunk right away (deduplicated with the effect above)
  }, []);

  const t = useCallback<TranslateFn>((key, vars) => translateWith(dictionary, key, vars), [dictionary]);

  const value = useMemo<I18nContextValue>(() => {
    const isRtl = !!getLanguageMeta(lang).isRtl;
    const intlLocale = getIntlLocale(lang);
    return {
      lang,
      setLang,
      t,
      dir: isRtl ? 'rtl' : 'ltr',
      isRtl,
      intlLocale,
      formatNumber: (num, options) => formatNumberIn(intlLocale, num, options),
      formatDate: (date, options) => formatDateIn(intlLocale, date, options),
      countryName: (isoCode, fallback) => countryNameIn(intlLocale, isoCode, fallback),
    };
  }, [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n() must be used inside <I18nProvider> (see src/main.tsx).');
  }
  return context;
}
