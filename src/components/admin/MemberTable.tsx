/**
 * Admin member list (one page of the filtered + sorted members). The column order is defined ONCE in
 * MEMBER_COLUMNS: header and body cells are both rendered by mapping over it, so they cannot drift apart
 * again (sprint-2 bug: the Status select sat under "Registered" and the date under "Status").
 * Phones (< 768 px) get a card list built from the same data instead of the table.
 */
import React from 'react';
import { ChevronDown, Clock, Crown, ExternalLink, FileSpreadsheet, Hash, Shield, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import type { Member } from '../../types';
import { formatKccId, isAdminRangeKccId, isKccId8, isLegacyKccId16, isMainAccountKccId } from '../../lib/idGenerator';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import { DATE_TIME_OPTIONS, MEMBER_STATUSES, SOURCE_LABEL_KEYS, STATUS_LABEL_KEYS, digitsOnly, memberName, useMinWidth } from './adminUi';
import type { MemberStatus } from './adminUi';

// ---------------------------------------------------------------------------------------------
// Sorting + search (pure helpers, used by AdminDashboard to build the list)
// ---------------------------------------------------------------------------------------------

export type SortMode =
  | 'timestamp_desc'
  | 'timestamp_asc'
  | 'name_asc'
  | 'name_desc'
  | 'age_asc'
  | 'age_desc'
  | 'location_asc'
  | 'location_desc'
  | 'status_asc'
  | 'status_desc'
  | 'uid_asc';

export type SortField = 'timestamp' | 'name' | 'age' | 'location' | 'status' | 'uid';

/** Next sort mode after a click on a sortable header. */
export function nextSortMode(prev: SortMode, field: SortField): SortMode {
  switch (field) {
    case 'timestamp':
      return prev === 'timestamp_desc' ? 'timestamp_asc' : 'timestamp_desc';
    case 'name':
      return prev === 'name_asc' ? 'name_desc' : 'name_asc';
    case 'age':
      return prev === 'age_asc' ? 'age_desc' : 'age_asc';
    case 'location':
      return prev === 'location_asc' ? 'location_desc' : 'location_asc';
    case 'status':
      return prev === 'status_asc' ? 'status_desc' : 'status_asc';
    case 'uid':
      return prev === 'uid_asc' ? 'timestamp_desc' : 'uid_asc';
    default:
      return prev;
  }
}

const createdAtValue = (m: Member): number => {
  const ms = new Date(m.createdAt || 0).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const ageValue = (m: Member): number => {
  if (m.age) {
    const parsed = parseInt(m.age.replace(/\D/g, ''), 10);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed < 120) return parsed;
  }
  const category = (m.ageCategory || '').toLowerCase();
  if (category.includes('minor')) return 16;
  if (category.includes('legal') || category.includes('dewasa')) return 22;
  return 20;
};

// Verified -> Active -> Pending (ascending)
const STATUS_WEIGHT: Record<string, number> = { verified: 1, active: 2, pending: 3 };

/** Sorted copy of `list` (stable; ties keep the incoming order). */
export function sortMembers(list: readonly Member[], mode: SortMode): Member[] {
  const sorted = [...list];
  const nameOf = (m: Member) => (m.cosplayName || m.fullName || m.name || '').toLowerCase().trim();
  const locationOf = (m: Member) => `${m.city || ''}, ${m.country || ''}`.toLowerCase().trim();
  sorted.sort((a, b) => {
    switch (mode) {
      case 'timestamp_asc':
        return createdAtValue(a) - createdAtValue(b);
      case 'name_asc':
        return nameOf(a).localeCompare(nameOf(b));
      case 'name_desc':
        return nameOf(b).localeCompare(nameOf(a));
      case 'age_asc':
        return ageValue(a) - ageValue(b);
      case 'age_desc':
        return ageValue(b) - ageValue(a);
      case 'location_asc':
        return locationOf(a).localeCompare(locationOf(b));
      case 'location_desc':
        return locationOf(b).localeCompare(locationOf(a));
      case 'status_asc':
      case 'status_desc': {
        const stA = STATUS_WEIGHT[a.status || 'verified'] || 99;
        const stB = STATUS_WEIGHT[b.status || 'verified'] || 99;
        return mode === 'status_asc' ? stA - stB : stB - stA;
      }
      case 'uid_asc':
        return digitsOnly(a.userId16).localeCompare(digitsOnly(b.userId16), undefined, { numeric: true });
      case 'timestamp_desc':
      default:
        return createdAtValue(b) - createdAtValue(a);
    }
  });
  return sorted;
}

/**
 * Free-text search over a member: names, email, phones, Discord, fandom, city, and the KCC ID (current and
 * old). For the ID comparison the query's non-digits are stripped, so "0000 0101" and "0000-0101" match.
 */
export function memberMatchesQuery(m: Member, rawQuery: string): boolean {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;
  const qDigits = digitsOnly(q);
  const includes = (value: string | undefined | null) => !!value && value.toLowerCase().includes(q);
  if (
    includes(m.cosplayName) ||
    includes(m.name) ||
    includes(m.fullName) ||
    includes(m.email) ||
    includes(m.discordUsername) ||
    includes(m.fandom) ||
    includes(m.city)
  ) {
    return true;
  }
  const phones = [m.phone, m.phone2, ...(Array.isArray(m.additionalPhones) ? m.additionalPhones : [])];
  if (phones.some((p) => typeof p === 'string' && p.includes(q))) return true;
  if (qDigits.length >= 3) {
    if (digitsOnly(m.userId16).includes(qDigits)) return true;
    if (digitsOnly(m.legacyUserId16).includes(qDigits)) return true;
    if (phones.some((p) => typeof p === 'string' && digitsOnly(p).includes(qDigits))) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------------------------

export const MEMBER_COLUMNS = [
  'member',
  'kccId',
  'contact',
  'discord',
  'role',
  'age',
  'location',
  'status',
  'registered',
  'actions',
] as const;
export type MemberColumn = (typeof MEMBER_COLUMNS)[number];

interface ColumnDef {
  label: TranslationKey;
  sortField?: SortField;
  /** Indicator text for the active sort of this column, or null when the column is not the sort key. */
  indicator?: (mode: SortMode) => TranslationKey | null;
  align?: 'end';
}

const COLUMN_DEFS: Record<MemberColumn, ColumnDef> = {
  member: {
    label: 'admin.colMember',
    sortField: 'name',
    indicator: (m) => (m === 'name_asc' ? 'admin.sortAz' : m === 'name_desc' ? 'admin.sortZa' : null),
  },
  kccId: {
    label: 'admin.colKccId',
    sortField: 'uid',
    indicator: (m) => (m === 'uid_asc' ? 'admin.sortIdAsc' : null),
  },
  contact: { label: 'admin.colContact' },
  discord: { label: 'admin.colDiscord' },
  role: { label: 'admin.colRole' },
  age: {
    label: 'admin.colAge',
    sortField: 'age',
    indicator: (m) => (m === 'age_asc' ? 'admin.sortAgeYoungest' : m === 'age_desc' ? 'admin.sortAgeOldest' : null),
  },
  location: {
    label: 'admin.colLocation',
    sortField: 'location',
    indicator: (m) => (m === 'location_asc' ? 'admin.sortAz' : m === 'location_desc' ? 'admin.sortZa' : null),
  },
  status: {
    label: 'admin.colStatus',
    sortField: 'status',
    indicator: (m) =>
      m === 'status_asc' ? 'admin.sortStatusAsc' : m === 'status_desc' ? 'admin.sortStatusDesc' : null,
  },
  registered: {
    label: 'admin.colRegistered',
    sortField: 'timestamp',
    indicator: (m) =>
      m === 'timestamp_desc' ? 'admin.sortTimeNewest' : m === 'timestamp_asc' ? 'admin.sortTimeOldest' : null,
  },
  actions: { label: 'admin.colActions', align: 'end' },
};

// ---------------------------------------------------------------------------------------------
// Small shared cells
// ---------------------------------------------------------------------------------------------

const chipBase =
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans border whitespace-nowrap';

/** Main / admin-range / member / legacy-timestamp badge for a KCC ID ('' -> no badge). */
export const KccIdBadge: React.FC<{ id: string | undefined }> = ({ id }) => {
  const { t } = useI18n();
  const value = id || '';
  if (isMainAccountKccId(value)) {
    return (
      <span className={`${chipBase} bg-amber-500/20 text-amber-300 border-amber-500/40`}>
        <Crown className="w-3 h-3 text-amber-400" aria-hidden="true" />
        <span>{t('admin.mainAccountBadge')}</span>
      </span>
    );
  }
  if (isAdminRangeKccId(value)) {
    const number = String(parseInt(digitsOnly(value) || '1', 10)).padStart(4, '0');
    return (
      <span className={`${chipBase} bg-rose-500/20 text-rose-300 border-rose-500/40`}>
        <Shield className="w-3 h-3 text-rose-400" aria-hidden="true" />
        <span>{t('admin.adminIdBadge', { number })}</span>
      </span>
    );
  }
  if (isKccId8(value)) {
    return (
      <span className={`${chipBase} bg-indigo-500/15 text-indigo-300 border-indigo-500/30`}>
        <Hash className="w-3 h-3 text-indigo-400" aria-hidden="true" />
        <span>{t('admin.memberIdBadge')}</span>
      </span>
    );
  }
  if (isLegacyKccId16(value)) {
    return (
      <span className={`${chipBase} bg-indigo-500/15 text-indigo-300 border-indigo-500/30`}>
        <Clock className="w-3 h-3 text-indigo-400" aria-hidden="true" />
        <span>{t('admin.timestampIdBadge')}</span>
      </span>
    );
  }
  return null;
};

export const AdminChip: React.FC = () => {
  const { t } = useI18n();
  return (
    <span className={`${chipBase} bg-emerald-500/15 text-emerald-300 border-emerald-500/40`}>
      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
      <span>{t('admin.adminChip')}</span>
    </span>
  );
};

const statusSelectTone = (status: Member['status']): string =>
  status === 'active'
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    : status === 'verified'
    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

const StatusSelect: React.FC<{
  member: Member;
  onStatusChange: (m: Member, s: MemberStatus) => void;
  className?: string;
}> = ({ member, onStatusChange, className = '' }) => {
  const { t } = useI18n();
  const status = member.status || 'verified';
  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(member, e.target.value as MemberStatus)}
      aria-label={t('admin.colStatus')}
      className={`px-2 py-1 rounded-lg text-base sm:text-xs font-bold border pointer-coarse:min-h-11 ${statusSelectTone(
        status
      )} ${className}`}
    >
      {MEMBER_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-slate-900 text-white">
          {t(STATUS_LABEL_KEYS[s])}
        </option>
      ))}
    </select>
  );
};

