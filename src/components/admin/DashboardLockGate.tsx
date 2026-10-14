/**
 * Dashboard lock gate (wraps the authorized dashboard). When a shared dashboard password is set
 * (adminSettings/dashboardLock), the dashboard asks for it once per browser tab, after 15 minutes without
 * activity and after "Lock now". It is a CONVENIENCE lock for unattended devices: every admin can read the
 * hash and the database rules remain the real protection (the copy says so).
 * While a long admin task runs (`busy`), the idle lock is suspended so a migration is never unmounted.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyRound, Lock, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { DashboardLockRecord } from '../../types';
import {
  getDashboardLock,
  isDashboardUnlocked,
  lockDashboardNow,
  markDashboardUnlocked,
  touchDashboardActivity,
  verifyDashboardPassword,
} from '../../lib/dashboardLock';
import { describeFirestoreError, isMainAdminUser } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import { OFFICIAL_ADMIN_EMAIL, Spinner } from './adminUi';
import { DashboardPasswordDialog } from './DashboardPasswordDialog';
import type { DashboardPasswordMode } from './DashboardPasswordDialog';

const RECHECK_RECORD_MS = 5 * 60 * 1000; // re-read the lock record (password changed elsewhere?)
const IDLE_CHECK_MS = 30 * 1000; // local idle check
const MAX_FAILED_ATTEMPTS = 5;
const RETRY_WAIT_MS = 30 * 1000;

export type DashboardLockStatus = 'none' | 'set' | 'rules-missing' | 'unknown';

/** What the shell (header "Lock now", admins tab card) needs to know about the lock. */
export interface DashboardLockInfo {
  hasLock: boolean;
  lockNow: () => void;
  isMain: boolean;
  lockState: DashboardLockStatus;
  record: DashboardLockRecord | null;
  /** Re-reads the lock record; `unlock` marks this tab unlocked (after the main account saved a password). */
  refresh: (options?: { unlock?: boolean }) => Promise<void>;
}

type GateState =
  | { kind: 'checking' }
  | { kind: 'error'; message: string } // offline etc.: stays LOCKED
  | { kind: 'open'; lock: 'none' | 'rules-missing' }
  | { kind: 'locked'; record: DashboardLockRecord }
  | { kind: 'unlocked'; record: DashboardLockRecord };

export interface DashboardLockGateProps {
  user: User;
  onLogout: () => void;
  busy: boolean; // suspends the idle lock
  onLockState: (info: DashboardLockInfo) => void;
  children: React.ReactNode;
}

