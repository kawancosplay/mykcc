import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Globe,
  MessageCircle,
  Mail,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../lib/i18n';

interface OfficialGovBannerProps {
  currentLang: LanguageCode;
}

export const OfficialGovBanner: React.FC<OfficialGovBannerProps> = ({ currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <div className="liquid-glass border-b border-slate-800 text-slate-300 text-xs transition-colors">
      {/* Top Banner Row - Gov style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          {/* Left: Global Community Badge + Official Site Tag */}
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm text-white">
              <Globe className="w-3 h-3" />
            </div>

            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-bold text-slate-200">
                {t.officialBannerText}
              </span>
            </div>
          </div>

          {/* Right: Gov-Style Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center space-x-1 text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span>{t.howYouKnow}</span>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Verification Guide Drawer */}
      {isOpen && (
        <div className="liquid-glass border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-5 animate-fade-in shadow-inner">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Official International Community Identity */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {t.aboutKccTitle}
                </h4>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  {t.aboutKccDesc}
                </p>
              </div>
            </div>

            {/* Pillar 2: Security & Privacy */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {t.secureSiteTitle}
                </h4>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  {t.secureSiteDesc}
                </p>
              </div>
            </div>

            {/* Pillar 3: Official WhatsApp Hotline & Email */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs sm:text-sm">
                  {t.officialContactTitle}
                </h4>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  {t.officialContactDesc}
                </p>
                <div className="pt-1 flex flex-col space-y-1">
                  <a
                    href="https://wa.me/6285711032782"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-emerald-400 font-bold hover:underline"
                  >
                    <span>WhatsApp: +62 857-1103-2782</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="mailto:cosplaysehat@gmail.com"
                    className="inline-flex items-center space-x-1.5 text-indigo-400 font-bold hover:underline"
                  >
                    <span>Email: cosplaysehat@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
