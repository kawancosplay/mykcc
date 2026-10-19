import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Search,
  Users,
  Download,
  Trash2,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCw,
  LogOut,
  Phone,
  Images,
  Wrench,
  History,
  UserCog,
} from 'lucide-react';
import type { AdminEntry, KccCounter, Member, SyncLog, SubscriptionErrorKind } from '../types';
import { formatKccId } from '../lib/idGenerator';
import { updateMemberStatus, deleteMember, purgeAllMembersFromFirestore, getKccCounter } from '../lib/firestoreService';
import { listAdmins } from '../lib/adminService';
import { describeFirestoreError } from '../lib/firebase';
import { haptic } from '../lib/haptic';
import { LAYOUT_IDS, usePresenceMotion, useReducedMotion, useThumbTransition } from '../lib/motion';
import type { MotionTransition } from '../lib/motion';
import { GoogleSheetsSync } from './GoogleSheetsSync';
import { StatsOverview } from './StatsOverview';
import { useI18n } from '../i18n';
import type { LanguageCode, TranslationKey } from '../i18n';
import type { User } from 'firebase/auth';
import {
  OFFICIAL_ADMIN_EMAIL,
  STATUS_LABEL_KEYS,
  csvCell,
  downloadCsv,
  fileDateStamp,
  memberName,
  renderRich,
} from './admin/adminUi';
import type { AdminBusyTask, MemberStatus } from './admin/adminUi';
import { MemberTable, memberMatchesQuery, nextSortMode, sortMembers } from './admin/MemberTable';
import type { SortField, SortMode } from './admin/MemberTable';
import { DEFAULT_PAGE_SIZE, Pagination, parsePageSize } from './admin/Pagination';
import type { PageSize } from './admin/Pagination';
import { DashboardLockGate } from './admin/DashboardLockGate';
import type { DashboardLockInfo } from './admin/DashboardLockGate';
import { DashboardPasswordCard } from './admin/DashboardPasswordCard';
import { AdminsPanel } from './admin/AdminsPanel';
import { AdminGalleryTab } from './admin/AdminGalleryTab';
import { AuditLogTab } from './admin/AuditLogTab';
import { IdToolsTab } from './admin/IdToolsTab';
import { MemberSupportModal } from './admin/MemberSupportModal';

interface AdminDashboardProps {
  user: User | null;
  isAdmin: boolean; // App-resolved (checkIsAdminUser for the CURRENT uid)
  isAdminChecking: boolean; // true while App resolves admin status
  accessToken: string | null; // Sheets token from googleSignIn only
  members: Member[];
  membersLoaded: boolean; // true after first successful members snapshot
  membersError: SubscriptionErrorKind | null;
  syncLogs: SyncLog[];
  syncLogsError: SubscriptionErrorKind | null;
  currentLang: LanguageCode; // Kept for existing callers; the language comes from useI18n()
  onSelectMember: (member: Member) => void;
  onOpenAuth: () => void; // opens AuthModal (Google sign-in)
  onConnectSheets: () => void | Promise<void>; // on-demand googleSignIn (read-only Sheets scope), owned by App
  sheetsConnectError: string | null;
  onLogout: () => void;
}

const NAMED_DATABASE_ID = 'ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040';
const ADMIN_WHATSAPP_DISPLAY = '+62 857-1103-2782';
// Keyword the admin must type to confirm the purge (compared in code, never translated)
const PURGE_CONFIRM_KEYWORD = 'PURGE';
// Member list rows per page, remembered per browser (convenience only)
const PAGE_SIZE_STORAGE_KEY = 'kcc_admin_page_size';
// How long the "a task is still running" note stays after a blocked tab tap
const BUSY_NOTE_MS = 4000;

// Admin sub-tabs, in display order (LTR left to right): used for the direction of the content slide
type AdminTab = 'members' | 'gallery' | 'tools' | 'sync' | 'admins' | 'log' | 'analytics';
const ADMIN_TAB_ORDER: readonly AdminTab[] = ['members', 'gallery', 'tools', 'sync', 'admins', 'log', 'analytics'];
const TAB_ICONS: Record<AdminTab, React.ComponentType<{ className?: string }>> = {
  members: Users,
  gallery: Images,
  tools: Wrench,
  sync: FileSpreadsheet,
  admins: UserCog,
  log: History,
  analytics: BarChart3,
};

