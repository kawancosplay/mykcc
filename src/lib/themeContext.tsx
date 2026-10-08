import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export type BackgroundTheme =
  | 'bright-purple-fluent'
  | 'cyber-purple'
  | 'cosmic-dark'
  | 'fluent-lavender'
  | 'dark-onyx'
  | 'custom';

export type FontTheme = 'din-next';

export type ColorTheme = 'purple' | 'rose' | 'indigo' | 'emerald' | 'amber' | 'cyan' | 'custom';

export type LayoutWidth = '7xl' | '6xl' | 'full';
export type CardRadius = 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-lg';
export type NavbarStyle = 'glass-bar' | 'floating-pill' | 'minimal';
export type EmblemType = 'kitsune' | 'crown' | 'sparkle' | 'shield' | 'heart' | 'custom_img';

export interface SiteTheme {
  background: BackgroundTheme;
  customBgGradient?: string;
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
  background: 'bright-purple-fluent',
  customBgGradient: 'linear-gradient(135deg, #2e1065 0%, #1e1145 40%, #3b0764 75%, #4c1d95 100%)',
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

interface ThemeContextType {
  theme: SiteTheme;
  updateTheme: (partial: Partial<SiteTheme>) => void;
  resetTheme: () => void;
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  updateTheme: () => {},
  resetTheme: () => {},
  isEditorOpen: false,
  setIsEditorOpen: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'siteSettings', 'theme'), (doc) => {
      if (doc.exists()) {
        setTheme({ ...DEFAULT_THEME, ...doc.data() } as SiteTheme);
      } else {
        // Initialize if not exists - only if we have permissions
        setDoc(doc.ref, DEFAULT_THEME).catch(e => console.warn('Could not initialize theme, might need admin permissions', e));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Apply font family globally
    const fontFamilies: Record<FontTheme, string> = {
      'din-next': "'DIN Next', sans-serif",
    };

    document.documentElement.style.setProperty(
      '--active-font-family',
      fontFamilies[theme.font]
    );

    // Apply primary color variable
    const colorMap: Record<ColorTheme, string> = {
      purple: '#a855f7',
      rose: '#f43f5e',
      indigo: '#6366f1',
      emerald: '#10b981',
      amber: '#f59e0b',
      cyan: '#06b6d4',
      custom: theme.customPrimaryColor || '#a855f7',
    };

    document.documentElement.style.setProperty('--theme-primary', colorMap[theme.colorScheme] || '#a855f7');
  }, [theme]);

  const updateTheme = async (partial: Partial<SiteTheme>) => {
    const newTheme = {
      ...theme,
      ...partial,
      logo: {
        ...theme.logo,
        ...(partial.logo || {}),
      },
    };
    
    // Save to Firestore
    try {
      await setDoc(doc(db, 'siteSettings', 'theme'), newTheme, { merge: true });
    } catch (error) {
      console.error('Error saving theme to Firestore:', error);
    }
  };

  const resetTheme = () => {
    updateTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        isEditorOpen,
        setIsEditorOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useSiteTheme = () => useContext(ThemeContext);
