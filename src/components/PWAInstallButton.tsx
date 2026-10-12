import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Guide open: focus the sheet (no keyboard pops up on iOS), Escape closes, focus returns afterwards.
  useEffect(() => {
    if (!showIOSGuide) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowIOSGuide(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [showIOSGuide]);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="glass-button min-h-11 w-full rounded-xl border-purple-500/30 px-4 py-2 text-xs font-bold text-slate-200 pressable"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        {t('common.pwaInstall')}
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="glass-button min-h-11 w-full rounded-xl border-purple-500/30 px-4 py-2 text-xs font-bold text-slate-200"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {t('common.pwaInstall')}
        </button>

        {/* Portaled to <body>: this button also lives inside the navbar's glass menu, whose
            backdrop-filter would otherwise trap a `position: fixed` sheet inside the menu. */}
        {showIOSGuide &&
          createPortal(
            <>
              <div
                className="glass-overlay animate-fade-in"
                onClick={() => setShowIOSGuide(false)}
                aria-hidden="true"
              />
              <div className="sheet-viewport">
                <div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  tabIndex={-1}
                  className="glass-sheet sm:max-w-sm animate-sheet-up sm:animate-scale-in outline-none"
                >
                  <div className="sheet-grabber" aria-hidden="true" />
                  <div className="glass-scroll px-6 pt-3 pb-6 sm:p-6">
                    <h3 id={titleId} className="text-lg font-semibold text-white">{t('common.pwaIosTitle')}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {withBold(t('common.pwaIosStep1'), 'share', t('common.pwaIosShare'))}<br />
                      {withBold(t('common.pwaIosStep2'), 'addToHome', t('common.pwaIosAddToHome'))}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowIOSGuide(false)}
                      className="btn-primary mt-6 w-full min-h-11 text-sm"
                    >
                      {t('common.close')}
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
      </>
    );
  }

  return null;
};
