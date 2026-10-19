/**
 * Admins tab: the fixed main-account row + every admins/{uid} entry (name, email, added by, when) with
 * Remove, and a member picker to make a signed-in member an admin. Any admin may add/remove admins
 * (owner decision); the main account is permanent. Writes go through adminService (one batch each, with
 * the audit-log entry).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Crown, RefreshCw, Search, ShieldCheck, ShieldPlus, UserMinus, Users } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AdminEntry, Member } from '../../types';
import { addAdmin, listAdmins, removeAdmin } from '../../lib/adminService';
import { formatKccId } from '../../lib/idGenerator';
import { describeFirestoreError, isMainAdminUser, isPermissionDeniedError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import {
  NoticeBanner,
  OFFICIAL_ADMIN_EMAIL,
  Spinner,
  digitsOnly,
  makeAdminBlockReason,
  memberName,
  shortUid,
} from './adminUi';
import type { AdminNotice } from './adminUi';

const PICKER_MAX_RESULTS = 8;

export interface AdminsPanelProps {
  user: User; // signed-in admin
  members: Member[]; // for the "add admin" picker
  admins: AdminEntry[] | null; // cached list from the shell (null = not loaded yet)
  onAdminsChange: (next: AdminEntry[]) => void; // shell cache update
}

export const AdminsPanel: React.FC<AdminsPanelProps> = ({ user, members, admins, onAdminsChange }) => {
  const { t, formatDate } = useI18n();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(admins ? 'ready' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const [rulesMissing, setRulesMissing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
  const [notice, setNotice] = useState<AdminNotice | null>(null);

  // Latest cache setter without re-running the load effect when the parent passes a new function
  const onAdminsChangeRef = useRef(onAdminsChange);
  useEffect(() => {
    onAdminsChangeRef.current = onAdminsChange;
  });

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const list = await listAdmins();
      onAdminsChangeRef.current(list);
      setRulesMissing(false);
      setStatus('ready');
    } catch (e) {
      console.error('Admin list could not be loaded:', e);
      if (isPermissionDeniedError(e)) {
        setRulesMissing(true);
        setStatus('ready');
      } else {
        setError(describeFirestoreError(e));
        setStatus('error');
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Always refresh from the server when the tab opens (another admin may have changed the list)
  useEffect(() => {
    void load();
  }, [load]);

  const busy = removingUid !== null || addingMemberId !== null;

  const handleRemove = async (entry: AdminEntry) => {
    if (busy) return;
    const name = entry.name || entry.email || shortUid(entry.uid);
    if (!window.confirm(t('admin.removeAdminConfirm', { name }))) return;
    const isSelf = entry.uid === user.uid;
    if (isSelf && !window.confirm(t('admin.removeSelfConfirm'))) return;

    setRemovingUid(entry.uid);
    setNotice(null);
    try {
      await removeAdmin(entry, { allowSelf: isSelf });
      if (isSelf) {
        // Own access removed: leave the dashboard (and the member data loaded in this page) right away
        window.location.reload();
        return;
      }
      onAdminsChange((admins || []).filter((a) => a.uid !== entry.uid));
      haptic('success');
      setNotice({ kind: 'success', text: t('admin.adminRemoved', { name }) });
    } catch (e) {
      console.error('Remove admin failed:', e);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(e) });
    } finally {
      setRemovingUid(null);
    }
  };

  const handleAdd = async (member: Member) => {
    if (busy || makeAdminBlockReason(member, user, admins)) return;
    const name = memberName(member);
    if (!window.confirm(t('admin.makeAdminConfirm', { name, id: formatKccId(member.userId16) }))) return;

    setAddingMemberId(member.id);
    setNotice(null);
    try {
      const entry = await addAdmin(member);
      onAdminsChange([...(admins || []).filter((a) => a.uid !== entry.uid), entry]);
      haptic('success');
      setNotice({ kind: 'success', text: t('admin.adminAdded', { name }), hint: t('admin.adminTakesEffectHint') });
      setPickerQuery('');
    } catch (e) {
      console.error('Add admin failed:', e);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(e) });
    } finally {
      setAddingMemberId(null);
    }
  };

  const pickerResults = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const qDigits = digitsOnly(q);
    const results: Member[] = [];
    for (const m of members) {
      const matches =
        (m.name || '').toLowerCase().includes(q) ||
        (m.cosplayName || '').toLowerCase().includes(q) ||
        (m.fullName || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (qDigits.length >= 3 &&
          (digitsOnly(m.userId16).includes(qDigits) || digitsOnly(m.legacyUserId16).includes(qDigits)));
      if (matches) {
        results.push(m);
        if (results.length >= PICKER_MAX_RESULTS) break;
      }
    }
    return results;
  }, [members, pickerQuery]);

  const rowClass = 'glass-well rounded-2xl p-3.5 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] md:items-center md:gap-3 space-y-1.5 md:space-y-0';

  return (
    <div className="space-y-6">
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('admin.tabAdmins')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">
                {t('admin.adminsInfo', { email: OFFICIAL_ADMIN_EMAIL })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing || busy}
            className="glass-button pressable px-3.5 text-xs pointer-coarse:min-h-11 self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{t('admin.refresh')}</span>
          </button>
        </div>

        <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />

        {rulesMissing && (
          <NoticeBanner notice={{ kind: 'info', text: t('admin.adminsRulesMissing') }} />
        )}

        {status === 'error' && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-3">
            <p className="font-semibold">{t('admin.adminsLoadFailed')}</p>
            {error && <p className="opacity-90 break-words">{error}</p>}
            <button type="button" onClick={() => void load()} className="glass-button pressable px-3.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('common.tryAgain')}</span>
            </button>
          </div>
        )}

        {/* Column titles (desktop) */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] gap-3 px-3.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
          <span>{t('admin.adminsColName')}</span>
          <span>{t('admin.adminsColEmail')}</span>
          <span>{t('admin.adminsColAddedBy')}</span>
          <span>{t('admin.adminsColAddedAt')}</span>
          <span className="sr-only">{t('admin.colActions')}</span>
        </div>

        <ul className="space-y-2">
          {/* Main account: fixed, never removable */}
          <li className={rowClass}>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="font-bold text-white text-sm">{t('admin.mainAccountRow')}</span>
              <span className="glass-chip bg-amber-500/20 text-amber-300 border-amber-500/40">{t('admin.permanentChip')}</span>
              {isMainAdminUser(user) && (
                <span className="glass-chip bg-indigo-500/20 text-indigo-200 border-indigo-500/40">{t('admin.youChip')}</span>
              )}
            </div>
            <p className="text-xs text-slate-300 break-all">{OFFICIAL_ADMIN_EMAIL}</p>
            <p className="text-xs text-slate-500">—</p>
            <p className="text-xs text-slate-500">—</p>
            <span className="hidden md:block w-[9rem]" aria-hidden="true" />
          </li>

          {status === 'loading' &&
            [0, 1, 2].map((i) => (
              <li key={`sk_${i}`} className="glass-well rounded-2xl p-3.5">
                <div className="glass-skeleton h-4 w-2/3" />
                <div className="glass-skeleton h-3 w-1/2 mt-2" />
              </li>
            ))}

          {status !== 'loading' &&
            (admins || []).map((entry) => {
              const name = entry.name || t('admin.unknownName');
              const isSelf = entry.uid === user.uid;
              const addedBy = entry.legacy ? t('admin.addedInConsole') : entry.addedByEmail || shortUid(entry.addedBy);
              return (
                <li key={entry.uid} className={rowClass}>
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                    <span className="font-bold text-white text-sm break-words">{name}</span>
                    {isSelf && (
                      <span className="glass-chip bg-indigo-500/20 text-indigo-200 border-indigo-500/40">{t('admin.youChip')}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 break-all">
                    <span className="md:hidden text-slate-500">{t('admin.adminsColEmail')}: </span>
                    {entry.email || '—'}
                  </p>
                  <p className="text-xs text-slate-400 break-words">
                    <span className="md:hidden text-slate-500">{t('admin.adminsColAddedBy')}: </span>
                    {addedBy}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="md:hidden text-slate-500">{t('admin.adminsColAddedAt')}: </span>
                    {entry.addedAt ? formatDate(entry.addedAt) : '—'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleRemove(entry)}
                    disabled={busy || rulesMissing}
                    className="glass-button pressable w-full md:w-[9rem] px-3 text-xs pointer-coarse:min-h-11 bg-rose-950/50 border-rose-500/40 text-rose-200 mt-2 md:mt-0"
                  >
                    {removingUid === entry.uid ? <Spinner /> : <UserMinus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    <span>{t('admin.removeAdmin')}</span>
                  </button>
                </li>
              );
            })}
        </ul>

        {status === 'ready' && !rulesMissing && (admins || []).length === 0 && (
          <p className="text-xs text-slate-400">{t('admin.noOtherAdmins')}</p>
        )}
      </div>

      {/* Add an admin */}
      {!rulesMissing && (
        <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldPlus className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span>{t('admin.addAdminTitle')}</span>
          </h3>
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder={t('admin.addAdminSearchPlaceholder')}
              aria-label={t('admin.addAdminSearchPlaceholder')}
              className="w-full ps-10 pe-4 py-3 liquid-glass-input rounded-2xl text-white text-base"
            />
          </div>

          {pickerResults.length > 0 && (
            <ul className="space-y-2">
              {pickerResults.map((m) => {
                const reason = makeAdminBlockReason(m, user, admins);
                return (
                  <li
                    key={m.id}
                    className="glass-well rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm break-words">{memberName(m)}</p>
                      <p className="text-[11px] font-mono text-slate-300">{formatKccId(m.userId16)}</p>
                      {m.email && <p className="text-[11px] text-slate-400 break-all">{m.email}</p>}
                    </div>
                    {reason ? (
                      <p className="text-[11px] text-slate-400 sm:max-w-[16rem] sm:text-end">{t(reason)}</p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleAdd(m)}
                        disabled={busy}
                        className="btn-primary pressable w-full sm:w-auto px-3.5 text-xs pointer-coarse:min-h-11"
                      >
                        {addingMemberId === m.id ? <Spinner /> : <ShieldPlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                        <span>{t('admin.makeAdmin')}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
