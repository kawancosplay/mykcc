import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gauge, X } from 'lucide-react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n/types';
import { haptic } from '../lib/haptic';
import { usePresenceMotion } from '../lib/motion';
import { markLiteNoticeSeen, setPerfMode, shouldShowLiteNotice, usePerfMode } from '../lib/perfMode';
import type { PerfPreference } from '../lib/perfMode';

/*
 * "Display mode" (lite / low-power mode) controls, src/lib/perfMode.ts:
 * - PerfModeControl: Auto · Lite · Full segmented radiogroup (+ the Auto outcome hint). Used in the Navbar
 *   mobile menu, the desktop language popover and the footer disclosure. Reachable without signing in.
 * - PerfModeFooterButton: "Display mode: Auto" text button that opens the same control inline.
 * - PerfLiteNotice: one-time toast when Auto turned Lite on for this device.
 * Switching applies immediately (html[data-perf] + subscribers), without a reload.
 */

const OPTIONS: ReadonlyArray<{ value: PerfPreference; labelKey: TranslationKey }> = [
  { value: 'auto', labelKey: 'common.perfModeAuto' },
  { value: 'lite', labelKey: 'common.perfModeLite' },
  { value: 'full', labelKey: 'common.perfModeFull' },
];

const LABEL_KEYS: Record<PerfPreference, TranslationKey> = {
  auto: 'common.perfModeAuto',
  lite: 'common.perfModeLite',
  full: 'common.perfModeFull',
};

interface PerfModeControlProps {
  className?: string;
  /** Hide the "Display mode" heading (when the surrounding UI already names it). */
  hideTitle?: boolean;
}

export const PerfModeControl: React.FC<PerfModeControlProps> = ({ className = '', hideTitle = false }) => {
  const { t, dir } = useI18n();
  const perf = usePerfMode();
  const titleId = useId();
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const choose = (value: PerfPreference) => {
    if (value === perf.preference) return;
    haptic('selection');
    setPerfMode(value);
  };

  // Radiogroup keyboard pattern: arrows move (and select) within the group, wrapping around.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    let step = 0;
    if (event.key === forward || event.key === 'ArrowDown') step = 1;
    else if (event.key === backward || event.key === 'ArrowUp') step = -1;
    if (!step) return;
    event.preventDefault();
    const current = OPTIONS.findIndex((o) => o.value === perf.preference);
    const next = (current + step + OPTIONS.length) % OPTIONS.length;
    choose(OPTIONS[next].value);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {!hideTitle && (
        <span id={titleId} className="text-xs font-semibold text-slate-300">
          {t('common.perfModeTitle')}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={hideTitle ? undefined : titleId}
        aria-label={hideTitle ? t('common.perfModeTitle') : undefined}
        onKeyDown={onKeyDown}
        className="glass-segmented glass-segmented-block"
      >
        {OPTIONS.map((option, index) => {
          const active = perf.preference === option.value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => choose(option.value)}
              className={`glass-segment min-w-0 px-2 text-xs ${active ? 'is-active' : ''}`}
            >
              <span className="truncate">{t(option.labelKey)}</span>
            </button>
          );
        })}
      </div>
      {perf.preference === 'auto' && (
        <p className="text-[11px] leading-snug text-slate-400">
          {perf.autoLite ? t('common.perfModeAutoLiteHint') : t('common.perfModeAutoFullHint')}
        </p>
      )}
    </div>
  );
};

/** Footer entry point: "Display mode: Auto" that opens the control inline (found on every screen). */
export const PerfModeFooterButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useI18n();
  const perf = usePerfMode();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="touch-target pressable inline-flex items-center gap-1.5 text-slate-400 hover:text-white"
      >
        <Gauge className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t('common.perfModeFooter', { mode: t(LABEL_KEYS[perf.preference]) })}</span>
      </button>
      {open && (
        <div id={panelId} className="glass-well rounded-2xl p-3 w-full max-w-xs">
          <PerfModeControl hideTitle />
        </div>
      )}
    </div>
  );
};

const NOTICE_AUTO_HIDE_MS = 12000;

/** One-time toast when Auto enabled Lite on this device ("Change" reveals the control in place). */
export const PerfLiteNotice: React.FC = () => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const motionProps = usePresenceMotion('dialog');

  useEffect(() => {
    if (!shouldShowLiteNotice()) return;
    // After the first paint settles, so it never competes with the landing content.
    const showId = window.setTimeout(() => {
      markLiteNoticeSeen();
      setVisible(true);
    }, 1500);
    return () => window.clearTimeout(showId);
  }, []);

  useEffect(() => {
    if (!visible || expanded) return;
    const hideId = window.setTimeout(() => setVisible(false), NOTICE_AUTO_HIDE_MS);
    return () => window.clearTimeout(hideId);
  }, [visible, expanded]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-x-0 bottom-[calc(1rem+var(--safe-bottom))] z-[55] flex justify-center px-4 pointer-events-none">
          <motion.div
            key="perf-lite-notice"
            {...motionProps}
            role="status"
            className={`glass-toast pointer-events-auto ${expanded ? 'flex-col items-stretch rounded-3xl p-4' : ''}`}
          >
            <div className="flex items-start gap-2">
              <Gauge className="w-4 h-4 mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
              <span className="flex-1 min-w-0 font-medium leading-snug">{t('common.perfLiteNotice')}</span>
              {!expanded && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="touch-target shrink-0 font-bold text-rose-300 hover:text-rose-200 px-1"
                >
                  {t('common.perfLiteNoticeAction')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label={t('common.close')}
                className="touch-target shrink-0 inline-flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {expanded && <PerfModeControl className="mt-3" />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
