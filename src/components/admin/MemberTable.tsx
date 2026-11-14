/**
 * Admin member list (one page of the filtered + sorted members). The column order is defined ONCE in
 * MEMBER_COLUMNS: header and body cells are both rendered by mapping over it, so they cannot drift apart
 * again (sprint-2 bug: the Status select sat under "Registered" and the date under "Status").
 * Phones (< 768 px) get a card list built from the same data instead of the table.
 */
import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  Crown,
  ExternalLink,
  FileSpreadsheet,
  Hash,
  Instagram,
  MessageCircle,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
} from 'lucide-react';
import type { Member } from '../../types';
import { formatKccId, isAdminRangeKccId, isKccId8, isLegacyKccId16, isMainAccountKccId } from '../../lib/idGenerator';
import { parseSocialLinks } from '../../lib/socialLinks';
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
    includes(m.city) ||
    includes(m.socialMedia) ||
    includes((m as unknown as { instagram?: string }).instagram)
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
// Smart Social Links Parser
// ---------------------------------------------------------------------------------------------

export interface SmartSocialLink {
  platform: 'Instagram' | 'TikTok' | 'X' | 'Facebook' | 'YouTube' | 'Discord' | 'Link' | 'Other';
  handle: string;
  url: string | null;
}

export function parseSmartSocials(socialMedia?: string, instagramField?: string): SmartSocialLink[] {
  const rawList: string[] = [];
  if (instagramField && typeof instagramField === 'string' && instagramField.trim()) {
    rawList.push(`Instagram: ${instagramField.trim()}`);
  }
  if (socialMedia && typeof socialMedia === 'string' && socialMedia.trim()) {
    const parts = socialMedia.split(/\s*\|\s*|\n+/).map((s) => s.trim()).filter(Boolean);
    rawList.push(...parts);
  }

  const results: SmartSocialLink[] = [];
  const seen = new Set<string>();

  for (const item of rawList) {
    if (!item) continue;
    let platform: SmartSocialLink['platform'] = 'Other';
    let handle = item;
    let url: string | null = null;

    const colonIdx = item.indexOf(': ');
    if (colonIdx > 0) {
      const p = item.slice(0, colonIdx).trim();
      const val = item.slice(colonIdx + 2).trim();
      if (/^instagram$/i.test(p)) {
        platform = 'Instagram';
        handle = val;
      } else if (/^tiktok$/i.test(p)) {
        platform = 'TikTok';
        handle = val;
      } else if (/^(x|twitter)$/i.test(p)) {
        platform = 'X';
        handle = val;
      } else if (/^facebook$/i.test(p)) {
        platform = 'Facebook';
        handle = val;
      } else if (/^youtube$/i.test(p)) {
        platform = 'YouTube';
        handle = val;
      } else if (/^discord$/i.test(p)) {
        platform = 'Discord';
        handle = val;
      } else {
        handle = val || item;
      }
    }

    if (platform === 'Other') {
      if (/instagram\.com/i.test(handle)) {
        platform = 'Instagram';
        const m = handle.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
        if (m && m[1] && m[1] !== 'p' && m[1] !== 'reel') {
          handle = m[1];
        }
      } else if (/tiktok\.com/i.test(handle)) {
        platform = 'TikTok';
        const m = handle.match(/tiktok\.com\/@?([a-zA-Z0-9_.-]+)/i);
        if (m && m[1]) handle = m[1];
      } else if (/twitter\.com|x\.com/i.test(handle)) {
        platform = 'X';
        const m = handle.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
        if (m && m[1]) handle = m[1];
      } else if (/facebook\.com/i.test(handle)) {
        platform = 'Facebook';
        url = handle.startsWith('http') ? handle : `https://${handle}`;
      } else if (/youtube\.com|youtu\.be/i.test(handle)) {
        platform = 'YouTube';
        url = handle.startsWith('http') ? handle : `https://${handle}`;
      } else if (/^https?:\/\//i.test(handle)) {
        platform = 'Link';
        url = handle;
      } else if (/^@[a-zA-Z0-9_.-]+$/.test(handle) || /^[a-zA-Z0-9_.-]{3,30}$/.test(handle)) {
        platform = 'Instagram';
      }
    }

    if (platform === 'Instagram') {
      const clean = handle.replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
      handle = `@${clean}`;
      url = clean ? `https://instagram.com/${clean}` : null;
    } else if (platform === 'TikTok') {
      const clean = handle.replace(/^https?:\/\/(?:www\.)?tiktok\.com\/@?/i, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
      handle = `@${clean}`;
      url = clean ? `https://www.tiktok.com/@${clean}` : null;
    } else if (platform === 'X') {
      const clean = handle.replace(/^https?:\/\/(?:www\.)?(?:twitter|x)\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
      handle = `@${clean}`;
      url = clean ? `https://x.com/${clean}` : null;
    } else if (platform === 'Facebook') {
      if (!url) url = handle.startsWith('http') ? handle : `https://facebook.com/${handle.replace(/^@/, '')}`;
    } else if (platform === 'YouTube') {
      if (!url) url = handle.startsWith('http') ? handle : `https://youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`;
    }

    const key = `${platform}:${handle}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ platform, handle, url });
    }
  }

  return results;
}

export function isBirthdayNear(b?: string): boolean {
  if (!b) return false;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  let month = 0;
  let day = 0;
  const match = b.match(/(?:^\d{4}-|^)(\d{1,2})[-/](\d{1,2})/);
  if (match) {
    month = parseInt(match[1], 10);
    day = parseInt(match[2], 10);
  } else {
    const dt = new Date(b);
    if (!isNaN(dt.getTime())) {
      month = dt.getMonth() + 1;
      day = dt.getDate();
    }
  }
  if (month !== currentMonth) return false;
  const diff = day - currentDay;
  return diff >= 0 && diff <= 7;
}

// ---------------------------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------------------------

export const MEMBER_COLUMNS = [
  'select',
  'member',
  'kccId',
  'contact',
  'discord',
  'socials',
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
  indicator?: (mode: SortMode) => TranslationKey | null;
  align?: 'end';
}

const COLUMN_DEFS: Record<MemberColumn, ColumnDef> = {
  select: { label: 'admin.colActions' },
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
  socials: { label: 'admin.fieldSocialMedia' },
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
      <span className={`${chipBase} bg-amber-100 text-amber-900 border-amber-300 font-bold`}>
        <Crown className="w-3 h-3 text-amber-700" aria-hidden="true" />
        <span>{t('admin.mainAccountBadge')}</span>
      </span>
    );
  }
  if (isAdminRangeKccId(value)) {
    const number = String(parseInt(digitsOnly(value) || '1', 10)).padStart(4, '0');
    return (
      <span className={`${chipBase} bg-rose-100 text-rose-900 border-rose-300 font-bold`}>
        <Shield className="w-3 h-3 text-rose-700" aria-hidden="true" />
        <span>{t('admin.adminIdBadge', { number })}</span>
      </span>
    );
  }
  if (isKccId8(value)) {
    return (
      <span className={`${chipBase} bg-slate-200 text-slate-900 border border-slate-300 font-bold`}>
        <Hash className="w-3 h-3 text-slate-700" aria-hidden="true" />
        <span>{t('admin.memberIdBadge')}</span>
      </span>
    );
  }
  if (isLegacyKccId16(value)) {
    return (
      <span className={`${chipBase} bg-indigo-100 text-indigo-900 border-indigo-300 font-bold`}>
        <Clock className="w-3 h-3 text-indigo-700" aria-hidden="true" />
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
  status === 'active' || status === 'verified'
    ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
    : status === 'pending'
    ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
    : 'bg-rose-100 text-rose-950 border-rose-400 font-bold';

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
      className={`px-2.5 py-1 rounded-lg text-base sm:text-xs font-bold border pointer-coarse:min-h-11 shadow-2xs ${statusSelectTone(
        status
      )} ${className}`}
    >
      {MEMBER_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-white text-slate-900 font-semibold">
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
      className={`touch-target pressable inline-flex items-center justify-center p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 pointer-coarse:min-h-11 pointer-coarse:min-w-11 ${className}`}
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
      <a href={v.trim()} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all font-semibold">
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
    [
      t('admin.fieldSocialMedia'),
      String(m.socialMedia ?? '').trim()
        ? parseSmartSocials(m.socialMedia, (m as unknown as { instagram?: string }).instagram).map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="font-bold text-violet-700">{s.platform}:</span>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-pink-700 underline font-semibold">
                  {s.handle}
                </a>
              ) : (
                <span>{s.handle}</span>
              )}
            </div>
          ))
        : '',
    ],
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
            <dd className="text-slate-900 font-medium break-words whitespace-pre-line">{value}</dd>
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
  selectedIds?: ReadonlySet<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
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
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {empty ? t('admin.emptyDatabaseTitle') : t('admin.noResultsTitle')}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
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
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  isSomeSelected = false,
}) => {
  const { t, formatDate } = useI18n();
  const isWide = useMinWidth(768);
  const [openIds, setOpenIds] = React.useState<ReadonlySet<string>>(() => new Set());
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyContact = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1500);
    }
  };

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
        {members.map((m) => {
          const parsedSocials = parseSmartSocials(m.socialMedia, (m as unknown as { instagram?: string }).instagram);
          const insta = parsedSocials.find((s) => s.platform === 'Instagram');
          const waDigits = digitsOnly(m.phone || '');
          const isNear = isBirthdayNear(m.birthday);
          return (
            <li key={m.id} className="liquid-glass-card rounded-2xl p-4 space-y-3 cv-auto border border-slate-200/80 bg-white/95">
              <div className="flex items-start gap-3">
                {onToggleSelect && (
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      aria-label={`Select ${memberName(m)}`}
                      checked={selectedIds?.has(m.id) ?? false}
                      onChange={() => onToggleSelect(m.id)}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                )}
                <Avatar member={m} size="w-11 h-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-bold text-[#0F172A] text-sm break-words">{memberName(m)}</p>
                    {isAdminMember(m) && <AdminChip />}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-purple-950 tracking-wider text-xs font-mono font-bold">{formatKccId(m.userId16)}</span>
                    <KccIdBadge id={m.userId16} />
                  </div>
                  {m.legacyUserId16 && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {t('admin.oldIdValue', { id: formatKccId(m.legacyUserId16) })}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {m.birthday && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isNear ? 'bg-amber-200 text-amber-950 border-amber-400 ring-2 ring-amber-300' : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}
                      >
                        🎂 {m.birthday}
                      </span>
                    )}
                    {m.discordUsername && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-950 border border-indigo-300 text-[10px] font-mono font-bold">
                        💬 {m.discordUsername}
                      </span>
                    )}
                  </div>
                  {parsedSocials.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {parsedSocials.map((s, idx) =>
                        s.platform === 'Instagram' ? (
                          <a
                            key={idx}
                            href={s.url || `https://instagram.com/${s.handle.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-100 text-pink-950 border border-pink-300"
                          >
                            <Instagram className="w-3 h-3 text-pink-700 shrink-0" />
                            <span>{s.handle}</span>
                          </a>
                        ) : s.url ? (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-900 border border-slate-300"
                          >
                            <span className="font-bold text-violet-700">{s.platform}:</span>
                            <span className="truncate max-w-[120px]">{s.handle}</span>
                          </a>
                        ) : (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-900 border border-slate-300"
                          >
                            <span className="font-bold text-violet-700">{s.platform}:</span>
                            <span className="truncate max-w-[120px]">{s.handle}</span>
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <StatusSelect member={m} onStatusChange={onStatusChange} className="w-full" />

              <div className="text-[11px] text-[#334155] font-medium space-y-0.5">
                <p>{t('admin.registeredOn', { date: m.createdAt ? formatDate(m.createdAt) : '-' })}</p>
                {m.phone ? (
                  <p className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-900 font-mono font-bold text-xs hover:underline inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{m.phone}</span>
                    </a>
                  </p>
                ) : (
                  <p className="text-slate-500 italic">—</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onViewCard(m)}
                  className="p-2 rounded-lg bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => onManage(m)}
                  className="p-2 rounded-lg bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 text-indigo-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <UserCog className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span>Manage</span>
                </button>
                {m.phone && (
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {insta && insta.url && (
                  <a
                    href={insta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-pink-50 border border-pink-300 hover:bg-pink-100 text-pink-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
              <div className="flex justify-end pt-1">
                <DetailsToggle open={openIds.has(m.id)} panelId={`member-details-${m.id}`} onToggle={() => toggleOpen(m.id)} />
              </div>
              {openIds.has(m.id) && <DetailsPanel id={`member-details-${m.id}`} member={m} showEmail />}
            </li>
          );
        })}
      </ul>
    );
  }

  // ----- Tablet / desktop: table -----
  const renderHeader = (column: MemberColumn) => {
    if (column === 'select') {
      return (
        <th key={column} scope="col" className="py-4 px-3 w-10 text-center">
          <input
            type="checkbox"
            aria-label="Select all on this page"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isSomeSelected && !isAllSelected;
            }}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
        </th>
      );
    }
    const def = COLUMN_DEFS[column];
    const indicatorKey = def.indicator ? def.indicator(sortMode) : null;
    const alignClass = def.align === 'end' ? 'text-end' : 'text-start';
    const columnTitle = column === 'socials' ? 'Instagram & Socials' : column === 'discord' ? 'Discord' : t(def.label);
    if (!def.sortField) {
      return (
        <th key={column} scope="col" className={`py-4 px-4 ${alignClass}`}>
          {columnTitle}
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
          className="inline-flex items-center gap-1.5 px-2 py-2 rounded-lg uppercase tracking-wider hover:text-purple-900 transition-colors whitespace-nowrap text-[#0F172A] font-bold"
        >
          <span>{columnTitle}</span>
          {indicatorKey && <span className="text-rose-600 font-bold normal-case">{t(indicatorKey)}</span>}
        </button>
      </th>
    );
  };

  const renderCell = (column: MemberColumn, m: Member) => {
    switch (column) {
      case 'select':
        return (
          <td key={column} className="py-4 px-3 text-center">
            <input
              type="checkbox"
              aria-label={`Select ${memberName(m)}`}
              checked={selectedIds?.has(m.id) ?? false}
              onChange={() => onToggleSelect?.(m.id)}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </td>
        );
      case 'member':
        return (
          <td key={column} className="py-4 px-4">
            <div className="flex items-center gap-3">
              <Avatar member={m} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-bold text-[#0F172A] text-sm">{memberName(m)}</p>
                  {isAdminMember(m) && <AdminChip />}
                </div>
                {m.fullName && m.fullName !== memberName(m) && (
                  <p className="text-[11px] text-[#475569] font-medium">{t('admin.legalNameValue', { name: m.fullName })}</p>
                )}
              </div>
            </div>
          </td>
        );
      case 'kccId':
        return (
          <td key={column} className="py-4 px-4">
            <div className="flex flex-col gap-1 items-start">
              <span className="text-purple-950 tracking-wider text-xs font-mono font-bold whitespace-nowrap">
                {formatKccId(m.userId16)}
              </span>
              {m.legacyUserId16 && (
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
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
        const waDigits = digitsOnly(m.phone || '');
        return (
          <td key={column} className="py-4 px-4">
            <div className="space-y-1">
              {m.phone ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-900 font-bold font-mono text-xs hover:underline inline-flex items-center gap-1"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{m.phone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copyContact(m.phone!)}
                    title="Copy phone"
                    aria-label="Copy phone number"
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-800 transition-colors"
                  >
                    {copiedText === m.phone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 italic text-xs">—</p>
              )}
              {m.phone2 && (
                <p className="text-emerald-800 font-mono text-[11px] flex items-center gap-1">
                  <span className="text-[9px] px-1 bg-emerald-100 text-emerald-900 rounded font-sans font-semibold border border-emerald-300">
                    {t('admin.phone2Chip')}
                  </span>
                  <a
                    href={`https://wa.me/${digitsOnly(m.phone2)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {m.phone2}
                  </a>
                </p>
              )}
              {extra.map((p, i) => (
                <p key={`${m.id}_wa_${i}`} className="text-emerald-800 font-mono text-[11px] flex items-center gap-1">
                  <span className="text-[9px] px-1 bg-emerald-100 text-emerald-900 rounded font-sans font-semibold border border-emerald-300">
                    {t('admin.additionalPhoneChip')}
                  </span>
                  <span>{p}</span>
                </p>
              ))}
              {m.email && <p className="text-xs text-[#334155] font-medium break-all">{m.email}</p>}
            </div>
          </td>
        );
      }
      case 'discord':
        return (
          <td key={column} className="py-4 px-4">
            {m.discordUsername ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-950 border border-indigo-300 font-mono text-xs font-semibold break-all">
                <span>💬 {m.discordUsername}</span>
                <button
                  type="button"
                  onClick={() => copyContact(m.discordUsername!)}
                  title="Copy Discord Username"
                  aria-label="Copy Discord Username"
                  className="p-0.5 rounded hover:bg-indigo-200 text-indigo-900 transition-colors"
                >
                  {copiedText === m.discordUsername ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </span>
            ) : (
              <span className="text-slate-400 italic text-xs">—</span>
            )}
          </td>
        );
      case 'socials': {
        const parsedSocials = parseSmartSocials(m.socialMedia, (m as unknown as { instagram?: string }).instagram);
        return (
          <td key={column} className="py-4 px-4">
            <div className="flex flex-col gap-1 items-start">
              {parsedSocials.length > 0 ? (
                parsedSocials.map((s, idx) => {
                  if (s.platform === 'Instagram') {
                    return (
                      <a
                        key={idx}
                        href={s.url || `https://instagram.com/${s.handle.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-pink-100 text-pink-950 border border-pink-300 hover:bg-pink-200 transition-colors shadow-2xs"
                        title="Open Instagram Profile"
                      >
                        <Instagram className="w-3 h-3 text-pink-700 shrink-0" />
                        <span className="break-all">{s.handle}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-pink-600 shrink-0 opacity-70" />
                      </a>
                    );
                  }
                  if (s.url) {
                    return (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 transition-colors"
                      >
                        <span className="font-bold text-violet-700">{s.platform}:</span>
                        <span className="truncate max-w-[130px]">{s.handle}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500 shrink-0 opacity-70" />
                      </a>
                    );
                  }
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-900 border border-slate-300"
                    >
                      <span className="font-bold text-violet-700">{s.platform}:</span>
                      <span className="truncate max-w-[130px]">{s.handle}</span>
                    </span>
                  );
                })
              ) : (
                <span className="text-slate-400 italic text-xs">—</span>
              )}
            </div>
          </td>
        );
      }
      case 'role':
        return (
          <td key={column} className="py-4 px-4">
            {m.primaryRole && (
              <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 font-semibold text-xs mb-1">
                {m.primaryRole}
              </span>
            )}
            {m.fandom && (
              <p className="text-xs text-[#334155] font-medium truncate max-w-[150px]">{m.fandom}</p>
            )}
          </td>
        );
      case 'age': {
        const isNear = isBirthdayNear(m.birthday);
        const ageCategoryStr = (m.ageCategory || '').trim();
        const ageStr = (m.age || '').trim();
        const isDuplicate = Boolean(
          ageStr &&
            ageCategoryStr &&
            (ageCategoryStr.toLowerCase().includes(ageStr.toLowerCase()) ||
              ageStr.toLowerCase().includes(ageCategoryStr.toLowerCase()))
        );
        return (
          <td key={column} className="py-4 px-4">
            <span className="text-slate-900 font-semibold text-xs">
              {ageCategoryStr || ageStr || '—'}
            </span>
            {ageStr && !isDuplicate && (
              <p className="text-[11px] text-[#334155] font-medium mt-0.5">{ageStr}</p>
            )}
            {m.birthday && (
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isNear
                      ? 'bg-amber-200 text-amber-950 border-amber-400 ring-2 ring-amber-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}
                  title={isNear ? 'Birthday today or within 7 days!' : 'Birthday'}
                >
                  🎂 {m.birthday}
                  {isNear && <span className="text-[9px] font-black text-rose-600">★ SOON</span>}
                </span>
              </div>
            )}
          </td>
        );
      }
      case 'location':
        return (
          <td key={column} className="py-4 px-4 text-slate-900 font-medium text-xs">
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
          <td key={column} className="py-4 px-4 text-[#334155] font-medium text-xs whitespace-nowrap">
            {m.createdAt ? formatDate(m.createdAt) : '—'}
          </td>
        );
      case 'actions': {
        const parsedSocials = parseSmartSocials(m.socialMedia, (m as unknown as { instagram?: string }).instagram);
        const insta = parsedSocials.find((s) => s.platform === 'Instagram');
        const waDigits = digitsOnly(m.phone || '');
        return (
          <td key={column} className="py-4 px-4 text-end">
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
              {/* 1-Click View / Download KCC ID Card */}
              <button
                type="button"
                onClick={() => onViewCard(m)}
                title={t('admin.viewKccIdTitle') || 'View KCC ID Card'}
                aria-label={t('admin.viewKccIdTitle') || 'View KCC ID Card'}
                className="touch-target pressable p-2 rounded-lg bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-900 transition-colors shadow-2xs"
              >
                <CreditCard className="w-4 h-4 text-purple-700" />
              </button>

              {/* 1-Click Manage / Edit */}
              <button
                type="button"
                onClick={() => onManage(m)}
                title={t('admin.manageMember') || 'Manage Member'}
                aria-label={t('admin.manageMember') || 'Manage Member'}
                className="touch-target pressable inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors shadow-2xs whitespace-nowrap"
              >
                <UserCog className="w-3.5 h-3.5 text-indigo-700" aria-hidden="true" />
                <span>{t('admin.manageMember')}</span>
              </button>

              {/* 1-Click WhatsApp Opener */}
              {m.phone && (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Message on WhatsApp"
                  aria-label="Message on WhatsApp"
                  className="touch-target pressable p-2 rounded-lg bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </a>
              )}

              {/* 1-Click Instagram Opener */}
              {insta && insta.url && (
                <a
                  href={insta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open Instagram (${insta.handle})`}
                  aria-label={`Open Instagram (${insta.handle})`}
                  className="touch-target pressable p-2 rounded-lg bg-pink-50 border border-pink-300 hover:bg-pink-100 text-pink-800 transition-colors shadow-2xs"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                </a>
              )}

              {/* Details toggle */}
              <DetailsToggle open={openIds.has(m.id)} panelId={`member-details-${m.id}`} onToggle={() => toggleOpen(m.id)} />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => onDelete(m)}
                title={t('admin.deleteMemberTitle')}
                aria-label={t('admin.deleteMemberTitle')}
                className="touch-target pressable p-2 rounded-lg bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 transition-colors shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="liquid-glass-card rounded-3xl overflow-hidden border border-slate-200/80 bg-white/95">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-100/90 text-slate-800 uppercase tracking-wider font-mono border-b border-slate-200">
            <tr>{MEMBER_COLUMNS.map(renderHeader)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {members.length > 0 ? (
              members.map((m) => (
                <React.Fragment key={m.id}>
                  <tr className="hover:bg-violet-50/40 transition-colors">
                    {MEMBER_COLUMNS.map((column) => renderCell(column, m))}
                  </tr>
                  {openIds.has(m.id) && (
                    <tr className="bg-slate-50/80">
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
