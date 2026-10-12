import React, { useEffect, useId, useRef } from 'react';
import { motion, useIsPresent } from 'framer-motion';
import {
  Download,
  Share2,
  X,
  CheckCircle2,
  Sparkles,
  QrCode,
  MessageCircle,
} from 'lucide-react';
import { Member } from '../types';
import { format16DigitUserId } from '../lib/idGenerator';
import { KawanCosplayLogo } from './KawanCosplayLogo';
import { useI18n } from '../i18n';
import { haptic } from '../lib/haptic';
import { usePresenceMotion, useScrollLock, useSheetDrag } from '../lib/motion';

interface MemberCardModalProps {
  member: Member | null;
  onClose: () => void;
}

/*
 * App mounts this inside <AnimatePresence> while a member is selected. After closing it stays mounted
 * until the overlay and sheet have animated out; `isPresent` is already false then, so the scroll lock,
 * Escape handler and focus trap end as soon as the close starts.
 */
export const MemberCardModal: React.FC<MemberCardModalProps> = ({ member, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { t, formatDate } = useI18n();
  const isPresent = useIsPresent();
  const isOpen = Boolean(member) && isPresent;

  // Motion: bottom sheet below 640px (drag the grabber down to dismiss), scale-fade dialog from 640px,
  // quick fades with reduced motion. The page behind is frozen while open.
  const sheetMotion = usePresenceMotion('sheet');
  const overlayMotion = usePresenceMotion('overlay');
  const drag = useSheetDrag(onClose);
  useScrollLock(isOpen);

  // The pass appearing is a small success moment (also right after a registration).
  useEffect(() => {
    if (isOpen) haptic('success');
  }, [isOpen]);

  // Latest onClose without re-running the open effect on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Open: focus the sheet, Escape closes, focus returns to the opener afterwards.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  if (!member) return null;

  const handlePrintCard = () => {
    window.print();
  };

  const handleShareCard = async () => {
    const kccIdFormatted = format16DigitUserId(member.userId16);
    const memberDisplayName = member.name || member.cosplayName || t('card.memberFallbackName');
    const text = t('card.shareText', { name: memberDisplayName, id: kccIdFormatted });
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('card.shareTitle'),
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert(t('card.shareCopied'));
    }
  };

  const createdDate = new Date(member.createdAt);
  const formattedDate = isNaN(createdDate.getTime())
    ? '-'
    : formatDate(createdDate, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  // Overlay and sheet are siblings (index.css: a dimmed/blurred parent would cut the sheet's own blur).
  // Phones: bottom sheet with grabber + safe-area padding; >= 640px: centered dialog (.glass-sheet).
  return (
    <>
      <motion.div className="glass-overlay" onClick={onClose} aria-hidden="true" {...overlayMotion} />
      <div className="sheet-viewport">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="glass-sheet sm:max-w-lg text-slate-100 outline-none"
          {...sheetMotion}
          {...drag.sheetProps}
        >
          {/* Drag handle: the grabber row (pb-3 replaces the scroll area's top padding on phones, so
              the layout is unchanged and the whole strip above the content starts the drag) */}
          <div className="sheet-handle pb-3 sm:pb-0" {...drag.handleProps}>
            <div className="sheet-grabber" aria-hidden="true" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="glass-icon-button absolute top-3 end-3 z-20 sm:top-4 sm:end-4"
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="glass-scroll px-5 pt-0 pb-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="glass-chip text-rose-300 bg-rose-500/20 border-rose-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('card.badge')}</span>
              </span>
              <h3 id={titleId} className="text-xl sm:text-2xl font-black text-white">
                {t('card.title')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('card.subtitle')}
              </p>
            </div>

            {/* HOLOGRAM ID CARD CONTAINER - LIQUID GLASS STYLE (no own backdrop blur: it already sits
                on the sheet's blurred glass, a second blur here only costs GPU time) */}
            <div
              ref={cardRef}
              className="relative isolate rounded-3xl p-6 sm:p-7 overflow-hidden border border-white/20 border-t-white/30 bg-gradient-to-br from-white/[0.10] via-slate-900/95 to-purple-950/80 shadow-2xl shadow-rose-950/50 mb-6 text-white"
            >
              {/* Hologram sheen effects: soft radial glows (same centres as the old blurred circles) instead of
                  `filter: blur()`, which re-rasterises on every frame of the sheet's slide-up animation */}
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 -mr-28 -mt-28 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(closest-side, rgba(244, 63, 94, 0.32) 0%, rgba(236, 72, 153, 0.14) 60%, rgba(236, 72, 153, 0) 100%)' }}
              ></div>
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 -ml-28 -mb-28 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(closest-side, rgba(99, 102, 241, 0.32) 0%, rgba(244, 63, 94, 0.14) 60%, rgba(244, 63, 94, 0) 100%)' }}
              ></div>

              {/* Card Top Brand */}
              <div className="flex justify-between items-start gap-3 mb-5 border-b border-rose-500/20 pb-4 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <KawanCosplayLogo size="sm" showText={true} />
                </div>

                {/* ONLY KCC ID is used - No separate redundant card number */}
                <div className="text-end shrink-0">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                    {t('card.kccIdLabel')}
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-rose-400 tracking-wider">
                    {format16DigitUserId(member.userId16, member.email)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-5 mb-5 relative z-10">
                {/* Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-rose-400/60 shadow-lg bg-slate-900 shrink-0">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name || member.cosplayName || t('card.memberFallbackName')}
                      width={96}
                      height={96}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-900 to-slate-900 text-rose-300 font-black text-2xl">
                      {(member.name || member.cosplayName || 'KC')[0]?.toUpperCase() || 'KC'}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                </div>

                {/* Names & Role */}
                <div className="min-w-0 flex-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-1.5 truncate max-w-full">
                    {member.primaryRole}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                    {member.name || member.cosplayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <span>📍 {member.city}{member.country ? `, ${member.country}` : ''}</span>
                  </p>
                </div>
              </div>

              {/* Card Footer Details & SVG QR Code */}
              <div className="flex justify-between items-end gap-3 pt-3 border-t border-rose-500/20 relative z-10">
                <div className="space-y-1 min-w-0">
                  {member.fandom && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      {t('card.fandomLabel')} <span className="text-slate-200 font-semibold">{member.fandom}</span>
                    </p>
                  )}
                  {member.discordUsername && (
                    <p className="text-[10px] text-indigo-300 font-mono">
                      DISCORD: <span className="text-white font-semibold">{member.discordUsername}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-mono">
                    {t('card.joinedLabel')} <span className="text-slate-200 font-semibold">{formattedDate}</span>
                  </p>
                  <p className="text-[9px] text-emerald-300 font-mono">
                    {t('card.hotlineWa')}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('card.verifiedMember')}</span>
                  </div>
                </div>

                {/* Visual QR Code Stamp with KCC ID */}
                <div className="p-2 bg-white rounded-xl shadow-md flex flex-col items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-slate-900" />
                  <span className="text-[8px] font-mono font-bold text-slate-900 mt-0.5 tracking-tight">
                    {t('card.passStamp')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handlePrintCard}
                className="flex-1 sm:flex-initial min-h-11 py-2.5 px-4 liquid-glass-button text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('card.printDownload')}</span>
              </button>

              <button
                type="button"
                onClick={handleShareCard}
                className="glass-button min-h-11 py-2.5 px-4 rounded-xl text-xs sm:text-sm text-slate-200 gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('card.share')}</span>
              </button>

              <a
                href="https://wa.me/6285711032782"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button min-h-11 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm text-emerald-300 bg-emerald-950/60 border-emerald-500/30 gap-1.5 pressable"
                title={t('card.contactAdminWhatsapp')}
                aria-label={t('card.contactAdminWhatsapp')}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
