import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n';
import { getInitialLanguage, getLoadedLocale, loadLocale } from './i18n/runtime';
import { ThemeProvider } from './lib/themeContext.tsx';
// Applies the lite / low-power decision of the inline <head> script to the module state early.
import './lib/perfMode';
import './index.css';

// Lock in soft translucent liquid glass defaults
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  root.style.setProperty('--glass-fill-card', 'rgba(255, 255, 255, 0.56)');
  root.style.setProperty('--glass-fill-bar', 'rgba(255, 255, 255, 0.65)');
  root.style.setProperty('--glass-fill-input', 'rgba(255, 255, 255, 0.88)');
  root.style.setProperty('--glass-stroke-card', '1.5px solid rgba(255, 255, 255, 0.82)');
  root.style.setProperty('--glass-blur', '18px');
  root.style.setProperty('--glass-text-title', '#0F172A');
  root.style.setProperty('--glass-text-body', '#1E293B');
  root.style.setProperty('--glass-text-muted', '#475569');
}

// First frame = final frame: English and Indonesian are bundled; any other initial language is loaded
// BEFORE the first render (capped at 1.5 s, then English is shown and the locale swaps in when it
// arrives), so the page never renders twice with text of different lengths (layout shift).
const LOCALE_WAIT_CAP_MS = 1500;

function waitForInitialLocale(): Promise<unknown> {
  const lang = getInitialLanguage();
  if (getLoadedLocale(lang)) return Promise.resolve();
  return Promise.race([
    loadLocale(lang),
    new Promise((resolve) => window.setTimeout(resolve, LOCALE_WAIT_CAP_MS)),
  ]);
}

function render(): void {
  createRoot(document.getElementById('root')!).render(
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  );
}

waitForInitialLocale().then(render, render);

// A new deployment's service worker reloads the page, so a refresh never sticks on the old cached build.
// Not while something is typed into a field (a second tab can trigger this): that page updates on its next load.
void import('virtual:pwa-register').then(({ registerSW }) =>
  registerSW({
    immediate: true,
    onNeedReload() {
      const typed = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]):not([type=range]):not([type=color]), textarea',
      );
      if (![...typed].some((field) => field.value)) window.location.reload();
    },
  }),
);
