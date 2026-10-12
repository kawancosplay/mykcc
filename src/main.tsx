import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './lib/themeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </I18nProvider>
);
