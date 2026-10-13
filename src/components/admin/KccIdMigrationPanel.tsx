/**
 * "Switch to 8-digit KCC IDs": preview (old -> new table, CSV download), then apply in batches with progress.
 * Members are renumbered in order of registration; old 16-digit IDs keep resolving through aliases. The
 * data layer makes it resumable and idempotent: after an interruption, preview again and apply again.
 * While it runs the shell blocks tab switches, the idle lock and every other ID-writing action.
 */
import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Play,
  RefreshCw,
  Square,
} from 'lucide-react';
import type { KccCounter, KccIdMigrationKind, KccIdMigrationNote, KccIdMigrationPlan, KccIdMigrationReport } from '../../types';
import { applyKccIdMigration, kccIdMigrationCsv, previewKccIdMigration } from '../../lib/firestoreService';
import { formatKccId, kccIdFromNumber, MAX_KCC_NUMBER } from '../../lib/idGenerator';
import { touchDashboardActivity } from '../../lib/dashboardLock';
import { describeFirestoreError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import { NoticeBanner, Spinner, downloadCsv, fileDateStamp } from './adminUi';
import type { AdminBusyTask } from './adminUi';

const PREVIEW_PAGE_SIZE = 50;
const ERRORS_SHOWN = 5;

type Phase = 'idle' | 'previewing' | 'preview' | 'applying' | 'done' | 'error';
type ProgressPhase = 'counter' | 'members' | 'late' | 'photos';

const KIND_KEYS: Record<KccIdMigrationKind, TranslationKey> = {
  main: 'admin.migrationKindMain',
  admin: 'admin.migrationKindAdmin',
  member: 'admin.migrationKindMember',
  done: 'admin.migrationKindDone',
};
const KIND_TONES: Record<KccIdMigrationKind, string> = {
  main: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  admin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  member: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};
const NOTE_KEYS: Record<KccIdMigrationNote, TranslationKey> = {
  duplicate_old_id: 'admin.migrationNoteDuplicateOldId',
  missing_old_id: 'admin.migrationNoteMissingOldId',
  unparsable_created_at: 'admin.migrationNoteUnparsableCreatedAt',
  reserved_conflict: 'admin.migrationNoteReservedConflict',
  late_claim: 'admin.migrationNoteLateClaim',
};
const PHASE_KEYS: Record<ProgressPhase, TranslationKey> = {
  counter: 'admin.migrationPhaseCounter',
  members: 'admin.migrationPhaseMembers',
  late: 'admin.migrationPhaseLate',
  photos: 'admin.migrationPhasePhotos',
};

const chip = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap';

export interface KccIdMigrationPanelProps {
  kccCounter: KccCounter | null | undefined;
  refreshCounter: () => Promise<void>;
  busyTask: AdminBusyTask | null;
  onBusyChange: (task: AdminBusyTask | null) => void;
}

export const KccIdMigrationPanel: React.FC<KccIdMigrationPanelProps> = ({
  kccCounter,
  refreshCounter,
  busyTask,
  onBusyChange,
}) => {
  const { t, formatNumber, formatDate } = useI18n();
  const [phase, setPhase] = useState<Phase>('idle');
  const [plan, setPlan] = useState<KccIdMigrationPlan | null>(null);
  const [csvSaved, setCsvSaved] = useState(false);
  const [skipCsv, setSkipCsv] = useState(false);
  const [rewritePhotos, setRewritePhotos] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number; phase: ProgressPhase } | null>(null);
  const [report, setReport] = useState<KccIdMigrationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsRepreview, setNeedsRepreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [onlyNotes, setOnlyNotes] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const otherTaskRunning = busyTask !== null && busyTask !== 'migration';
  const applying = phase === 'applying';

  const stats = useMemo(() => {
    if (!plan) return null;
    let done = 0;
    let reserved = 0;
    let notes = 0;
    for (const row of plan.rows) {
      if (row.kind === 'done') done++;
      if (row.kind === 'main' || row.kind === 'admin') reserved++;
      if (row.note) notes++;
    }
    const firstPending = plan.rows.find((r) => r.kind === 'member' && r.note !== 'late_claim');
    const lastIssued = Math.max(plan.planEnd, plan.counter?.last ?? 0);
    const nextPublic = lastIssued < MAX_KCC_NUMBER ? kccIdFromNumber(lastIssued + 1) : null;
    return { done, reserved, notes, firstPending, nextPublic };
  }, [plan]);

  const tableRows = useMemo(() => (plan ? (onlyNotes ? plan.rows.filter((r) => !!r.note) : plan.rows) : []), [plan, onlyNotes]);
  const pageCount = Math.max(1, Math.ceil(tableRows.length / PREVIEW_PAGE_SIZE));
  const page = Math.min(previewPage, pageCount);
  const pageRows = tableRows.slice((page - 1) * PREVIEW_PAGE_SIZE, page * PREVIEW_PAGE_SIZE);

  const statusText = (): string => {
    if (kccCounter === undefined) return '';
    if (kccCounter === null) return t('admin.migrationStatusNotStarted');
    if (report && phase === 'done') {
      return report.complete ? t('admin.migrationStatusDone') : t('admin.migrationStatusInProgress');
    }
    if (plan) return plan.pending > 0 ? t('admin.migrationStatusInProgress') : t('admin.migrationStatusDone');
    return t('admin.idEraKcc8');
  };

  const handlePreview = async () => {
    if (otherTaskRunning || applying) return;
    setPhase('previewing');
    setError(null);
    setNeedsRepreview(false);
    setReport(null);
    setCsvSaved(false);
    setSkipCsv(false);
    setPreviewPage(1);
    try {
      const next = await previewKccIdMigration();
      setPlan(next);
      setPhase('preview');
    } catch (e) {
      console.error('8-digit migration preview failed:', e);
      haptic('error');
      setError(describeFirestoreError(e));
      setPhase('error');
    }
  };

  const handleCsv = () => {
    if (!plan) return;
    downloadCsv(`kcc-id-migration-${fileDateStamp()}.csv`, kccIdMigrationCsv(plan));
    setCsvSaved(true);
  };

  const handleApply = async () => {
    if (!plan || plan.pending === 0 || otherTaskRunning || applying) return;
    if (!csvSaved && !skipCsv) return;
    const first = stats?.firstPending ? formatKccId(stats.firstPending.toId) : '—';
    const confirmText = t('admin.migrationApplyConfirm', {
      pending: formatNumber(plan.pending),
      first,
      planEnd: formatKccId(kccIdFromNumber(plan.planEnd)),
    });
    if (!window.confirm(confirmText)) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setCancelRequested(false);
    setPhase('applying');
    setError(null);
    setNeedsRepreview(false);
    setReport(null);
    setProgress({ done: 0, total: 0, phase: 'counter' });
    onBusyChange('migration');
    try {
      const result = await applyKccIdMigration(
        plan,
        (done, total, progressPhase) => {
          setProgress({ done, total, phase: progressPhase });
          touchDashboardActivity();
        },
        { rewritePhotos, signal: controller.signal }
      );
      setReport(result);
      setPhase('done');
      haptic(result.complete && result.errors.length === 0 ? 'success' : 'error');
    } catch (e) {
      console.error('8-digit migration failed:', e);
      haptic('error');
      const message = describeFirestoreError(e);
      setError(message);
      setNeedsRepreview(
        message === t('errors.migrationPlanChanged') || message === t('errors.migrationAlreadyStarted')
      );
      setPhase('error');
    } finally {
      abortRef.current = null;
      setProgress(null);
      onBusyChange(null);
      try {
        await refreshCounter();
      } catch (refreshError) {
        console.warn('Counter refresh after the migration failed:', refreshError);
      }
    }
  };

  const handleCancel = () => {
    if (!abortRef.current) return;
    abortRef.current.abort();
    setCancelRequested(true);
  };

  const progressPercent =
    progress && progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0;

  return (
    <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
          <ArrowRightLeft className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-bold text-white">{t('admin.migrationTitle')}</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{t('admin.migrationDesc')}</p>
          {statusText() && <p className="text-xs font-semibold text-violet-200">{statusText()}</p>}
        </div>
      </div>

      {/* Preview button */}
      {!applying && (
        <button
          type="button"
          onClick={() => void handlePreview()}
          disabled={phase === 'previewing' || otherTaskRunning}
          className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11"
        >
          {phase === 'previewing' ? <Spinner /> : <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>
            {phase === 'previewing'
              ? t('admin.migrationPreviewing')
              : report && !report.complete
              ? t('admin.migrationResume')
              : plan
              ? t('admin.migrationRepreview')
              : t('admin.migrationPreview')}
          </span>
        </button>
      )}

      {/* Errors */}
      {phase === 'error' && error && (
        <div className="space-y-2">
          <NoticeBanner notice={{ kind: 'error', text: error }} />
          {needsRepreview && (
            <button
              type="button"
              onClick={() => void handlePreview()}
              disabled={otherTaskRunning}
              className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('admin.migrationRepreview')}</span>
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {applying && progress && (
        <div className="sticky bottom-3 z-[1] p-4 rounded-2xl bg-violet-950/90 border border-violet-500/40 space-y-2.5" role="status" aria-live="polite">
          <p className="text-xs font-semibold text-violet-100 flex items-center gap-2">
            <Spinner />
            <span>
              {t(PHASE_KEYS[progress.phase])} •{' '}
              {t('admin.migrationProgress', { done: formatNumber(progress.done), total: formatNumber(progress.total) })}
            </span>
          </p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-violet-400 transition-[width]" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[11px] text-amber-200 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
            <span>{t('admin.keepTabOpen')}</span>
          </p>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelRequested}
            className="glass-button pressable w-full sm:w-auto px-3.5 text-xs pointer-coarse:min-h-11"
          >
            {cancelRequested ? <Spinner /> : <Square className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            <span>{t('admin.migrationCancel')}</span>
          </button>
        </div>
      )}

      {/* Report */}
      {report && phase === 'done' && (
        <div
          className={`p-4 rounded-2xl border text-xs text-slate-200 space-y-3 ${
            report.complete ? 'bg-emerald-950/50 border-emerald-500/30' : 'bg-amber-950/50 border-amber-500/30'
          }`}
        >
          <p className={`font-bold flex items-start gap-1.5 ${report.complete ? 'text-emerald-300' : 'text-amber-300'}`}>
            {report.complete ? (
              <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{report.complete ? t('admin.migrationComplete') : t('admin.migrationIncomplete')}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                ['admin.migrationStatMigrated', report.migrated],
                ['admin.migrationStatAliases', report.aliasesWritten],
                ['admin.migrationStatCards', report.cardsWritten],
                ['admin.migrationStatOldCards', report.oldCardsDeleted],
                ['admin.migrationStatLate', report.lateClaimed],
                ['admin.migrationStatPhotos', report.photosUpdated],
              ] as Array<[TranslationKey, number]>
            ).map(([key, value]) => (
              <div key={key} className="glass-well rounded-xl p-2.5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t(key)}</p>
                <p className="text-lg font-black text-white">{formatNumber(value)}</p>
              </div>
            ))}
          </div>
          {report.errors.length > 0 && (
            <div>
              <p className="font-semibold text-rose-300 mb-1">
                {t('admin.issuesCount', { count: formatNumber(report.errors.length) })}
              </p>
              <ul className="list-disc ps-5 space-y-0.5 text-rose-200 break-words">
                {report.errors.slice(0, ERRORS_SHOWN).map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
              {report.errors.length > ERRORS_SHOWN && (
                <p className="mt-1 text-slate-400">
                  {t('admin.bulkMoreErrors', { count: formatNumber(report.errors.length - ERRORS_SHOWN) })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {plan && stats && phase !== 'previewing' && !(phase === 'done' && report) && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="glass-chip">{t('admin.migrationRows', { count: formatNumber(plan.rows.length) })}</span>
            <span className="glass-chip bg-violet-500/20 text-violet-200 border-violet-500/40">
              {t('admin.migrationPending', { count: formatNumber(plan.pending) })}
            </span>
            <span className="glass-chip">{t('admin.migrationDone', { count: formatNumber(stats.done) })}</span>
            <span className="glass-chip">{t('admin.migrationReservedRows', { count: formatNumber(stats.reserved) })}</span>
            <span className="glass-chip font-mono">
              {t('admin.migrationPlanEnd', { id: formatKccId(kccIdFromNumber(plan.planEnd)) })}
            </span>
            {stats.nextPublic && (
              <span className="glass-chip font-mono">
                {t('admin.migrationNextPublic', { id: formatKccId(stats.nextPublic) })}
              </span>
            )}
          </div>

          {plan.warnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t('admin.migrationWarningsTitle')}</span>
              </p>
              <ul className="list-disc ps-5 space-y-0.5 break-words max-h-40 overflow-y-auto">
                {plan.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="text-amber-100/90">{t('admin.migrationWarningsHint')}</p>
            </div>
          )}

          {/* Table */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer pointer-coarse:min-h-11">
              <input
                type="checkbox"
                checked={onlyNotes}
                onChange={(e) => {
                  setOnlyNotes(e.target.checked);
                  setPreviewPage(1);
                }}
                className="w-4 h-4 accent-violet-400"
              />
              <span>
                {t('admin.migrationOnlyNotes')} ({formatNumber(stats.notes)})
              </span>
            </label>
            {pageCount > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => setPreviewPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="glass-icon-button pressable disabled:opacity-40"
                  aria-label={t('admin.pagePrev')}
                  title={t('admin.pagePrev')}
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
                <span className="whitespace-nowrap tabular-nums">
                  {t('admin.pageOf', { page: formatNumber(page), pages: formatNumber(pageCount) })}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPage(Math.min(pageCount, page + 1))}
                  disabled={page >= pageCount}
                  className="glass-icon-button pressable disabled:opacity-40"
                  aria-label={t('admin.pageNext')}
                  title={t('admin.pageNext')}
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>

          <div className="glass-well rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[640px] text-start text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-mono border-b border-white/10">
                <tr>
                  <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColOld')}</th>
                  <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColNew')}</th>
                  <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColName')}</th>
                  <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColRegistered')}</th>
                  <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColKind')}</th>
                  <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColNote')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {pageRows.map((row) => (
                  <tr key={row.memberId}>
                    <td className="py-2 px-3 font-mono whitespace-nowrap text-slate-400">
                      {row.fromId ? formatKccId(row.fromId) : t('admin.migrationNoOldId')}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-white whitespace-nowrap">
                      {row.note === 'late_claim'
                        ? t('admin.migrationProvisional', { id: formatKccId(row.toId) })
                        : formatKccId(row.toId)}
                    </td>
                    <td className="py-2 px-3 break-words max-w-[14rem]">{row.name || row.memberId}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-400">
                      {row.createdAt ? formatDate(row.createdAt) : '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`${chip} ${KIND_TONES[row.kind]}`}>{t(KIND_KEYS[row.kind])}</span>
                    </td>
                    <td className="py-2 px-3">
                      {row.note && (
                        <span className={`${chip} bg-amber-500/15 text-amber-200 border-amber-500/30 whitespace-normal`}>
                          {t(NOTE_KEYS[row.note])}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CSV + options + apply */}
          {plan.pending > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleCsv}
                  disabled={applying}
                  className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t('admin.migrationDownloadCsv')}</span>
                </button>
                {csvSaved && (
                  <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{t('admin.migrationCsvSaved')}</span>
                  </p>
                )}
              </div>
              {!csvSaved && (
                <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipCsv}
                    onChange={(e) => setSkipCsv(e.target.checked)}
                    disabled={applying}
                    className="w-4 h-4 mt-px accent-violet-400"
                  />
                  <span>{t('admin.migrationSkipCsv')}</span>
                </label>
              )}
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rewritePhotos}
                  onChange={(e) => setRewritePhotos(e.target.checked)}
                  disabled={applying}
                  className="w-4 h-4 mt-px accent-violet-400"
                />
                <span>
                  {t('admin.migrationRewritePhotos')}
                  <span className="block text-[11px] text-slate-500">{t('admin.migrationRewritePhotosHint')}</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => void handleApply()}
                disabled={applying || otherTaskRunning || (!csvSaved && !skipCsv)}
                className="glass-button pressable w-full sm:w-auto px-5 text-sm font-bold pointer-coarse:min-h-11 bg-rose-600/80 border-rose-400/60 text-white disabled:opacity-50"
              >
                {applying ? <Spinner /> : <Play className="w-4 h-4 shrink-0" aria-hidden="true" />}
                <span>{t('admin.migrationApply')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
