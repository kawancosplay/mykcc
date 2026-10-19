import React, { useState } from 'react';
import { useSiteTheme } from '../lib/themeContext';
import { useI18n } from '../i18n';
import { useMediaQuery } from '../lib/motion';
import { Crown, Shield, Heart, Sparkles } from 'lucide-react';

// Emblem tiles / custom logo: the glass rim (specular top highlight + soft drop shadow) used by the
// .glass-* surfaces, instead of a flat `shadow-md`
const GLASS_RIM_SHADOW =
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_14px_-6px_rgba(0,0,0,0.55)]';
const EMBLEM_TILE_CLASS = `w-full h-full rounded-2xl p-2 flex items-center justify-center border ${GLASS_RIM_SHADOW}`;

// Long-press on the logo (it sits inside the tappable nav home link) must not open the iOS image
// callout or start an image drag
const NO_CALLOUT_CLASS = '[-webkit-touch-callout:none]';

// Set by vite.config.ts (`define`): true when public/brand/kcc-logo-96.webp + -160.webp exist.
declare const __KCC_LOCAL_LOGO__: boolean;

const REMOTE_HEADER_LOGO_URL = 'https://i.postimg.cc/sXbd1FgB/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png';
const HAS_LOCAL_LOGO = typeof __KCC_LOCAL_LOGO__ !== 'undefined' && __KCC_LOCAL_LOGO__ === true;

/**
 * The header logo (square artwork). Self-hosted 96/160 px WebP (44 CSS px on phones, 56 px from `sm`)
 * when the files are in public/brand/, else the original remote PNG. The remote PNG is also the fallback
 * if a local file fails to load.
 */
export const KCC_HEADER_LOGO: { src: string; srcSet?: string; sizes?: string; fallbackSrc?: string } = HAS_LOCAL_LOGO
  ? {
      src: '/brand/kcc-logo-96.webp',
      srcSet: '/brand/kcc-logo-96.webp 96w, /brand/kcc-logo-160.webp 160w',
      sizes: '(min-width: 640px) 56px, 44px',
      fallbackSrc: REMOTE_HEADER_LOGO_URL,
    }
  : { src: REMOTE_HEADER_LOGO_URL };

interface KawanCosplayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  noContainer?: boolean;
  desktopLogoUrl?: string;
  mobileLogoUrl?: string;
  /** Responsive candidates for the logo image (`srcset`), used with `logoSizes`. */
  logoSrcSet?: string;
  logoSizes?: string;
  /** Tried once when the logo image fails, before falling back to the emblem. */
  fallbackLogoUrl?: string;
}

