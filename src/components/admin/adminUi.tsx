/**
 * Shared helpers for the admin dashboard (src/components/admin/*): constants, small formatters, CSV/clipboard
 * helpers and two UI primitives (notice banner, portaled bottom sheet / dialog). No data access here.
 */
import React, { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AdminEntry, AdminLogAction, Member } from '../../types';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import type { TranslateFn } from '../../i18n';
import { usePresenceMotion, useScrollLock, useSheetDrag } from '../../lib/motion';
import { isMainAdminUser } from '../../lib/firebase';
import { classifySheetsError } from '../../lib/sheetsService';

/** Long-running admin tasks; while one runs the dashboard blocks tab switches, the idle lock and other ID writes. */
export type AdminBusyTask = 'migration' | 'dateFix' | 'repair' | 'bulkMerge' | 'import' | 'purge' | 'reassign';

export type MemberStatus = Member['status'];

// Display only. Admin access is decided by Firebase Auth + Firestore rules.
export const OFFICIAL_ADMIN_EMAIL = 'cosplaysehat@gmail.com';
/** Public site origin used for card links (contract with App: `/?kcc=<digits>` opens the card). */
export const PUBLIC_SITE_URL = 'https://mykcc.vercel.app';

/** Date + time with seconds (exact duplicates / log entries are seconds apart). */
export const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

// Display labels for the stored status values (the values themselves never change)
export const STATUS_LABEL_KEYS: Record<MemberStatus, TranslationKey> = {
  verified: 'admin.statusVerified',
  active: 'admin.statusActive',
  pending: 'admin.statusPending',
};
export const MEMBER_STATUSES: readonly MemberStatus[] = ['verified', 'active', 'pending'];

export const SOURCE_LABEL_KEYS: Record<Member['source'], TranslationKey> = {
  web_form: 'admin.sourceWebForm',
  google_form_sync: 'admin.sourceGoogleForm',
  spreadsheet_import: 'admin.sourceSpreadsheet',
};

export const LOG_ACTION_KEYS: Record<AdminLogAction, TranslationKey> = {
  admin_added: 'admin.logActionAdminAdded',
  admin_removed: 'admin.logActionAdminRemoved',
  photo_deleted: 'admin.logActionPhotoDeleted',
  member_deleted: 'admin.logActionMemberDeleted',
  member_edited: 'admin.logActionMemberEdited',
  member_unlinked: 'admin.logActionMemberUnlinked',
  member_status_changed: 'admin.logActionMemberStatusChanged',
  password_reset_sent: 'admin.logActionPasswordResetSent',
  kcc_id_migration: 'admin.logActionKccIdMigration',
  kcc_id_repair: 'admin.logActionKccIdRepair',
  registration_dates_fixed: 'admin.logActionRegistrationDatesFixed',
  duplicates_merged: 'admin.logActionDuplicatesMerged',
  sheets_import: 'admin.logActionSheetsImport',
  dashboard_lock_set: 'admin.logActionDashboardLockSet',
  dashboard_lock_cleared: 'admin.logActionDashboardLockCleared',
};

/** Friendly message for a failed Google Sheets API call (classifySheetsError(error) !== null). */
export function describeSheetsError(error: unknown, t: TranslateFn, accountEmail: string | null | undefined): string {
  const account = accountEmail || t('sheets.adminAccountFallback');
  switch (classifySheetsError(error)) {
    case 'unauthorized':
      return t('sheets.errorUnauthorized');
    case 'scope':
      return t('sheets.errorScope');
    case 'no-access':
    case 'not-found':
      return t('sheets.errorNoAccess', { account });
    case 'unsupported-file':
      return t('sheets.errorUnsupportedFile');
    case 'rate-limit':
      return t('sheets.errorRateLimit');
    case 'network':
      return t('sheets.errorNetwork');
    default: {
      const detail = error instanceof Error ? error.message : String(error);
      return t('sheets.errorRejected', { detail });
    }
  }
}

