import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { db, describeFirestoreError } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export type BackgroundTheme =
  | 'lavender-mint-sticker'
  | 'lavender-poster'
  | 'mint-breeze'
  | 'sakura-otaku'
  | 'ios-dark-glass'
  | 'bright-purple-fluent'
  | 'cyber-purple'
  | 'cosmic-dark'
  | 'fluent-lavender'
  | 'dark-onyx'
  | 'deep-lavender-solid'
  | 'custom';

export type GlassPreset = 'clear' | 'thin' | 'regular' | 'thick' | 'adaptive';
export type PerfTier = 'auto' | 'high' | 'fast';
export type LayoutWidth = '5xl' | '6xl' | '7xl' | 'full';
export type CardRadius = 'rounded-4xl' | 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-lg';
export type CardDensity = 'compact' | 'normal' | 'spacious';
export type NavbarStyle = 'glass-bar' | 'floating-pill' | 'minimal';
export type SurfaceMode = 'light' | 'dark';
export type ButtonStyle = 'solid' | 'gradient' | 'outline';
export type FontFamily = 'Plus Jakarta Sans' | 'Inter' | 'Nunito' | 'Poppins' | 'Space Grotesk' | 'din-next';
export type HeadingStyle = 'clean' | 'sticker' | 'gradient';
export type FontScale = '95' | '100' | '105';
export type GridType = 'lines' | 'dots';
export type GradientAngle = '135deg' | '180deg' | '90deg' | 'radial';
export type ColorTheme = 'purple' | 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan' | 'custom';
export type EmblemType = 'kitsune' | 'crown' | 'sparkle' | 'shield' | 'heart' | 'custom_img';

export interface SiteTheme {
  background: BackgroundTheme;
  customBgGradient?: string;
  bgGradientStop1?: string;
  bgGradientStop2?: string;
  bgGradientStop3?: string;
  bgGradientAngle?: GradientAngle;

  // QuickLiquid Glass Engine
  glassPreset: GlassPreset;
  glassBlur: number;
  cardFrostOpacity: number; // 45% - 98%
  specularRim: boolean;
  perfTier: PerfTier;

  // Layout & Density
  layoutWidth: LayoutWidth;
  navbarStyle: NavbarStyle;
  cardRadius: CardRadius;
  cardDensity: CardDensity;

  // Grid
  gridEnabled: boolean;
  gridType: GridType;
  gridOpacity: number; // 0 - 25 (%)

  // Surface & Colors
  surfaceMode: SurfaceMode;
  colorScheme: ColorTheme;
  customPrimaryColor?: string;
  primaryAccentColor?: string;
  secondaryAccentColor?: string;
  buttonStyle: ButtonStyle;
  lavenderColor?: string;
  mintColor?: string;

  // Typography
  font: FontFamily;
  headingStyle: HeadingStyle;
  fontScale: FontScale;

  // Brand & Section Visibility Toggles
  showOfficialBanner: boolean;
  showRegistrationIntro: boolean;
  showWhatsAppHotline: boolean;
  showMemberStats: boolean;
  registrationOpen: boolean;

  logo: {
    title: string;
    subtitle: string;
    emblemType: EmblemType;
    customLogoUrl?: string;
  };
}

export const DEFAULT_THEME: SiteTheme = {
  background: 'lavender-mint-sticker',
  customBgGradient: 'linear-gradient(135deg, #B18CFE 0%, #93C5FD 50%, #6EE7B7 100%)',
  bgGradientStop1: '#B18CFE',
  bgGradientStop2: '#93C5FD',
  bgGradientStop3: '#6EE7B7',
  bgGradientAngle: '135deg',

  glassPreset: 'regular',
  glassBlur: 18,
  cardFrostOpacity: 56,
  specularRim: true,
  perfTier: 'auto',

  layoutWidth: '7xl',
  navbarStyle: 'glass-bar',
  cardRadius: 'rounded-3xl',
  cardDensity: 'normal',

  gridEnabled: true,
  gridType: 'lines',
  gridOpacity: 7,

  surfaceMode: 'light',
  colorScheme: 'purple',
  customPrimaryColor: '#7C3AED',
  primaryAccentColor: '#7C3AED',
  secondaryAccentColor: '#10B981',
  buttonStyle: 'gradient',
  lavenderColor: '#B18CFE',
  mintColor: '#6EE7B7',

  font: 'Plus Jakarta Sans',
  headingStyle: 'clean',
  fontScale: '100',

  showOfficialBanner: true,
  showRegistrationIntro: true,
  showWhatsAppHotline: false,
  showMemberStats: true,
  registrationOpen: true,

  logo: {
    title: 'MyKCC',
    subtitle: '',
    emblemType: 'custom_img',
    customLogoUrl: 'https://iili.io/nE6N8b4.png',
  },
};

