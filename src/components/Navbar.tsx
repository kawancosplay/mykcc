import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Sparkles,
  IdCard,
  LogOut,
  Camera,
  User as UserIcon,
  Globe,
  ChevronDown,
  MessageCircle,
  Palette,
  Menu,
  X,
} from 'lucide-react';
import { Member } from '../types';
import { LANGUAGES, useI18n } from '../i18n';
import type { LanguageCode } from '../i18n';
import { KawanCosplayLogo } from './KawanCosplayLogo';
import { useSiteTheme } from '../lib/themeContext';
import { PWAInstallButton } from './PWAInstallButton';
import { haptic } from '../lib/haptic';
import {
  LAYOUT_IDS,
  SPRING,
  TWEEN,
  fadeVariants,
  useMediaQuery,
  usePresenceMotion,
  useReducedMotion,
  useScrollLock,
  useThumbTransition,
} from '../lib/motion';
import type { PresenceMotionProps } from '../lib/motion';

type NavTab = 'form' | 'card' | 'gallery' | 'profile' | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: User | null;
  currentMember: Member | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  memberCount?: number | null; // null = unknown (only known for a signed-in admin); currently not rendered
  isAdmin?: boolean; // Site/Theme Editor entry points are admin-only
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  isVisible: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

// Panels that drop down from the navbar (mobile menu, desktop language popover): they settle in from
// just above their anchor with the sheet spring and fade out. They end on y = 0 / scale = 1, where
// framer-motion writes `transform: none`, and contain no `position: fixed` children (the PWA guide
// sheet is portaled to <body>).
const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING.sheet, opacity: TWEEN.fadeIn } },
  exit: { opacity: 0, scale: 0.98, transition: TWEEN.fadeOut },
};

// Inline disclosure (language list inside the mobile menu): the height opens with the sheet spring.
const disclosureVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { ...SPRING.sheet, opacity: TWEEN.fadeIn } },
  exit: { opacity: 0, height: 0, transition: TWEEN.sheetExit },
};

const presence = (variants: Variants): PresenceMotionProps => ({
  variants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
});

const DROPDOWN_MOTION = presence(dropdownVariants);
const DISCLOSURE_MOTION = presence(disclosureVariants);
// Reduced motion: quick cross-fade only (no movement, no height animation).
const FADE_MOTION = presence(fadeVariants);

// Tailwind `lg`: the desktop navbar replaces the mobile menu.
const DESKTOP_NAV_QUERY = '(min-width: 64rem)';

/*
 * Rendered inside App's sticky `.glass-bar` container (one glass surface for gov banner + navbar, with the
 * safe-area top padding), so the header itself is transparent. The header and its rows never get a
 * transform or will-change: the mobile menu overlay below is `position: fixed`. Only leaf panels without
 * fixed children animate transforms (segment thumb, menu drawer, language popover).
 */