const Avatar: React.FC<{ member: Member; size?: string }> = ({ member, size = 'w-9 h-9' }) => (
  <div className={`${size} rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0`}>
    {member.avatarUrl ? (
      <img src={member.avatarUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs">
        {memberName(member).slice(0, 2).toUpperCase() || 'KC'}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------------------------
// Expandable details (rendered only while open: 700+ members)
// ---------------------------------------------------------------------------------------------

const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v.trim());

const DetailsToggle: React.FC<{ open: boolean; panelId: string; onToggle: () => void; className?: string }> = ({
  open,
  panelId,
  onToggle,
  className = '',
}) => {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      title={t('admin.detailsToggle')}
      aria-label={t('admin.detailsToggle')}
      className={`touch-target pressable inline-flex items-center justify-center p-1.5 rounded-lg bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] text-slate-200 pointer-coarse:min-h-11 pointer-coarse:min-w-11 ${className}`}
    >
      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
  );
};

const DetailsPanel: React.FC<{ id: string; member: Member; showEmail: boolean }> = ({ id, member: m, showEmail }) => {
  const { t, formatDate } = useI18n();
  const extra = Array.isArray(m.additionalPhones) ? m.additionalPhones.filter((p) => typeof p === 'string') : [];
  const link = (v: string): React.ReactNode =>
    isHttpUrl(v) ? (
      <a href={v.trim()} target="_blank" rel="noopener noreferrer" className="text-indigo-300 underline break-all">
        {v}
      </a>
    ) : (
      v
    );
  const rows: Array<[string, React.ReactNode]> = [
    [t('admin.csvLegalName'), m.fullName],
    [t('admin.csvEmail'), showEmail ? m.email : ''],
    [t('admin.csvPrimaryWhatsapp'), m.phone],
    [t('admin.csvBackupWhatsapp'), m.phone2],
    [t('admin.extraPhonesLabel'), extra.join(', ')],
    [t('admin.csvDiscord'), m.discordUsername],
    [t('admin.csvProvince'), m.province],
    [t('admin.csvCity'), m.city],
    [t('admin.csvCountry'), m.country],
    [t('admin.fieldBirthday'), m.birthday],
    [t('admin.csvAge'), m.age],
    [t('admin.csvAgeCategory'), m.ageCategory],
    [t('admin.csvExperience'), m.experience],
    [t('admin.csvFandom'), m.fandom],
    [t('admin.fieldSocialMedia'), m.socialMedia ? link(m.socialMedia) : ''],
    [t('admin.fieldPortfolio'), m.portfolioUrl ? link(m.portfolioUrl) : ''],
    [t('admin.fieldReason'), m.reason],
    [t('admin.detailsSource'), t(SOURCE_LABEL_KEYS[m.source] || 'admin.sourceWebForm')],
    [t('admin.csvStatus'), t(STATUS_LABEL_KEYS[m.status || 'verified'])],
    [t('admin.csvRegisteredAt'), m.createdAt ? formatDate(m.createdAt, DATE_TIME_OPTIONS) : ''],
    [t('admin.detailsLogin'), m.authUid ? t('admin.loginLinked') : t('admin.loginNotLinked')],
    [t('admin.csvOldKccId'), m.legacyUserId16 ? formatKccId(m.legacyUserId16) : ''],
  ];
  return (
    <dl id={id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-[11px]">
      {rows
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-slate-500 uppercase tracking-wider text-[10px]">{label}</dt>
            <dd className="text-slate-200 break-words whitespace-pre-line">{value}</dd>
          </div>
        ))}
    </dl>
  );
};

// ---------------------------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------------------------

export interface MemberTableProps {
  members: Member[]; // the CURRENT PAGE of the filtered + sorted list
  totalMembers: number; // unfiltered count (empty-state wording)
  sortMode: SortMode;
  onToggleSort: (field: SortField) => void;
  adminUids: ReadonlySet<string>; // for the Admin chip (empty until admins are loaded)
  onViewCard: (m: Member) => void;
  onManage: (m: Member) => void;
  onDelete: (m: Member) => void;
  onStatusChange: (m: Member, s: MemberStatus) => void;
  onOpenSync: () => void;
}

const EmptyState: React.FC<{ totalMembers: number; onOpenSync: () => void }> = ({ totalMembers, onOpenSync }) => {
  const { t } = useI18n();
  const empty = totalMembers === 0;
  return (
    <div className="max-w-md mx-auto space-y-4 px-4 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
        <ShieldCheck className="w-8 h-8" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">
          {empty ? t('admin.emptyDatabaseTitle') : t('admin.noResultsTitle')}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {empty ? t('admin.emptyDatabaseDesc') : t('admin.noResultsDesc')}
        </p>
      </div>
      {empty && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button type="button" onClick={onOpenSync} className="btn-primary pressable px-4 text-xs pointer-coarse:min-h-11">
            <FileSpreadsheet className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t('admin.openSheetsSync')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  totalMembers,
  sortMode,
  onToggleSort,
  adminUids,
  onViewCard,
  onManage,
  onDelete,
  onStatusChange,
  onOpenSync,
}) => {
  const { t, formatDate } = useI18n();
  const isWide = useMinWidth(768);
  const [openIds, setOpenIds] = React.useState<ReadonlySet<string>>(() => new Set());
  // New page / filter / sort -> everything collapses; a live refresh of the same rows keeps them open
  const visibleIds = members.map((m) => m.id).join('|');
  React.useEffect(() => setOpenIds(new Set()), [visibleIds, sortMode]);
  const toggleOpen = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const isAdminMember = (m: Member) => !!m.authUid && adminUids.has(m.authUid);

  // ----- Phones: card list -----
  if (!isWide) {
    if (members.length === 0) {
      return (
        <div className="liquid-glass-card rounded-3xl">
          <EmptyState totalMembers={totalMembers} onOpenSync={onOpenSync} />
        </div>
      );
    }
    return (
      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="liquid-glass-card rounded-2xl p-4 space-y-3 cv-auto">
            <div className="flex items-start gap-3">
              <Avatar member={m} size="w-11 h-11" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-bold text-white text-sm break-words">{memberName(m)}</p>
                  {isAdminMember(m) && <AdminChip />}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-white tracking-wider text-xs font-mono font-bold">{formatKccId(m.userId16)}</span>
                  <KccIdBadge id={m.userId16} />
                </div>
                {m.legacyUserId16 && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {t('admin.oldIdValue', { id: formatKccId(m.legacyUserId16) })}
                  </p>
                )}
              </div>
            </div>

            <StatusSelect member={m} onStatusChange={onStatusChange} className="w-full" />

            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>{t('admin.registeredOn', { date: m.createdAt ? formatDate(m.createdAt) : '-' })}</p>
              {m.phone ? (
                <p className="text-emerald-400 font-mono font-bold text-xs break-all">{m.phone}</p>
              ) : (
                <p className="text-slate-500 italic">—</p>
              )}
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => onViewCard(m)}
                className="glass-button pressable px-3 text-xs pointer-coarse:min-h-11"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('admin.viewKccIdTitle')}</span>
              </button>
              <button
                type="button"
                onClick={() => onManage(m)}
                className="glass-button pressable px-3 text-xs pointer-coarse:min-h-11"
              >
                <UserCog className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('admin.manageMember')}</span>
              </button>
              <DetailsToggle open={openIds.has(m.id)} panelId={`member-details-${m.id}`} onToggle={() => toggleOpen(m.id)} />
            </div>
            {openIds.has(m.id) && <DetailsPanel id={`member-details-${m.id}`} member={m} showEmail />}
          </li>
        ))}
      </ul>
    );
  }

  // ----- Tablet / desktop: table -----
  const renderHeader = (column: MemberColumn) => {
    const def = COLUMN_DEFS[column];
    const indicatorKey = def.indicator ? def.indicator(sortMode) : null;
    const alignClass = def.align === 'end' ? 'text-end' : 'text-start';
    if (!def.sortField) {
      return (
        <th key={column} scope="col" className={`py-4 px-4 ${alignClass}`}>
          {t(def.label)}
        </th>
      );
    }
    const field = def.sortField;
    const ariaSort = indicatorKey
      ? sortMode.endsWith('_desc')
        ? 'descending'
        : 'ascending'
      : undefined;
    return (
      <th key={column} scope="col" aria-sort={ariaSort} className={`py-2 px-2 ${alignClass}`}>
        <button
          type="button"
          onClick={() => onToggleSort(field)}
          className="inline-flex items-center gap-1.5 px-2 py-2 rounded-lg uppercase tracking-wider hover:text-white transition-colors whitespace-nowrap"
        >
          <span>{t(def.label)}</span>
          {indicatorKey && <span className="text-rose-400 font-bold normal-case">{t(indicatorKey)}</span>}
        </button>
      </th>
    );
  };

  const renderCell = (column: MemberColumn, m: Member) => {
    switch (column) {
      case 'member':
        return (
          <td key={column} className="py-4 px-4">
            <div className="flex items-center gap-3">
              <Avatar member={m} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-bold text-white text-sm">{memberName(m)}</p>
                  {isAdminMember(m) && <AdminChip />}
                </div>
                {m.fullName && m.fullName !== memberName(m) && (
                  <p className="text-[11px] text-slate-400">{t('admin.legalNameValue', { name: m.fullName })}</p>
                )}
              </div>
            </div>
          </td>
        );
      case 'kccId':
        return (
          <td key={column} className="py-4 px-4">
            <div className="flex flex-col gap-1 items-start">
              <span className="text-white tracking-wider text-xs font-mono font-bold whitespace-nowrap">
                {formatKccId(m.userId16)}
              </span>
              {m.legacyUserId16 && (
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {t('admin.oldIdValue', { id: formatKccId(m.legacyUserId16) })}
                </span>
              )}
              <KccIdBadge id={m.userId16} />
            </div>
          </td>
        );
      case 'contact': {
        const extra = Array.isArray(m.additionalPhones)
          ? m.additionalPhones.filter((p): p is string => typeof p === 'string' && p.trim() !== '')
          : [];
        return (
          <td key={column} className="py-4 px-4">
            <div className="space-y-0.5">
              {m.phone ? (
                <p className="text-emerald-400 font-mono font-bold text-xs">{m.phone}</p>
              ) : (
                <p className="text-slate-500 italic text-xs">—</p>
              )}
              {m.phone2 && (
                <p className="text-emerald-300/80 font-mono text-[11px] flex items-center gap-1">
                  <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded font-sans font-semibold">
                    {t('admin.phone2Chip')}
                  </span>
                  <span>{m.phone2}</span>
                </p>
              )}
              {extra.map((p, i) => (
                <p key={`${m.id}_wa_${i}`} className="text-emerald-300/70 font-mono text-[11px] flex items-center gap-1">
                  <span className="text-[9px] px-1 bg-emerald-500/15 text-emerald-300 rounded font-sans font-semibold">
                    {t('admin.additionalPhoneChip')}
                  </span>
                  <span>{p}</span>
                </p>
              ))}
              {m.email && <p className="text-[11px] text-slate-400 break-all">{m.email}</p>}
            </div>
          </td>
        );
      }
      case 'discord':
        return (
          <td key={column} className="py-4 px-4">
            {m.discordUsername ? (
              <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-semibold break-all">
                {m.discordUsername}
              </span>
            ) : (
              <span className="text-slate-500 italic text-xs">—</span>
            )}
          </td>
        );
      case 'role':
        return (
          <td key={column} className="py-4 px-4">
            {m.primaryRole && (
              <span className="inline-block px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold mb-1">
                {m.primaryRole}
              </span>
            )}
            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{m.fandom}</p>
          </td>
        );
      case 'age':
        return (
          <td key={column} className="py-4 px-4">
            <span className="text-slate-300 font-medium">{m.ageCategory || (m.age ? `${m.age}` : '-')}</span>
            {m.age && m.ageCategory && <p className="text-[10px] text-slate-400">{m.age}</p>}
          </td>
        );
      case 'location':
        return (
          <td key={column} className="py-4 px-4 text-slate-300">
            {[m.city, m.country].filter(Boolean).join(', ') || '—'}
          </td>
        );
      case 'status':
        return (
          <td key={column} className="py-4 px-4">
            <StatusSelect member={m} onStatusChange={onStatusChange} />
          </td>
        );
      case 'registered':
        return (
          <td key={column} className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">
            {m.createdAt ? formatDate(m.createdAt) : '-'}
          </td>
        );
      case 'actions':
        return (
          <td key={column} className="py-4 px-4 text-end">
            <div className="flex items-center justify-end gap-2">
              <DetailsToggle open={openIds.has(m.id)} panelId={`member-details-${m.id}`} onToggle={() => toggleOpen(m.id)} />
              <button
                type="button"
                onClick={() => onViewCard(m)}
                title={t('admin.viewKccIdTitle')}
                aria-label={t('admin.viewKccIdTitle')}
                className="touch-target pressable p-1.5 rounded-lg bg-white/[0.07] border border-white/10 hover:bg-white/[0.12] text-slate-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onManage(m)}
                title={t('admin.manageMember')}
                className="touch-target pressable inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-indigo-200 text-[11px] font-bold whitespace-nowrap"
              >
                <UserCog className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('admin.manageMember')}</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(m)}
                title={t('admin.deleteMemberTitle')}
                aria-label={t('admin.deleteMemberTitle')}
                className="touch-target pressable p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 text-rose-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div className="liquid-glass-card rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[color:var(--glass-fill-well)] text-slate-400 uppercase tracking-wider font-mono border-b border-white/10">
            <tr>{MEMBER_COLUMNS.map(renderHeader)}</tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {members.length > 0 ? (
              members.map((m) => (
                <React.Fragment key={m.id}>
                  <tr className="hover:bg-white/[0.04] transition-colors">
                    {MEMBER_COLUMNS.map((column) => renderCell(column, m))}
                  </tr>
                  {openIds.has(m.id) && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={MEMBER_COLUMNS.length} className="px-4 py-3">
                        <DetailsPanel id={`member-details-${m.id}`} member={m} showEmail={false} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={MEMBER_COLUMNS.length}>
                  <EmptyState totalMembers={totalMembers} onOpenSync={onOpenSync} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
