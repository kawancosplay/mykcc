import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Users,
  Download,
  Trash2,
  CheckCircle,
  ExternalLink,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  AlertTriangle,
  Database,
  BarChart3,
  Layers,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCw,
  Crown,
  Shield,
  Clock,
  LogOut,
  Wrench,
} from 'lucide-react';
import type {
  Member,
  SyncLog,
  MemberRepairReport,
  SubscriptionErrorKind,
  DuplicateRegistrationGroup,
} from '../types';
import {
  format16DigitUserId,
  isMainAccountUserId,
  isAdminUserId,
} from '../lib/idGenerator';
import {
  updateMemberStatus,
  deleteMember,
  purgeAllMembersFromFirestore,
  listReservedIdHolders,
  reassignMemberUserId16,
  repairMemberIdsAndCards,
  findDuplicateRegistrationGroups,
  mergeDuplicateRegistration,
  isExactDuplicateGroup,
  EXACT_DUPLICATE_WINDOW_MS,
} from '../lib/firestoreService';
import { isMainAdminUser, describeFirestoreError } from '../lib/firebase';
import { GoogleSheetsSync } from './GoogleSheetsSync';
import { StatsOverview } from './StatsOverview';
import { useI18n } from '../i18n';
import type { LanguageCode, TranslationKey } from '../i18n';
import type { User } from 'firebase/auth';

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

// Display only. Admin access is decided by Firebase Auth + Firestore rules (isAdmin prop).
const OFFICIAL_ADMIN_EMAIL = 'cosplaysehat@gmail.com';
const NAMED_DATABASE_ID = 'ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040';
const ADMIN_WHATSAPP_DISPLAY = '+62 857-1103-2782';
const RESERVED_ID_RANGE_LABEL = '0000 0000 0000 0000 – 0000 0000 0000 0100';
// Keyword the admin must type to confirm the purge (compared in code, never translated)
const PURGE_CONFIRM_KEYWORD = 'PURGE';
// Registration date + time (with seconds: exact duplicates are seconds apart) in the duplicate list
const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

// Translation keys for MemberIdReassignment.reason in the repair report (unknown reasons are shown as-is)
const REPAIR_REASON_KEYS: Record<string, TranslationKey> = {
  duplicate: 'admin.repairReasonDuplicate',
  missing: 'admin.repairReasonMissing',
  main_account: 'admin.repairReasonMainAccount',
};

// Display labels for the member status values stored in Firestore (the values themselves never change)
type MemberStatus = 'pending' | 'verified' | 'active';
const STATUS_LABEL_KEYS: Record<MemberStatus, TranslationKey> = {
  verified: 'admin.statusVerified',
  active: 'admin.statusActive',
  pending: 'admin.statusPending',
};

// Renders a translated template whose {placeholders} are React nodes (e.g. bold counts).
// Placeholders without a node are left as they are.
const renderRich = (template: string, nodes: Record<string, React.ReactNode>): React.ReactNode[] =>
  template
    .split(/\{(\w+)\}/g)
    .map((part, i) =>
      i % 2 === 1 ? (
        <React.Fragment key={i}>{part in nodes ? nodes[part] : `{${part}}`}</React.Fragment>
      ) : (
        part
      )
    );

// Bulk duplicate merge: 'identical' = only exact copies (isExactDuplicateGroup), 'all' = every scanned group
type BulkMergeMode = 'identical' | 'all';

interface BulkMergeReport {
  mode: BulkMergeMode;
  groups: number; // groups processed
  mergedGroups: number; // groups whose duplicates were all merged
  mergedRecords: number; // duplicate records merged into their keeper (and deleted)
  failedGroups: number; // groups with at least one failed merge
  errors: string[];
}

