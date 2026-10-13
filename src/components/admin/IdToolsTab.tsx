/**
 * KCC ID tools tab, top to bottom in the recommended run order after the sprint-3 deploy:
 * run-order guide → duplicate registrations (merge) → 8-digit switch → counter health (after the switch)
 * → KCC ID repair + reserved-ID holders. The duplicate / repair / reserved panels moved here from the
 * members tab (behaviour unchanged except 8-digit display); long tasks report to the shell's busy guard.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  ListOrdered,
  RefreshCw,
  Search,
  Shield,
  Wrench,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { DuplicateRegistrationGroup, KccCounter, Member, MemberRepairReport } from '../../types';
import {
  EXACT_DUPLICATE_WINDOW_MS,
  findDuplicateRegistrationGroups,
  isExactDuplicateGroup,
  listReservedIdHolders,
  mergeDuplicateRegistration,
  reassignMemberUserId16,
  repairMemberIdsAndCards,
} from '../../lib/firestoreService';
import { formatKccId, isMainAccountKccId } from '../../lib/idGenerator';
import { describeFirestoreError, isMainAdminUser } from '../../lib/firebase';
import { touchDashboardActivity } from '../../lib/dashboardLock';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import {
  DATE_TIME_OPTIONS,
  OFFICIAL_ADMIN_EMAIL,
  SOURCE_LABEL_KEYS,
  Spinner,
  memberName,
  memberPhones,
  renderRich,
} from './adminUi';
import type { AdminBusyTask } from './adminUi';
import { KccIdMigrationPanel } from './KccIdMigrationPanel';
import { KccCounterCard } from './KccCounterCard';

// Reserved range label in the current ID format (constant strings, not translated)
const RESERVED_RANGE_KCC8 = '0000 0000 – 0000 0100';
const RESERVED_RANGE_LEGACY = '0000 0000 0000 0000 – 0000 0000 0000 0100';

// Translation keys for MemberIdReassignment.reason in the repair report (unknown reasons are shown as-is)
const REPAIR_REASON_KEYS: Record<string, TranslationKey> = {
  duplicate: 'admin.repairReasonDuplicate',
  missing: 'admin.repairReasonMissing',
  main_account: 'admin.repairReasonMainAccount',
};

type BulkMergeMode = 'identical' | 'all';
interface BulkMergeReport {
  mode: BulkMergeMode;
  groups: number;
  mergedGroups: number;
  mergedRecords: number;
  failedGroups: number;
  errors: string[];
}

const ERRORS_SHOWN = 5;
const EXACT_DUPLICATE_WINDOW_SECONDS = Math.round(EXACT_DUPLICATE_WINDOW_MS / 1000);

const dangerButton =
  'px-4 py-2.5 rounded-xl text-white text-xs font-bold pressable pointer-coarse:min-h-11 shadow-md inline-flex items-center justify-center gap-1.5 disabled:opacity-50';

export interface IdToolsTabProps {
  user: User;
  members: Member[];
  kccCounter: KccCounter | null | undefined;
  refreshCounter: () => Promise<void>;
  busyTask: AdminBusyTask | null;
  onBusyChange: (task: AdminBusyTask | null) => void;
  onOpenSync: () => void; // step 2 of the run order lives in the Sync tab
}

export const IdToolsTab: React.FC<IdToolsTabProps> = ({
  user,
  members,
  kccCounter,
  refreshCounter,
  busyTask,
  onBusyChange,
  onOpenSync,
}) => {
  const { t, formatNumber, formatDate } = useI18n();
  const anyTaskRunning = busyTask !== null;

  // ----- Repair + reserved holders -----
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState<{ done: number; total: number } | null>(null);
  const [repairReport, setRepairReport] = useState<MemberRepairReport | null>(null);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [reassignResult, setReassignResult] = useState<{ isError: boolean; message: string } | null>(null);

  // ----- Duplicates (scanned on demand only) -----
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateRegistrationGroup[] | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [mergeResult, setMergeResult] = useState<{ isError: boolean; message: string } | null>(null);
  const [bulkMergeProgress, setBulkMergeProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkMergeReport, setBulkMergeReport] = useState<BulkMergeReport | null>(null);
  const isBulkMerging = bulkMergeProgress !== null;
  const isAnyMergeRunning = mergingId !== null || isBulkMerging;

  // Latest members snapshot for the re-scan after a bulk merge (the handler's own `members` is stale)
  const membersRef = useRef<Member[]>(members);
  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  const afterSwitch = !!kccCounter;
  const reservedRangeLabel = afterSwitch ? RESERVED_RANGE_KCC8 : RESERVED_RANGE_LEGACY;

  const duplicateRecordCount = useMemo(
    () => (duplicateGroups || []).reduce((total, g) => total + g.duplicates.length, 0),
    [duplicateGroups]
  );
  const exactDuplicateGroups = useMemo(
    () => (duplicateGroups || []).filter((g) => isExactDuplicateGroup(g)),
    [duplicateGroups]
  );

  const mainAdminUid = isMainAdminUser(user) ? user.uid : null;
  const reservedHolders = useMemo(() => listReservedIdHolders(members, mainAdminUid), [members, mainAdminUid]);

  // Members whose KCC ID is shared with at least one other member (display only)
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

  const handleRunRepair = async () => {
    if (isRepairing || anyTaskRunning) return;
    if (!window.confirm(t('admin.repairConfirm'))) return;

    setIsRepairing(true);
    setRepairError(null);
    setRepairReport(null);
    setRepairProgress({ done: 0, total: 0 });
    onBusyChange('repair');
    try {
      const report = await repairMemberIdsAndCards((done, total) => {
        setRepairProgress({ done, total });
        touchDashboardActivity();
      });
      setRepairReport(report);
      haptic(report.errors.length > 0 ? 'error' : 'success');
    } catch (e) {
      console.error('Repair error:', e);
      haptic('error');
      setRepairError(describeFirestoreError(e));
    } finally {
      setIsRepairing(false);
      onBusyChange(null);
      try {
        await refreshCounter();
      } catch (refreshError) {
        console.warn('Counter refresh after the repair failed:', refreshError);
      }
    }
  };

  const handleReassignReservedId = async (member: Member) => {
    if (reassigningId || anyTaskRunning) return;
    const displayName = memberName(member);
    const confirmLines = [t('admin.reassignConfirm', { name: displayName, id: formatKccId(member.userId16) })];
    if (isMainAccountKccId(member.userId16)) {
      confirmLines.push(t('admin.reassignMainAccountWarning', { email: OFFICIAL_ADMIN_EMAIL }));
    }
    if (!window.confirm(confirmLines.join('\n\n'))) return;

    setReassigningId(member.id);
    setReassignResult(null);
    onBusyChange('reassign');
    try {
      const newId = await reassignMemberUserId16(member, members);
      haptic('success');
      setReassignResult({
        isError: false,
        message: `${displayName}: ${formatKccId(member.userId16)} → ${formatKccId(newId)}`,
      });
    } catch (e) {
      console.error('Reassign KCC ID error:', e);
      haptic('error');
      setReassignResult({ isError: true, message: `${displayName}: ${describeFirestoreError(e)}` });
    } finally {
      setReassigningId(null);
      onBusyChange(null);
      try {
        await refreshCounter();
      } catch (refreshError) {
        console.warn('Counter refresh after the reassignment failed:', refreshError);
      }
    }
  };

  // O(n²) duplicate-person scan: on demand only, never on every members snapshot
  const handleScanDuplicateRegistrations = () => {
    if (isAnyMergeRunning) return;
    setDuplicateGroups(findDuplicateRegistrationGroups(members));
    setMergeResult(null);
    setBulkMergeReport(null);
  };

  const handleMergeDuplicate = async (group: DuplicateRegistrationGroup, dup: Member) => {
    if (isAnyMergeRunning || anyTaskRunning) return;
    const keeper = group.keeper;
    const keeperName = memberName(keeper);
    const dupName = memberName(dup);
    const confirmMerge = window.confirm(
      t('admin.mergeConfirm', {
        duplicate: dupName,
        duplicateId: formatKccId(dup.userId16),
        keeper: keeperName,
        keeperId: formatKccId(keeper.userId16),
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
      haptic('success');
      setMergeResult({
        isError: false,
        message: t('admin.mergeSuccess', {
          duplicate: dupName,
          keeper: memberName(merged) || keeperName,
          id: formatKccId(merged.userId16),
        }),
      });
    } catch (e) {
      console.error('Merge duplicate registration error:', e);
      haptic('error');
      setMergeResult({ isError: true, message: `${dupName}: ${describeFirestoreError(e)}` });
    } finally {
      setMergingId(null);
    }
  };

  // Bulk merge with ONE confirm: the per-record merge (<= 3 ops per batch) runs sequentially for every
  // group, keeps going after a failed merge, then reports and re-scans.
  const handleBulkMergeDuplicates = async (mode: BulkMergeMode) => {
    if (isAnyMergeRunning || anyTaskRunning || !duplicateGroups) return;
    const groups = mode === 'identical' ? exactDuplicateGroups : duplicateGroups;
    if (groups.length === 0) return;
    const recordCount = groups.reduce((total, g) => total + g.duplicates.length, 0);

    const confirmText = t(mode === 'identical' ? 'admin.bulkMergeIdenticalConfirm' : 'admin.bulkMergeAllConfirm', {
      groups: formatNumber(groups.length),
      records: formatNumber(recordCount),
      seconds: formatNumber(EXACT_DUPLICATE_WINDOW_SECONDS),
    });
    if (!window.confirm(confirmText)) return;

    setMergeResult(null);
    setBulkMergeReport(null);
    setBulkMergeProgress({ done: 0, total: groups.length });
    onBusyChange('bulkMerge');

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
        const keeperLabel = `${memberName(group.keeper)} (${formatKccId(group.keeper.userId16)})`;
        let groupFailed = false;
        // mergeDuplicateRegistration re-reads both docs from the server, so the keeper always receives the
        // result of the previous merge of its group
        for (const dup of group.duplicates) {
          try {
            await mergeDuplicateRegistration(group.keeper, dup);
            mergedIds.add(dup.id);
            report.mergedRecords++;
          } catch (e) {
            groupFailed = true;
            console.error('Bulk merge duplicate registration error:', e);
            report.errors.push(
              `${memberName(dup)} (${formatKccId(dup.userId16)}) → ${keeperLabel}: ${describeFirestoreError(e)}`
            );
          }
        }
        if (groupFailed) report.failedGroups++;
        else report.mergedGroups++;
        setBulkMergeProgress({ done: i + 1, total: groups.length });
        touchDashboardActivity();
      }
    } finally {
      haptic(report.failedGroups > 0 || report.mergedGroups < report.groups ? 'error' : 'success');
      setBulkMergeReport(report);
      setBulkMergeProgress(null);
      onBusyChange(null);
      // Re-scan on the latest snapshot; merged duplicates are dropped explicitly in case their deletion has
      // not reached the members snapshot yet
      setDuplicateGroups(findDuplicateRegistrationGroups(membersRef.current.filter((m) => !mergedIds.has(m.id))));
    }
  };

  // ----- Run order chips -----
  const step1Chip =
    duplicateGroups === null
      ? t('admin.runOrderNotScanned')
      : duplicateGroups.length === 0
      ? t('admin.noDuplicatesFound')
      : t('admin.runOrderScanResult', { count: formatNumber(duplicateGroups.length) });
  const step3Chip = kccCounter === undefined ? '—' : kccCounter ? t('admin.idEraKcc8') : t('admin.idEraLegacy');

  return (
    <div className="space-y-6">
      {/* 1. Run order guide */}
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
            <ListOrdered className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('admin.runOrderTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('admin.runOrderDesc')}</p>
          </div>
        </div>
        <ol className="space-y-2">
          <li className="glass-well rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">{t('admin.runOrderStep1')}</span>
            <span className="glass-chip self-start sm:self-center">{step1Chip}</span>
          </li>
          <li className="glass-well rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">{t('admin.runOrderStep2')}</span>
            <button
              type="button"
              onClick={onOpenSync}
              disabled={anyTaskRunning}
              className="glass-button pressable px-3.5 text-xs pointer-coarse:min-h-11 self-start sm:self-center"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('admin.openSheetsSync')}</span>
            </button>
          </li>
          <li className="glass-well rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">{t('admin.runOrderStep3')}</span>
            <span
              className={`glass-chip self-start sm:self-center ${
                kccCounter ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : ''
              }`}
            >
              {step3Chip}
            </span>
          </li>
        </ol>
      </div>

      {/* 2. Duplicate registrations */}
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('admin.duplicatesTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">{t('admin.duplicatesDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleScanDuplicateRegistrations}
            disabled={isAnyMergeRunning || anyTaskRunning}
            className={`${dangerButton} bg-indigo-600 hover:bg-indigo-500`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t('admin.scanDuplicates')}</span>
          </button>
        </div>

        {mergeResult && (
          <p className={`mt-4 text-xs font-mono break-words ${mergeResult.isError ? 'text-rose-300' : 'text-emerald-300'}`}>
            {t(mergeResult.isError ? 'admin.resultFailed' : 'admin.resultSuccess', { message: mergeResult.message })}
          </p>
        )}

        {bulkMergeReport && (
          <div
            className={`mt-4 p-4 rounded-2xl border text-xs text-slate-200 space-y-3 ${
              bulkMergeReport.failedGroups > 0 ? 'bg-amber-950/50 border-amber-500/30' : 'bg-emerald-950/50 border-emerald-500/30'
            }`}
          >
            <p
              className={`font-bold flex items-center gap-1.5 ${
                bulkMergeReport.failedGroups > 0 ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {bulkMergeReport.failedGroups > 0 ? (
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {t('admin.bulkMergeDone', {
                  mode: t(bulkMergeReport.mode === 'identical' ? 'admin.bulkModeIdentical' : 'admin.bulkModeAll'),
                })}
              </span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  ['admin.bulkStatGroups', bulkMergeReport.groups],
                  ['admin.bulkStatMergedGroups', bulkMergeReport.mergedGroups],
                  ['admin.bulkStatMergedRecords', bulkMergeReport.mergedRecords],
                  ['admin.bulkStatFailedGroups', bulkMergeReport.failedGroups],
                ] as Array<[TranslationKey, number]>
              ).map(([key, value]) => (
                <div key={key} className="glass-well rounded-xl p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t(key)}</p>
                  <p className="text-lg font-black text-white">{formatNumber(value)}</p>
                </div>
              ))}
            </div>
            {bulkMergeReport.errors.length > 0 && (
              <div>
                <p className="font-semibold text-rose-300 mb-1">
                  {t('admin.issuesCount', { count: formatNumber(bulkMergeReport.errors.length) })}
                </p>
                <ul className="list-disc ps-5 space-y-0.5 text-rose-200 break-words">
                  {bulkMergeReport.errors.slice(0, ERRORS_SHOWN).map((errText, i) => (
                    <li key={i}>{errText}</li>
                  ))}
                </ul>
                {bulkMergeReport.errors.length > ERRORS_SHOWN && (
                  <p className="mt-1 text-slate-400">
                    {t('admin.bulkMoreErrors', { count: formatNumber(bulkMergeReport.errors.length - ERRORS_SHOWN) })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

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
                type="button"
                onClick={() => void handleBulkMergeDuplicates('identical')}
                disabled={isAnyMergeRunning || anyTaskRunning || exactDuplicateGroups.length === 0}
                className={`${dangerButton} bg-emerald-600 hover:bg-emerald-500`}
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('admin.mergeAllIdentical', { count: formatNumber(exactDuplicateGroups.length) })}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleBulkMergeDuplicates('all')}
                disabled={isAnyMergeRunning || anyTaskRunning}
                className={`${dangerButton} bg-rose-600 hover:bg-rose-500`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('admin.mergeAllScanned', { count: formatNumber(duplicateGroups.length) })}</span>
              </button>
            </div>
            {bulkMergeProgress && (
              <div className="space-y-1.5" role="status" aria-live="polite">
                <p className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
                  <span>
                    {t('admin.bulkMergeProgress', {
                      done: formatNumber(bulkMergeProgress.done),
                      total: formatNumber(bulkMergeProgress.total),
                    })}
                  </span>
                </p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 transition-[width]"
                    style={{
                      width: `${
                        bulkMergeProgress.total > 0
                          ? Math.round((bulkMergeProgress.done / bulkMergeProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-amber-200">{t('admin.keepTabOpen')}</p>
              </div>
            )}
          </div>
        )}

        {duplicateGroups !== null &&
          (duplicateGroups.length === 0 ? (
            <p className="mt-4 text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('admin.noDuplicatesFound')}</span>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {duplicateGroups.map((group) => {
                const keeper = group.keeper;
                const keeperPhones = memberPhones(keeper);
                return (
                  <div key={keeper.id} className="glass-well p-3.5 rounded-2xl space-y-2.5 cv-auto">
                    <div className="min-w-0 space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle className="w-3 h-3" aria-hidden="true" />
                        <span>{t('admin.keeperBadge')}</span>
                      </span>
                      <p className="font-bold text-white text-sm break-words">{memberName(keeper)}</p>
                      <p className="text-[11px] font-mono font-bold text-amber-300">{formatKccId(keeper.userId16)}</p>
                      <p className="text-[11px] text-emerald-300/90 font-mono break-all">
                        {keeperPhones.length > 0 ? keeperPhones.join(' / ') : '—'}
                      </p>
                      {keeper.email && <p className="text-[11px] text-slate-400 break-all">{keeper.email}</p>}
                      <p className="text-[11px] text-slate-500">
                        {keeper.createdAt ? formatDate(keeper.createdAt, DATE_TIME_OPTIONS) : '-'}
                      </p>
                    </div>

                    {group.duplicates.map((dup) => {
                      const dupPhones = memberPhones(dup);
                      return (
                        <div
                          key={dup.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-white/10"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-semibold text-slate-200 text-sm break-words">{memberName(dup)}</p>
                            <p className="text-[11px] font-mono text-slate-300">{formatKccId(dup.userId16)}</p>
                            <p className="text-[11px] text-emerald-300/80 font-mono break-all">
                              {dupPhones.length > 0 ? dupPhones.join(' / ') : '—'}
                            </p>
                            {dup.email && <p className="text-[11px] text-slate-400 break-all">{dup.email}</p>}
                            <p className="text-[11px] text-slate-500">
                              {dup.createdAt ? formatDate(dup.createdAt, DATE_TIME_OPTIONS) : '-'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleMergeDuplicate(group, dup)}
                            disabled={isAnyMergeRunning || anyTaskRunning}
                            className={`${dangerButton} bg-rose-600 hover:bg-rose-500 w-full sm:w-auto`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${mergingId === dup.id ? 'animate-spin' : ''}`} aria-hidden="true" />
                            <span>
                              {mergingId === dup.id
                                ? t('admin.merging')
                                : t('admin.mergeInto', { id: formatKccId(keeper.userId16) })}
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

      {/* 3. 8-digit switch */}
      <KccIdMigrationPanel
        kccCounter={kccCounter}
        refreshCounter={refreshCounter}
        busyTask={busyTask}
        onBusyChange={onBusyChange}
      />

      {/* 4. Counter health (after the switch) */}
      {kccCounter && <KccCounterCard kccCounter={kccCounter} refreshCounter={refreshCounter} busy={anyTaskRunning} />}

      {/* 5. KCC ID repair + reserved holders */}
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Wrench className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('admin.repairTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">{t('admin.repairDesc')}</p>
              {duplicateIdCount > 0 ? (
                <p className="text-xs font-semibold text-amber-300 mt-2 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {t('admin.repairDuplicatesDetected', {
                      count: formatNumber(duplicateIdCount),
                      action: t('admin.runRepair'),
                    })}
                  </span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-emerald-300 mt-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t('admin.allIdsUnique')}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleRunRepair()}
            disabled={isRepairing || anyTaskRunning}
            className={`${dangerButton} bg-amber-600 hover:bg-amber-500`}
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRepairing ? 'animate-spin' : ''}`} aria-hidden="true" />
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

        {isRepairing && <p className="mt-3 text-[11px] text-amber-200">{t('admin.keepTabOpen')}</p>}

        {repairError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="break-words">{t('admin.repairFailed', { error: repairError })}</span>
          </div>
        )}

        {repairReport && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-slate-200 space-y-3">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>{t('admin.repairDone')}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  ['admin.repairStatScanned', repairReport.scanned],
                  ['admin.repairStatDuplicateGroups', repairReport.duplicateGroups],
                  ['admin.repairStatCardsWritten', repairReport.cardsWritten],
                  ['admin.repairStatCardsDeleted', repairReport.cardsDeleted],
                ] as Array<[TranslationKey, number]>
              ).map(([key, value]) => (
                <div key={key} className="glass-well rounded-xl p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t(key)}</p>
                  <p className="text-lg font-black text-white">{formatNumber(value)}</p>
                </div>
              ))}
            </div>
            {repairReport.reassigned.length > 0 ? (
              <div>
                <p className="font-semibold text-white mb-1.5">
                  {t('admin.reassignedListTitle', { count: formatNumber(repairReport.reassigned.length) })}
                </p>
                <ul className="space-y-1 max-h-48 overflow-y-auto pe-1">
                  {repairReport.reassigned.map((r) => (
                    <li key={`${r.memberId}_${r.toUserId16}`} className="font-mono text-[11px] text-slate-300 break-words">
                      <span className="font-sans font-semibold text-white">{r.name}</span>: {formatKccId(r.fromUserId16)} →{' '}
                      {formatKccId(r.toUserId16)}{' '}
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
                <ul className="list-disc ps-5 space-y-0.5 text-rose-200 max-h-32 overflow-y-auto break-words">
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
            <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t('admin.reservedIdsTitle', { range: reservedRangeLabel })}</span>
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            {t('admin.reservedIdsDesc', { action: t('admin.assignNewId') })}
          </p>

          {reservedHolders.length === 0 ? (
            <p className="mt-3 text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('admin.noReservedHolders')}</span>
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {reservedHolders.map((m) => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl glass-well">
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm break-words">{memberName(m)}</p>
                    <p className="text-[11px] font-mono font-bold text-amber-300">{formatKccId(m.userId16)}</p>
                    <p className="text-[11px] text-slate-400 break-words">
                      {t('admin.reservedHolderMeta', {
                        source: SOURCE_LABEL_KEYS[m.source] ? t(SOURCE_LABEL_KEYS[m.source]) : m.source || '',
                        role: m.primaryRole || '',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleReassignReservedId(m)}
                    disabled={reassigningId !== null || anyTaskRunning}
                    className={`${dangerButton} bg-rose-600 hover:bg-rose-500 w-full sm:w-auto`}
                  >
                    {reassigningId === m.id ? <Spinner className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    <span>{reassigningId === m.id ? t('admin.processing') : t('admin.assignNewId')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {reassignResult && (
            <p className={`mt-3 text-xs font-mono break-words ${reassignResult.isError ? 'text-rose-300' : 'text-emerald-300'}`}>
              {t(reassignResult.isError ? 'admin.resultFailed' : 'admin.resultSuccess', { message: reassignResult.message })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
