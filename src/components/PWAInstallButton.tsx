import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';
import { useI18n } from '../i18n';

// Renders a translated sentence with its "{placeholder}" shown in bold (e.g. the Safari button name).
const withBold = (template: string, placeholder: string, value: string): React.ReactNode => {
  const token = `{${placeholder}}`;
  const index = template.indexOf(token);
  if (index === -1) return template;
  return (
    <>
      {template.slice(0, index)}
      <strong>{value}</strong>
      {template.slice(index + token.length)}
    </>
  );
};

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { t } = useI18n();

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-purple-500 hover:to-rose-500 transition-all"
      >
        <Download className="w-4 h-4" />
        {t('common.pwaInstall')}
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all"
        >
          <Download className="w-4 h-4" />
          {t('common.pwaInstall')}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-2xl border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white">{t('common.pwaIosTitle')}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {withBold(t('common.pwaIosStep1'), 'share', t('common.pwaIosShare'))}<br />
                {withBold(t('common.pwaIosStep2'), 'addToHome', t('common.pwaIosAddToHome'))}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-500"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
