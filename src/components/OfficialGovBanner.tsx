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

// Disclosure: the guide's height opens with the sheet spring and closes with the iOS curve, so the
// navbar below glides instead of jumping. Height + opacity only (no transform inside the sticky header).
const disclosureVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { ...SPRING.sheet, opacity: TWEEN.fadeIn } },
  exit: { opacity: 0, height: 0, transition: TWEEN.sheetExit },
};

const DISCLOSURE_MOTION: PresenceMotionProps = {
  variants: disclosureVariants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
};

// Reduced motion: quick cross-fade, no height animation.
const FADE_MOTION: PresenceMotionProps = {
  variants: fadeVariants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
};

/*
 * Top strip of the sticky header. App renders it inside the `.glass-bar` container together with the
 * navbar, so it has no glass of its own (one continuous surface, no seam, no double blur).
 */
export const OfficialGovBanner: React.FC<OfficialGovBannerProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const disclosureMotion = useReducedMotion() === true ? FADE_MOTION : DISCLOSURE_MOTION;

  return (
    <div className="relative border-b border-white/[0.06] text-slate-300 text-xs">
      {/* Top Banner Row - Gov style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        {/* Two lines reserved on phones: a language with longer copy cannot shift the page below (CLS). */}
        <div className="flex flex-wrap items-center justify-between gap-1 min-h-[2.25rem] sm:min-h-0">
          {/* Left: Global Community Badge + Official Site Tag */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm text-white">
              <Globe className="w-3 h-3" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-bold text-slate-200">
                {t('common.officialBannerText')}
              </span>
            </div>
          </div>

          {/* Right: Gov-Style Toggle (small visual, 44px hit area via .touch-target) */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="touch-target inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
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

      {/* Expandable Verification Guide Drawer (scrolls on short phone screens instead of pushing the
          whole sticky header past the viewport). The outer wrapper clips the height animation. */}
      <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div key="gov-banner-guide" {...disclosureMotion} className="overflow-hidden">
        <div className="border-t border-white/[0.06] px-4 sm:px-6 lg:px-8 py-5 max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-visible overscroll-contain">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Official International Community Identity */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {t('common.aboutKccTitle')}
                </h4>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  {t('common.aboutKccDesc')}
                </p>
              </div>
            </div>

            {/* Pillar 2: Security & Privacy */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {t('common.secureSiteTitle')}
                </h4>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  {t('common.secureSiteDesc')}
                </p>
              </div>
            </div>

            {/* Pillar 3: Official WhatsApp Hotline & Email */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {t('common.officialContactTitle')}
                </h4>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  {t('common.officialContactDesc')}
                </p>
                <div className="pt-1 flex flex-col items-start gap-2">
                  <a
                    href="https://wa.me/6285711032782"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
                  >
                    <span>{t('common.whatsappContact')}</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                  <a
                    href="mailto:cosplaysehat@gmail.com"
                    className="touch-target inline-flex items-center gap-1.5 text-indigo-400 font-bold hover:underline"
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
