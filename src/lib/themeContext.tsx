import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { db, describeFirestoreError } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export type BackgroundTheme =
  | 'deep-lavender-solid'
  | 'lavender-mint-sticker'
  | 'bright-purple-fluent'
  | 'cyber-purple'
  | 'cosmic-dark'
  | 'fluent-lavender'
  | 'dark-onyx'
  | 'custom';

export type GlassPreset = 'clear' | 'thin' | 'regular' | 'thick' | 'adaptive';

// The id is stored in siteSettings/theme and predates the switch to Google Sans Flex.
export type FontTheme = 'din-next';

export type ColorTheme = 'purple' | 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan' | 'custom';

export type LayoutWidth = '7xl' | '6xl' | 'full';
export type CardRadius = 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-lg';
export type NavbarStyle = 'glass-bar' | 'floating-pill' | 'minimal';
export type EmblemType = 'kitsune' | 'crown' | 'sparkle' | 'shield' | 'heart' | 'custom_img';

export interface SiteTheme {
  background: BackgroundTheme;
  customBgGradient?: string;
  glassPreset?: GlassPreset;
  glassBlur?: number;
  lavenderColor?: string;
  mintColor?: string;
  font: FontTheme;
  colorScheme: ColorTheme;
  customPrimaryColor?: string;
  layoutWidth: LayoutWidth;
  cardRadius: CardRadius;
  navbarStyle: NavbarStyle;
  logo: {
    title: string;
    subtitle: string;
    emblemType: EmblemType;
    customLogoUrl?: string;
  };
}

export const DEFAULT_THEME: SiteTheme = {
  background: 'deep-lavender-solid',
  customBgGradient: '#1e1436',
  glassPreset: 'thick',
  glassBlur: 20,
  lavenderColor: '#a855f7',
  mintColor: '#10b981',
  font: 'din-next',
  colorScheme: 'purple',
  customPrimaryColor: '#a855f7',
  layoutWidth: '7xl',
  cardRadius: 'rounded-3xl',
  navbarStyle: 'glass-bar',
  logo: {
    title: 'MyKCC',
    subtitle: '',
    emblemType: 'custom_img',
    customLogoUrl: 'https://iili.io/nE6N8b4.png',
  },
};

const BACKGROUND_GRADIENTS: Record<Exclude<BackgroundTheme, 'custom'>, string> = {
  'deep-lavender-solid': '#1e1436',
  'lavender-mint-sticker': 'linear-gradient(135deg, #1e1436 0%, #2a1b4e 50%, #1e1436 100%)',
  'bright-purple-fluent': '#1e1436',
  'cyber-purple': 'linear-gradient(135deg, #18052e 0%, #3b0764 50%, #064e3b 100%)',
  'cosmic-dark': 'linear-gradient(135deg, #090614 0%, #170d2b 50%, #0c1a17 100%)',
  'fluent-lavender': 'linear-gradient(135deg, #1e1436 0%, #2e1d52 100%)',
  'dark-onyx': '#0a0910',
};

/** The page background gradient of a theme (App writes it to `--app-bg`; painted by `body::before`). */
export function themeBackground(theme: SiteTheme): string {
  if (theme.background === 'custom') return theme.customBgGradient || '#1e1436';
  if (!theme.background || theme.background === 'deep-lavender-solid' || theme.background === 'bright-purple-fluent') {
    return '#1e1436';
  }
  return BACKGROUND_GRADIENTS[theme.background] ?? '#1e1436';
}

// ---------------------------------------------------------------------------------------------
// Local cache: the last theme seen, so the first frame already has the right background (and the
// Firestore snapshot only re-renders when something actually changed). index.html reads `appBg`.
// ---------------------------------------------------------------------------------------------

const THEME_CACHE_KEY = 'kcc_theme_v2';

const BACKGROUNDS: readonly BackgroundTheme[] = ['deep-lavender-solid', 'lavender-mint-sticker', 'bright-purple-fluent', 'cyber-purple', 'cosmic-dark', 'fluent-lavender', 'dark-onyx', 'custom'];
const GLASS_PRESETS: readonly GlassPreset[] = ['clear', 'thin', 'regular', 'thick', 'adaptive'];
const COLORS: readonly ColorTheme[] = ['purple', 'rose', 'indigo', 'emerald', 'amber', 'cyan', 'custom'];
const WIDTHS: readonly LayoutWidth[] = ['7xl', '6xl', 'full'];
const RADII: readonly CardRadius[] = ['rounded-3xl', 'rounded-2xl', 'rounded-xl', 'rounded-lg'];
const NAVBARS: readonly NavbarStyle[] = ['glass-bar', 'floating-pill', 'minimal'];
const EMBLEMS: readonly EmblemType[] = ['kitsune', 'crown', 'sparkle', 'shield', 'heart', 'custom_img'];

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function str(value: unknown, fallback: string | undefined, max = 2000): string | undefined {
  return typeof value === 'string' && value.length <= max ? value : fallback;
}