/**
 * Renders a translated template whose {placeholders} are React nodes (e.g. bold counts).
 * Placeholders without a node are left as they are.
 */
export const renderRich = (template: string, nodes: Record<string, React.ReactNode>): React.ReactNode[] =>
  template
    .split(/\{(\w+)\}/g)
    .map((part, i) =>
      i % 2 === 1 ? (
        <React.Fragment key={i}>{part in nodes ? nodes[part] : `{${part}}`}</React.Fragment>
      ) : (
        part
      )
    );

export const digitsOnly = (value: string | null | undefined): string => (value || '').replace(/\D/g, '');

/** Display name of a member (cosname first). */
export const memberName = (m: Pick<Member, 'name' | 'cosplayName' | 'id'>): string =>
  m.name || m.cosplayName || m.id;

/** Every WhatsApp number of a member (primary, backup, additional), non-empty. */
export const memberPhones = (m: Pick<Member, 'phone' | 'phone2' | 'additionalPhones'>): string[] =>
  [m.phone, m.phone2, ...(Array.isArray(m.additionalPhones) ? m.additionalPhones : [])].filter(
    (p): p is string => typeof p === 'string' && p.trim() !== ''
  );

/**
 * Why a member cannot be made admin (null = allowed): the main account is always admin, a member who never
 * signed in has no login uid, an existing admin entry cannot be created twice (the rules deny updates).
 */
export function makeAdminBlockReason(
  member: Member,
  user: User,
  admins: AdminEntry[] | null
): 'admin.makeAdminNeedsSignIn' | 'admin.alreadyAdmin' | 'admin.isMainAccount' | null {
  const email = (member.email || '').trim().toLowerCase();
  if (email === OFFICIAL_ADMIN_EMAIL) return 'admin.isMainAccount';
  if (member.authUid && member.authUid === user.uid && isMainAdminUser(user)) return 'admin.isMainAccount';
  if (!member.authUid) return 'admin.makeAdminNeedsSignIn';
  if (admins && admins.some((a) => a.uid === member.authUid)) return 'admin.alreadyAdmin';
  return null;
}

/** Public card link for a KCC ID (8 or 16 digits). */
export const cardLink = (kccId: string): string => `${PUBLIC_SITE_URL}/?kcc=${digitsOnly(kccId)}`;

/**
 * wa.me link with a prefilled message. Non-digits are stripped; a leading 0 or 8 is read as an Indonesian
 * number (0812… / 812… → 62812…). Returns null when no digits are left.
 */
export function waLink(phone: string, text?: string): string | null {
  let digits = digitsOnly(phone);
  if (!digits) return null;
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Short form of a uid for display (never used as data). */
export const shortUid = (uid: string | null | undefined): string => {
  const value = uid || '';
  return value.length > 8 ? `${value.slice(0, 6)}…` : value || '—';
};

/** Signed duration, largest two units: "−29 d 3 h", "+14 s" (unit symbols, not words). */
export function formatDelta(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  const sign = ms < 0 ? '−' : '+';
  let rest = Math.round(Math.abs(ms) / 1000);
  if (rest === 0) return '0 s';
  const units: Array<[string, number]> = [
    ['d', 86400],
    ['h', 3600],
    ['min', 60],
    ['s', 1],
  ];
  const parts: string[] = [];
  for (const [label, size] of units) {
    if (parts.length === 2) break;
    const value = Math.floor(rest / size);
    if (value > 0 || parts.length > 0) {
      if (value > 0) parts.push(`${value} ${label}`);
      else if (parts.length > 0) break;
      rest -= value * size;
    }
  }
  return `${sign}${parts.join(' ')}`;
}

/**
 * One quoted CSV cell. Values starting with = + - @ (or tab / CR) get a leading ' so spreadsheet apps never
 * evaluate them as formulas (CSV injection).
 */
export function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Downloads CSV text as a file (Blob, UTF-8 with BOM so Excel reads the encoding; never a data: URI). */
export function downloadCsv(filename: string, csv: string): void {
  const body = csv.startsWith('\uFEFF') ? csv : `\uFEFF${csv}`;
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Local date as YYYY-MM-DD for file names. */
export const fileDateStamp = (date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Copies text; falls back to a hidden textarea when the async clipboard API is unavailable or denied. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the textarea fallback
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * True while the viewport is at least `px` wide (matchMedia, re-renders on change). Lets a screen render
 * EITHER its phone layout or its desktop layout instead of both (half the DOM on long lists).
 */
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : true),
    () => true
  );
}

