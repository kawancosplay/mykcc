/**
 * Member support sheet (member list "Manage"): copy KCC ID / card link, WhatsApp chat per number, password
 * reset email, unlink login, make admin, edit details, delete. Every action shows success only after its
 * promise resolved; destructive ones confirm first. Changing a login email or deleting an Auth account needs
 * the Admin SDK and is out of scope (short note).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Copy,
  Crown,
  ExternalLink,
  KeyRound,
  Link2,
  Link2Off,
  MessageCircle,
  Pencil,
  ShieldPlus,
  Trash2,
  Info,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AdminEntry, Member } from '../../types';
import { formatKccId, isMainAccountKccId } from '../../lib/idGenerator';
import { unlinkMemberLogin } from '../../lib/firestoreService';
import { sendMemberPasswordReset } from '../../lib/authService';
import { addAdmin } from '../../lib/adminService';
import { describeFirestoreError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import {
  AdminSheet,
  NoticeBanner,
  SOURCE_LABEL_KEYS,
  STATUS_LABEL_KEYS,
  Spinner,
  cardLink,
  copyText,
  makeAdminBlockReason,
  memberName,
  memberPhones,
  waLink,
} from './adminUi';
import type { AdminNotice } from './adminUi';
import { AdminChip, KccIdBadge } from './MemberTable';
import { MemberEditForm } from './MemberEditForm';

type BusyAction = null | 'reset' | 'unlink' | 'admin' | 'save' | 'delete';

export interface MemberSupportModalProps {
  member: Member | null; // null = closed; the shell re-resolves it from the live members by id
  open: boolean;
  onClose: () => void;
  user: User; // acting admin
  admins: AdminEntry[] | null;
  reloadAdmins: () => Promise<AdminEntry[]>;
  onAdminsChange: (next: AdminEntry[]) => void;
  onViewCard: (m: Member) => void;
  onDelete: (m: Member) => Promise<void>; // shell confirm + deleteMember; closes the sheet on success
  /** True while a long ID task runs: member writes are disabled. */
  locked?: boolean;
}

