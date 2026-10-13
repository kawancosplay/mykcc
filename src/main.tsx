import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n';
import { getInitialLanguage, getLoadedLocale, loadLocale } from './i18n/runtime';
import { ThemeProvider } from './lib/themeContext.tsx';
// Applies the lite / low-power decision of the inline <head> script to the module state early.
import './lib/perfMode';
import './index.css';

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
