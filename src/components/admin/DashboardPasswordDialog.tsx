/**
 * MAIN ACCOUNT ONLY: set / change / remove the shared dashboard lock password, or reset it after a Google
 * re-authentication ("forgot"). Hashing (PBKDF2-SHA256, ~1 s on a low-end phone) happens in dashboardLock;
 * the password never leaves the browser. Inputs are cleared whenever the sheet closes.
 */
import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import {
  DASHBOARD_LOCK_MIN_LENGTH,
  clearDashboardPassword,
  reauthenticateMainAccount,
  setDashboardPassword,
} from '../../lib/dashboardLock';
import { isPopupBlockedError, isPopupCancelledError } from '../../lib/googleAuth';
import { describeFirestoreError, warmAuthPopup } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import { AdminSheet, OFFICIAL_ADMIN_EMAIL, Spinner } from './adminUi';

export type DashboardPasswordMode = 'set' | 'change' | 'remove' | 'forgot';

export interface DashboardPasswordDialogProps {
  mode: DashboardPasswordMode;
  open: boolean;
  onClose: () => void;
  /** After a successful write; the gate re-fetches the lock record ('saved' also unlocks this tab). */
  onDone: (result: 'saved' | 'removed') => void;
}

const TITLE_KEYS: Record<DashboardPasswordMode, TranslationKey> = {
  set: 'admin.lockDialogSetTitle',
  change: 'admin.lockDialogChangeTitle',
  remove: 'admin.lockDialogRemoveTitle',
  forgot: 'admin.lockDialogForgotTitle',
};