function readStoredPageSize(): PageSize {
  try {
    if (typeof window === 'undefined') return DEFAULT_PAGE_SIZE;
    return parsePageSize(window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY)) ?? DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
}

function storePageSize(size: PageSize): void {
  try {
    window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size));
  } catch {
    // Storage blocked: the choice simply is not remembered
  }
}

/**
 * Active indicator of the admin sub-tabs. Only the active tab renders it; the shared layoutId makes it
 * slide from the previous tab. borderRadius is set inline (same value as the CSS) so framer-motion keeps
 * the pill round while it scales between tabs of different widths.
 */
const AdminTabThumb: React.FC<{ transition: MotionTransition }> = ({ transition }) => (
  <motion.span
    layoutId={LAYOUT_IDS.adminTabs}
    className="glass-segment-thumb"
    style={{ borderRadius: 9999 }}
    transition={transition}
    aria-hidden="true"
  />
);

/** Runs `onMount` when it mounts, i.e. when the lock gate renders the dashboard (open / unlocked). */
const OnUnlocked: React.FC<{ onMount: () => void }> = ({ onMount }) => {
  const ref = useRef(onMount);
  useEffect(() => {
    ref.current();
  }, []);
  return null;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  isAdmin,
  isAdminChecking,
  accessToken,
  members,
  membersLoaded,
  membersError,
  syncLogs,
  syncLogsError,
  onSelectMember,
  onOpenAuth,
  onConnectSheets,
  sheetsConnectError,
  onLogout,
}) => {
  const { t, isRtl, formatNumber } = useI18n();
  const reducedMotion = useReducedMotion();

  // ----- Tabs + long-running task guard -----
  const [adminTab, setAdminTab] = useState<AdminTab>('members');
  // 1 = new content slides in from the right, -1 = from the left, 0 = no slide yet (first render)
  const [adminTabDirection, setAdminTabDirection] = useState(0);
  const tabMotion = usePresenceMotion('tab');
  const thumbTransition = useThumbTransition();
  const [busyTask, setBusyTask] = useState<AdminBusyTask | null>(null);
  const [showBusyNote, setShowBusyNote] = useState(false);
  const busyNoteTimer = useRef<number | null>(null);
  const isBusy = busyTask !== null;

  const selectAdminTab = (tab: AdminTab) => {
    if (tab === adminTab) return;
    if (busyTask !== null) {
      // Switching would unmount the running task: explain instead
      setShowBusyNote(true);
      haptic('error');
      if (busyNoteTimer.current) window.clearTimeout(busyNoteTimer.current);
      busyNoteTimer.current = window.setTimeout(() => setShowBusyNote(false), BUSY_NOTE_MS);
      return;
    }
    // A later tab sits to the right in LTR (to the left in RTL): its content slides in from that side
    const step = Math.sign(ADMIN_TAB_ORDER.indexOf(tab) - ADMIN_TAB_ORDER.indexOf(adminTab));
    setAdminTabDirection(isRtl ? -step : step);
    setAdminTab(tab);
    setShowBusyNote(false);
    haptic('selection');
  };

  const handleBusyChange = useCallback((task: AdminBusyTask | null) => {
    setBusyTask(task);
    if (task === null) setShowBusyNote(false);
  }, []);

  // Closing / reloading the page during a long task: ask first
  useEffect(() => {
    if (!busyTask) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [busyTask]);

  useEffect(
    () => () => {
      if (busyNoteTimer.current) window.clearTimeout(busyNoteTimer.current);
    },
    []
  );

  // ----- Dashboard lock (state reported by DashboardLockGate) -----
  const [lockInfo, setLockInfo] = useState<DashboardLockInfo | null>(null);

  // ----- KCC ID counter: undefined = loading/unknown, null = before the 8-digit switch -----
  const [kccCounter, setKccCounter] = useState<KccCounter | null | undefined>(undefined);
  const refreshCounter = useCallback(async () => {
    try {
      setKccCounter(await getKccCounter());
    } catch (error) {
      // Read errors: nothing ID-era specific is shown (no crash)
      console.warn('KCC counter could not be read:', error);
    }
  }, []);

  // ----- Admins (loaded lazily by the Admins tab / support sheet; cached here) -----
  const [admins, setAdmins] = useState<AdminEntry[] | null>(null);
  const reloadAdmins = useCallback(async () => {
    const list = await listAdmins();
    setAdmins(list);
    return list;
  }, []);
  const adminUids = useMemo(() => new Set((admins || []).map((a) => a.uid)), [admins]);

  // ----- Member support sheet (member re-resolved from the live snapshot on every render) -----
  const [supportMemberId, setSupportMemberId] = useState<string | null>(null);
  const supportMember = useMemo(
    () => (supportMemberId ? members.find((m) => m.id === supportMemberId) ?? null : null),
    [members, supportMemberId]
  );
  // The member was deleted / merged elsewhere: forget the selection (the sheet already closed)
  useEffect(() => {
    if (supportMemberId && membersLoaded && !supportMember) setSupportMemberId(null);
  }, [supportMemberId, membersLoaded, supportMember]);

  // Runs every time the lock gate shows the dashboard (first open, after an unlock)
  const handleDashboardShown = useCallback(() => {
    // A sheet that was open when the dashboard locked does not pop up again after unlocking
    setSupportMemberId(null);
    void refreshCounter();
  }, [refreshCounter]);

  // ----- Search, filters, sort, pagination -----
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('timestamp_desc');
  const [pageSize, setPageSize] = useState<PageSize>(() => readStoredPageSize());
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  const handleToggleSort = (field: SortField) => setSortMode((prev) => nextSortMode(prev, field));

  // Back to page 1 whenever what is listed changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedRole, selectedCity, selectedAgeCategory, sortMode, pageSize]);

  const handlePageSize = (size: PageSize) => {
    setPageSize(size);
    storePageSize(size);
  };

  const [isPurging, setIsPurging] = useState(false);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.primaryRole) set.add(m.primaryRole);
    });
    return Array.from(set).sort();
  }, [members]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.city) set.add(m.city);
    });
    return Array.from(set).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    const filtered = members.filter(
      (m) =>
        memberMatchesQuery(m, searchQuery) &&
        (selectedRole === 'ALL' || m.primaryRole === selectedRole) &&
        (selectedCity === 'ALL' || m.city === selectedCity) &&
        (selectedAgeCategory === 'ALL' || m.ageCategory === selectedAgeCategory)
    );
    return sortMembers(filtered, sortMode);
  }, [members, searchQuery, selectedRole, selectedCity, selectedAgeCategory, sortMode]);

  const total = filteredMembers.length;
  const effectivePageSize = pageSize === 'all' ? Math.max(1, total) : pageSize;
  const pageCount = Math.max(1, Math.ceil(total / effectivePageSize));
  // Clamped when the list shrinks (e.g. after a delete)
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * effectivePageSize;
  const pageMembers = useMemo(
    () => filteredMembers.slice(pageStart, pageStart + effectivePageSize),
    [filteredMembers, pageStart, effectivePageSize]
  );
  const rangeFrom = total === 0 ? 0 : pageStart + 1;
  const rangeTo = Math.min(total, pageStart + effectivePageSize);

  const goToPage = (next: number) => {
    const clamped = Math.max(1, Math.min(pageCount, next));
    if (clamped === currentPage) return;
    setPage(clamped);
    const lite = typeof document !== 'undefined' && document.documentElement.dataset.perf === 'lite';
    listTopRef.current?.scrollIntoView({ behavior: reducedMotion || lite ? 'auto' : 'smooth', block: 'start' });
  };

  // ----- Member actions -----
  const handleStatusChange = async (member: Member, newStatus: MemberStatus) => {
    try {
      await updateMemberStatus(member.id, newStatus, member.userId16);
    } catch (e) {
      alert(t('admin.statusUpdateFailed', { error: describeFirestoreError(e) }));
    }
  };

  /** Confirm + delete; resolves false when cancelled. Errors are thrown to the caller. */
  const confirmAndDelete = async (member: Member): Promise<boolean> => {
    const confirmDelete = window.confirm(
      t('admin.deleteMemberConfirm', { name: memberName(member), id: formatKccId(member.userId16) })
    );
    if (!confirmDelete) return false;
    await deleteMember(member.id, member.userId16, { name: memberName(member) });
    haptic('success');
    return true;
  };

  const handleDeleteMember = async (member: Member) => {
    if (isBusy) return;
    try {
      await confirmAndDelete(member);
    } catch (e) {
      haptic('error');
      alert(t('admin.deleteMemberFailed', { error: describeFirestoreError(e) }));
    }
  };

  const handleDeleteFromSupport = async (member: Member) => {
    const deleted = await confirmAndDelete(member);
    if (deleted) setSupportMemberId(null);
  };

  const handlePurgeAll = async () => {
    if (isBusy) return;
    const confirmCode = window.prompt(t('admin.purgePrompt', { keyword: PURGE_CONFIRM_KEYWORD }));
    if (confirmCode !== PURGE_CONFIRM_KEYWORD) {
      if (confirmCode !== null) alert(t('admin.purgeCancelled'));
      return;
    }

    setIsPurging(true);
    handleBusyChange('purge');
    try {
      const deletedCount = await purgeAllMembersFromFirestore();
      haptic('success');
      alert(t('admin.purgeSuccess', { count: formatNumber(deletedCount) }));
    } catch (e) {
      haptic('error');
      alert(t('admin.purgeFailed', { error: describeFirestoreError(e) }));
    } finally {
      setIsPurging(false);
      handleBusyChange(null);
    }
  };

  // CSV of the filtered list. Header order == cell order. IDs FORMATTED (Excel keeps leading zeros), values
  // starting with = + - @ are prefixed with ' (CSV injection), downloaded as a Blob with a BOM.
  const exportToCsv = () => {
    if (filteredMembers.length === 0) {
      alert(t('admin.exportNoData'));
      return;
    }
    const headerKeys: TranslationKey[] = [
      'admin.csvKccId',
      'admin.csvOldKccId',
      'admin.csvCosname',
      'admin.csvLegalName',
      'admin.csvPrimaryWhatsapp',
      'admin.csvBackupWhatsapp',
      'admin.csvDiscord',
      'admin.csvEmail',
      'admin.csvAgeCategory',
      'admin.csvAge',
      'admin.csvCountry',
      'admin.csvProvince',
      'admin.csvCity',
      'admin.csvPrimaryRole',
      'admin.csvFandom',
      'admin.csvExperience',
      'admin.csvStatus',
      'admin.csvRegisteredAt',
    ];
    const header = headerKeys.map((key) => csvCell(t(key))).join(',');
    const rows = filteredMembers.map((m) =>
      [
        m.userId16 ? formatKccId(m.userId16) : '',
        m.legacyUserId16 ? formatKccId(m.legacyUserId16) : '',
        m.cosplayName || m.name || '',
        m.fullName || '',
        m.phone || '',
        [m.phone2, ...(Array.isArray(m.additionalPhones) ? m.additionalPhones : [])].filter(Boolean).join(' / '),
        m.discordUsername || '',
        m.email || '',
        m.ageCategory || '',
        m.age || '',
        m.country || '',
        m.province || '',
        m.city || '',
        m.primaryRole || '',
        m.fandom || '',
        m.experience || '',
        m.status || '',
        m.createdAt || '',
      ]
        .map(csvCell)
        .join(',')
    );
    downloadCsv(`kawancosplay_members_${fileDateStamp()}.csv`, [header, ...rows].join('\r\n'));
  };

  // ----- Not authorized: privacy lock screen (Google sign-in only, no passkey) -----
  if (!isAdmin || !user) {
    const signedInLabel = user ? user.email || user.uid : '';
    const isUnverifiedAdminEmail =
      !!user && !!user.email && user.email.toLowerCase().trim() === OFFICIAL_ADMIN_EMAIL && !user.emailVerified;

    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-fade-in text-slate-100">
        <div className="glass-card glass-raised border-amber-500/30 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">{t('admin.dashboardTitle')}</h2>

          {isAdminChecking ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-slate-300">{t('admin.checkingAccess')}</p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">{t('admin.privacyRestrictedNotice')}</p>

              {user && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-start space-y-1.5">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      {renderRich(t('admin.signedInNotAdmin'), {
                        account: <strong className="text-white break-all">{signedInLabel}</strong>,
                      })}
                    </span>
                  </p>
                  {isUnverifiedAdminEmail && <p className="ps-6 text-amber-300 font-semibold">{t('admin.emailNotVerified')}</p>}
                </div>
              )}

              <button onClick={onOpenAuth} className="btn-primary pressable w-full py-3 px-4 text-sm whitespace-normal">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t('admin.signInWithAdminGoogleEmail', { email: OFFICIAL_ADMIN_EMAIL })}</span>
              </button>

              {user && (
                <button onClick={onLogout} className="glass-button pressable w-full mt-3 px-4 text-xs">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{t('admin.signOutThisAccount')}</span>
                </button>
              )}
            </>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t('admin.whatsappAdminHelp', { phone: ADMIN_WHATSAPP_DISPLAY })}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    selectedRole !== 'ALL' || selectedCity !== 'ALL' || selectedAgeCategory !== 'ALL' || !!searchQuery;

  const tabLabel = (tab: AdminTab): string => {
    switch (tab) {
      case 'members':
        return t('admin.tabMembers', { count: membersLoaded ? formatNumber(members.length) : '—' });
      case 'gallery':
        return t('admin.tabGallery');
      case 'tools':
        return t('admin.tabTools');
      case 'sync':
        return t('admin.tabSync');
      case 'admins':
        return t('admin.tabAdmins');
      case 'log':
        return t('admin.tabLog');
      case 'analytics':
      default:
        return t('admin.tabStats');
    }
  };

  // ----- Authorized: the dashboard behind the (optional) dashboard lock -----
  return (
    <>
      <DashboardLockGate user={user} onLogout={onLogout} busy={isBusy} onLockState={setLockInfo}>
        <OnUnlocked onMount={handleDashboardShown} />
        <div className="w-full mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-slate-100">
          {/* Top Admin Banner */}
          <div className="liquid-glass-card glass-raised rounded-3xl p-5 sm:p-8 mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="glass-chip font-bold bg-rose-500/20 text-rose-300 border-rose-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t('admin.managementPortalBadge')}</span>
                  </span>
                  <span className="glass-chip font-mono font-normal bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {t('admin.verifiedAccessBadge')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{t('admin.dashboardTitle')}</h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                  {t('admin.dashboardDesc')} {t('admin.dashboardPrivacyNote')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://wa.me/6285711032782"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button pressable px-3.5 text-xs font-bold bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('admin.whatsappHotlineShort', { phone: ADMIN_WHATSAPP_DISPLAY })}</span>
                </a>
                {lockInfo?.hasLock && (
                  <button
                    type="button"
                    onClick={() => lockInfo.lockNow()}
                    disabled={isBusy}
                    className="glass-button pressable px-3.5 text-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-300" />
                    <span>{t('admin.lockNow')}</span>
                  </button>
                )}
                <button type="button" onClick={onLogout} disabled={isBusy} className="glass-button pressable px-3.5 text-xs">
                  <LogOut className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('admin.signOutAdmin')}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Summary ('—' until the first successful members snapshot) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-white/10">
              <div className="glass-well p-4 rounded-2xl">
                <p className="text-xs text-slate-400">{t('admin.totalMembers')}</p>
                <p className="text-2xl font-black text-white">{membersLoaded ? formatNumber(members.length) : '—'}</p>
              </div>
              {(
                [
                  ['verified', 'text-emerald-400'],
                  ['active', 'text-indigo-400'],
                  ['pending', 'text-amber-400'],
                ] as Array<[MemberStatus, string]>
              ).map(([status, tone]) => (
                <div key={status} className="glass-well p-4 rounded-2xl">
                  <p className="text-xs text-slate-400">{t('admin.statusStat', { status: t(STATUS_LABEL_KEYS[status]) })}</p>
                  <p className={`text-2xl font-black ${tone}`}>
                    {membersLoaded ? formatNumber(members.filter((m) => m.status === status).length) : '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Sub-nav tabs (segmented control; scrolls sideways on narrow screens). The active thumb slides
                between tabs (shared layoutId); layoutScroll keeps it right while the control is scrolled. */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <motion.div
                role="tablist"
                aria-label={t('admin.dashboardTitle')}
                className="glass-segmented glass-segmented-scroll"
                layoutScroll
              >
                {ADMIN_TAB_ORDER.map((tab) => {
                  const Icon = TAB_ICONS[tab];
                  const selected = adminTab === tab;
                  const blocked = isBusy && !selected;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-disabled={blocked || undefined}
                      onClick={() => selectAdminTab(tab)}
                      className={`glass-segment shrink-0 ${blocked ? 'opacity-50' : ''}`}
                    >
                      {selected && <AdminTabThumb transition={thumbTransition} />}
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tabLabel(tab)}</span>
                    </button>
                  );
                })}
              </motion.div>
              {showBusyNote && (
                <p role="status" className="mt-3 text-xs text-amber-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                  <span>{t('admin.busyTabLocked')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Sub-tab content. The keyed wrapper re-mounts per tab and slides the new content in from the side
              of the chosen tab (opacity + 16px translate, inside this container's >= 16px side padding, so no
              horizontal overflow). Sheets/dialogs are portaled to <body>, so the brief transform is safe. */}
          <motion.div
            key={adminTab}
            custom={adminTabDirection}
            {...tabMotion}
            initial={adminTabDirection === 0 ? false : tabMotion.initial}
          >
            {/* MEMBERS: (a) rejected by Firestore rules */}
            {adminTab === 'members' && membersError === 'permission-denied' && (
              <div className="liquid-glass-card rounded-3xl p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('admin.permissionDeniedTitle')}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                  {renderRich(t('admin.permissionDeniedDesc', { email: OFFICIAL_ADMIN_EMAIL }), {
                    database: <span className="font-mono text-amber-300 break-all">{NAMED_DATABASE_ID}</span>,
                  })}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={onOpenAuth}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('admin.signInWithAdminGoogle')}</span>
                  </button>
                  <button onClick={() => window.location.reload()} className="glass-button pressable px-4 text-xs">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('admin.reloadPage')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* MEMBERS: (b) any other subscription error (offline, unavailable, ...) */}
            {adminTab === 'members' && membersError && membersError !== 'permission-denied' && (
              <div className="liquid-glass-card rounded-3xl p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('admin.loadMembersFailedTitle')}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">{t('admin.loadMembersFailedDesc')}</p>
                <button onClick={() => window.location.reload()} className="glass-button pressable px-4 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('admin.reloadPage')}</span>
                </button>
              </div>
            )}

            {/* MEMBERS: (c) waiting for the first members snapshot */}
            {adminTab === 'members' && !membersError && !membersLoaded && (
              <div className="liquid-glass-card rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs sm:text-sm text-slate-300">{t('admin.loadingMembers')}</p>
              </div>
            )}

            {/* MEMBERS: (d) loaded — filters, pagination, list */}
            {adminTab === 'members' && !membersError && membersLoaded && (
              <div className="space-y-5">
                <div className="liquid-glass-card rounded-3xl p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="search"
                        placeholder={t('admin.searchPlaceholder')}
                        aria-label={t('admin.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full ps-12 pe-4 py-3.5 liquid-glass-input rounded-2xl text-white text-base"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        aria-label={t('admin.colRole')}
                        className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-300 max-w-full"
                      >
                        <option value="ALL">{t('admin.filterAllRoles', { count: formatNumber(members.length) })}</option>
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        aria-label={t('admin.colLocation')}
                        className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-300 max-w-full"
                      >
                        <option value="ALL">{t('admin.filterAllCities')}</option>
                        {availableCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedAgeCategory}
                        onChange={(e) => setSelectedAgeCategory(e.target.value)}
                        aria-label={t('admin.colAge')}
                        className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-300 max-w-full"
                      >
                        <option value="ALL">{t('admin.filterAllAges')}</option>
                        {/* Values are the stored ageCategory strings; only the labels are translated */}
                        <option value="Legal Age / Dewasa (18+)">{t('admin.filterLegalAge')}</option>
                        <option value="Minor / Di Bawah Umur (<18)">{t('admin.filterMinor')}</option>
                        <option value="Memilih untuk tidak menyebutkan">{t('admin.filterPreferNotToSay')}</option>
                      </select>

                      <div className="flex items-center gap-1.5 liquid-glass-input rounded-xl px-2.5 py-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <select
                          value={sortMode === 'name_asc' ? 'name_asc' : 'timestamp_desc'}
                          onChange={(e) => setSortMode(e.target.value === 'name_asc' ? 'name_asc' : 'timestamp_desc')}
                          className="bg-transparent text-base sm:text-sm text-slate-200 focus:outline-none pe-1 cursor-pointer"
                        >
                          <option value="timestamp_desc">{t('admin.sortNewest')}</option>
                          <option value="name_asc">{t('admin.sortNameAsc')}</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={exportToCsv}
                        className="px-3.5 py-2 liquid-glass-button rounded-xl text-xs font-bold text-slate-900 inline-flex items-center gap-1.5 shadow-md pointer-coarse:min-h-11"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('admin.exportCsv')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePurgeAll}
                        disabled={isPurging || isBusy}
                        title={t('admin.purgeButtonTitle')}
                        className="px-3.5 py-2 liquid-glass-button rounded-xl text-xs font-bold text-rose-900 inline-flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed pointer-coarse:min-h-11"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                        <span>{isPurging ? t('admin.purging') : t('admin.purgeButton')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-3 border-t border-white/10">
                    <span>
                      {renderRich(t('admin.showingMembers', { total: formatNumber(members.length) }), {
                        shown: <strong>{formatNumber(total)}</strong>,
                      })}
                    </span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('ALL');
                          setSelectedCity('ALL');
                          setSelectedAgeCategory('ALL');
                          setSearchQuery('');
                        }}
                        className="touch-target text-rose-400 hover:underline"
                      >
                        {t('admin.resetFilter')}
                      </button>
                    )}
                  </div>
                </div>

                <div ref={listTopRef} className="scroll-mt-24 space-y-4">
                  <Pagination
                    page={currentPage}
                    pageCount={pageCount}
                    from={rangeFrom}
                    to={rangeTo}
                    total={total}
                    pageSize={pageSize}
                    onPage={goToPage}
                    onPageSize={handlePageSize}
                  />

                  <MemberTable
                    members={pageMembers}
                    totalMembers={members.length}
                    sortMode={sortMode}
                    onToggleSort={handleToggleSort}
                    adminUids={adminUids}
                    onViewCard={onSelectMember}
                    onManage={(m) => setSupportMemberId(m.id)}
                    onDelete={handleDeleteMember}
                    onStatusChange={handleStatusChange}
                    onOpenSync={() => selectAdminTab('sync')}
                  />

                  {pageCount > 1 && (
                    <Pagination
                      page={currentPage}
                      pageCount={pageCount}
                      from={rangeFrom}
                      to={rangeTo}
                      total={total}
                      pageSize={pageSize}
                      onPage={goToPage}
                      onPageSize={handlePageSize}
                    />
                  )}
                </div>
              </div>
            )}

            {/* GALLERY MODERATION */}
            {adminTab === 'gallery' && <AdminGalleryTab busy={isBusy} />}

            {/* KCC ID TOOLS */}
            {adminTab === 'tools' && (
              <IdToolsTab
                user={user}
                members={members}
                kccCounter={kccCounter}
                refreshCounter={refreshCounter}
                busyTask={busyTask}
                onBusyChange={handleBusyChange}
                onOpenSync={() => selectAdminTab('sync')}
              />
            )}

            {/* GOOGLE SHEETS SYNC (+ registration date fix) */}
            {adminTab === 'sync' && (
              <GoogleSheetsSync
                user={user}
                accessToken={accessToken}
                onLogin={onConnectSheets}
                connectError={sheetsConnectError}
                syncLogs={syncLogs}
                syncLogsError={syncLogsError}
                busyTask={busyTask}
                onBusyChange={handleBusyChange}
              />
            )}

            {/* ADMINS + dashboard password */}
            {adminTab === 'admins' && (
              <div className="space-y-6">
                <AdminsPanel user={user} members={members} admins={admins} onAdminsChange={setAdmins} />
                <DashboardPasswordCard lock={lockInfo} />
              </div>
            )}

            {/* AUDIT LOG */}
            {adminTab === 'log' && <AuditLogTab />}

            {/* STATS OVERVIEW */}
            {adminTab === 'analytics' && <StatsOverview members={members} />}
          </motion.div>
        </div>

        {/* Inside the gate: a lock (idle / "Lock now") unmounts the sheet together with the dashboard, so
            member data never stays on screen over the lock screen. Portaled, so the tab transform is safe. */}
        <MemberSupportModal
          member={supportMember}
          open={supportMember !== null}
          onClose={() => setSupportMemberId(null)}
          user={user}
          admins={admins}
          reloadAdmins={reloadAdmins}
          onAdminsChange={setAdmins}
          onViewCard={onSelectMember}
          onDelete={handleDeleteFromSupport}
          locked={isBusy}
        />
      </DashboardLockGate>
    </>
  );
};
