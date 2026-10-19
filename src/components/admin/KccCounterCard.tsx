/**
 * KCC ID counter health (after the 8-digit switch): last issued / next number, "Check counter" probes the
 * next five card IDs; if cards already exist there (written outside the counter), public registration is
 * blocked until the counter is moved past them ("Move counter forward", never backwards).
 */
import React, { useState } from 'react';
import { Activity, CheckCircle, FastForward, ShieldAlert } from 'lucide-react';
import type { KccCounter } from '../../types';
import { advanceKccCounterTo, checkKccCounter } from '../../lib/firestoreService';
import { MAX_KCC_NUMBER, formatKccId, kccIdFromNumber } from '../../lib/idGenerator';
import { describeFirestoreError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import { NoticeBanner, Spinner } from './adminUi';
import type { AdminNotice } from './adminUi';

export interface KccCounterCardProps {
  kccCounter: KccCounter;
  refreshCounter: () => Promise<void>;
  busy: boolean; // another ID task runs
}

export const KccCounterCard: React.FC<KccCounterCardProps> = ({ kccCounter, refreshCounter, busy }) => {
  const { t } = useI18n();
  const [checking, setChecking] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [blockedIds, setBlockedIds] = useState<string[] | null>(null);
  const [notice, setNotice] = useState<AdminNotice | null>(null);

  const nextId = kccCounter.last < MAX_KCC_NUMBER ? kccIdFromNumber(kccCounter.last + 1) : null;

  const runCheck = async (): Promise<string[] | null> => {
    setChecking(true);
    setNotice(null);
    try {
      const result = await checkKccCounter();
      setBlockedIds(result.blockedIds);
      haptic(result.blockedIds.length === 0 ? 'success' : 'error');
      return result.blockedIds;
    } catch (e) {
      console.error('KCC counter check failed:', e);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(e) });
      return null;
    } finally {
      setChecking(false);
    }
  };

  const handleAdvance = async () => {
    if (!blockedIds || blockedIds.length === 0 || busy) return;
    const target = blockedIds.reduce((max, id) => (id > max ? id : max), blockedIds[0]);
    if (!window.confirm(t('admin.counterAdvanceConfirm', { id: formatKccId(target) }))) return;
    setAdvancing(true);
    setNotice(null);
    try {
      await advanceKccCounterTo(target);
      await refreshCounter();
      await runCheck();
    } catch (e) {
      console.error('Advancing the KCC counter failed:', e);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(e) });
    } finally {
      setAdvancing(false);
    }
  };

  const working = checking || advancing;

  return (
    <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">{t('admin.counterTitle')}</h3>
            <p className="text-xs text-slate-300 font-mono">{t('admin.counterLast', { id: formatKccId(kccCounter.lastId) })}</p>
            {nextId && <p className="text-xs text-slate-400 font-mono">{t('admin.counterNext', { id: formatKccId(nextId) })}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void runCheck()}
          disabled={working}
          className="glass-button pressable px-3.5 text-xs pointer-coarse:min-h-11 self-start"
        >
          {checking ? <Spinner /> : <Activity className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>{t('admin.counterCheck')}</span>
        </button>
      </div>

      <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />

      {blockedIds && blockedIds.length === 0 && (
        <p role="status" className="text-xs text-emerald-300 flex items-start gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          <span>{t('admin.counterHealthy')}</span>
        </p>
      )}

      {blockedIds && blockedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 space-y-3">
          <p className="flex items-start gap-1.5" role="alert">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
            <span>{t('admin.counterBlocked', { ids: blockedIds.map((id) => formatKccId(id)).join(', ') })}</span>
          </p>
          <button
            type="button"
            onClick={() => void handleAdvance()}
            disabled={working || busy}
            className="glass-button pressable w-full sm:w-auto px-3.5 text-xs pointer-coarse:min-h-11 bg-amber-600/20 border-amber-500/40 text-amber-100"
          >
            {advancing ? <Spinner /> : <FastForward className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            <span>{t('admin.counterAdvance')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