/** Merges stored data over the defaults, keeping only known keys with valid values. */
function normalizeTheme(raw: unknown): SiteTheme {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const logo = (data.logo && typeof data.logo === 'object' ? data.logo : {}) as Record<string, unknown>;
  return {
    background: pick(data.background, BACKGROUNDS, DEFAULT_THEME.background),
    customBgGradient: str(data.customBgGradient, DEFAULT_THEME.customBgGradient, 400),
    glassPreset: pick(data.glassPreset, GLASS_PRESETS, DEFAULT_THEME.glassPreset || 'regular'),
    glassBlur: typeof data.glassBlur === 'number' && data.glassBlur >= 0 && data.glassBlur <= 30 ? data.glassBlur : DEFAULT_THEME.glassBlur,
    lavenderColor: str(data.lavenderColor, DEFAULT_THEME.lavenderColor, 20),
    mintColor: str(data.mintColor, DEFAULT_THEME.mintColor, 20),
    font: 'din-next',
    colorScheme: pick(data.colorScheme, COLORS, DEFAULT_THEME.colorScheme),
    customPrimaryColor: str(data.customPrimaryColor, DEFAULT_THEME.customPrimaryColor, 40),
    layoutWidth: pick(data.layoutWidth, WIDTHS, DEFAULT_THEME.layoutWidth),
    cardRadius: pick(data.cardRadius, RADII, DEFAULT_THEME.cardRadius),
    navbarStyle: pick(data.navbarStyle, NAVBARS, DEFAULT_THEME.navbarStyle),
    logo: {
      title: str(logo.title, DEFAULT_THEME.logo.title, 120) ?? DEFAULT_THEME.logo.title,
      subtitle: str(logo.subtitle, DEFAULT_THEME.logo.subtitle, 200) ?? '',
      emblemType: pick(logo.emblemType, EMBLEMS, DEFAULT_THEME.logo.emblemType),
      customLogoUrl: str(logo.customLogoUrl, DEFAULT_THEME.logo.customLogoUrl),
    },
  };
}

function readCachedTheme(): SiteTheme | null {
  try {
    const raw = window.localStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { theme?: unknown } | null;
    return parsed && parsed.theme ? normalizeTheme(parsed.theme) : null;
  } catch {
    return null;
  }
}

function writeCachedTheme(theme: SiteTheme): void {
  try {
    window.localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ v: 1, theme, appBg: themeBackground(theme) }));
  } catch {
    // Storage unavailable: the next visit simply starts from the defaults again.
  }
}

/** Runs `fn` once the browser is idle after the first paint (2 s cap), so the theme listen never
 *  competes with first-paint requests. */
function afterFirstPaint(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1200);
  return () => window.clearTimeout(id);
}

interface ThemeContextType {
  theme: SiteTheme;
  updateTheme: (partial: Partial<SiteTheme>) => void;
  resetTheme: () => void;
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
  saveError: string | null; // Last failed site-settings save (e.g. permission denied), shown in the editor
  clearSaveError: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  updateTheme: () => {},
  resetTheme: () => {},
  isEditorOpen: false,
  setIsEditorOpen: () => {},
  saveError: null,
  clearSaveError: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<SiteTheme>(() => readCachedTheme() ?? DEFAULT_THEME);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let disposed = false;
    const cancelIdle = afterFirstPaint(() => {
      if (disposed) return;
      unsub = onSnapshot(
        doc(db, 'siteSettings', 'theme'),
        (snap) => {
          // No saved theme yet: the defaults. Visitors never write on page load; the admin's first save in
          // the Site Editor creates siteSettings/theme (admin-only per rules).
          const next = snap.exists() ? normalizeTheme(snap.data()) : DEFAULT_THEME;
          // Identical snapshot (the usual case thanks to the cache): no state change, no re-render.
          if (JSON.stringify(next) === JSON.stringify(themeRef.current)) {
            writeCachedTheme(next);
            return;
          }
          setTheme(next);
          writeCachedTheme(next);
        },
        (err) => console.warn('Theme subscription note:', err)
      );
    });
    return () => {
      disposed = true;
      cancelIdle();
      unsub?.();
    };
  }, []);

  useEffect(() => {
    // Apply font family globally
    const fontFamilies: Record<FontTheme, string> = {
      'din-next': "'Google Sans Flex', sans-serif",
    };

    document.documentElement.style.setProperty(
      '--active-font-family',
      fontFamilies[theme.font]
    );

    // Apply primary color variable
    const colorMap: Record<ColorTheme, string> = {
      purple: '#8c52ff',
      rose: '#f43f5e',
      indigo: '#6366f1',
      emerald: '#10b981',
      amber: '#f59e0b',
      cyan: '#06b6d4',
      custom: theme.customPrimaryColor || '#8c52ff',
    };

    document.documentElement.style.setProperty('--theme-primary', colorMap[theme.colorScheme] || '#8c52ff');

    // Apply live glass blur and pastel colors if customized
    const blurPx = typeof theme.glassBlur === 'number' ? theme.glassBlur : 12;
    document.documentElement.style.setProperty('--glass-blur', `${blurPx}px`);
    if (theme.lavenderColor) {
      document.documentElement.style.setProperty('--kcc-lavender', theme.lavenderColor);
    }
    if (theme.mintColor) {
      document.documentElement.style.setProperty('--kcc-mint', theme.mintColor);
    }
  }, [theme]);

  const updateTheme = useCallback(async (partial: Partial<SiteTheme>) => {
    const current = themeRef.current;
    const newTheme = {
      ...current,
      ...partial,
      logo: {
        ...current.logo,
        ...(partial.logo || {}),
      },
    };

    // Save to Firestore (admin only per rules; failures are surfaced in the Site Editor)
    try {
      await setDoc(doc(db, 'siteSettings', 'theme'), newTheme, { merge: true });
      setSaveError(null);
    } catch (error) {
      console.error('Error saving theme to Firestore:', error);
      setSaveError(describeFirestoreError(error, true));
    }
  }, []);

  const resetTheme = useCallback(() => {
    updateTheme(DEFAULT_THEME);
  }, [updateTheme]);

  const clearSaveError = useCallback(() => setSaveError(null), []);

  const value = useMemo<ThemeContextType>(
    () => ({ theme, updateTheme, resetTheme, isEditorOpen, setIsEditorOpen, saveError, clearSaveError }),
    [theme, updateTheme, resetTheme, isEditorOpen, saveError, clearSaveError]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useSiteTheme = () => useContext(ThemeContext);