const BACKGROUND_GRADIENTS: Record<Exclude<BackgroundTheme, 'custom'>, string> = {
  'lavender-mint-sticker': 'linear-gradient(135deg, #B18CFE 0%, #93C5FD 50%, #6EE7B7 100%)',
  'lavender-poster': 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #818CF8 100%)',
  'mint-breeze': 'linear-gradient(135deg, #6EE7B7 0%, #34D399 50%, #059669 100%)',
  'sakura-otaku': 'linear-gradient(135deg, #FBCFE8 0%, #F472B6 50%, #FB7185 100%)',
  'ios-dark-glass': 'linear-gradient(135deg, #0B0A10 0%, #171523 50%, #1A162B 100%)',
  'bright-purple-fluent': 'linear-gradient(135deg, #9333EA 0%, #3B82F6 50%, #10B981 100%)',
  'cyber-purple': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #10B981 100%)',
  'cosmic-dark': 'linear-gradient(135deg, #090614 0%, #170d2b 50%, #0c1a17 100%)',
  'fluent-lavender': 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #6EE7B7 100%)',
  'dark-onyx': '#0a0910',
  'deep-lavender-solid': 'linear-gradient(135deg, #1e1436 0%, #2a1b4e 100%)',
};

/** The page background gradient of a theme (App writes it to `--app-bg`; painted by `body::before`). */
export function themeBackground(theme: SiteTheme): string {
  if (theme.background === 'custom') {
    if (theme.bgGradientStop1 && theme.bgGradientStop2 && theme.bgGradientStop3) {
      const angle = theme.bgGradientAngle || '135deg';
      return angle === 'radial'
        ? `radial-gradient(circle, ${theme.bgGradientStop1} 0%, ${theme.bgGradientStop2} 50%, ${theme.bgGradientStop3} 100%)`
        : `linear-gradient(${angle}, ${theme.bgGradientStop1} 0%, ${theme.bgGradientStop2} 50%, ${theme.bgGradientStop3} 100%)`;
    }
    return theme.customBgGradient || BACKGROUND_GRADIENTS['lavender-mint-sticker'];
  }
  return BACKGROUND_GRADIENTS[theme.background] ?? BACKGROUND_GRADIENTS['lavender-mint-sticker'];
}

const THEME_CACHE_KEY = 'kcc_theme_v4';

const BACKGROUNDS: readonly BackgroundTheme[] = [
  'lavender-mint-sticker',
  'lavender-poster',
  'mint-breeze',
  'sakura-otaku',
  'ios-dark-glass',
  'bright-purple-fluent',
  'cyber-purple',
  'cosmic-dark',
  'fluent-lavender',
  'dark-onyx',
  'deep-lavender-solid',
  'custom',
];
const GLASS_PRESETS: readonly GlassPreset[] = ['clear', 'thin', 'regular', 'thick', 'adaptive'];
const PERF_TIERS: readonly PerfTier[] = ['auto', 'high', 'fast'];
const COLORS: readonly ColorTheme[] = ['purple', 'rose', 'indigo', 'emerald', 'amber', 'cyan', 'custom'];
const WIDTHS: readonly LayoutWidth[] = ['5xl', '6xl', '7xl', 'full'];
const RADII: readonly CardRadius[] = ['rounded-4xl', 'rounded-3xl', 'rounded-2xl', 'rounded-xl', 'rounded-lg'];
const DENSITIES: readonly CardDensity[] = ['compact', 'normal', 'spacious'];
const NAVBARS: readonly NavbarStyle[] = ['glass-bar', 'floating-pill', 'minimal'];
const SURFACE_MODES: readonly SurfaceMode[] = ['light', 'dark'];
const BUTTON_STYLES: readonly ButtonStyle[] = ['solid', 'gradient', 'outline'];
const FONTS: readonly FontFamily[] = ['Plus Jakarta Sans', 'Inter', 'Nunito', 'Poppins', 'Space Grotesk', 'din-next'];
const HEADING_STYLES: readonly HeadingStyle[] = ['clean', 'sticker', 'gradient'];
const FONT_SCALES: readonly FontScale[] = ['95', '100', '105'];
const GRID_TYPES: readonly GridType[] = ['lines', 'dots'];
const GRADIENT_ANGLES: readonly GradientAngle[] = ['135deg', '180deg', '90deg', 'radial'];
const EMBLEMS: readonly EmblemType[] = ['kitsune', 'crown', 'sparkle', 'shield', 'heart', 'custom_img'];

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function str(value: unknown, fallback: string | undefined, max = 2000): string | undefined {
  return typeof value === 'string' && value.length <= max ? value : fallback;
}