export const DashboardLockGate: React.FC<DashboardLockGateProps> = ({ user, onLogout, busy, onLockState, children }) => {
  const { t, formatNumber } = useI18n();
  const isMain = isMainAdminUser(user);
  const uid = user.uid;

  const [state, setState] = useState<GateState>({ kind: 'checking' });
  const [dialogMode, setDialogMode] = useState<DashboardPasswordMode | null>(null);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [retrying, setRetrying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stateRef = useRef(state);
  const busyRef = useRef(busy);
  const onLockStateRef = useRef(onLockState);
  useEffect(() => {
    stateRef.current = state;
    busyRef.current = busy;
    onLockStateRef.current = onLockState;
  });

  const check = useCallback(
    async (options: { initial?: boolean; unlock?: boolean } = {}) => {
      try {
        const result = await getDashboardLock();
        if (result.state !== 'set') {
          setState({ kind: 'open', lock: result.state });
          return;
        }
        if (options.unlock) markDashboardUnlocked(uid, result.record);
        const unlocked = isDashboardUnlocked(uid, result.record);
        if (!unlocked && busyRef.current && stateRef.current.kind !== 'locked') {
          // A running task is never interrupted; the lock applies as soon as it finished
          setState({ kind: 'unlocked', record: result.record });
          return;
        }
        setState(unlocked ? { kind: 'unlocked', record: result.record } : { kind: 'locked', record: result.record });
      } catch (error) {
        console.warn('Dashboard lock check failed:', error);
        const current = stateRef.current.kind;
        // First check (or retry) failed: stay locked. A failed RE-check of an open/unlocked dashboard keeps
        // it as it is (an offline blip must not unmount running work); the local idle check still applies.
        if (options.initial || current === 'checking' || current === 'error') {
          setState({ kind: 'error', message: describeFirestoreError(error) });
        }
      }
    },
    [uid]
  );

  // Initial check (and when the signed-in admin changes)
  useEffect(() => {
    setState({ kind: 'checking' });
    void check({ initial: true });
  }, [check]);

  // Re-read the record when the tab becomes visible and every 5 minutes while the dashboard is usable
  const usable = state.kind === 'open' || state.kind === 'unlocked';
  useEffect(() => {
    if (!usable) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(() => void check(), RECHECK_RECORD_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [usable, check]);

  // Unlocked: activity keeps the session alive; the local idle check locks after 15 min without activity
  const unlockedRecord = state.kind === 'unlocked' ? state.record : null;
  useEffect(() => {
    if (!unlockedRecord) return;
    const onActivity = () => touchDashboardActivity();
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    events.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));

    const idleCheck = () => {
      if (isDashboardUnlocked(uid, unlockedRecord)) return;
      if (busyRef.current) {
        touchDashboardActivity();
        return;
      }
      setState({ kind: 'locked', record: unlockedRecord });
    };
    const timer = window.setInterval(idleCheck, IDLE_CHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') idleCheck();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      events.forEach((name) => window.removeEventListener(name, onActivity));
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [unlockedRecord, uid]);

  // After a long task finished: apply a lock that was postponed while it ran
  useEffect(() => {
    if (busy || !unlockedRecord) return;
    if (!isDashboardUnlocked(uid, unlockedRecord)) setState({ kind: 'locked', record: unlockedRecord });
  }, [busy, unlockedRecord, uid]);

  // Countdown after too many wrong attempts
  useEffect(() => {
    if (retryAt === null) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= retryAt) {
        setRetryAt(null);
        setUnlockError(null);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  const lockNow = useCallback(() => {
    if (busyRef.current) return;
    const current = stateRef.current;
    if (current.kind !== 'unlocked') return;
    lockDashboardNow();
    setPassword('');
    setUnlockError(null);
    setState({ kind: 'locked', record: current.record });
    haptic('selection');
  }, []);

  const refresh = useCallback((options?: { unlock?: boolean }) => check({ unlock: options?.unlock }), [check]);

  // Report the lock state to the shell
  useEffect(() => {
    const lockState: DashboardLockStatus =
      state.kind === 'open'
        ? state.lock
        : state.kind === 'locked' || state.kind === 'unlocked'
        ? 'set'
        : 'unknown';
    onLockStateRef.current({
      hasLock: lockState === 'set',
      lockNow,
      isMain,
      lockState,
      record: state.kind === 'locked' || state.kind === 'unlocked' ? state.record : null,
      refresh,
    });
  }, [state, isMain, lockNow, refresh]);

  const waitSeconds = retryAt !== null ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== 'locked' || unlocking || waitSeconds > 0 || !password) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      let record = state.record;
      let ok = await verifyDashboardPassword(password, record);
      if (!ok) {
        // The locked screen keeps the record it loaded: the main account may have changed or removed the
        // password on another device since. Compare once with the current record before counting a wrong try.
        const latest = await getDashboardLock().catch(() => null);
        if (latest && latest.state !== 'set') {
          setFailedAttempts(0);
          setPassword('');
          setState({ kind: 'open', lock: latest.state });
          return;
        }
        if (latest && (latest.record.salt !== record.salt || latest.record.hash !== record.hash)) {
          record = latest.record;
          ok = await verifyDashboardPassword(password, record);
          if (!ok) setState({ kind: 'locked', record });
        }
      }
      if (ok) {
        markDashboardUnlocked(uid, record);
        setFailedAttempts(0);
        setPassword('');
        haptic('success');
        setState({ kind: 'unlocked', record });
        return;
      }
      const failed = failedAttempts + 1;
      haptic('error');
      setPassword('');
      if (failed >= MAX_FAILED_ATTEMPTS) {
        setFailedAttempts(0);
        const until = Date.now() + RETRY_WAIT_MS;
        setNow(Date.now());
        setRetryAt(until);
      } else {
        setFailedAttempts(failed);
      }
      setUnlockError(t('errors.lockWrongPassword'));
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error('Dashboard unlock failed:', error);
      haptic('error');
      setUnlockError(describeFirestoreError(error));
    } finally {
      setUnlocking(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await check({ initial: true });
    setRetrying(false);
  };

  const dialog = (
    <DashboardPasswordDialog
      mode={dialogMode ?? 'set'}
      open={dialogMode !== null}
      onClose={() => setDialogMode(null)}
      onDone={(result) => void check({ unlock: result === 'saved' })}
    />
  );

  const convenienceNote = (
    <p className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5 text-start">
      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px text-emerald-300" aria-hidden="true" />
      <span>{t('admin.lockConvenienceNote')}</span>
    </p>
  );

  const signOutButton = (
    <button type="button" onClick={onLogout} className="glass-button pressable w-full px-4 text-xs pointer-coarse:min-h-11">
      <LogOut className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
      <span>{t('admin.signOutAdmin')}</span>
    </button>
  );

  // ----- Checking -----
  if (state.kind === 'checking') {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-slate-100">
        <div className="liquid-glass-card glass-raised rounded-3xl p-8 flex flex-col items-center gap-3 text-center">
          <Spinner className="w-8 h-8 text-rose-400" />
          <p className="text-xs sm:text-sm text-slate-300">{t('admin.lockChecking')}</p>
        </div>
      </div>
    );
  }

  // ----- Error (stays locked) -----
  if (state.kind === 'error') {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-slate-100">
        <div className="liquid-glass-card glass-raised rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-white">{t('admin.dashboardTitle')}</h2>
          <p role="alert" className="text-sm text-slate-300 leading-relaxed">
            {t('admin.lockCheckFailed')}
          </p>
          <p className="text-[11px] text-slate-500 break-words">{state.message}</p>
          <button
            type="button"
            onClick={() => void handleRetry()}
            disabled={retrying}
            className="btn-primary pressable w-full px-4 text-sm pointer-coarse:min-h-11"
          >
            {retrying ? <Spinner /> : <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>{t('common.tryAgain')}</span>
          </button>
          {signOutButton}
          {convenienceNote}
        </div>
      </div>
    );
  }

  // ----- Locked -----
  if (state.kind === 'locked') {
    const waiting = waitSeconds > 0;
    return (
      <div className="w-full max-w-md mx-auto py-12 sm:py-16 px-4 text-slate-100">
        <form onSubmit={handleUnlock} className="liquid-glass-card glass-raised rounded-3xl p-6 sm:p-8 space-y-4" noValidate>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-300">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">{t('admin.dashboardTitle')}</p>
            <h2 className="text-xl font-black text-white">{t('admin.lockTitle')}</h2>
            <p className="text-sm text-slate-300">{t('admin.lockDesc')}</p>
          </div>

          <div>
            <label htmlFor="dash-unlock-password" className="block text-xs font-bold text-slate-300 mb-1.5">
              {t('admin.lockPasswordLabel')}
            </label>
            <input
              ref={inputRef}
              id="dash-unlock-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (unlockError && !waiting) setUnlockError(null);
              }}
              disabled={unlocking || waiting}
              autoFocus
              aria-invalid={unlockError ? true : undefined}
              aria-describedby={unlockError || waiting ? 'dash-unlock-error' : undefined}
              className="w-full px-3.5 py-3 liquid-glass-input rounded-xl text-base text-white disabled:opacity-60"
            />
            {(unlockError || waiting) && (
              <p id="dash-unlock-error" role="alert" className="mt-1.5 text-xs text-rose-300">
                {waiting ? t('admin.lockTooManyTries', { seconds: formatNumber(waitSeconds) }) : unlockError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={unlocking || waiting || !password}
            className="btn-primary pressable w-full px-4 text-sm pointer-coarse:min-h-11"
          >
            {unlocking ? <Spinner /> : <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>{unlocking ? t('admin.unlocking') : t('admin.unlock')}</span>
          </button>

          {isMain ? (
            <button
              type="button"
              onClick={() => setDialogMode('forgot')}
              className="touch-target w-full text-xs font-semibold text-rose-300 hover:underline"
            >
              {t('admin.lockForgot')}
            </button>
          ) : (
            <p className="text-xs text-slate-400 text-center">{t('admin.lockAskMain', { email: OFFICIAL_ADMIN_EMAIL })}</p>
          )}

          {signOutButton}
          {convenienceNote}
        </form>
        {dialog}
      </div>
    );
  }

  // ----- Open / unlocked -----
  return (
    <>
      {state.kind === 'open' && isMain && state.lock === 'none' && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="liquid-glass-card rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t('admin.lockNotSetTitle')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">{t('admin.lockNotSetDesc')}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 max-w-3xl">{t('admin.lockConvenienceNote')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDialogMode('set')}
              className="btn-primary pressable px-4 text-xs pointer-coarse:min-h-11 self-start sm:self-center"
            >
              <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t('admin.lockSetButton')}</span>
            </button>
          </div>
        </div>
      )}
      {state.kind === 'open' && isMain && state.lock === 'rules-missing' && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <p
            role="status"
            className="p-3.5 rounded-2xl border bg-indigo-950/60 border-indigo-500/40 text-indigo-200 text-xs flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t('admin.lockRulesMissing')}</span>
          </p>
        </div>
      )}
      {children}
      {dialog}
    </>
  );
};
