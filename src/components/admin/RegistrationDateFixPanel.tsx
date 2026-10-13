/**
 * "Fix registration dates from the spreadsheet" (Sync tab, under the column mapping): reads the inspected
 * sheet (formatted values + the timestamp column as serial numbers), matches rows to members and previews
 * current → sheet dates. Only the selected rows are written (7 members per batch, card createdAt kept equal).
 * Dates are shown in the SHEET'S time zone so they read exactly like the spreadsheet.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle, ChevronLeft, ChevronRight, Eye, Play } from 'lucide-react';
import type {
  ColumnMapping,
  RegistrationDateFixPlan,
  RegistrationDateFixReport,
  RegistrationDateFixRow,
  SheetTimeContext,
} from '../../types';
import { fetchSheetValues, fetchTimestampColumn, classifySheetsError, sheetRange } from '../../lib/sheetsService';
import { applyRegistrationDateFix, previewRegistrationDateFix } from '../../lib/firestoreService';
import { formatKccId } from '../../lib/idGenerator';
import { touchDashboardActivity } from '../../lib/dashboardLock';
import { describeFirestoreError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import {
  DATE_TIME_OPTIONS,
  NoticeBanner,
  SOURCE_LABEL_KEYS,
  Spinner,
  describeSheetsError,
  formatDelta,
  useMinWidth,
} from './adminUi';
import type { AdminBusyTask } from './adminUi';

const PAGE_SIZE = 50;
const ERRORS_SHOWN = 5;

type Phase = 'idle' | 'loading' | 'preview' | 'applying' | 'done' | 'error';
type Filter = 'all' | 'selected' | 'weak' | 'ambiguous';

const MATCH_KEYS: Record<RegistrationDateFixRow['matchedBy'], TranslationKey> = {
  phone: 'admin.dateFixMatchPhone',
  email: 'admin.dateFixMatchEmail',
  discord: 'admin.dateFixMatchDiscord',
  social: 'admin.dateFixMatchSocial',
  name: 'admin.dateFixMatchName',
};

const FILTERS: ReadonlyArray<{ id: Filter; label: TranslationKey }> = [
  { id: 'all', label: 'admin.dateFixFilterAll' },
  { id: 'selected', label: 'admin.dateFixFilterSelected' },
  { id: 'weak', label: 'admin.dateFixFilterWeak' },
  { id: 'ambiguous', label: 'admin.dateFixAmbiguous' },
];

const chip = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap';

export interface RegistrationDateFixPanelProps {
  accessToken: string | null;
  spreadsheetId: string; // inspected sheet
  tabTitle: string;
  mapping: ColumnMapping; // current mapping (timestamp column required)
  context: SheetTimeContext; // sheetTimeContext(meta) stored at inspect time
  busy: boolean; // another long task runs
  onBusyChange: (task: AdminBusyTask | null) => void;
  accountEmail?: string | null; // for Sheets error messages
}

export const RegistrationDateFixPanel: React.FC<RegistrationDateFixPanelProps> = ({
  accessToken,
  spreadsheetId,
  tabTitle,
  mapping,
  context,
  busy,
  onBusyChange,
  accountEmail,
}) => {
  const { t, formatDate, formatNumber } = useI18n();
  const isWide = useMinWidth(768);
  const [phase, setPhase] = useState<Phase>('idle');
  const [plan, setPlan] = useState<RegistrationDateFixPlan | null>(null);
  const [rows, setRows] = useState<RegistrationDateFixRow[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [report, setReport] = useState<RegistrationDateFixReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);

  const applying = phase === 'applying';

  // Another sheet, tab or timestamp column: the old preview no longer applies
  useEffect(() => {
    if (applying) return;
    setPhase('idle');
    setPlan(null);
    setRows([]);
    setReport(null);
    setError(null);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadsheetId, tabTitle, mapping.timestamp]);

  /** Date in the sheet's zone (falls back to the browser zone for an unknown zone name). */
  const sheetDate = (iso: string): string => {
    if (!iso) return '—';
    try {
      return formatDate(iso, { ...DATE_TIME_OPTIONS, timeZone: context.timeZone });
    } catch {
      return formatDate(iso, DATE_TIME_OPTIONS);
    }
  };

  const selectedRows = useMemo(() => rows.filter((r) => r.selected), [rows]);
  const filtered = useMemo(() => {
    switch (filter) {
      case 'selected':
        return rows.filter((r) => r.selected);
      case 'weak':
        return rows.filter((r) => r.matchedBy === 'name');
      case 'ambiguous':
        return rows.filter((r) => r.ambiguous);
      default:
        return rows;
    }
  }, [rows, filter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePreview = async () => {
    if (busy || applying || !accessToken || mapping.timestamp < 0) return;
    setPhase('loading');
    setError(null);
    setReport(null);
    setPage(1);
    setFilter('all');
    try {
      const values = await fetchSheetValues(accessToken, spreadsheetId, sheetRange(tabTitle, 'A1:Z2000'));
      const timestamps = await fetchTimestampColumn(
        accessToken,
        spreadsheetId,
        tabTitle,
        mapping.timestamp,
        Math.max(values.length, 2)
      );
      const next = await previewRegistrationDateFix({ rows: values, mapping, timestamps, context });
      setPlan(next);
      setRows(next.rows.map((r) => ({ ...r })));
      setPhase('preview');
    } catch (e) {
      console.error('Registration date fix preview failed:', e);
      haptic('error');
      setError(classifySheetsError(e) ? describeSheetsError(e, t, accountEmail) : describeFirestoreError(e));
      setPhase('error');
    }
  };

  const toggleRow = (memberId: string) => {
    setRows((prev) => prev.map((r) => (r.memberId === memberId ? { ...r, selected: !r.selected } : r)));
  };
  const selectDefault = () => {
    if (!plan) return;
    const defaults = new Map(plan.rows.map((r) => [r.memberId, r.selected] as const));
    setRows((prev) => prev.map((r) => ({ ...r, selected: defaults.get(r.memberId) ?? false })));
  };
  const selectNone = () => setRows((prev) => prev.map((r) => ({ ...r, selected: false })));

  const handleApply = async () => {
    if (busy || applying || selectedRows.length === 0) return;
    if (!window.confirm(t('admin.dateFixApplyConfirm', { count: formatNumber(selectedRows.length) }))) return;
    setPhase('applying');
    setError(null);
    setProgress({ done: 0, total: selectedRows.length });
    onBusyChange('dateFix');
    try {
      const result = await applyRegistrationDateFix(
        selectedRows,
        (done, total) => {
          setProgress({ done, total });
          touchDashboardActivity();
        },
        { spreadsheetId }
      );
      setReport(result);
      setPhase('done');
      haptic(result.errors.length > 0 ? 'error' : 'success');
    } catch (e) {
      console.error('Registration date fix failed:', e);
      haptic('error');
      setError(describeFirestoreError(e));
      setPhase('error');
    } finally {
      setProgress(null);
      onBusyChange(null);
    }
  };

  const needsTimestamp = mapping.timestamp < 0;

  const renderChips = (r: RegistrationDateFixRow) => (
    <div className="flex flex-wrap gap-1">
      <span
        className={`${chip} ${
          r.matchedBy === 'name'
            ? 'bg-amber-500/15 text-amber-200 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        }`}
      >
        {t(MATCH_KEYS[r.matchedBy])}
      </span>
      {r.ambiguous && <span className={`${chip} bg-rose-500/15 text-rose-200 border-rose-500/30`}>{t('admin.dateFixAmbiguous')}</span>}
      <span className={`${chip} bg-white/[0.06] text-slate-300 border-white/10`}>
        {SOURCE_LABEL_KEYS[r.source] ? t(SOURCE_LABEL_KEYS[r.source]) : r.source}
      </span>
    </div>
  );

  const checkbox = (r: RegistrationDateFixRow) => (
    <input
      type="checkbox"
      checked={r.selected}
      onChange={() => toggleRow(r.memberId)}
      disabled={applying}
      aria-label={t('admin.dateFixSelectRow', { name: r.name || r.memberId })}
      className="w-4 h-4 accent-emerald-400"
    />
  );

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
          <CalendarClock className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t('admin.dateFixTitle')}</h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('admin.dateFixDesc')}</p>
        </div>
      </div>

      {needsTimestamp ? (
        <p className="text-xs text-amber-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
          <span>{t('admin.dateFixNeedsTimestamp')}</span>
        </p>
      ) : (
        !applying && (
          <button
            type="button"
            onClick={() => void handlePreview()}
            disabled={busy || phase === 'loading' || !accessToken}
            className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11"
          >
            {phase === 'loading' ? <Spinner /> : <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            <span>{phase === 'loading' ? t('admin.dateFixLoading') : t('admin.dateFixPreview')}</span>
          </button>
        )
      )}

      {phase === 'error' && error && <NoticeBanner notice={{ kind: 'error', text: error }} />}

      {applying && progress && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-2" role="status" aria-live="polite">
          <p className="text-xs font-semibold text-amber-100 flex items-center gap-2">
            <Spinner />
            <span>{t('admin.dateFixProgress', { done: formatNumber(progress.done), total: formatNumber(progress.total) })}</span>
          </p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-[width]"
              style={{ width: `${progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-200">{t('admin.keepTabOpen')}</p>
        </div>
      )}

      {report && phase === 'done' && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 ${
            report.errors.length > 0 ? 'bg-amber-950/50 border-amber-500/30 text-amber-100' : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-100'
          }`}
        >
          <p className="font-bold flex items-start gap-1.5">
            <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {t('admin.dateFixDone', { updated: formatNumber(report.updated), cards: formatNumber(report.cardsWritten) })}
            </span>
          </p>
          {report.errors.length > 0 && (
            <div>
              <p className="font-semibold text-rose-300 mb-1">{t('admin.issuesCount', { count: formatNumber(report.errors.length) })}</p>
              <ul className="list-disc ps-5 space-y-0.5 text-rose-200 break-words">
                {report.errors.slice(0, ERRORS_SHOWN).map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
              {report.errors.length > ERRORS_SHOWN && (
                <p className="mt-1 text-slate-400">{t('admin.bulkMoreErrors', { count: formatNumber(report.errors.length - ERRORS_SHOWN) })}</p>
              )}
            </div>
          )}
        </div>
      )}

      {plan && (phase === 'preview' || phase === 'applying') && (
        <div className="space-y-4">
          <div className="glass-well rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-white">
              {t('admin.dateFixSummary', {
                changes: formatNumber(plan.rows.length),
                unchanged: formatNumber(plan.unchanged),
                unmatched: formatNumber(plan.unmatchedRows),
                unparsable: formatNumber(plan.unparsableRows),
              })}
            </p>
            <p className="text-slate-400">
              {t('admin.dateFixContext', { timeZone: plan.context.timeZone, locale: plan.context.locale })}
            </p>
            <p className="text-slate-400">{t('admin.dateFixSpotCheck')}</p>
          </div>

          {plan.rows.length === 0 ? (
            <p className="text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('admin.dateFixNothing')}</span>
            </p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="glass-segmented glass-segmented-scroll" role="radiogroup" aria-label={t('admin.dateFixFilterAll')}>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={filter === f.id}
                      onClick={() => {
                        setFilter(f.id);
                        setPage(1);
                      }}
                      className={`glass-segment shrink-0 ${filter === f.id ? 'is-active' : ''}`}
                    >
                      <span>{t(f.label)}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={selectDefault} disabled={applying} className="glass-button pressable px-3 text-xs pointer-coarse:min-h-11">
                    {t('admin.dateFixSelectDefault')}
                  </button>
                  <button type="button" onClick={selectNone} disabled={applying} className="glass-button pressable px-3 text-xs pointer-coarse:min-h-11">
                    {t('admin.dateFixSelectNone')}
                  </button>
                </div>
              </div>

              {isWide ? (
                <div className="glass-well rounded-2xl overflow-x-auto">
                  <table className="w-full min-w-[720px] text-start text-xs">
                    <thead className="text-slate-400 uppercase tracking-wider font-mono border-b border-white/10">
                      <tr>
                        <th scope="col" className="py-2.5 px-3 w-8">
                          <span className="sr-only">{t('admin.dateFixFilterSelected')}</span>
                        </th>
                        <th scope="col" className="py-2.5 px-3 text-start">{t('admin.migrationColName')}</th>
                        <th scope="col" className="py-2.5 px-3 text-start">{t('admin.colKccId')}</th>
                        <th scope="col" className="py-2.5 px-3 text-start">{t('admin.dateFixColCurrent')}</th>
                        <th scope="col" className="py-2.5 px-3 text-start">{t('admin.dateFixColSheet')}</th>
                        <th scope="col" className="py-2.5 px-3 text-start">{t('admin.dateFixColDelta')}</th>
                        <th scope="col" className="py-2.5 px-3 text-start">{t('admin.dateFixColMatch')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-slate-300">
                      {pageRows.map((r) => (
                        <tr key={r.memberId} className={r.selected ? '' : 'opacity-70'}>
                          <td className="py-2 px-3">{checkbox(r)}</td>
                          <td className="py-2 px-3 break-words max-w-[12rem] text-white font-semibold">{r.name || r.memberId}</td>
                          <td className="py-2 px-3 font-mono whitespace-nowrap">{formatKccId(r.kccId)}</td>
                          <td className="py-2 px-3 whitespace-nowrap text-slate-400">{sheetDate(r.currentCreatedAt)}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-semibold text-white">{sheetDate(r.sheetCreatedAt)}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-mono">{formatDelta(r.deltaMs)}</td>
                          <td className="py-2 px-3">{renderChips(r)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ul className="space-y-2">
                  {pageRows.map((r) => (
                    <li key={r.memberId} className={`glass-well rounded-2xl p-3.5 space-y-2 text-xs ${r.selected ? '' : 'opacity-70'}`}>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <span className="pt-0.5">{checkbox(r)}</span>
                        <span className="min-w-0">
                          <span className="block font-bold text-white text-sm break-words">{r.name || r.memberId}</span>
                          <span className="block font-mono text-slate-400">{formatKccId(r.kccId)}</span>
                        </span>
                      </label>
                      <div className="text-slate-400 space-y-0.5">
                        <p>
                          {t('admin.dateFixColCurrent')}: <span className="text-slate-300">{sheetDate(r.currentCreatedAt)}</span>
                        </p>
                        <p>
                          {t('admin.dateFixColSheet')}: <span className="text-white font-semibold">{sheetDate(r.sheetCreatedAt)}</span>
                        </p>
                        <p>
                          {t('admin.dateFixColDelta')}: <span className="font-mono text-slate-300">{formatDelta(r.deltaMs)}</span>
                        </p>
                      </div>
                      {renderChips(r)}
                    </li>
                  ))}
                </ul>
              )}

              {pageCount > 1 && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="glass-icon-button pressable disabled:opacity-40"
                    aria-label={t('admin.pagePrev')}
                    title={t('admin.pagePrev')}
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <span className="whitespace-nowrap tabular-nums">
                    {t('admin.pageOf', { page: formatNumber(currentPage), pages: formatNumber(pageCount) })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                    disabled={currentPage >= pageCount}
                    className="glass-icon-button pressable disabled:opacity-40"
                    aria-label={t('admin.pageNext')}
                    title={t('admin.pageNext')}
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleApply()}
                disabled={busy || applying || selectedRows.length === 0}
                className="btn-primary pressable w-full sm:w-auto px-5 text-sm pointer-coarse:min-h-11"
              >
                {applying ? <Spinner /> : <Play className="w-4 h-4 shrink-0" aria-hidden="true" />}
                <span>{t('admin.dateFixApply', { count: formatNumber(selectedRows.length) })}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