export const KawanCosplayLogo: React.FC<KawanCosplayLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  noContainer = false,
  desktopLogoUrl,
  mobileLogoUrl,
  logoSrcSet,
  logoSizes,
  fallbackLogoUrl,
}) => {
  const { theme } = useSiteTheme();
  const { t } = useI18n();
  // 0 = primary image, 1 = fallback image, 2 = both failed (emblem)
  const [imageStage, setImageStage] = useState<0 | 1 | 2>(0);
  // Same 768px breakpoint as before, but through matchMedia: it re-renders only when the breakpoint is
  // crossed (not on every resize event) and is already correct on the first render
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const primarySrc = isDesktop ? desktopLogoUrl : mobileLogoUrl || desktopLogoUrl;
  const logoSrc = imageStage === 0 ? primarySrc : imageStage === 1 ? fallbackLogoUrl : undefined;
  const hasImageError = imageStage === 2 || !logoSrc;
  const handleImageError = () => setImageStage((stage) => (stage === 0 && fallbackLogoUrl ? 1 : 2));

  const isImageActive = Boolean(logoSrc && !hasImageError);

  const iconDimensions = {
    sm: isImageActive ? 'h-11 sm:h-14 w-auto max-w-[210px]' : 'w-11 h-11 sm:w-14 sm:h-14',
    md: isImageActive ? 'h-14 sm:h-18 w-auto max-w-[260px]' : 'w-14 h-14 sm:w-18 sm:h-18',
    lg: isImageActive ? 'h-20 sm:h-24 w-auto max-w-[320px]' : 'w-20 h-20 sm:w-24 sm:h-24',
  }[size];

  const logoTitle = theme?.logo?.title || 'MyKCC';
  const logoSubtitle = theme?.logo?.subtitle || 'KawanCosplay';
  const emblemType = theme?.logo?.emblemType || 'kitsune';
  const customLogoUrl = theme?.logo?.customLogoUrl;

  return (
    <div className={`flex items-center ${showText ? 'space-x-2.5' : ''} select-none h-full ${className}`}>
      {/* Official KawanCosplay Vector Emblem or Custom Logo */}
      <div className={`relative ${noContainer ? '' : iconDimensions} shrink-0 flex items-center justify-center`}>
        {logoSrc && !hasImageError ? (
          // width/height reserve the (square) box before the image arrives: no header layout shift
          <img
            key={logoSrc}
            src={logoSrc}
            srcSet={imageStage === 0 ? logoSrcSet : undefined}
            sizes={imageStage === 0 && logoSrcSet ? logoSizes : undefined}
            width={44}
            height={44}
            alt={t('common.logoAlt')}
            className={`h-11 sm:h-14 w-auto max-w-[210px] object-contain block ${NO_CALLOUT_CLASS}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            onError={handleImageError}
          />
        ) : customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt={t('common.logoAlt')}
            draggable={false}
            className={`${noContainer ? iconDimensions : 'w-full h-full'} object-contain ${NO_CALLOUT_CLASS} ${noContainer ? '' : `rounded-2xl border border-rose-500/40 ${GLASS_RIM_SHADOW}`}`}
          />
        ) : emblemType === 'crown' ? (
          <div className={`${EMBLEM_TILE_CLASS} bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 text-slate-950 border-amber-400`}>
            <Crown className="w-full h-full" />
          </div>
        ) : emblemType === 'shield' ? (
          <div className={`${EMBLEM_TILE_CLASS} bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white border-indigo-400`}>
            <Shield className="w-full h-full" />
          </div>
        ) : emblemType === 'heart' ? (
          <div className={`${EMBLEM_TILE_CLASS} bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 text-white border-pink-400`}>
            <Heart className="w-full h-full" />
          </div>
        ) : emblemType === 'sparkle' ? (
          <div className={`${EMBLEM_TILE_CLASS} bg-gradient-to-tr from-yellow-500 via-amber-400 to-purple-600 text-white border-yellow-300`}>
            <Sparkles className="w-full h-full" />
          </div>
        ) : (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_4px_12px_rgba(244,63,94,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="kcBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="kcBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e102e" />
                <stop offset="100%" stopColor="#0b0716" />
              </linearGradient>

              <linearGradient id="kcMaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>

              <linearGradient id="kcStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              <filter id="kcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Rounded Hexagonal Badge */}
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="24"
              fill="url(#kcBgGrad)"
              stroke="url(#kcBorderGrad)"
              strokeWidth="3.5"
            />

            {/* Subtle inner grid aura */}
            <circle cx="50" cy="50" r="38" stroke="#f43f5e" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="28" stroke="#a855f7" strokeWidth="0.75" strokeOpacity="0.3" />

            {/* Kitsune / Cosplay Mask Wings & Ears */}
            {/* Left Cat / Kitsune Ear */}
            <path
              d="M26 38 L38 20 L44 34 Z"
              fill="url(#kcMaskGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M30 35 L38 24 L41 33 Z" fill="#ffe4e6" />

            {/* Right Cat / Kitsune Ear */}
            <path
              d="M74 38 L62 20 L56 34 Z"
              fill="url(#kcMaskGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M70 35 L62 24 L59 33 Z" fill="#ffe4e6" />

            {/* Cosplay Mask Face Shield */}
            <path
              d="M26 42 C26 42, 36 34, 50 34 C64 34, 74 42, 74 42 C74 42, 75 58, 68 70 C62 80, 50 84, 50 84 C50 84, 38 80, 32 70 C25 58, 26 42, 26 42 Z"
              fill="url(#kcMaskGrad)"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Anime Styled Eyes / Visor */}
            <path
              d="M34 50 Q42 56 47 50"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M66 50 Q58 56 53 50"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Kawan (Friendship) Heart & Star Emblem in Center */}
            <path
              d="M50 56 C50 56 46 51 43 53 C40 55 41 59 43 61 L50 67 L57 61 C59 59 60 55 57 53 C54 51 50 56 50 56 Z"
              fill="#ffffff"
            />

            {/* Glowing Golden Friendship Star on Forehead */}
            <polygon
              points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43"
              fill="url(#kcStarGrad)"
              filter="url(#kcGlow)"
            />

            {/* Cyberpunk Accent Dots */}
          </svg>
        )}

      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="font-black text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-white via-rose-100 to-pink-300 bg-clip-text text-transparent leading-none">
              {logoTitle}
            </span>
            <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 border border-rose-500/30 leading-none">
              {t('common.officialBadge')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 sm:mt-1 leading-none">
            {logoSubtitle}
          </span>
        </div>
      )}
    </div>
  );
};
