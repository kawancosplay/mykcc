import React, { useRef } from 'react';
import {
  Download,
  Share2,
  X,
  CheckCircle2,
  Sparkles,
  QrCode,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { Member } from '../types';
import { format16DigitUserId, getUserIdBadgeInfo } from '../lib/idGenerator';
import { KawanCosplayLogo } from './KawanCosplayLogo';
import { useI18n } from '../i18n';

interface MemberCardModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({ member, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t, formatDate } = useI18n();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg liquid-glass-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10 backdrop-blur-md"
          title={t('common.close')}
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('card.badge')}</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t('card.title')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('card.subtitle')}
          </p>
        </div>

        {/* HOLOGRAM ID CARD CONTAINER - LIQUID GLASS STYLE */}
        <div
          ref={cardRef}
          className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-white/20 bg-gradient-to-br from-white/[0.10] via-slate-900/95 to-purple-950/80 backdrop-blur-2xl shadow-2xl shadow-rose-950/50 mb-6 text-white"
        >
          {/* Hologram sheen effects */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-gradient-to-br from-rose-500/30 to-pink-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-gradient-to-tr from-indigo-500/30 to-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Top Brand */}
          <div className="flex justify-between items-start mb-5 border-b border-rose-500/20 pb-4 relative z-10">
            <div className="flex items-center space-x-2.5">
              <KawanCosplayLogo size="sm" showText={true} />
            </div>

            {/* ONLY KCC ID is used - No separate redundant card number */}
            <div className="text-right">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                {t('card.kccIdLabel')}
              </span>
              <span className="font-mono font-black text-xs sm:text-sm text-rose-400 tracking-wider">
                {format16DigitUserId(member.userId16, member.email)}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex items-center space-x-5 mb-5 relative z-10">
            {/* Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-rose-400/60 shadow-lg bg-slate-900 shrink-0">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name || member.cosplayName || t('card.memberFallbackName')}
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
          <div className="flex justify-between items-end pt-3 border-t border-rose-500/20 relative z-10">
            <div className="space-y-1">
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
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold mt-1">
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
            onClick={handlePrintCard}
            className="flex-1 sm:flex-initial py-2.5 px-4 liquid-glass-button text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md inline-flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('card.printDownload')}</span>
          </button>

          <button
            onClick={handleShareCard}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm transition-all border border-white/15 backdrop-blur-md inline-flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('card.share')}</span>
          </button>

          <a
            href="https://wa.me/6285711032782"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 font-semibold rounded-xl text-xs sm:text-sm transition-all border border-emerald-500/30 inline-flex items-center justify-center gap-1.5"
            title={t('card.contactAdminWhatsapp')}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