function num(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Merges stored data over the defaults, keeping only known keys with valid values. */
function normalizeTheme(raw: unknown): SiteTheme {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const logo = (data.logo && typeof data.logo === 'object' ? data.logo : {}) as Record<string, unknown>;
  return {
    background: pick(data.background, BACKGROUNDS, DEFAULT_THEME.background),
    customBgGradient: str(data.customBgGradient, DEFAULT_THEME.customBgGradient, 400),
    bgGradientStop1: str(data.bgGradientStop1, DEFAULT_THEME.bgGradientStop1, 20),
    bgGradientStop2: str(data.bgGradientStop2, DEFAULT_THEME.bgGradientStop2, 20),
    bgGradientStop3: str(data.bgGradientStop3, DEFAULT_THEME.bgGradientStop3, 20),
    bgGradientAngle: pick(data.bgGradientAngle, GRADIENT_ANGLES, DEFAULT_THEME.bgGradientAngle || '135deg'),

    glassPreset: pick(data.glassPreset, GLASS_PRESETS, DEFAULT_THEME.glassPreset),
    glassBlur: num(data.glassBlur, 0, 32, DEFAULT_THEME.glassBlur),
    cardFrostOpacity: num(data.cardFrostOpacity, 45, 98, DEFAULT_THEME.cardFrostOpacity),
    specularRim: bool(data.specularRim, DEFAULT_THEME.specularRim),
    perfTier: pick(data.perfTier, PERF_TIERS, DEFAULT_THEME.perfTier),

    layoutWidth: pick(data.layoutWidth, WIDTHS, DEFAULT_THEME.layoutWidth),
    navbarStyle: pick(data.navbarStyle, NAVBARS, DEFAULT_THEME.navbarStyle),
    cardRadius: pick(data.cardRadius, RADII, DEFAULT_THEME.cardRadius),
    cardDensity: pick(data.cardDensity, DENSITIES, DEFAULT_THEME.cardDensity),

    gridEnabled: bool(data.gridEnabled, DEFAULT_THEME.gridEnabled),
    gridType: pick(data.gridType, GRID_TYPES, DEFAULT_THEME.gridType),
    gridOpacity: num(data.gridOpacity, 0, 25, DEFAULT_THEME.gridOpacity),

    surfaceMode: pick(data.surfaceMode, SURFACE_MODES, DEFAULT_THEME.surfaceMode),
    colorScheme: pick(data.colorScheme, COLORS, DEFAULT_THEME.colorScheme),
    customPrimaryColor: str(data.customPrimaryColor, DEFAULT_THEME.customPrimaryColor, 40),
    primaryAccentColor: str(data.primaryAccentColor, DEFAULT_THEME.primaryAccentColor, 40),
    secondaryAccentColor: str(data.secondaryAccentColor, DEFAULT_THEME.secondaryAccentColor, 40),
    buttonStyle: pick(data.buttonStyle, BUTTON_STYLES, DEFAULT_THEME.buttonStyle),
    lavenderColor: str(data.lavenderColor, DEFAULT_THEME.lavenderColor, 20),
    mintColor: str(data.mintColor, DEFAULT_THEME.mintColor, 20),

    font: pick(data.font, FONTS, DEFAULT_THEME.font),
    headingStyle: pick(data.headingStyle, HEADING_STYLES, DEFAULT_THEME.headingStyle),
    fontScale: pick(data.fontScale, FONT_SCALES, DEFAULT_THEME.fontScale),

    showOfficialBanner: bool(data.showOfficialBanner, DEFAULT_THEME.showOfficialBanner),
    showRegistrationIntro: bool(data.showRegistrationIntro, DEFAULT_THEME.showRegistrationIntro),
    showWhatsAppHotline: bool(data.showWhatsAppHotline, DEFAULT_THEME.showWhatsAppHotline),
    showMemberStats: bool(data.showMemberStats, DEFAULT_THEME.showMemberStats),
    registrationOpen: bool(data.registrationOpen, DEFAULT_THEME.registrationOpen),

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
    window.localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ v: 2, theme, appBg: themeBackground(theme) }));
  } catch {
    // Storage unavailable: fallback to defaults
  }
}

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
  saveError: string | null;
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
          const next = snap.exists() ? normalizeTheme(snap.data()) : DEFAULT_THEME;
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
    // 1. Font Family & Scale
    const fontFamilies: Record<FontFamily, string> = {
      'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
      'Inter': "'Inter', sans-serif",
      'Nunito': "'Nunito', sans-serif",
      'Poppins': "'Poppins', sans-serif",
      'Space Grotesk': "'Space Grotesk', sans-serif",
      'din-next': "'Google Sans Flex', sans-serif",
    };
    document.documentElement.style.setProperty('--active-font-family', fontFamilies[theme.font] || "'Plus Jakarta Sans', sans-serif");
    document.documentElement.style.fontSize = theme.fontScale === '95' ? '95%' : theme.fontScale === '105' ? '105%' : '100%';

    // 2. Primary & Secondary Accent Colors
    const primary = theme.primaryAccentColor || theme.customPrimaryColor || '#7C3AED';
    document.documentElement.style.setProperty('--theme-primary', primary);
    const secondary = theme.secondaryAccentColor || theme.mintColor || '#10B981';
    document.documentElement.style.setProperty('--theme-secondary', secondary);

    if (theme.lavenderColor) {
      document.documentElement.style.setProperty('--kcc-lavender', theme.lavenderColor);
    }
    if (theme.mintColor) {
      document.documentElement.style.setProperty('--kcc-mint', theme.mintColor);
    }

    // 3. QuickLiquid Blur & Frost Opacity
    const blurPx = typeof theme.glassBlur === 'number' ? theme.glassBlur : 18;
    document.documentElement.style.setProperty('--glass-blur', `${blurPx}px`);

    const frostPercent = typeof theme.cardFrostOpacity === 'number' ? theme.cardFrostOpacity : 56;
    const frostAlpha = (frostPercent / 100).toFixed(2);

    // 4. Surface Mode & Safe Contrast
    const isDark = theme.surfaceMode === 'dark';
    document.documentElement.setAttribute('data-surface-mode', isDark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    if (isDark) {
      document.documentElement.style.setProperty('--glass-text-title', '#F8FAFC');
      document.documentElement.style.setProperty('--glass-text-body', '#CBD5E1');
      document.documentElement.style.setProperty('--glass-text-muted', '#94A3B8');
      document.documentElement.style.setProperty('--glass-fill-card', `rgba(15, 23, 42, ${frostAlpha})`);
      document.documentElement.style.setProperty('--glass-fill-bar', 'rgba(15, 23, 42, 0.85)');
      document.documentElement.style.setProperty('--glass-fill-input', 'rgba(30, 41, 59, 0.85)');
      document.documentElement.style.setProperty('--glass-stroke-card', '1.5px solid rgba(255, 255, 255, 0.15)');
    } else {
      document.documentElement.style.setProperty('--glass-text-title', '#0F172A');
      document.documentElement.style.setProperty('--glass-text-body', '#1E293B');
      document.documentElement.style.setProperty('--glass-text-muted', '#475569');
      document.documentElement.style.setProperty('--glass-fill-card', `rgba(255, 255, 255, ${frostAlpha})`);
      document.documentElement.style.setProperty('--glass-fill-bar', 'rgba(255, 255, 255, 0.65)');
      document.documentElement.style.setProperty('--glass-fill-input', 'rgba(255, 255, 255, 0.88)');
      document.documentElement.style.setProperty('--glass-stroke-card', '1.5px solid rgba(255, 255, 255, 0.82)');
    }

    // 5. Grid Pattern
    document.documentElement.style.setProperty('--grid-opacity', theme.gridEnabled ? `${(theme.gridOpacity ?? 7) / 100}` : '0');
    document.body.setAttribute('data-grid-type', theme.gridType || 'lines');
  }, [theme]);

  const updateTheme = useCallback(async (partial: Partial<SiteTheme>) => {
    const current = themeRef.current;
    const newTheme: SiteTheme = {
      ...current,
      ...partial,
      logo: {
        ...current.logo,
        ...(partial.logo || {}),
      },
    };

    // Save to Firestore (merge: true)
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