export const DashboardPasswordDialog: React.FC<DashboardPasswordDialogProps> = ({ mode, open, onClose, onDone }) => {
  const { t } = useI18n();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [reauthed, setReauthed] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [nextError, setNextError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fresh, empty form every time the sheet opens or closes (never keep a typed password around)
  useEffect(() => {
    setCurrent('');
    setNext('');
    setRepeat('');
    setBusy(false);
    setReauthed(false);
    setCurrentError(null);
    setNextError(null);
    setFormError(null);
  }, [open, mode]);

  // The Google popup must open straight from the tap: load its resolver ahead of time
  useEffect(() => {
    if (open && mode === 'forgot') warmAuthPopup();
  }, [open, mode]);

  const wrongPasswordText = t('errors.lockWrongPassword');

  const validateNew = (): boolean => {
    if (next.length < DASHBOARD_LOCK_MIN_LENGTH) {
      setNextError(t('admin.lockTooShort', { min: DASHBOARD_LOCK_MIN_LENGTH }));
      return false;
    }
    if (next !== repeat) {
      setNextError(t('admin.lockMismatch'));
      return false;
    }
    return true;
  };

  const showError = (error: unknown) => {
    const message = describeFirestoreError(error);
    if (message === wrongPasswordText) setCurrentError(message);
    else setFormError(message);
    haptic('error');
  };

  const handleReauth = async () => {
    if (busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await reauthenticateMainAccount();
      setReauthed(true);
      haptic('success');
    } catch (error) {
      if (isPopupCancelledError(error)) {
        // Popup closed: stay on step 1 silently
      } else if (isPopupBlockedError(error)) {
        setFormError(t('auth.popupBlockedTapAgain'));
        haptic('error');
      } else {
        console.error('Main account re-authentication failed:', error);
        showError(error);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setCurrentError(null);
    setNextError(null);
    setFormError(null);

    if (mode === 'remove') {
      if (!current) {
        setCurrentError(wrongPasswordText);
        return;
      }
      if (!window.confirm(t('admin.lockRemoveConfirm'))) return;
      setBusy(true);
      try {
        await clearDashboardPassword({ currentPassword: current });
        haptic('success');
        setCurrent('');
        onDone('removed');
        onClose();
      } catch (error) {
        console.error('Removing the dashboard lock failed:', error);
        showError(error);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'forgot' && !reauthed) return;
    if (!validateNew()) {
      haptic('error');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'set') await setDashboardPassword(next);
      else if (mode === 'change') await setDashboardPassword(next, { currentPassword: current });
      else await setDashboardPassword(next, { reauthenticated: true });
      haptic('success');
      setCurrent('');
      setNext('');
      setRepeat('');
      onDone('saved');
      onClose();
    } catch (error) {
      console.error('Saving the dashboard password failed:', error);
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-3 liquid-glass-input rounded-xl text-base text-white disabled:opacity-60';
  const labelClass = 'block text-xs font-bold text-slate-300 mb-1.5';

  const showCurrent = mode === 'change' || mode === 'remove';
  const showNew = mode === 'set' || mode === 'change' || (mode === 'forgot' && reauthed);

  return (
    <AdminSheet open={open} onClose={onClose} title={t(TITLE_KEYS[mode])} closeDisabled={busy}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('admin.lockConvenienceNote')}</span>
        </p>

        {mode === 'forgot' && !reauthed && (
          <div className="glass-well rounded-2xl p-4 space-y-3">
            <p className="text-sm text-slate-200 leading-relaxed">
              {t('admin.lockForgotDesc', { email: OFFICIAL_ADMIN_EMAIL })}
            </p>
            <button
              type="button"
              onClick={() => void handleReauth()}
              disabled={busy}
              className="btn-primary pressable w-full px-4 text-sm pointer-coarse:min-h-11"
            >
              {busy ? <Spinner /> : <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{t('admin.lockReauthButton')}</span>
            </button>
          </div>
        )}

        {showCurrent && (
          <div>
            <label htmlFor="dash-lock-current" className={labelClass}>
              {t('admin.lockCurrentPassword')}
            </label>
            <input
              id="dash-lock-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              disabled={busy}
              aria-invalid={currentError ? true : undefined}
              aria-describedby={currentError ? 'dash-lock-current-error' : undefined}
              className={inputClass}
            />
            {currentError && (
              <p id="dash-lock-current-error" role="alert" className="mt-1.5 text-xs text-rose-300">
                {currentError}
              </p>
            )}
          </div>
        )}

        {showNew && (
          <>
            <div>
              <label htmlFor="dash-lock-new" className={labelClass}>
                {t('admin.lockNewPassword')}
              </label>
              <input
                id="dash-lock-new"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                disabled={busy}
                minLength={DASHBOARD_LOCK_MIN_LENGTH}
                aria-invalid={nextError ? true : undefined}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-slate-500">{t('admin.lockTooShort', { min: DASHBOARD_LOCK_MIN_LENGTH })}</p>
            </div>
            <div>
              <label htmlFor="dash-lock-repeat" className={labelClass}>
                {t('admin.lockConfirmPassword')}
              </label>
              <input
                id="dash-lock-repeat"
                type="password"
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                disabled={busy}
                aria-invalid={nextError ? true : undefined}
                aria-describedby={nextError ? 'dash-lock-new-error' : undefined}
                className={inputClass}
              />
              {nextError && (
                <p id="dash-lock-new-error" role="alert" className="mt-1.5 text-xs text-rose-300">
                  {nextError}
                </p>
              )}
            </div>
          </>
        )}

        {formError && (
          <p role="alert" className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 break-words">
            {formError}
          </p>
        )}

        {(showNew || mode === 'remove') && (
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button
              type="submit"
              disabled={busy}
              className={`${
                mode === 'remove'
                  ? 'glass-button bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'btn-primary'
              } pressable w-full px-4 text-sm pointer-coarse:min-h-11`}
            >
              {busy ? (
                <Spinner />
              ) : mode === 'remove' ? (
                <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {busy
                  ? t('admin.lockSaving')
                  : mode === 'remove'
                  ? t('admin.lockRemoveButton')
                  : mode === 'change'
                  ? t('admin.lockChangeButton')
                  : t('admin.lockSetButton')}
              </span>
            </button>
          </div>
        )}
      </form>
    </AdminSheet>
  );
};
