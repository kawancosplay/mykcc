import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Lock,
  ChevronDown,
  Globe,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../i18n';
import type { LanguageCode } from '../i18n';
import { SPRING, TWEEN, fadeVariants, useReducedMotion } from '../lib/motion';
import type { PresenceMotionProps } from '../lib/motion';

interface OfficialGovBannerProps {
  /** Kept for existing callers; the text follows the I18nProvider language. */
  currentLang: LanguageCode;
}

const disclosureVariants: Variants = {
  initial: { opacity: 0, transform: 'translate3d(0, -6px, 0)' },
  animate: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: { duration: 0.14, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transform: 'translate3d(0, -6px, 0)',
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

const DISCLOSURE_MOTION: PresenceMotionProps = {
  variants: disclosureVariants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
};

const FADE_MOTION: PresenceMotionProps = {
  variants: fadeVariants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
};

export const OfficialGovBanner: React.FC<OfficialGovBannerProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const disclosureMotion = useReducedMotion() === true ? FADE_MOTION : DISCLOSURE_MOTION;

  return (
    <div className="relative text-slate-800 text-[13px]">
      {/* Top Banner Row - Gov style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5 min-h-[2.5rem] sm:min-h-0">
          {/* Left: Global Community Badge + Official Site Tag */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700">
              <Globe className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-bold text-slate-900 text-[13px]">
                {t('common.officialBannerText')}
              </span>
            </div>
          </div>

          {/* Right: Gov-Style Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="touch-target inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold underline underline-offset-2 transition-colors cursor-pointer text-[13px] touch-manipulation"
              aria-expanded={isOpen}
            >
              <span>{t('common.howYouKnow')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ease-ios ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Verification Guide Drawer */}
      <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="gov-banner-guide"
          {...disclosureMotion}
          style={{ willChange: 'transform, opacity' }}
          className="overflow-hidden will-change-[transform,opacity]"
        >
        <div className="border-t border-white/60 bg-[rgba(255,255,255,0.96)] text-slate-800 px-4 sm:px-6 lg:px-8 py-5 max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-visible overscroll-contain shadow-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Official International Community Identity */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100/70 border border-purple-200 flex items-center justify-center shrink-0 text-purple-700">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {t('common.aboutKccTitle')}
                </h4>
                <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                  {t('common.aboutKccDesc')}
                </p>
              </div>
            </div>

            {/* Pillar 2: Security & Privacy */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {t('common.secureSiteTitle')}
                </h4>
                <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                  {t('common.secureSiteDesc')}
                </p>
              </div>
            </div>

            {/* Pillar 3: Official WhatsApp Hotline & Email */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100/70 border border-rose-200 flex items-center justify-center shrink-0 text-rose-700">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {t('common.officialContactTitle')}
                </h4>
                <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                  {t('common.officialContactDesc')}
                </p>
                <div className="pt-1 flex flex-col items-start gap-2">
                  <a
                    href="https://wa.me/6285711032782"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex items-center gap-1.5 text-purple-700 font-bold hover:underline"
                  >
                    <span>{t('common.whatsappContact')}</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                  <a
                    href="mailto:cosplaysehat@gmail.com"
                    className="touch-target inline-flex items-center gap-1.5 text-purple-700 font-bold hover:underline"
                  >
                    <span>{t('common.emailContact')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
