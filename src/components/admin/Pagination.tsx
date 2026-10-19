/**
 * Page controls for the admin member list: "x–y of z", first/prev/next/last, "Page n of m" and the
 * rows-per-page select (25 / 50 / 100 / All). Pure presentation; the state lives in AdminDashboard.
 */
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useI18n } from '../../i18n';

export type PageSize = 25 | 50 | 100 | 'all';
export const PAGE_SIZES: readonly PageSize[] = [25, 50, 100, 'all'];
export const DEFAULT_PAGE_SIZE: PageSize = 25;

/** Parses a stored page size ('25' | '50' | '100' | 'all'); anything else -> null. */
export function parsePageSize(value: unknown): PageSize | null {
  if (value === 'all') return 'all';
  const n = Number(value);
  return n === 25 || n === 50 || n === 100 ? n : null;
}

export interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  from: number; // 1-based index of the first row shown (0 when empty)
  to: number;
  total: number;
  pageSize: PageSize;
  onPage: (page: number) => void;
  onPageSize: (size: PageSize) => void;
  /** Hides the page buttons (e.g. a single page) but keeps the range text and the size select. */
  compact?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageCount,
  from,
  to,
  total,
  pageSize,
  onPage,
  onPageSize,
  compact = false,
  className = '',
}) => {
  const { t, formatNumber } = useI18n();
  const atFirst = page <= 1;
  const atLast = page >= pageCount;

  const iconButton =
    'glass-icon-button pressable disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-300 ${className}`}
    >
      <p className="font-semibold" aria-live="polite">
        {t('admin.paginationRange', {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {!compact && pageCount > 1 && (
          <nav className="flex items-center gap-1.5" aria-label={t('admin.pageOf', { page: page, pages: pageCount })}>
            <button
              type="button"
              className={iconButton}
              onClick={() => onPage(1)}
              disabled={atFirst}
              aria-label={t('admin.pageFirst')}
              title={t('admin.pageFirst')}
            >
              <ChevronsLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              className={iconButton}
              onClick={() => onPage(page - 1)}
              disabled={atFirst}
              aria-label={t('admin.pagePrev')}
              title={t('admin.pagePrev')}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <span className="px-1.5 whitespace-nowrap tabular-nums">
              {t('admin.pageOf', { page: formatNumber(page), pages: formatNumber(pageCount) })}
            </span>
            <button
              type="button"
              className={iconButton}
              onClick={() => onPage(page + 1)}
              disabled={atLast}
              aria-label={t('admin.pageNext')}
              title={t('admin.pageNext')}
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              className={iconButton}
              onClick={() => onPage(pageCount)}
              disabled={atLast}
              aria-label={t('admin.pageLast')}
              title={t('admin.pageLast')}
            >
              <ChevronsRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </nav>
        )}

        <label className="flex items-center gap-1.5">
          <span className="text-slate-400">{t('admin.pageSize')}</span>
          <select
            value={String(pageSize)}
            onChange={(e) => {
              const next = parsePageSize(e.target.value);
              if (next) onPageSize(next);
            }}
            className="px-2.5 py-1.5 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-200 pointer-coarse:min-h-11"
          >
            {PAGE_SIZES.map((size) => (
              <option key={String(size)} value={String(size)} className="bg-slate-900 text-white">
                {size === 'all' ? t('admin.pageSizeAll') : formatNumber(size)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};
