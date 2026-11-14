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
  Copy,
  FileCode,
  Instagram,
  Plus,
  X,
} from 'lucide-react';
import type { AdminEntry, KccCounter, Member, SyncLog, SubscriptionErrorKind } from '../types';
import { formatKccId } from '../lib/idGenerator';
import { updateMemberStatus, deleteMember, purgeAllMembersFromFirestore, getKccCounter } from '../lib/firestoreService';
import { ageCategoryKey } from '../lib/memberRules';
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
import { MemberTable, memberMatchesQuery, nextSortMode, parseSmartSocials, sortMembers } from './admin/MemberTable';
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
  const [selectedBirthdayFilter, setSelectedBirthdayFilter] = useState<'ALL' | 'HAS_BIRTHDAY' | 'THIS_MONTH'>('ALL');
  const [selectedSocialFilter, setSelectedSocialFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | MemberStatus>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('timestamp_desc');
  const [pageSize, setPageSize] = useState<PageSize>(() => readStoredPageSize());
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleToggleSort = (field: SortField) => setSortMode((prev) => nextSortMode(prev, field));

  // Back to page 1 whenever what is listed changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedRole, selectedCity, selectedAgeCategory, selectedBirthdayFilter, selectedSocialFilter, selectedStatusFilter, sortMode, pageSize]);

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

  const birthdayThisMonthCount = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return members.filter((m) => {
      if (!m.birthday || !m.birthday.trim()) return false;
      const b = m.birthday.trim();
      const isoMatch = b.match(/^\d{4}-(\d{1,2})-\d{1,2}/);
      if (isoMatch) return parseInt(isoMatch[1], 10) === currentMonth;
      const slashMatch = b.match(/^\d{1,2}[/-](\d{1,2})[/-]\d{2,4}/);
      if (slashMatch) return parseInt(slashMatch[1], 10) === currentMonth;
      const dt = new Date(b);
      return !isNaN(dt.getTime()) && dt.getMonth() + 1 === currentMonth;
    }).length;
  }, [members]);

  const filteredMembers = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const filtered = members.filter((m) => {
      if (!memberMatchesQuery(m, searchQuery)) return false;
      if (selectedRole !== 'ALL' && m.primaryRole !== selectedRole) return false;
      if (selectedCity !== 'ALL' && m.city !== selectedCity) return false;
      if (selectedAgeCategory !== 'ALL' && ageCategoryKey(m.ageCategory) !== ageCategoryKey(selectedAgeCategory)) return false;
      if (selectedStatusFilter !== 'ALL' && (m.status || 'verified') !== selectedStatusFilter) return false;

      // Birthday filter
      if (selectedBirthdayFilter === 'HAS_BIRTHDAY') {
        if (!m.birthday || !m.birthday.trim()) return false;
      } else if (selectedBirthdayFilter === 'THIS_MONTH') {
        if (!m.birthday || !m.birthday.trim()) return false;
        const b = m.birthday.trim();
        let matches = false;
        const isoMatch = b.match(/^\d{4}-(\d{1,2})-\d{1,2}/);
        if (isoMatch) {
          matches = parseInt(isoMatch[1], 10) === currentMonth;
        } else {
          const slashMatch = b.match(/^\d{1,2}[/-](\d{1,2})[/-]\d{2,4}/);
          if (slashMatch) {
            matches = parseInt(slashMatch[1], 10) === currentMonth;
          } else {
            const dt = new Date(b);
            if (!isNaN(dt.getTime())) {
              matches = dt.getMonth() + 1 === currentMonth;
            }
          }
        }
        if (!matches) return false;
      }

      // Social filter
      if (selectedSocialFilter === 'HAS_SOCIAL') {
        const hasSocial = (!!m.socialMedia && m.socialMedia.trim() !== '') || (!!m.discordUsername && m.discordUsername.trim() !== '');
        if (!hasSocial) return false;
      } else if (selectedSocialFilter === 'NO_SOCIAL') {
        const hasSocial = (!!m.socialMedia && m.socialMedia.trim() !== '') || (!!m.discordUsername && m.discordUsername.trim() !== '');
        if (hasSocial) return false;
      } else if (selectedSocialFilter === 'Discord') {
        const isDiscord = (!!m.discordUsername && m.discordUsername.trim() !== '') || (!!m.socialMedia && m.socialMedia.toLowerCase().includes('discord'));
        if (!isDiscord) return false;
      } else if (selectedSocialFilter !== 'ALL') {
        if (!m.socialMedia || !m.socialMedia.toLowerCase().includes(selectedSocialFilter.toLowerCase())) return false;
      }

      return true;
    });
    return sortMembers(filtered, sortMode);
  }, [members, searchQuery, selectedRole, selectedCity, selectedAgeCategory, selectedBirthdayFilter, selectedSocialFilter, selectedStatusFilter, sortMode]);

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

  // CSV & JSON export helpers
  const exportMembersToCsv = (list: Member[], fileSuffix = '') => {
    if (list.length === 0) {
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
    const rows = list.map((m) =>
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
        [m.age, m.birthday].filter(Boolean).join(' / '),
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
    const suffix = fileSuffix ? `_${fileSuffix}` : '';
    downloadCsv(`kawancosplay_members${suffix}_${fileDateStamp()}.csv`, [header, ...rows].join('\r\n'));
  };

  const exportToCsv = () => exportMembersToCsv(filteredMembers);

  const exportToJson = () => {
    if (filteredMembers.length === 0) {
      alert(t('admin.exportNoData'));
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredMembers, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `kawancosplay_members_${fileDateStamp()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ----- Bulk Selection & Batch Actions -----
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(() => new Set());

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageMemberIds = useMemo(() => pageMembers.map((m) => m.id), [pageMembers]);
  const isAllOnPageSelected =
    pageMemberIds.length > 0 && pageMemberIds.every((id) => selectedMemberIds.has(id));
  const isSomeOnPageSelected =
    pageMemberIds.some((id) => selectedMemberIds.has(id));

  const toggleSelectAllOnPage = () => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (isAllOnPageSelected) {
        pageMemberIds.forEach((id) => next.delete(id));
      } else {
        pageMemberIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkSetStatus = async (status: MemberStatus) => {
    if (selectedMemberIds.size === 0) return;
    const targets = members.filter((m) => selectedMemberIds.has(m.id));
    if (!window.confirm(`Update status to "${status}" for ${targets.length} selected member(s)?`)) {
      return;
    }
    try {
      for (const m of targets) {
        await updateMemberStatus(m.id, status, m.userId16);
      }
      haptic('success');
      alert(`Updated ${targets.length} members to "${status}".`);
    } catch (e) {
      alert(`Bulk update error: ${describeFirestoreError(e)}`);
    }
  };

  const handleBulkCopyPhones = () => {
    const phones = members
      .filter((m) => selectedMemberIds.has(m.id) && m.phone)
      .map((m) => m.phone!.trim());
    if (phones.length === 0) {
      alert('No WhatsApp phone numbers found for selected members.');
      return;
    }
    navigator.clipboard.writeText(phones.join('\n'));
    haptic('success');
    alert(`Copied ${phones.length} WhatsApp numbers to clipboard.`);
  };

  const handleBulkCopyInstagrams = () => {
    const handles: string[] = [];
    members
      .filter((m) => selectedMemberIds.has(m.id))
      .forEach((m) => {
        const parsed = parseSmartSocials(m.socialMedia, (m as unknown as { instagram?: string }).instagram);
        const ig = parsed.find((s) => s.platform === 'Instagram');
        if (ig && ig.handle) handles.push(ig.handle);
      });
    if (handles.length === 0) {
      alert('No Instagram handles found for selected members.');
      return;
    }
    navigator.clipboard.writeText(handles.join('\n'));
    haptic('success');
    alert(`Copied ${handles.length} Instagram handles to clipboard.`);
  };

  const handleBulkExportCsv = () => {
    const selectedList = members.filter((m) => selectedMemberIds.has(m.id));
    if (selectedList.length === 0) return;
    exportMembersToCsv(selectedList, `selected_${selectedList.length}`);
  };

  // ----- Not authorized: privacy lock screen (Google sign-in only, no passkey) -----
  if (!isAdmin || !user) {
    const signedInLabel = user ? user.email || user.uid : '';
    const isUnverifiedAdminEmail =
      !!user && !!user.email && user.email.toLowerCase().trim() === OFFICIAL_ADMIN_EMAIL && !user.emailVerified;

    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-fade-in text-slate-800">
        <div className="glass-card glass-raised border-amber-500/30 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-center mx-auto mb-5 text-amber-700">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">{t('admin.dashboardTitle')}</h2>

          {isAdminChecking ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-slate-600">{t('admin.checkingAccess')}</p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">{t('admin.privacyRestrictedNotice')}</p>

              {user && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs text-start space-y-1.5">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      {renderRich(t('admin.signedInNotAdmin'), {
                        account: <strong className="text-slate-900 break-all">{signedInLabel}</strong>,
                      })}
                    </span>
                  </p>
                  {isUnverifiedAdminEmail && <p className="ps-6 text-amber-700 font-semibold">{t('admin.emailNotVerified')}</p>}
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
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:underline"
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
    selectedRole !== 'ALL' ||
    selectedCity !== 'ALL' ||
    selectedAgeCategory !== 'ALL' ||
    selectedBirthdayFilter !== 'ALL' ||
    selectedSocialFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL' ||
    !!searchQuery;

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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t('admin.dashboardTitle')}</h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                  {t('admin.dashboardDesc')} {t('admin.dashboardPrivacyNote')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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

            {/* Quick Stats Summary: Clickable KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatusFilter('ALL');
                  setSelectedBirthdayFilter('ALL');
                }}
                className={`text-start p-4 rounded-2xl transition-all cursor-pointer ${
                  selectedStatusFilter === 'ALL' && selectedBirthdayFilter === 'ALL'
                    ? 'bg-purple-100/90 border-2 border-purple-500 shadow-md ring-2 ring-purple-300'
                    : 'glass-well hover:border-purple-300 border border-transparent'
                }`}
              >
                <p className="text-xs text-slate-500 font-semibold">{t('admin.totalMembers')}</p>
                <p className="text-2xl font-black text-slate-900">{membersLoaded ? formatNumber(members.length) : '—'}</p>
                <span className="text-[10px] text-purple-700 font-semibold mt-1 block">Click to view all</span>
              </button>

              {(
                [
                  ['verified', 'text-emerald-700', 'bg-emerald-50 border-emerald-400 ring-emerald-300'],
                  ['active', 'text-indigo-700', 'bg-indigo-50 border-indigo-400 ring-indigo-300'],
                  ['pending', 'text-amber-700', 'bg-amber-50 border-amber-400 ring-amber-300'],
                ] as Array<[MemberStatus, string, string]>
              ).map(([status, tone, activeBorder]) => {
                const isSelected = selectedStatusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setSelectedStatusFilter((prev) => (prev === status ? 'ALL' : status));
                      if (selectedBirthdayFilter === 'THIS_MONTH') setSelectedBirthdayFilter('ALL');
                    }}
                    className={`text-start p-4 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? `bg-white border-2 shadow-md ring-2 ${activeBorder}`
                        : 'glass-well hover:border-slate-300 border border-transparent'
                    }`}
                  >
                    <p className="text-xs text-slate-500 font-semibold">{t('admin.statusStat', { status: t(STATUS_LABEL_KEYS[status]) })}</p>
                    <p className={`text-2xl font-black ${tone}`}>
                      {membersLoaded ? formatNumber(members.filter((m) => (m.status || 'verified') === status).length) : '—'}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                      {isSelected ? '✓ Filter active' : 'Filter by status'}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setSelectedBirthdayFilter((prev) => (prev === 'THIS_MONTH' ? 'ALL' : 'THIS_MONTH'));
                  if (selectedStatusFilter !== 'ALL') setSelectedStatusFilter('ALL');
                }}
                className={`text-start p-4 rounded-2xl transition-all cursor-pointer ${
                  selectedBirthdayFilter === 'THIS_MONTH'
                    ? 'bg-amber-50 border-2 border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'glass-well hover:border-amber-300 border border-transparent'
                }`}
              >
                <p className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                  <span>🎂</span>
                  <span>Birthdays (Month)</span>
                </p>
                <p className="text-2xl font-black text-amber-900">
                  {membersLoaded ? formatNumber(birthdayThisMonthCount) : '—'}
                </p>
                <span className="text-[10px] text-amber-700 font-medium mt-1 block">
                  {selectedBirthdayFilter === 'THIS_MONTH' ? '✓ Filter active' : 'Filter birthdays'}
                </span>
              </button>
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('admin.permissionDeniedTitle')}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('admin.loadMembersFailedTitle')}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">{t('admin.loadMembersFailedDesc')}</p>
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
                <p className="text-xs sm:text-sm text-slate-600">{t('admin.loadingMembers')}</p>
              </div>
            )}

            {/* MEMBERS: (d) loaded — filters, pagination, list */}
            {adminTab === 'members' && !membersError && membersLoaded && (
              <div className="space-y-5">
                <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4 border border-slate-200/80 bg-white/95">
                  {/* Row 1: Full-Width Search Bar + Primary Action Buttons */}
                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    <div className="relative flex-1 min-w-[280px]">
                      <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569] pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search name, KCC ID, Instagram, Discord, WhatsApp, email, or city..."
                        aria-label={t('admin.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full ps-11 pe-20 py-2.5 h-11 liquid-glass-input rounded-2xl text-[#0F172A] font-medium placeholder:text-[#64748B] text-sm sm:text-base border border-slate-300 bg-white/90 focus:bg-white transition-colors"
                      />
                      <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded shadow-xs">
                          /
                        </kbd>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href="/?tab=register"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center gap-1.5 shadow-md transition-colors"
                        title="Open Registration Form"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Member</span>
                      </a>
                      <button
                        type="button"
                        onClick={exportToCsv}
                        className="h-11 px-3.5 py-2 bg-white/90 hover:bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#0F172A] inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-700" />
                        <span>{t('admin.exportCsv')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={exportToJson}
                        className="h-11 px-3.5 py-2 bg-white/90 hover:bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#0F172A] inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Export filtered members as JSON"
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-700" />
                        <span>Export JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePurgeAll}
                        disabled={isPurging || isBusy}
                        title={t('admin.purgeButtonTitle')}
                        className="h-11 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className={`w-3.5 h-3.5 text-rose-700 ${isPurging ? 'animate-spin' : ''}`} />
                        <span>{isPurging ? t('admin.purging') : t('admin.purgeButton')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Responsive Filter Selects + Reset */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      aria-label={t('admin.colRole')}
                      className="px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-slate-900 bg-white border border-slate-300"
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
                      className="px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-slate-900 bg-white border border-slate-300"
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
                      className="px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-slate-900 bg-white border border-slate-300"
                    >
                      <option value="ALL">{t('admin.filterAllAges')}</option>
                      <option value="Legal Age / Dewasa (18+)">{t('admin.filterLegalAge')}</option>
                      <option value="Minor / Di Bawah Umur (<18)">{t('admin.filterMinor')}</option>
                      <option value="Memilih untuk tidak menyebutkan">{t('admin.filterPreferNotToSay')}</option>
                    </select>

                    <select
                      value={selectedBirthdayFilter}
                      onChange={(e) => setSelectedBirthdayFilter(e.target.value as 'ALL' | 'HAS_BIRTHDAY' | 'THIS_MONTH')}
                      aria-label={t('admin.fieldBirthday')}
                      className="px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-slate-900 bg-white border border-slate-300"
                    >
                      <option value="ALL">{t('admin.filterAllBirthdays')}</option>
                      <option value="HAS_BIRTHDAY">🎂 {t('admin.filterHasBirthday')}</option>
                      <option value="THIS_MONTH">🎉 {t('admin.filterBirthdayThisMonth')}</option>
                    </select>

                    <select
                      value={selectedSocialFilter}
                      onChange={(e) => setSelectedSocialFilter(e.target.value)}
                      aria-label={t('admin.fieldSocialMedia')}
                      className="px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-slate-900 bg-white border border-slate-300"
                    >
                      <option value="ALL">{t('admin.filterAllSocials')}</option>
                      <option value="HAS_SOCIAL">📱 {t('admin.filterHasSocial')}</option>
                      <option value="NO_SOCIAL">❌ {t('admin.filterNoSocial')}</option>
                      <option value="Instagram">📸 Instagram</option>
                      <option value="TikTok">🎵 TikTok</option>
                      <option value="Discord">💬 Discord</option>
                      <option value="Twitter">🐦 Twitter / X</option>
                      <option value="YouTube">📺 YouTube</option>
                      <option value="Facebook">👥 Facebook</option>
                    </select>

                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value as 'ALL' | MemberStatus)}
                      aria-label={t('admin.colStatus')}
                      className="px-3 py-2 liquid-glass-input rounded-xl text-xs font-semibold text-slate-900 bg-white border border-slate-300"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="verified">Verified</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                    </select>

                    <div className="flex items-center gap-1.5 liquid-glass-input rounded-xl px-2.5 py-1.5 bg-white border border-slate-300">
                      <ArrowUpDown className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <select
                        value={sortMode === 'name_asc' ? 'name_asc' : 'timestamp_desc'}
                        onChange={(e) => setSortMode(e.target.value === 'name_asc' ? 'name_asc' : 'timestamp_desc')}
                        className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none pe-1 cursor-pointer"
                      >
                        <option value="timestamp_desc">{t('admin.sortNewest')}</option>
                        <option value="name_asc">{t('admin.sortNameAsc')}</option>
                      </select>
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('ALL');
                          setSelectedCity('ALL');
                          setSelectedAgeCategory('ALL');
                          setSelectedBirthdayFilter('ALL');
                          setSelectedSocialFilter('ALL');
                          setSelectedStatusFilter('ALL');
                          setSearchQuery('');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 transition-colors"
                      >
                        {t('admin.resetFilter')}
                      </button>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#0F172A] font-semibold pt-3 border-t border-slate-200/70">
                    <span>
                      {renderRich(t('admin.showingMembers', { total: formatNumber(members.length) }), {
                        shown: <strong className="text-purple-950 font-bold">{formatNumber(total)}</strong>,
                      })}
                    </span>
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
                    selectedIds={selectedMemberIds}
                    onToggleSelect={toggleSelectMember}
                    onToggleSelectAll={toggleSelectAllOnPage}
                    isAllSelected={isAllOnPageSelected}
                    isSomeSelected={isSomeOnPageSelected}
                  />

                  {/* Floating / Sticky Batch Action Bar when 1+ members selected */}
                  {selectedMemberIds.size > 0 && (
                    <aside
                      aria-label="Bulk actions"
                      className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-slate-900/95 text-white border border-purple-500/40 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-fade-in"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs sm:text-sm font-bold font-mono">
                          {selectedMemberIds.size} member{selectedMemberIds.size > 1 ? 's' : ''} selected
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center rounded-xl bg-white/10 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleBulkSetStatus('verified')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          >
                            Set Verified
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkSetStatus('active')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                          >
                            Set Active
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkSetStatus('pending')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                          >
                            Set Pending
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleBulkCopyPhones}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 transition-colors inline-flex items-center gap-1.5"
                          title="Copy WhatsApp numbers of selected members"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copy WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBulkCopyInstagrams}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 transition-colors inline-flex items-center gap-1.5"
                          title="Copy Instagram handles of selected members"
                        >
                          <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          <span>Copy Instagram</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBulkExportCsv}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 transition-colors inline-flex items-center gap-1.5"
                          title="Export selected members to CSV"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-300" />
                          <span>Export CSV ({selectedMemberIds.size})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedMemberIds(new Set())}
                          className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors text-xs font-bold"
                          title="Deselect all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </aside>
                  )}

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