export const MemberSupportModal: React.FC<MemberSupportModalProps> = ({
  member,
  open,
  onClose,
  user,
  admins,
  reloadAdmins,
  onAdminsChange,
  onViewCard,
  onDelete,
  locked = false,
}) => {
  const { t, formatDate } = useI18n();
  // Keep the last member while the sheet animates out
  const lastMemberRef = useRef<Member | null>(member);
  if (member) lastMemberRef.current = member;
  const m = member || lastMemberRef.current;

  const [view, setView] = useState<'support' | 'edit'>('support');
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const [editDirty, setEditDirty] = useState(false);
  const copiedTimer = useRef<number | null>(null);
  const adminsRequested = useRef(false);

  // Reset per opened member
  const memberId = member?.id ?? null;
  useEffect(() => {
    if (!memberId) return;
    setView('support');
    setNotice(null);
    setCopied(null);
    setEditDirty(false);
  }, [memberId]);

  // The admin list is needed for "Already an admin": load it once, lazily
  useEffect(() => {
    if (!open || admins !== null || adminsRequested.current) return;
    adminsRequested.current = true;
    reloadAdmins().catch((error) => console.warn('Admin list unavailable for the support sheet:', error));
  }, [open, admins, reloadAdmins]);

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  const handleDirtyChange = useCallback((dirty: boolean) => setEditDirty(dirty), []);

  const requestClose = () => {
    if (busyAction) return;
    if (view === 'edit' && editDirty && !window.confirm(t('admin.discardChanges'))) return;
    onClose();
  };

  if (!m) return null;

  const name = memberName(m);
  const kccLabel = formatKccId(m.userId16);
  const phones = memberPhones(m);
  const isMainMember = isMainAccountKccId(m.userId16);
  const isAdminMember = !!m.authUid && !!admins && admins.some((a) => a.uid === m.authUid);
  const blockReason = makeAdminBlockReason(m, user, admins);
  const hasEmail = !!(m.email || '').trim();
  const isSignInProfile = !!m.authUid && m.id === m.authUid;
  const anyBusy = busyAction !== null;

  const showCopied = (which: 'id' | 'link') => {
    setCopied(which);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(null), 2000);
  };

  const handleCopy = async (which: 'id' | 'link') => {
    const text = which === 'id' ? kccLabel : cardLink(m.userId16);
    const ok = await copyText(text);
    if (ok) {
      haptic('success');
      showCopied(which);
    } else {
      haptic('error');
      setNotice({ kind: 'error', text });
    }
  };

  const run = async (action: Exclude<BusyAction, null>, task: () => Promise<AdminNotice | null>) => {
    if (anyBusy) return;
    setBusyAction(action);
    setNotice(null);
    try {
      const result = await task();
      if (result) {
        haptic('success');
        setNotice(result);
      }
    } catch (error) {
      console.error(`Member support action "${action}" failed:`, error);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const handlePasswordReset = () => {
    if (!hasEmail) return;
    if (!window.confirm(t('admin.passwordResetConfirm', { email: (m.email || '').trim() }))) return;
    void run('reset', async () => {
      await sendMemberPasswordReset(m);
      return { kind: 'success', text: t('admin.passwordResetSent') };
    });
  };

  const handleUnlink = () => {
    if (!m.authUid || isSignInProfile || locked) return;
    if (!window.confirm(t('admin.unlinkConfirm', { name }))) return;
    void run('unlink', async () => {
      await unlinkMemberLogin(m);
      return { kind: 'success', text: t('admin.unlinked'), hint: t('admin.unlinkHint') };
    });
  };

  const handleMakeAdmin = () => {
    if (blockReason) return;
    if (!window.confirm(t('admin.makeAdminConfirm', { name, id: kccLabel }))) return;
    void run('admin', async () => {
      const entry = await addAdmin(m);
      onAdminsChange([...(admins || []), entry]);
      return { kind: 'success', text: t('admin.adminAdded', { name }), hint: t('admin.adminTakesEffectHint') };
    });
  };

  const handleDelete = () => {
    if (locked) return;
    void run('delete', async () => {
      await onDelete(m);
      return null;
    });
  };

  const actionButton =
    'glass-button pressable w-full px-3 text-xs pointer-coarse:min-h-11 justify-start text-start disabled:opacity-50';

  return (
    <AdminSheet
      open={open && !!member}
      onClose={requestClose}
      title={view === 'edit' ? t('admin.editDetails') : t('admin.supportTitle')}
      subtitle={name}
      widthClass="sm:max-w-2xl"
      dragDisabled={view === 'edit' && editDirty}
      closeDisabled={anyBusy}
    >
      <div className="space-y-5">
        {/* Header: who this is */}
        <div className="glass-well rounded-2xl p-4 flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shrink-0">
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">
                {name.slice(0, 2).toUpperCase() || 'KC'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="font-bold text-white text-base break-words">{name}</p>
              {isMainMember && (
                <span className="glass-chip bg-amber-500/20 text-amber-300 border-amber-500/40">
                  <Crown className="w-3 h-3" aria-hidden="true" />
                  <span>{t('admin.mainAccountBadge')}</span>
                </span>
              )}
              {isAdminMember && <AdminChip />}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono font-bold text-white tracking-wider text-sm">{kccLabel}</span>
              <KccIdBadge id={m.userId16} />
            </div>
            {m.legacyUserId16 && (
              <p className="text-[11px] text-slate-400 font-mono">
                {t('admin.oldIdValue', { id: formatKccId(m.legacyUserId16) })}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              {t(STATUS_LABEL_KEYS[m.status] || 'admin.statusVerified')} • {t(SOURCE_LABEL_KEYS[m.source] || 'admin.sourceWebForm')}
              {m.createdAt ? ` • ${t('admin.registeredOn', { date: formatDate(m.createdAt) })}` : ''}
            </p>
            <p className={`text-[11px] font-semibold flex items-center gap-1 ${m.authUid ? 'text-emerald-300' : 'text-slate-400'}`}>
              {m.authUid ? <Link2 className="w-3.5 h-3.5" aria-hidden="true" /> : <Link2Off className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{m.authUid ? t('admin.loginLinked') : t('admin.loginNotLinked')}</span>
            </p>
          </div>
        </div>

        <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />

        {view === 'edit' ? (
          <MemberEditForm
            member={m}
            onCancel={() => setView('support')}
            onSaved={() => {
              setView('support');
              setNotice({ kind: 'success', text: t('admin.memberSaved') });
            }}
            onDirtyChange={handleDirtyChange}
            onBusyChange={(busy) => setBusyAction(busy ? 'save' : null)}
            disabled={locked}
          />
        ) : (
          <>
            {/* Copy + card */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleCopy('id')} className={actionButton}>
                <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span aria-live="polite">{copied === 'id' ? t('admin.copied') : t('admin.copyKccId')}</span>
              </button>
              <button type="button" onClick={() => handleCopy('link')} className={actionButton}>
                <Link2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span aria-live="polite">{copied === 'link' ? t('admin.copied') : t('admin.copyCardLink')}</span>
              </button>
              <button type="button" onClick={() => onViewCard(m)} className={`${actionButton} col-span-2 sm:col-span-1`}>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('admin.viewKccIdTitle')}</span>
              </button>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              {phones.length === 0 ? (
                <p className="text-xs text-slate-400">{t('admin.noPhone')}</p>
              ) : (
                phones.map((phone, i) => {
                  const href = waLink(phone, t('admin.whatsappTemplate', { name, id: kccLabel }));
                  if (!href) return null;
                  return (
                    <a
                      key={`${phone}_${i}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button pressable w-full px-3 text-xs pointer-coarse:min-h-11 justify-start bg-emerald-600/15 border-emerald-500/40 text-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="break-all">{t('admin.whatsappChat', { phone })}</span>
                    </a>
                  );
                })
              )}
            </div>

            {/* Login + access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={!hasEmail || anyBusy}
                  className={actionButton}
                >
                  {busyAction === 'reset' ? <Spinner /> : <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{t('admin.sendPasswordReset')}</span>
                </button>
                {!hasEmail && <p className="text-[11px] text-slate-400 px-1">{t('admin.passwordResetNoEmail')}</p>}
              </div>

              {m.authUid && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={handleUnlink}
                    disabled={isSignInProfile || anyBusy || locked}
                    className={actionButton}
                  >
                    {busyAction === 'unlink' ? <Spinner /> : <Link2Off className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    <span>{t('admin.unlinkLogin')}</span>
                  </button>
                  {isSignInProfile && <p className="text-[11px] text-slate-400 px-1">{t('admin.unlinkSignInProfile')}</p>}
                </div>
              )}

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleMakeAdmin}
                  disabled={!!blockReason || anyBusy}
                  className={actionButton}
                >
                  {busyAction === 'admin' ? <Spinner /> : <ShieldPlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{t('admin.makeAdmin')}</span>
                </button>
                {blockReason && <p className="text-[11px] text-slate-400 px-1">{t(blockReason)}</p>}
              </div>

              <button
                type="button"
                onClick={() => setView('edit')}
                disabled={anyBusy || locked}
                className={actionButton}
              >
                <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t('admin.editDetails')}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t('admin.supportAdminSdkNote')}</span>
            </p>

            {/* Danger zone */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 space-y-2">
              <p className="text-xs font-bold text-rose-300 uppercase tracking-wider">{t('admin.dangerZone')}</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={anyBusy || locked}
                className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11 bg-rose-950/60 border-rose-500/40 text-rose-200 disabled:opacity-50"
              >
                {busyAction === 'delete' ? <Spinner /> : <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                <span>{t('admin.deleteMemberTitle')}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </AdminSheet>
  );
};
