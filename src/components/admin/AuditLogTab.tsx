/**
 * Audit log tab: adminLogs newest first (50 per page, "Load more"), filter by action over the LOADED
 * entries. Entries are written by the acting admin's device: an accountability aid, not tamper-proof.
 * Entries hold names / field names / counts only (never members' personal data).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import type { AdminLogAction, AdminLogCursor, AdminLogEntry } from '../../types';
import { listAdminLogs } from '../../lib/adminLogService';
import { describeFirestoreError, isPermissionDeniedError } from '../../lib/firebase';
import { useI18n } from '../../i18n';
import { DATE_TIME_OPTIONS, LOG_ACTION_KEYS, NoticeBanner, Spinner, shortUid, useMinWidth } from './adminUi';

const PAGE_SIZE = 50;
const ACTIONS = Object.keys(LOG_ACTION_KEYS) as AdminLogAction[];

type Status = 'loading' | 'ready' | 'loadingMore' | 'error';

const DetailsText: React.FC<{ text: string }> = ({ text }) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 140 || text.split('\n').length > 3;
  return (
    <div className="min-w-0">
      <p className={`break-words whitespace-pre-line ${expanded || !long ? '' : 'line-clamp-3'}`}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="touch-target text-[11px] font-semibold text-rose-300 hover:underline mt-0.5"
          aria-expanded={expanded}
        >
          {expanded ? t('admin.showLess') : t('admin.showMore')}
        </button>
      )}
    </div>
  );
};

export const AuditLogTab: React.FC = () => {
  const { t, formatDate, formatNumber } = useI18n();
  const isWide = useMinWidth(768);
  const [entries, setEntries] = useState<AdminLogEntry[]>([]);
  const [cursor, setCursor] = useState<AdminLogCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [rulesMissing, setRulesMissing] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<AdminLogAction | 'all'>('all');
  const requestId = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);
    setMoreError(null);
    try {
      const page = await listAdminLogs({ pageSize: PAGE_SIZE });
      if (id !== requestId.current) return;
      setEntries(page.entries);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
      setRulesMissing(false);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      console.error('Audit log load failed:', e);
      if (isPermissionDeniedError(e)) {
        setRulesMissing(true);
        setEntries([]);
        setHasMore(false);
        setStatus('ready');
      } else {
        setError(describeFirestoreError(e));
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    void loadFirstPage();
    return () => {
      requestId.current++;
    };
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (status !== 'ready' || !hasMore) return;
    const id = ++requestId.current;
    setStatus('loadingMore');
    setMoreError(null);
    try {
      const page = await listAdminLogs({ pageSize: PAGE_SIZE, cursor });
      if (id !== requestId.current) return;
      setEntries((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        return [...prev, ...page.entries.filter((e) => !seen.has(e.id))];
      });
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (e) {
      if (id !== requestId.current) return;
      console.error('Audit log load more failed:', e);
      setMoreError(describeFirestoreError(e));
    } finally {
      if (id === requestId.current) setStatus('ready');
    }
  };

  const visible = useMemo(
    () => (actionFilter === 'all' ? entries : entries.filter((e) => e.action === actionFilter)),
    [entries, actionFilter]
  );

  const actionLabel = (action: string): string =>
    action in LOG_ACTION_KEYS ? t(LOG_ACTION_KEYS[action as AdminLogAction]) : action || '—';
  const timeLabel = (e: AdminLogEntry): string => (e.at ? formatDate(e.at, DATE_TIME_OPTIONS) : t('admin.logPending'));
  const actorLabel = (e: AdminLogEntry): string => e.actorEmail || shortUid(e.actorUid);
  const targetLabel = (e: AdminLogEntry): string => e.targetLabel || e.targetId || '—';

  const renderDetails = (e: AdminLogEntry) => (
    <div className="space-y-0.5">
      {typeof e.count === 'number' && <p className="font-semibold text-slate-300">{t('admin.logCount', { count: formatNumber(e.count) })}</p>}
      {e.details ? <DetailsText text={e.details} /> : typeof e.count !== 'number' ? <span>—</span> : null}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <History className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('admin.logTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">{t('admin.logInfo')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as AdminLogAction | 'all')}
              aria-label={t('admin.logColAction')}
              className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-200 pointer-coarse:min-h-11"
            >
              <option value="all" className="bg-slate-900 text-white">
                {t('admin.logFilterAll')}
              </option>
              {ACTIONS.map((a) => (
                <option key={a} value={a} className="bg-slate-900 text-white">
                  {t(LOG_ACTION_KEYS[a])}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadFirstPage()}
              disabled={status === 'loading' || status === 'loadingMore'}
              className="glass-button pressable px-3.5 text-xs pointer-coarse:min-h-11"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{t('admin.refresh')}</span>
            </button>
          </div>
        </div>

        {rulesMissing && <NoticeBanner notice={{ kind: 'info', text: t('admin.logRulesMissing') }} />}
      </div>

      {status === 'error' && (
        <div className="liquid-glass-card rounded-3xl p-6 text-center space-y-3">
          <p className="text-sm font-bold text-rose-300">{t('admin.logLoadFailed')}</p>
          {error && <p className="text-xs text-slate-400 break-words">{error}</p>}
          <button type="button" onClick={() => void loadFirstPage()} className="glass-button pressable px-4 text-xs">
            <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t('common.tryAgain')}</span>
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="liquid-glass-card rounded-3xl p-5 space-y-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="glass-skeleton h-3.5 w-1/3" />
              <div className="glass-skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {(status === 'ready' || status === 'loadingMore') && !rulesMissing && visible.length === 0 && (
        <div className="liquid-glass-card rounded-3xl p-8 text-center text-sm text-slate-400">{t('admin.logEmpty')}</div>
      )}

      {(status === 'ready' || status === 'loadingMore') && visible.length > 0 && (
        isWide ? (
          <div className="liquid-glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-[color:var(--glass-fill-well)] text-slate-400 uppercase tracking-wider font-mono border-b border-white/10">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-start">{t('admin.logColTime')}</th>
                    <th scope="col" className="py-3 px-4 text-start">{t('admin.logColActor')}</th>
                    <th scope="col" className="py-3 px-4 text-start">{t('admin.logColAction')}</th>
                    <th scope="col" className="py-3 px-4 text-start">{t('admin.logColTarget')}</th>
                    <th scope="col" className="py-3 px-4 text-start">{t('admin.logColDetails')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-400">
                  {visible.map((e) => (
                    <tr key={e.id} className="align-top">
                      <td className="py-3 px-4 whitespace-nowrap">{timeLabel(e)}</td>
                      <td className="py-3 px-4 break-all text-slate-300">{actorLabel(e)}</td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{actionLabel(e.action)}</td>
                      <td className="py-3 px-4 break-words text-slate-300 max-w-[14rem]">{targetLabel(e)}</td>
                      <td className="py-3 px-4 max-w-[22rem]">{renderDetails(e)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((e) => (
              <li key={e.id} className="liquid-glass-card rounded-2xl p-4 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className="font-bold text-white text-sm">{actionLabel(e.action)}</p>
                  <p>{timeLabel(e)}</p>
                </div>
                <p className="break-all">
                  <span className="text-slate-500">{t('admin.logColActor')}: </span>
                  <span className="text-slate-300">{actorLabel(e)}</span>
                </p>
                <p className="break-words">
                  <span className="text-slate-500">{t('admin.logColTarget')}: </span>
                  <span className="text-slate-300">{targetLabel(e)}</span>
                </p>
                {renderDetails(e)}
              </li>
            ))}
          </ul>
        )
      )}

      {moreError && <NoticeBanner notice={{ kind: 'error', text: moreError }} onDismiss={() => setMoreError(null)} />}

      {hasMore && (status === 'ready' || status === 'loadingMore') && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={status === 'loadingMore'}
            className="glass-button pressable px-5 text-sm pointer-coarse:min-h-11 w-full sm:w-auto"
          >
            {status === 'loadingMore' ? <Spinner /> : <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>{t('admin.loadMore')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
