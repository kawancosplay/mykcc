import React, { useState, useEffect } from 'react';
import { useSiteTheme } from '../lib/themeContext';
import { Crown, Shield, Heart, Sparkles } from 'lucide-react';

interface KawanCosplayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  noContainer?: boolean;
  desktopLogoUrl?: string;
  mobileLogoUrl?: string;
}

export const KawanCosplayLogo: React.FC<KawanCosplayLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  noContainer = false,
  desktopLogoUrl,
  mobileLogoUrl,
}) => {
  const { theme } = useSiteTheme();
  const [logoSrc, setLogoSrc] = useState(desktopLogoUrl);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setLogoSrc(mobileLogoUrl || desktopLogoUrl);
      } else {
        setLogoSrc(desktopLogoUrl);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopLogoUrl, mobileLogoUrl]);

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
          <img
            src={logoSrc}
            alt="KawanCosplay Logo"
            className="h-11 sm:h-14 w-auto max-w-[210px] object-contain block"
            loading="eager"
            onError={() => setHasImageError(true)}
          />
        ) : customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Logo"
            className={`${noContainer ? iconDimensions : 'w-full h-full'} object-contain ${noContainer ? '' : 'rounded-2xl border border-rose-500/40 shadow-md'}`}
          />
        ) : emblemType === 'crown' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-2 flex items-center justify-center text-slate-950 shadow-md border border-amber-400">
            <Crown className="w-full h-full" />
          </div>
        ) : emblemType === 'shield' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-2 flex items-center justify-center text-white shadow-md border border-indigo-400">
            <Shield className="w-full h-full" />
          </div>
        ) : emblemType === 'heart' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 p-2 flex items-center justify-center text-white shadow-md border border-pink-400">
            <Heart className="w-full h-full" />
          </div>
        ) : emblemType === 'sparkle' ? (
          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-purple-600 p-2 flex items-center justify-center text-white shadow-md border border-yellow-300">
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
              Official
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