export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  currentMember,
  onOpenAuth,
  onLogout,
  isAdmin = false,
  currentLang,
  onSelectLang,
  isMobileMenuOpen: externalMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;

  const handleToggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    setInternalMobileMenuOpen(next);
    onMobileMenuToggle?.(next);
    haptic('light');
  };

  const handleCloseMobileMenu = () => {
    setInternalMobileMenuOpen(false);
    onMobileMenuToggle?.(false);
  };

  // Desktop language popover and the language list inside the mobile menu open independently, so a
  // tap in one never closes the other.
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const { setIsEditorOpen } = useSiteTheme();
  const { t } = useI18n();
  const currentLangMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  const userFallbackName = t('common.userFallbackName');
  const showProfileTab = Boolean(user || currentMember);

  // Motion
  const reducedMotion = useReducedMotion() === true;
  const overlayMotion = usePresenceMotion('overlay');
  const dropdownMotion = reducedMotion ? FADE_MOTION : DROPDOWN_MOTION;
  const disclosureMotion = reducedMotion ? FADE_MOTION : DISCLOSURE_MOTION;
  const thumbTransition = useThumbTransition();

  // The open mobile menu freezes the page behind it (only while it can be seen: it is hidden from lg).
  const isDesktopNav = useMediaQuery(DESKTOP_NAV_QUERY);
  useScrollLock(isMobileMenuOpen && !isDesktopNav);

  const desktopTabs: Array<{ id: NavTab; label: string }> = [
    { id: 'form', label: t('common.navFormShort') },
    { id: 'card', label: t('common.navCardShort') },
    { id: 'gallery', label: t('common.navGalleryShort') },
    ...(showProfileTab ? [{ id: 'profile' as NavTab, label: t('common.navProfile') }] : []),
  ];

  const selectLang = (code: LanguageCode) => {
    if (code !== currentLang) haptic('selection');
    onSelectLang(code);
  };

  // Escape closes the mobile menu (keyboard / iPad hardware keyboard)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseMobileMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileMenuOpen]);

  // Desktop language popover: a tap outside it or Escape dismisses it, like a native menu.
  useEffect(() => {
    if (!isLangMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = langMenuRef.current;
      if (root && e.target instanceof Node && !root.contains(e.target)) setIsLangMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLangMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isLangMenuOpen]);

  const avatarUrl = currentMember?.avatarUrl || user?.photoURL || '';
  const avatarAlt = currentMember?.name || currentMember?.cosplayName || user?.displayName || userFallbackName;
  const avatarInitial = ((currentMember?.name || currentMember?.cosplayName || user?.displayName || userFallbackName)[0] || 'U').toUpperCase();

  return (
    <header
      ref={navbarRef}
      className="relative z-10 text-slate-100"
    >
      <div className="relative z-50 max-w-[100rem] mx-auto px-3 sm:px-4 h-14 md:h-16">
        <div className="flex items-center justify-between h-full w-full">
          <div
            className="cursor-pointer group flex items-center justify-start shrink-0 h-full flex-1"
            onClick={() => {
              setActiveTab('form');
              handleCloseMobileMenu();
            }}
          >
            <KawanCosplayLogo
              size="md"
              showText={false}
              desktopLogoUrl="https://i.postimg.cc/sXbd1FgB/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png"
              mobileLogoUrl="https://i.postimg.cc/sXbd1FgB/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png"
            />
          </div>

          <div className="hidden lg:flex items-center justify-center h-full flex-none px-4">
            {/* Desktop tabs: iOS segmented control. The active segment holds the thumb; framer-motion's
                shared layout (`layoutId`) slides it to the next segment with the thumb spring. */}
            <nav className="glass-segmented isolate">
              {desktopTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`glass-segment px-4 text-sm ${isActive ? 'font-bold' : 'font-medium'}`}
                  >
                    {isActive && (
                      <motion.span
                        aria-hidden="true"
                        layoutId={LAYOUT_IDS.navTabs}
                        className="glass-segment-thumb"
                        transition={thumbTransition}
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-1 md:gap-2 shrink-0 h-full flex-1">
            <button
              type="button"
              className={`glass-button lg:hidden min-touch p-2.5 rounded-2xl pressable ${
                isMobileMenuOpen ? 'bg-rose-500/25 text-rose-300 border-rose-500/50' : 'text-white'
              }`}
              onClick={handleToggleMobileMenu}
              aria-label={isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-300" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <div className="hidden lg:flex items-center gap-1">
              <a
                href="https://wa.me/6285711032782"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => haptic('light')}
                className="min-touch inline-flex items-center justify-center rounded-full text-slate-300 hover:text-white pressable"
                title={t('common.whatsappHotline')}
                aria-label={t('common.whatsappHotline')}
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen((open) => !open)}
                  className="min-touch px-3 inline-flex items-center justify-center rounded-full text-sm font-medium text-slate-300 hover:text-white uppercase pressable"
                  title={t('common.chooseLanguage', { language: currentLangMeta.nativeName })}
                  aria-label={t('common.chooseLanguage', { language: currentLangMeta.nativeName })}
                  aria-expanded={isLangMenuOpen}
                >
                  {currentLang}
                </button>
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div
                      key="lang-menu"
                      {...dropdownMotion}
                      className="glass-menu absolute end-0 mt-4 w-52 max-h-[min(70vh,28rem)] overflow-y-auto z-50 origin-top text-sm"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          type="button"
                          key={lang.code}
                          onClick={() => {
                            selectLang(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          aria-current={currentLang === lang.code ? 'true' : undefined}
                          className="glass-menu-item px-4"
                        >
                          <span className="truncate">{lang.nativeName}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  className="min-touch inline-flex items-center justify-center rounded-full text-slate-300 hover:text-white pressable"
                  title={t('siteEditor.editorTitle')}
                  aria-label={t('siteEditor.editorTitle')}
                >
                  <Palette className="w-5 h-5" />
                </button>
              )}

              <div className="hidden md:block">
                <PWAInstallButton />
              </div>

              {user || currentMember ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="min-touch flex items-center justify-center rounded-full pressable hover:opacity-85"
                    aria-label={t('common.navProfile')}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={avatarAlt}
                        width={32}
                        height={32}
                        decoding="async"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                        {avatarInitial}
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onLogout}
                    title={t('common.navLogout')}
                    aria-label={t('common.navLogout')}
                    className="min-touch inline-flex items-center justify-center rounded-full text-slate-400 hover:text-white pressable"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="min-h-11 bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm px-4 py-2 rounded-full pressable"
                >
                  {t('common.navLogin')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Dropdown Menu Overlay - LIQUID GLASS. AnimatePresence keeps both pieces mounted
          until they have animated out. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          // Dim backdrop: covers the page and the gov banner, stays under the navbar row (z-50)
          <motion.div
            key="mobile-menu-overlay"
            {...overlayMotion}
            className="glass-overlay z-40 lg:hidden touch-none"
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />
        )}

        {isMobileMenuOpen && (
          // Liquid Glass Floating Menu Drawer
          <motion.div
            key="mobile-menu"
            {...dropdownMotion}
            className="lg:hidden absolute top-full left-0 right-0 w-full liquid-glass-menu p-4 sm:p-5 flex flex-col gap-2.5 max-h-[calc(100dvh-75px-var(--safe-top))] overflow-y-auto overscroll-contain z-50 rounded-b-3xl border-t-0 pb-[calc(1rem+var(--safe-bottom))] origin-top"
          >
             {/* User Profile Info Card */}
             {currentMember && (
                <div className="flex items-center gap-3 p-3 rounded-2xl glass-well border-purple-400/30 mb-1">
                    {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={avatarAlt}
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-purple-400/40"
                    />
                    ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-rose-700 flex items-center justify-center font-bold text-white shrink-0">
                        {avatarInitial}
                    </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white truncate text-sm">{currentMember?.name || currentMember?.cosplayName || user?.displayName}</span>
                        <span className="text-xs font-mono text-purple-300">{t('common.idValue', { id: currentMember?.userId16?.slice(-4) ?? '' })}</span>
                    </div>
                </div>
             )}

             {/* Navigation Tabs with Liquid Glass Styling */}
             <button
               type="button"
               onClick={() => { setActiveTab('form'); handleCloseMobileMenu(); }}
               aria-current={activeTab === 'form' ? 'page' : undefined}
               className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border pressable-soft ${
                 activeTab === 'form'
                   ? 'bg-rose-500/25 text-white border-rose-500/50 shadow-lg font-bold'
                   : 'liquid-glass-menu-item text-slate-100 hover:text-white'
               }`}
             >
               <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                 <Sparkles className="w-4 h-4" />
               </div>
               <span className="text-sm font-semibold">{t('common.navForm')}</span>
             </button>

             <button
               type="button"
               onClick={() => { setActiveTab('card'); handleCloseMobileMenu(); }}
               aria-current={activeTab === 'card' ? 'page' : undefined}
               className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border pressable-soft ${
                 activeTab === 'card'
                   ? 'bg-indigo-500/25 text-white border-indigo-500/50 shadow-lg font-bold'
                   : 'liquid-glass-menu-item text-slate-100 hover:text-white'
               }`}
             >
               <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                 <IdCard className="w-4 h-4" />
               </div>
               <span className="text-sm font-semibold">{t('common.navCardShort')}</span>
             </button>

             <button
               type="button"
               onClick={() => { setActiveTab('gallery'); handleCloseMobileMenu(); }}
               aria-current={activeTab === 'gallery' ? 'page' : undefined}
               className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border pressable-soft ${
                 activeTab === 'gallery'
                   ? 'bg-pink-500/25 text-white border-pink-500/50 shadow-lg font-bold'
                   : 'liquid-glass-menu-item text-slate-100 hover:text-white'
               }`}
             >
               <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0">
                 <Camera className="w-4 h-4" />
               </div>
               <span className="text-sm font-semibold">{t('common.navGallery')}</span>
             </button>

             {(user || currentMember) && (
               <button
                 type="button"
                 onClick={() => { setActiveTab('profile'); handleCloseMobileMenu(); }}
                 aria-current={activeTab === 'profile' ? 'page' : undefined}
                 className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border pressable-soft ${
                   activeTab === 'profile'
                     ? 'bg-cyan-500/25 text-white border-cyan-500/50 shadow-lg font-bold'
                     : 'liquid-glass-menu-item text-slate-100 hover:text-white'
                 }`}
               >
                 <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                   <UserIcon className="w-4 h-4" />
                 </div>
                 <span className="text-sm font-semibold">{t('common.navProfile')}</span>
               </button>
             )}

             {/* Secondary Utilities Container */}
             <div className="border-t border-white/10 my-1 pt-2.5 flex flex-col gap-2">
                {/* Language Selection: inline disclosure list (the gap above the list lives inside the
                    animated wrapper, so the height animation starts and ends flush) */}
                <div className="flex flex-col">
                    <button
                        type="button"
                        onClick={() => setIsMobileLangOpen((open) => !open)}
                        aria-expanded={isMobileLangOpen}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white pressable-soft"
                    >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{currentLangMeta.nativeName} ({currentLang.toUpperCase()})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ease-ios ${isMobileLangOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isMobileLangOpen && (
                        <motion.div key="mobile-lang-list" {...disclosureMotion} className="overflow-hidden">
                          <div className="pt-1.5">
                            <div className="w-full grid grid-cols-2 gap-1 p-1.5 rounded-2xl glass-well border-purple-500/30 text-sm text-slate-100 max-h-56 overflow-y-auto overscroll-contain">
                            {LANGUAGES.map((lang) => (
                                <button
                                type="button"
                                key={lang.code}
                                onClick={() => {
                                    selectLang(lang.code);
                                    setIsMobileLangOpen(false);
                                }}
                                aria-current={currentLang === lang.code ? 'true' : undefined}
                                className="glass-menu-item min-w-0 px-3"
                                >
                                <span className="truncate">{lang.nativeName}</span>
                                </button>
                            ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>

                <a
                  href="https://wa.me/6285711032782"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white pressable-soft"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{t('common.whatsappCommunity')}</span>
                </a>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => { setIsEditorOpen(true); handleCloseMobileMenu(); }}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white pressable-soft"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{t('common.themeEditor')}</span>
                  </button>
                )}

                <div className="pt-1">
                   <PWAInstallButton />
                </div>

                {user || currentMember ? (
                  <button
                    type="button"
                    onClick={() => { onLogout(); handleCloseMobileMenu(); }}
                    className="glass-button w-full p-3 min-h-11 rounded-2xl bg-rose-500/20 border-rose-500/40 text-rose-200 hover:bg-rose-500/30 font-bold pressable mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.navLogout')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onOpenAuth(); handleCloseMobileMenu(); }}
                    className="btn-primary w-full p-3.5 min-h-11 rounded-2xl pressable mt-1"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>{t('common.navLogin')}</span>
                  </button>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
