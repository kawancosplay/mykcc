/**
 * Admins tab card for the shared dashboard lock password. The main account can set / change / remove it;
 * other admins see who manages it. State comes from DashboardLockGate (via the shell).
 */
import React, { useState } from 'react';
import { KeyRound, Lock, LockOpen, ShieldAlert, Trash2 } from 'lucide-react';
import { useI18n } from '../../i18n';
import { NoticeBanner } from './adminUi';
import type { AdminNotice } from './adminUi';
import { DashboardPasswordDialog } from './DashboardPasswordDialog';
import type { DashboardPasswordMode } from './DashboardPasswordDialog';
import type { DashboardLockInfo } from './DashboardLockGate';

export interface DashboardPasswordCardProps {
  lock: DashboardLockInfo | null; // null until the gate reported
}

export const DashboardPasswordCard: React.FC<DashboardPasswordCardProps> = ({ lock }) => {
  const { t, formatDate } = useI18n();
  const [mode, setMode] = useState<DashboardPasswordMode | null>(null);
  const [notice, setNotice] = useState<AdminNotice | null>(null);

  const isMain = !!lock?.isMain;
  const lockState = lock?.lockState ?? 'unknown';
  const record = lock?.record ?? null;

  const handleDone = (result: 'saved' | 'removed') => {
    setNotice({ kind: 'success', text: result === 'saved' ? t('admin.lockSaved') : t('admin.lockRemoved') });
    void lock?.refresh({ unlock: result === 'saved' });
  };

  return (
    <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
          {lockState === 'set' ? <Lock className="w-5 h-5" aria-hidden="true" /> : <LockOpen className="w-5 h-5" aria-hidden="true" />}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white">{t('admin.lockPasswordLabel')}</h3>
          <p className="text-xs text-slate-300 mt-1">
            {lockState === 'set'
              ? t('admin.lockStatusOn', { date: record?.updatedAt ? formatDate(record.updatedAt) : '—' })
              : lockState === 'none'
              ? t('admin.lockStatusOff')
              : lockState === 'rules-missing'
              ? t('admin.lockRulesMissing')
              : t('admin.lockChecking')}
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{t('admin.lockConvenienceNote')}</p>
        </div>
      </div>

      <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />

      {!isMain && (
        <p className="text-xs text-slate-400 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          <span>{t('admin.lockManagedByMain')}</span>
        </p>
      )}

      {isMain && lockState === 'none' && (
        <button
          type="button"
          onClick={() => setMode('set')}
          className="btn-primary pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11"
        >
          <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t('admin.lockSetButton')}</span>
        </button>
      )}

      {isMain && lockState === 'set' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setMode('change')}
            className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11"
          >
            <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t('admin.lockChangeButton')}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('remove')}
            className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11 bg-rose-950/50 border-rose-500/40 text-rose-200"
          >
            <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t('admin.lockRemoveButton')}</span>
          </button>
          {/* Current password forgotten while this tab is still unlocked: Google re-auth, then a new one */}
          <button
            type="button"
            onClick={() => setMode('forgot')}
            className="touch-target px-2 text-xs font-semibold text-rose-300 hover:underline self-start sm:self-center"
          >
            {t('admin.lockForgot')}
          </button>
        </div>
      )}

      {isMain && (
        <DashboardPasswordDialog
          mode={mode ?? 'set'}
          open={mode !== null}
          onClose={() => setMode(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
};