/** Opacity-only spinner (no transform-based containing block issues: it is never a parent of fixed elements). */
export const Spinner: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <span
    aria-hidden="true"
    className={`inline-block shrink-0 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
  />
);

export interface AdminNotice {
  kind: 'success' | 'error' | 'info';
  text: string;
  hint?: string;
}

/** Result / error banner for admin actions. */
export const NoticeBanner: React.FC<{ notice: AdminNotice | null; onDismiss?: () => void; className?: string }> = ({
  notice,
  onDismiss,
  className = '',
}) => {
  const { t } = useI18n();
  if (!notice) return null;
  const tone =
    notice.kind === 'success'
      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
      : notice.kind === 'error'
      ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
      : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200';
  const Icon = notice.kind === 'success' ? CheckCircle : notice.kind === 'error' ? AlertTriangle : Info;
  return (
    <div
      role={notice.kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2 ${tone} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1 break-words">
        <p className="font-semibold">{notice.text}</p>
        {notice.hint && <p className="opacity-90">{notice.hint}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="touch-target shrink-0 p-1 rounded-lg hover:bg-white/10"
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

interface AdminSheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** Width of the centered dialog from 640 px, e.g. 'sm:max-w-lg'. */
  widthClass?: string;
  /** Disables drag-to-dismiss (e.g. while a form is dirty). */
  dragDisabled?: boolean;
  /** Blocks closing (close button, backdrop, Escape, drag) while an action runs. */
  closeDisabled?: boolean;
}

/**
 * Bottom sheet on phones, centered dialog from 640 px (same pattern as MemberCardModal / SiteEditorModal).
 * Portaled to <body> so the transformed tab wrapper of the dashboard can never trap it; AnimatePresence keeps
 * it mounted until the exit animation finished. Scroll lock, Escape and focus return included.
 */
export const AdminSheet: React.FC<AdminSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'sm:max-w-lg',
  dragDisabled = false,
  closeDisabled = false,
}) => {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sheetMotion = usePresenceMotion('sheet');
  const overlayMotion = usePresenceMotion('overlay');
  const requestClose = () => {
    if (!closeDisabled) onClose();
  };
  const drag = useSheetDrag(requestClose, { disabled: dragDisabled || closeDisabled });
  useScrollLock(open);

  // Latest close handler for the keydown listener without re-running the open effect
  const closeRef = useRef(requestClose);
  useEffect(() => {
    closeRef.current = requestClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="admin-sheet-overlay"
          className="glass-overlay touch-none"
          aria-hidden="true"
          onClick={requestClose}
          {...overlayMotion}
        />
      )}
      {open && (
        <div key="admin-sheet-viewport" className="sheet-viewport">
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`glass-sheet ${widthClass} text-slate-100 outline-none`}
            {...sheetMotion}
            {...drag.sheetProps}
          >
            <div className="sheet-handle px-5 pt-1 pb-3 sm:px-7 sm:pt-6" {...drag.handleProps}>
              <div className="sheet-grabber" aria-hidden="true" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 id={titleId} className="text-lg font-black text-white break-words">
                    {title}
                  </h3>
                  {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={closeDisabled}
                  className="glass-icon-button shrink-0 disabled:opacity-50"
                  title={t('common.close')}
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="glass-scroll px-5 pb-6 sm:px-7 sm:pb-7">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