// Number of error messages shown in the bulk merge report (all of them go to the console)
const BULK_MERGE_ERRORS_SHOWN = 5;
const EXACT_DUPLICATE_WINDOW_SECONDS = Math.round(EXACT_DUPLICATE_WINDOW_MS / 1000);

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
  const { t, lang, formatNumber, formatDate } = useI18n();
  // Only for describeFirestoreError's legacy (error, isId) signature
  const isId = lang === 'id';

  // Sub-tabs in Admin Dashboard
  const [adminTab, setAdminTab] = useState<'members' | 'sync' | 'analytics'>('members');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState('ALL');
  const [sortMode, setSortMode] = useState<
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
    | 'uid_asc'
  >('timestamp_desc');

  const handleToggleSort = (field: 'timestamp' | 'name' | 'age' | 'location' | 'status' | 'uid') => {
    if (field === 'timestamp') {
      setSortMode((prev) => (prev === 'timestamp_desc' ? 'timestamp_asc' : 'timestamp_desc'));
    } else if (field === 'name') {
      setSortMode((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'));
    } else if (field === 'age') {
      setSortMode((prev) => (prev === 'age_asc' ? 'age_desc' : 'age_asc'));
    } else if (field === 'location') {
      setSortMode((prev) => (prev === 'location_asc' ? 'location_desc' : 'location_asc'));
    } else if (field === 'status') {
      setSortMode((prev) => (prev === 'status_asc' ? 'status_desc' : 'status_asc'));
    } else if (field === 'uid') {
      setSortMode((prev) => (prev === 'uid_asc' ? 'timestamp_desc' : 'uid_asc'));
    }
  };

  // Loading states for actions
  const [isPurging, setIsPurging] = useState(false);

  // KCC ID & public card repair states
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState<{ done: number; total: number } | null>(null);
  const [repairReport, setRepairReport] = useState<MemberRepairReport | null>(null);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [reassignResult, setReassignResult] = useState<{ isError: boolean; message: string } | null>(null);

  // Duplicate registrations (same person filled the form more than once). Scanned on demand only.
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateRegistrationGroup[] | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [mergeResult, setMergeResult] = useState<{ isError: boolean; message: string } | null>(null);
  // Bulk merge: progress in groups while running (null = idle) and the report of the last run
  const [bulkMergeProgress, setBulkMergeProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkMergeReport, setBulkMergeReport] = useState<BulkMergeReport | null>(null);
  const isBulkMerging = bulkMergeProgress !== null;
  const isAnyMergeRunning = mergingId !== null || isBulkMerging;

  // Latest members snapshot for the re-scan after a bulk merge (the handler's own `members` is stale)
  const membersRef = useRef<Member[]>(members);
  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  // Scan summary: duplicate records in all groups and the exact-copy groups ("identical")
  const duplicateRecordCount = useMemo(
    () => (duplicateGroups || []).reduce((total, g) => total + g.duplicates.length, 0),
    [duplicateGroups]
  );
  const exactDuplicateGroups = useMemo(
    () => (duplicateGroups || []).filter((g) => isExactDuplicateGroup(g)),
    [duplicateGroups]
  );

  // Members holding reserved IDs (0000 0000 0000 0000 – 0000 0000 0000 0100), always computed live.
  // The signed-in main account's own doc is excluded.
  const mainAdminUid = user && isMainAdminUser(user) ? user.uid : null;
  const reservedHolders = useMemo(
    () => listReservedIdHolders(members, mainAdminUid),
    [members, mainAdminUid]
  );

  // Number of members whose KCC ID (digits only) is shared with at least one other member.
  // Display only; "Jalankan Perbaikan" (repairMemberIdsAndCards) is the single repair entry point.
  const duplicateIdCount = useMemo(() => {
    const counts = new Map<string, number>();
    members.forEach((m) => {
      const clean = (m.userId16 || '').replace(/\D/g, '');
      if (clean) counts.set(clean, (counts.get(clean) || 0) + 1);
    });
    let total = 0;
    counts.forEach((count) => {
      if (count > 1) total += count;
    });
    return total;
  }, [members]);

  // Authorization: real Firebase identity resolved by App (verified cosplaysehat@gmail.com or admins/{uid}).
  const isAuthorized = isAdmin;

  const handleStatusChange = async (
    memberId: string,
    newStatus: MemberStatus,
    userId16?: string
  ) => {
    try {
      await updateMemberStatus(memberId, newStatus, userId16);
    } catch (e) {
      alert(t('admin.statusUpdateFailed', { error: describeFirestoreError(e, isId) }));
    }
  };

  const handleDeleteMember = async (member: Member) => {
    const confirmDelete = window.confirm(
      t('admin.deleteMemberConfirm', {
        name: member.name || member.cosplayName || '',
        id: format16DigitUserId(member.userId16),
      })
    );
    if (!confirmDelete) return;

    try {
      await deleteMember(member.id, member.userId16);
    } catch (e) {
      alert(t('admin.deleteMemberFailed', { error: describeFirestoreError(e, isId) }));
    }
  };

  const handleRunRepair = async () => {
    if (isRepairing) return;
    const confirmRepair = window.confirm(t('admin.repairConfirm'));
    if (!confirmRepair) return;

    setIsRepairing(true);
    setRepairError(null);
    setRepairReport(null);
    setRepairProgress({ done: 0, total: 0 });
    try {
      const report = await repairMemberIdsAndCards((done, total) => setRepairProgress({ done, total }));
      setRepairReport(report);
    } catch (e) {
      console.error('Repair error:', e);
      setRepairError(describeFirestoreError(e, isId));
    } finally {
      setIsRepairing(false);
    }
  };

  const handleReassignReservedId = async (member: Member) => {
    if (reassigningId) return;
    const displayName = member.name || member.cosplayName || member.id;
    const confirmLines = [
      t('admin.reassignConfirm', { name: displayName, id: format16DigitUserId(member.userId16) }),
    ];
    if (isMainAccountUserId(member.userId16)) {
      confirmLines.push(t('admin.reassignMainAccountWarning', { email: OFFICIAL_ADMIN_EMAIL }));
    }
    const confirmReassign = window.confirm(confirmLines.join('\n\n'));
    if (!confirmReassign) return;

    setReassigningId(member.id);
    setReassignResult(null);
    try {
      const newId = await reassignMemberUserId16(member, members);
      setReassignResult({
        isError: false,
        message: `${displayName}: ${format16DigitUserId(member.userId16)} → ${format16DigitUserId(newId)}`,
      });
    } catch (e) {
      console.error('Reassign KCC ID error:', e);
      setReassignResult({
        isError: true,
        message: `${displayName}: ${describeFirestoreError(e, isId)}`,
      });
    } finally {
      setReassigningId(null);
    }
  };

  // O(n²) duplicate-person scan: on demand only, never on every members snapshot.
  const handleScanDuplicateRegistrations = () => {
    if (isAnyMergeRunning) return;
    setDuplicateGroups(findDuplicateRegistrationGroups(members));
    setMergeResult(null);
    setBulkMergeReport(null);
  };

  const handleMergeDuplicate = async (group: DuplicateRegistrationGroup, dup: Member) => {
    if (isAnyMergeRunning) return;
    const keeper = group.keeper;
    const keeperName = keeper.name || keeper.cosplayName || keeper.id;
    const dupName = dup.name || dup.cosplayName || dup.id;
    const confirmMerge = window.confirm(
      t('admin.mergeConfirm', {
        duplicate: dupName,
        duplicateId: format16DigitUserId(dup.userId16),
        keeper: keeperName,
        keeperId: format16DigitUserId(keeper.userId16),
      })
    );
    if (!confirmMerge) return;

    setMergingId(dup.id);
    setMergeResult(null);
    try {
      const merged = await mergeDuplicateRegistration(keeper, dup);
      setDuplicateGroups((prev) =>
        prev
          ? prev
              .map((g) =>
                g.keeper.id === keeper.id
                  ? { keeper: merged, duplicates: g.duplicates.filter((d) => d.id !== dup.id) }
                  : g
              )
              .filter((g) => g.duplicates.length > 0)
          : prev
      );
      setMergeResult({
        isError: false,
        message: t('admin.mergeSuccess', {
          duplicate: dupName,
          keeper: merged.name || merged.cosplayName || keeperName,
          id: format16DigitUserId(merged.userId16),
        }),
      });
    } catch (e) {
      console.error('Merge duplicate registration error:', e);
      setMergeResult({
        isError: true,
        message: `${dupName}: ${describeFirestoreError(e, isId)}`,
      });
    } finally {
      setMergingId(null);
    }
  };

  // Bulk merge with ONE confirm: runs the per-record merge (mergeDuplicateRegistration, <= 3 ops per
  // batch) sequentially for every group, keeps going after a failed merge, then reports and re-scans.
  const handleBulkMergeDuplicates = async (mode: BulkMergeMode) => {
    if (isAnyMergeRunning || !duplicateGroups) return;
    const groups = mode === 'identical' ? exactDuplicateGroups : duplicateGroups;
    if (groups.length === 0) return;
    const recordCount = groups.reduce((total, g) => total + g.duplicates.length, 0);

    const confirmText = t(
      mode === 'identical' ? 'admin.bulkMergeIdenticalConfirm' : 'admin.bulkMergeAllConfirm',
      {
        groups: formatNumber(groups.length),
        records: formatNumber(recordCount),
        seconds: formatNumber(EXACT_DUPLICATE_WINDOW_SECONDS),
      }
    );
    if (!window.confirm(confirmText)) return;

    setMergeResult(null);
    setBulkMergeReport(null);
    setBulkMergeProgress({ done: 0, total: groups.length });

    const report: BulkMergeReport = {
      mode,
      groups: groups.length,
      mergedGroups: 0,
      mergedRecords: 0,
      failedGroups: 0,
      errors: [],
    };
    const mergedIds = new Set<string>();

    try {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const keeperLabel = `${group.keeper.name || group.keeper.cosplayName || group.keeper.id} (${format16DigitUserId(
          group.keeper.userId16
        )})`;
        let groupFailed = false;

        // mergeDuplicateRegistration re-reads both docs from the server, so the keeper always receives
        // the result of the previous merge of its group
        for (const dup of group.duplicates) {
          try {
            await mergeDuplicateRegistration(group.keeper, dup);
            mergedIds.add(dup.id);
            report.mergedRecords++;
          } catch (e) {
            groupFailed = true;
            console.error('Bulk merge duplicate registration error:', e);
            const dupLabel = `${dup.name || dup.cosplayName || dup.id} (${format16DigitUserId(dup.userId16)})`;
            report.errors.push(`${dupLabel} → ${keeperLabel}: ${describeFirestoreError(e, isId)}`);
          }
        }

        if (groupFailed) report.failedGroups++;
        else report.mergedGroups++;
        setBulkMergeProgress({ done: i + 1, total: groups.length });
      }
    } finally {
      setBulkMergeReport(report);
      setBulkMergeProgress(null);
      // Re-scan on the latest snapshot; merged duplicates are dropped explicitly in case their deletion
      // has not reached the members snapshot yet
      setDuplicateGroups(
        findDuplicateRegistrationGroups(membersRef.current.filter((m) => !mergedIds.has(m.id)))
      );
    }
  };

  // Every WhatsApp number of a member (primary, backup, additional), display only
  const getMemberPhones = (m: Member): string[] =>
    [m.phone, m.phone2, ...(Array.isArray(m.additionalPhones) ? m.additionalPhones : [])].filter(
      (p): p is string => typeof p === 'string' && p.trim() !== ''
    );

  const handlePurgeAll = async () => {
    const confirmCode = window.prompt(t('admin.purgePrompt', { keyword: PURGE_CONFIRM_KEYWORD }));
    if (confirmCode !== PURGE_CONFIRM_KEYWORD) {
      if (confirmCode !== null) {
        alert(t('admin.purgeCancelled'));
      }
      return;
    }

    setIsPurging(true);
    try {
      const deletedCount = await purgeAllMembersFromFirestore();
      alert(t('admin.purgeSuccess', { count: formatNumber(deletedCount) }));
    } catch (e) {
      alert(t('admin.purgeFailed', { error: describeFirestoreError(e, isId) }));
    } finally {
      setIsPurging(false);
    }
  };

  const exportToCsv = () => {
    if (filteredMembers.length === 0) {
      alert(t('admin.exportNoData'));
      return;
    }

    // Translated column titles, quoted so a comma in any language cannot shift the columns
    const headers = (
      [
        'admin.csvKccId',
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
      ] as const
    ).map((key) => `"${t(key).replace(/"/g, '""')}"`);

    const rows = filteredMembers.map((m) => [
      `"${m.userId16 || ''}"`,
      `"${(m.cosplayName || '').replace(/"/g, '""')}"`,
      `"${(m.fullName || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${[m.phone2, ...(Array.isArray(m.additionalPhones) ? m.additionalPhones : [])]
        .filter(Boolean)
        .join(' / ')
        .replace(/"/g, '""')}"`,
      `"${(m.discordUsername || '').replace(/"/g, '""')}"`,
      `"${m.email || ''}"`,
      `"${m.ageCategory || ''}"`,
      `"${m.age || ''}"`,
      `"${m.country || ''}"`,
      `"${m.province || ''}"`,
      `"${m.city || ''}"`,
      `"${m.primaryRole || ''}"`,
      `"${(m.fandom || '').replace(/"/g, '""')}"`,
      `"${m.experience || ''}"`,
      `"${m.status || ''}"`,
      `"${m.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kawancosplay_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
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
    const filtered = members.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (m.cosplayName && m.cosplayName.toLowerCase().includes(q)) ||
        (m.fullName && m.fullName.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.userId16 && m.userId16.includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.phone2 && m.phone2.includes(q)) ||
        (Array.isArray(m.additionalPhones) &&
          m.additionalPhones.some((p) => typeof p === 'string' && p.includes(q))) ||
        (m.discordUsername && m.discordUsername.toLowerCase().includes(q)) ||
        (m.fandom && m.fandom.toLowerCase().includes(q)) ||
        (m.city && m.city.toLowerCase().includes(q));

      const matchRole = selectedRole === 'ALL' || m.primaryRole === selectedRole;
      const matchCity = selectedCity === 'ALL' || m.city === selectedCity;
      const matchAge = selectedAgeCategory === 'ALL' || m.ageCategory === selectedAgeCategory;

      return matchQuery && matchRole && matchCity && matchAge;
    });

    return filtered.sort((a, b) => {
      // 1. Timestamp (Submission Date & Time)
      if (sortMode === 'timestamp_asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortMode === 'timestamp_desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      // 2. Alphabet of the name (Cosname or Full Name)
      if (sortMode === 'name_asc') {
        const nameA = (a.cosplayName || a.fullName || '').toLowerCase().trim();
        const nameB = (b.cosplayName || b.fullName || '').toLowerCase().trim();
        return nameA.localeCompare(nameB);
      }
      if (sortMode === 'name_desc') {
        const nameA = (a.cosplayName || a.fullName || '').toLowerCase().trim();
        const nameB = (b.cosplayName || b.fullName || '').toLowerCase().trim();
        return nameB.localeCompare(nameA);
      }

      // 3. Age (Numeric age with ageCategory fallback)
      if (sortMode === 'age_asc' || sortMode === 'age_desc') {
        const getAgeNum = (m: Member): number => {
          if (m.age) {
            const parsed = parseInt(m.age.replace(/\D/g, ''), 10);
            if (!isNaN(parsed) && parsed > 0 && parsed < 120) return parsed;
          }
          if (m.ageCategory?.toLowerCase().includes('minor')) return 16;
          if (m.ageCategory?.toLowerCase().includes('legal') || m.ageCategory?.toLowerCase().includes('dewasa')) return 22;
          return 20;
        };
        const valA = getAgeNum(a);
        const valB = getAgeNum(b);
        return sortMode === 'age_asc' ? valA - valB : valB - valA;
      }

      // 4. Location (City, Province, Country)
      if (sortMode === 'location_asc') {
        const locA = `${a.city || ''}, ${a.country || ''}`.toLowerCase().trim();
        const locB = `${b.city || ''}, ${b.country || ''}`.toLowerCase().trim();
        return locA.localeCompare(locB);
      }
      if (sortMode === 'location_desc') {
        const locA = `${a.city || ''}, ${a.country || ''}`.toLowerCase().trim();
        const locB = `${b.city || ''}, ${b.country || ''}`.toLowerCase().trim();
        return locB.localeCompare(locA);
      }

      // 5. Status (Verified -> Active -> Pending)
      if (sortMode === 'status_asc' || sortMode === 'status_desc') {
        const statusWeight: Record<string, number> = {
          verified: 1,
          active: 2,
          pending: 3,
        };
        const stA = statusWeight[a.status || 'verified'] || 99;
        const stB = statusWeight[b.status || 'verified'] || 99;
        return sortMode === 'status_asc' ? stA - stB : stB - stA;
      }

      // 6. KCC ID (0000 -> Admins -> Members)
      if (sortMode === 'uid_asc') {
        const aId = (a.userId16 || '').replace(/\D/g, '');
        const bId = (b.userId16 || '').replace(/\D/g, '');
        return aId.localeCompare(bId, undefined, { numeric: true });
      }

      // Default: Timestamp newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [members, searchQuery, selectedRole, selectedCity, selectedAgeCategory, sortMode]);

  // If NOT authorized, show privacy lock screen (Google sign-in only, no passkey)
  if (!isAuthorized) {
    const signedInLabel = user ? user.email || user.uid : '';
    const isUnverifiedAdminEmail =
      !!user &&
      !!user.email &&
      user.email.toLowerCase().trim() === OFFICIAL_ADMIN_EMAIL &&
      !user.emailVerified;

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
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {t('admin.privacyRestrictedNotice')}
              </p>

              {user && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-left space-y-1.5">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      {renderRich(t('admin.signedInNotAdmin'), {
                        account: <strong className="text-white break-all">{signedInLabel}</strong>,
                      })}
                    </span>
                  </p>
                  {isUnverifiedAdminEmail && (
                    <p className="pl-6 text-amber-300 font-semibold">{t('admin.emailNotVerified')}</p>
                  )}
                </div>
              )}

              <button
                onClick={onOpenAuth}
                className="btn-primary pressable w-full py-3 px-4 text-sm whitespace-normal"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t('admin.signInWithAdminGoogleEmail', { email: OFFICIAL_ADMIN_EMAIL })}</span>
              </button>

              {user && (
                <button
                  onClick={onLogout}
                  className="glass-button pressable w-full mt-3 px-4 text-xs"
                >
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
              className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t('admin.whatsappAdminHelp', { phone: ADMIN_WHATSAPP_DISPLAY })}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If AUTHORIZED, show the full Admin Dashboard
  return (
    <div className="w-full mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-slate-100">
      {/* Top Admin Banner */}
      <div className="liquid-glass-card glass-raised rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
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

            <button
              onClick={onLogout}
              className="glass-button pressable px-3.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('admin.signOutAdmin')}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Summary ('—' until the first successful members snapshot) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
           <div className="glass-well p-4 rounded-2xl">
              <p className="text-xs text-slate-400">{t('admin.totalMembers')}</p>
              <p className="text-2xl font-black text-white">{membersLoaded ? formatNumber(members.length) : '—'}</p>
           </div>
           <div className="glass-well p-4 rounded-2xl">
              <p className="text-xs text-slate-400">
                {t('admin.statusStat', { status: t(STATUS_LABEL_KEYS.verified) })}
              </p>
              <p className="text-2xl font-black text-emerald-400">
                {membersLoaded ? formatNumber(members.filter((m) => m.status === 'verified').length) : '—'}
              </p>
           </div>
           <div className="glass-well p-4 rounded-2xl">
              <p className="text-xs text-slate-400">
                {t('admin.statusStat', { status: t(STATUS_LABEL_KEYS.active) })}
              </p>
              <p className="text-2xl font-black text-indigo-400">
                {membersLoaded ? formatNumber(members.filter((m) => m.status === 'active').length) : '—'}
              </p>
           </div>
           <div className="glass-well p-4 rounded-2xl">
              <p className="text-xs text-slate-400">
                {t('admin.statusStat', { status: t(STATUS_LABEL_KEYS.pending) })}
              </p>
              <p className="text-2xl font-black text-amber-400">
                {membersLoaded ? formatNumber(members.filter((m) => m.status === 'pending').length) : '—'}
              </p>
           </div>
        </div>

        {/* Sub-nav tabs (segmented control; scrolls sideways on narrow screens) */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div role="tablist" aria-label={t('admin.dashboardTitle')} className="glass-segmented glass-segmented-scroll">
            <button
              type="button"
              role="tab"
              aria-selected={adminTab === 'members'}
              onClick={() => setAdminTab('members')}
              className={`glass-segment shrink-0 ${adminTab === 'members' ? 'is-active' : ''}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('admin.tabMembers', { count: membersLoaded ? formatNumber(members.length) : '—' })}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={adminTab === 'sync'}
              onClick={() => setAdminTab('sync')}
              className={`glass-segment shrink-0 ${adminTab === 'sync' ? 'is-active' : ''}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('admin.tabSync')}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={adminTab === 'analytics'}
              onClick={() => setAdminTab('analytics')}
              className={`glass-segment shrink-0 ${adminTab === 'analytics' ? 'is-active' : ''}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('admin.tabStats')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: MEMBER LIST & ROSTER */}
      {/* (a) Members subscription rejected by Firestore rules */}
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
            <button
              onClick={() => window.location.reload()}
              className="glass-button pressable px-4 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('admin.reloadPage')}</span>
            </button>
          </div>
        </div>
      )}

      {/* (b) Any other subscription error (offline, unavailable, ...) */}
      {adminTab === 'members' && membersError && membersError !== 'permission-denied' && (
        <div className="liquid-glass-card rounded-3xl p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{t('admin.loadMembersFailedTitle')}</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            {t('admin.loadMembersFailedDesc')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="glass-button pressable px-4 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('admin.reloadPage')}</span>
          </button>
        </div>
      )}

      {/* (c) Waiting for the first members snapshot */}
      {adminTab === 'members' && !membersError && !membersLoaded && (
        <div className="liquid-glass-card rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-slate-300">{t('admin.loadingMembers')}</p>
        </div>
      )}

      {/* (d) Members loaded */}
      {adminTab === 'members' && !membersError && membersLoaded && (
        <div className="space-y-6">
          {/* KCC ID & PUBLIC CARD REPAIR (admin only, idempotent) */}
          <div className="liquid-glass-card rounded-3xl p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t('admin.repairTitle')}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">
                    {t('admin.repairDesc')}
                  </p>
                  {duplicateIdCount > 0 ? (
                    <p className="text-xs font-semibold text-amber-300 mt-2 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        {t('admin.repairDuplicatesDetected', {
                          count: formatNumber(duplicateIdCount),
                          action: t('admin.runRepair'),
                        })}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-300 mt-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('admin.allIdsUnique')}</span>
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleRunRepair}
                disabled={isRepairing}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                <span>
                  {isRepairing
                    ? repairProgress && repairProgress.total > 0
                      ? t('admin.repairRunningProgress', {
                          done: formatNumber(repairProgress.done),
                          total: formatNumber(repairProgress.total),
                        })
                      : t('admin.repairRunning')
                    : t('admin.runRepair')}
                </span>
              </button>
            </div>

            {repairError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{t('admin.repairFailed', { error: repairError })}</span>
              </div>
            )}

            {repairReport && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-slate-200 space-y-3">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('admin.repairDone')}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'scanned', label: t('admin.repairStatScanned'), value: repairReport.scanned },
                    { id: 'groups', label: t('admin.repairStatDuplicateGroups'), value: repairReport.duplicateGroups },
                    { id: 'written', label: t('admin.repairStatCardsWritten'), value: repairReport.cardsWritten },
                    { id: 'deleted', label: t('admin.repairStatCardsDeleted'), value: repairReport.cardsDeleted },
                  ].map((s) => (
                    <div key={s.id} className="glass-well rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                      <p className="text-lg font-black text-white">{formatNumber(s.value)}</p>
                    </div>
                  ))}
                </div>

                {repairReport.reassigned.length > 0 ? (
                  <div>
                    <p className="font-semibold text-white mb-1.5">
                      {t('admin.reassignedListTitle', { count: formatNumber(repairReport.reassigned.length) })}
                    </p>
                    <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {repairReport.reassigned.map((r) => (
                        <li key={`${r.memberId}_${r.toUserId16}`} className="font-mono text-[11px] text-slate-300">
                          <span className="font-sans font-semibold text-white">{r.name}</span>:{' '}
                          {format16DigitUserId(r.fromUserId16 || undefined)} → {format16DigitUserId(r.toUserId16)}{' '}
                          <span className="font-sans text-slate-400">
                            ({REPAIR_REASON_KEYS[r.reason] ? t(REPAIR_REASON_KEYS[r.reason]) : r.reason})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-slate-400">{t('admin.noIdsChanged')}</p>
                )}

                {repairReport.errors.length > 0 && (
                  <div>
                    <p className="font-semibold text-rose-300 mb-1">
                      {t('admin.issuesCount', { count: formatNumber(repairReport.errors.length) })}
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5 text-rose-200 max-h-32 overflow-y-auto">
                      {repairReport.errors.map((errText, i) => (
                        <li key={i}>{errText}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Members holding reserved admin / main-account IDs */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4 className="text-sm font-bold text-white flex items-start gap-2">
                <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{t('admin.reservedIdsTitle', { range: RESERVED_ID_RANGE_LABEL })}</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                {t('admin.reservedIdsDesc', { action: t('admin.assignNewId') })}
              </p>

              {reservedHolders.length === 0 ? (
                <p className="mt-3 text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('admin.noReservedHolders')}</span>
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {reservedHolders.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl glass-well"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{m.name || m.cosplayName}</p>
                        <p className="text-[11px] font-mono font-bold text-amber-300">
                          {format16DigitUserId(m.userId16)}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {t('admin.reservedHolderMeta', { source: m.source || '', role: m.primaryRole || '' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleReassignReservedId(m)}
                        disabled={reassigningId !== null}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${reassigningId === m.id ? 'animate-spin' : ''}`} />
                        <span>{reassigningId === m.id ? t('admin.processing') : t('admin.assignNewId')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {reassignResult && (
                <p
                  className={`mt-3 text-xs font-mono ${
                    reassignResult.isError ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {t(reassignResult.isError ? 'admin.resultFailed' : 'admin.resultSuccess', {
                    message: reassignResult.message,
                  })}
                </p>
              )}
            </div>
          </div>

          {/* DUPLICATE REGISTRATIONS: same person filled the form more than once (admin merge, on demand) */}
          <div className="liquid-glass-card rounded-3xl p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t('admin.duplicatesTitle')}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">
                    {t('admin.duplicatesDesc')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleScanDuplicateRegistrations}
                disabled={isAnyMergeRunning}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('admin.scanDuplicates')}</span>
              </button>
            </div>

            {mergeResult && (
              <p
                className={`mt-4 text-xs font-mono ${mergeResult.isError ? 'text-rose-300' : 'text-emerald-300'}`}
              >
                {t(mergeResult.isError ? 'admin.resultFailed' : 'admin.resultSuccess', {
                  message: mergeResult.message,
                })}
              </p>
            )}

            {/* Report of the last bulk merge */}
            {bulkMergeReport && (
              <div
                className={`mt-4 p-4 rounded-2xl border text-xs text-slate-200 space-y-3 ${
                  bulkMergeReport.failedGroups > 0
                    ? 'bg-amber-950/50 border-amber-500/30'
                    : 'bg-emerald-950/50 border-emerald-500/30'
                }`}
              >
                <p
                  className={`font-bold flex items-center gap-1.5 ${
                    bulkMergeReport.failedGroups > 0 ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {bulkMergeReport.failedGroups > 0 ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {t('admin.bulkMergeDone', {
                      mode: t(bulkMergeReport.mode === 'identical' ? 'admin.bulkModeIdentical' : 'admin.bulkModeAll'),
                    })}
                  </span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'groups', label: t('admin.bulkStatGroups'), value: bulkMergeReport.groups },
                    { id: 'mergedGroups', label: t('admin.bulkStatMergedGroups'), value: bulkMergeReport.mergedGroups },
                    { id: 'mergedRecords', label: t('admin.bulkStatMergedRecords'), value: bulkMergeReport.mergedRecords },
                    { id: 'failedGroups', label: t('admin.bulkStatFailedGroups'), value: bulkMergeReport.failedGroups },
                  ].map((s) => (
                    <div key={s.id} className="glass-well rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                      <p className="text-lg font-black text-white">{formatNumber(s.value)}</p>
                    </div>
                  ))}
                </div>

                {bulkMergeReport.errors.length > 0 && (
                  <div>
                    <p className="font-semibold text-rose-300 mb-1">
                      {t('admin.issuesCount', { count: formatNumber(bulkMergeReport.errors.length) })}
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5 text-rose-200 break-words">
                      {bulkMergeReport.errors.slice(0, BULK_MERGE_ERRORS_SHOWN).map((errText, i) => (
                        <li key={i}>{errText}</li>
                      ))}
                    </ul>
                    {bulkMergeReport.errors.length > BULK_MERGE_ERRORS_SHOWN && (
                      <p className="mt-1 text-slate-400">
                        {t('admin.bulkMoreErrors', {
                          count: formatNumber(bulkMergeReport.errors.length - BULK_MERGE_ERRORS_SHOWN),
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Scan summary + bulk merge (one confirm per action) */}
            {duplicateGroups !== null && duplicateGroups.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <p className="text-xs text-slate-200 leading-relaxed">
                  {renderRich(t('admin.scanSummary', { seconds: formatNumber(EXACT_DUPLICATE_WINDOW_SECONDS) }), {
                    groups: <strong className="text-white">{formatNumber(duplicateGroups.length)}</strong>,
                    records: <strong className="text-white">{formatNumber(duplicateRecordCount)}</strong>,
                    identical: <strong className="text-emerald-300">{formatNumber(exactDuplicateGroups.length)}</strong>,
                  })}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkMergeDuplicates('identical')}
                    disabled={isAnyMergeRunning || exactDuplicateGroups.length === 0}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('admin.mergeAllIdentical', { count: formatNumber(exactDuplicateGroups.length) })}</span>
                  </button>
                  <button
                    onClick={() => handleBulkMergeDuplicates('all')}
                    disabled={isAnyMergeRunning}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('admin.mergeAllScanned', { count: formatNumber(duplicateGroups.length) })}</span>
                  </button>
                </div>

                {bulkMergeProgress && (
                  <div className="space-y-1.5" role="status" aria-live="polite">
                    <p className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>
                        {t('admin.bulkMergeProgress', {
                          done: formatNumber(bulkMergeProgress.done),
                          total: formatNumber(bulkMergeProgress.total),
                        })}
                      </span>
                    </p>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 transition-all"
                        style={{
                          width: `${
                            bulkMergeProgress.total > 0
                              ? Math.round((bulkMergeProgress.done / bulkMergeProgress.total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {duplicateGroups !== null &&
              (duplicateGroups.length === 0 ? (
                <p className="mt-4 text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('admin.noDuplicatesFound')}</span>
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {duplicateGroups.map((group) => {
                    const keeper = group.keeper;
                    const keeperPhones = getMemberPhones(keeper);
                    return (
                      <div
                        key={keeper.id}
                        className="glass-well p-3.5 rounded-2xl space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="min-w-0 space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle className="w-3 h-3" />
                              <span>{t('admin.keeperBadge')}</span>
                            </span>
                            <p className="font-bold text-white text-sm truncate">
                              {keeper.name || keeper.cosplayName || keeper.id}
                            </p>
                            <p className="text-[11px] font-mono font-bold text-amber-300">
                              {format16DigitUserId(keeper.userId16)}
                            </p>
                            <p className="text-[11px] text-emerald-300/90 font-mono break-all">
                              {keeperPhones.length > 0 ? keeperPhones.join(' / ') : '—'}
                            </p>
                            {keeper.email && (
                              <p className="text-[11px] text-slate-400 break-all">{keeper.email}</p>
                            )}
                            <p className="text-[11px] text-slate-500">
                              {keeper.createdAt ? formatDate(keeper.createdAt, DATE_TIME_OPTIONS) : '-'}
                            </p>
                          </div>
                        </div>

                        {group.duplicates.map((dup) => {
                          const dupPhones = getMemberPhones(dup);
                          return (
                            <div
                              key={dup.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-white/10"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <p className="font-semibold text-slate-200 text-sm truncate">
                                  {dup.name || dup.cosplayName || dup.id}
                                </p>
                                <p className="text-[11px] font-mono text-slate-300">
                                  {format16DigitUserId(dup.userId16)}
                                </p>
                                <p className="text-[11px] text-emerald-300/80 font-mono break-all">
                                  {dupPhones.length > 0 ? dupPhones.join(' / ') : '—'}
                                </p>
                                {dup.email && <p className="text-[11px] text-slate-400 break-all">{dup.email}</p>}
                                <p className="text-[11px] text-slate-500">
                                  {dup.createdAt ? formatDate(dup.createdAt, DATE_TIME_OPTIONS) : '-'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleMergeDuplicate(group, dup)}
                                disabled={isAnyMergeRunning}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${mergingId === dup.id ? 'animate-spin' : ''}`} />
                                <span>
                                  {mergingId === dup.id
                                    ? t('admin.merging')
                                    : t('admin.mergeInto', { id: format16DigitUserId(keeper.userId16) })}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* Filters and Controls */}
          <div className="liquid-glass-card rounded-3xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('admin.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 liquid-glass-input rounded-2xl text-white text-base"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-300"
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
                  className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-300"
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
                  className="px-3 py-2 liquid-glass-input rounded-xl text-base sm:text-sm text-slate-300"
                >
                  <option value="ALL">{t('admin.filterAllAges')}</option>
                  {/* Values are the stored ageCategory strings; only the labels are translated */}
                  <option value="Legal Age / Dewasa (18+)">{t('admin.filterLegalAge')}</option>
                  <option value="Minor / Di Bawah Umur (<18)">{t('admin.filterMinor')}</option>
                  <option value="Memilih untuk tidak menyebutkan">{t('admin.filterPreferNotToSay')}</option>
                </select>
                
                {/* Sort Order Selector (Simplified) */}
                <div className="flex items-center gap-1.5 liquid-glass-input rounded-xl px-2.5 py-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as any)}
                    className="bg-transparent text-base sm:text-sm text-slate-200 focus:outline-none pr-1 cursor-pointer"
                  >
                    <option value="timestamp_desc">{t('admin.sortNewest')}</option>
                    <option value="name_asc">{t('admin.sortNameAsc')}</option>
                  </select>
                </div>
                
                <button
                  onClick={exportToCsv}
                  className="px-3.5 py-2 liquid-glass-button rounded-xl text-xs font-bold text-slate-900 inline-flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('admin.exportCsv')}</span>
                </button>
                <button
                  onClick={handlePurgeAll}
                  disabled={isPurging}
                  title={t('admin.purgeButtonTitle')}
                  className="px-3.5 py-2 liquid-glass-button rounded-xl text-xs font-bold text-rose-900 inline-flex items-center gap-1.5 shadow-md"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                  <span>{isPurging ? t('admin.purging') : t('admin.purgeButton')}</span>
                </button>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
              <span>
                {renderRich(t('admin.showingMembers', { total: formatNumber(members.length) }), {
                  shown: <strong>{formatNumber(filteredMembers.length)}</strong>,
                })}
              </span>
              {(selectedRole !== 'ALL' || selectedCity !== 'ALL' || selectedAgeCategory !== 'ALL' || searchQuery) && (
                <button
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

          {/* Members Table */}
          <div className="liquid-glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-white/10">
                  <tr>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('name')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t('admin.colMember')}</span>
                        {sortMode.startsWith('name') && (
                          <span className="text-rose-400 font-bold">
                            {sortMode === 'name_asc' ? t('admin.sortAz') : t('admin.sortZa')}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('uid')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t('admin.colKccId')}</span>
                        {sortMode === 'uid_asc' && (
                          <span className="text-rose-400 font-bold">{t('admin.sortIdAsc')}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4">{t('admin.colContact')}</th>
                    <th className="py-4 px-4">{t('admin.colDiscord')}</th>
                    <th className="py-4 px-4">{t('admin.colRole')}</th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('age')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t('admin.colAge')}</span>
                        {sortMode.startsWith('age') && (
                          <span className="text-rose-400 font-bold">
                            {sortMode === 'age_asc' ? t('admin.sortAgeYoungest') : t('admin.sortAgeOldest')}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('location')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t('admin.colLocation')}</span>
                        {sortMode.startsWith('location') && (
                          <span className="text-rose-400 font-bold">
                            {sortMode === 'location_asc' ? t('admin.sortAz') : t('admin.sortZa')}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('status')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t('admin.colStatus')}</span>
                        {sortMode.startsWith('status') && (
                          <span className="text-rose-400 font-bold">
                            {sortMode === 'status_asc' ? t('admin.sortStatusAsc') : t('admin.sortStatusDesc')}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('timestamp')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t('admin.colRegistered')}</span>
                        {sortMode.startsWith('timestamp') && (
                          <span className="text-rose-400 font-bold">
                            {sortMode === 'timestamp_desc' ? t('admin.sortTimeNewest') : t('admin.sortTimeOldest')}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-right">{t('admin.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">
                                  {(m.name || m.cosplayName || 'KC').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{m.name || m.cosplayName}</p>
                              {m.fullName && m.fullName !== (m.name || m.cosplayName) && (
                                <p className="text-[11px] text-slate-400">{t('admin.legalNameValue', { name: m.fullName })}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-white tracking-wider text-xs font-mono font-bold">
                              {format16DigitUserId(m.userId16)}
                            </span>
                            {isMainAccountUserId(m.userId16) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>{t('admin.mainAccountBadge')}</span>
                              </span>
                            ) : isAdminUserId(m.userId16) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-sans">
                                <Shield className="w-3 h-3 text-rose-400" />
                                <span>
                                  {t('admin.adminIdBadge', {
                                    number: parseInt((m.userId16 || '').replace(/\D/g, '') || '1').toString().padStart(4, '0'),
                                  })}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-sans">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                <span>{t('admin.timestampIdBadge')}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            {m.phone ? (
                              <p className="text-emerald-400 font-mono font-bold text-xs">{m.phone}</p>
                            ) : (
                              <p className="text-slate-500 italic text-xs">—</p>
                            )}
                            {m.phone2 && (
                              <p className="text-emerald-300/80 font-mono text-[11px] flex items-center gap-1">
                                <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-sans font-semibold">{t('admin.phone2Chip')}</span>
                                <span>{m.phone2}</span>
                              </p>
                            )}
                            {Array.isArray(m.additionalPhones) &&
                              m.additionalPhones
                                .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
                                .map((p, i) => (
                                  <p
                                    key={`${m.id}_wa_${i}`}
                                    className="text-emerald-300/70 font-mono text-[11px] flex items-center gap-1"
                                  >
                                    <span className="text-[9px] px-1 py-0.2 bg-emerald-500/15 text-emerald-300 rounded font-sans font-semibold">{t('admin.additionalPhoneChip')}</span>
                                    <span>{p}</span>
                                  </p>
                                ))}
                            {m.email && <p className="text-[11px] text-slate-400">{m.email}</p>}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {m.discordUsername ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-semibold">
                              {m.discordUsername}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-xs">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold mb-1">
                            {m.primaryRole}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{m.fandom}</p>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-slate-300 font-medium">
                            {m.ageCategory || (m.age ? `${m.age}` : '-')}
                          </span>
                          {m.age && m.ageCategory && (
                            <p className="text-[10px] text-slate-400">{m.age}</p>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-300">
                          {m.city}, {m.country}
                        </td>

                        <td className="py-4 px-4 text-slate-400 text-xs">
                          {m.createdAt ? formatDate(m.createdAt) : '-'}
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={m.status || 'verified'}
                            onChange={(e) => handleStatusChange(m.id, e.target.value as MemberStatus, m.userId16)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                              m.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : m.status === 'verified'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {(['verified', 'active', 'pending'] as const).map((status) => (
                              <option key={status} value={status} className="bg-slate-900 text-white">
                                {t(STATUS_LABEL_KEYS[status])}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => onSelectMember(m)}
                              title={t('admin.viewKccIdTitle')}
                              aria-label={t('admin.viewKccIdTitle')}
                              className="touch-target pressable p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteMember(m)}
                              title={t('admin.deleteMemberTitle')}
                              aria-label={t('admin.deleteMemberTitle')}
                              className="touch-target pressable p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <div className="max-w-md mx-auto space-y-4 px-4">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                              {members.length === 0 ? t('admin.emptyDatabaseTitle') : t('admin.noResultsTitle')}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {members.length === 0 ? t('admin.emptyDatabaseDesc') : t('admin.noResultsDesc')}
                            </p>
                          </div>
                          {members.length === 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                              <button
                                onClick={() => setAdminTab('sync')}
                                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center gap-1.5"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>{t('admin.openSheetsSync')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GOOGLE SHEETS SYNC */}
      {adminTab === 'sync' && (
        <GoogleSheetsSync
          user={user}
          accessToken={accessToken}
          onLogin={onConnectSheets}
          connectError={sheetsConnectError}
          syncLogs={syncLogs}
          syncLogsError={syncLogsError}
          totalMembersInFirestore={members.length}
        />
      )}

      {/* TAB CONTENT 3: STATS OVERVIEW */}
      {adminTab === 'analytics' && <StatsOverview members={members} />}
    </div>
  );
};
