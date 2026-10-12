import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { User } from 'firebase/auth';
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
import { triggerHaptic } from '../lib/haptic';

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

/*
 * Rendered inside App's sticky `.glass-bar` container (one glass surface for gov banner + navbar, with the
 * safe-area top padding), so the header itself is transparent. Nothing here may get a transform or
 * will-change: the mobile menu overlay below is `position: fixed`.
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
    triggerHaptic(10);
  };

  const handleCloseMobileMenu = () => {
    setInternalMobileMenuOpen(false);
    onMobileMenuToggle?.(false);
  };

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const segmentedRef = useRef<HTMLElement>(null);
  const { setIsEditorOpen } = useSiteTheme();
  const { t } = useI18n();
  const currentLangMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  const userFallbackName = t('common.userFallbackName');
  const showProfileTab = Boolean(user || currentMember);

  const desktopTabs: Array<{ id: NavTab; label: string }> = [
    { id: 'form', label: t('common.navFormShort') },
    { id: 'card', label: t('common.navCardShort') },
    { id: 'gallery', label: t('common.navGalleryShort') },
    ...(showProfileTab ? [{ id: 'profile' as NavTab, label: t('common.navProfile') }] : []),
  ];

  // Sliding thumb of the desktop segmented control: measured from the active segment and moved with
  // `translate` + the spring easing from index.css. Re-measured whenever the control resizes
  // (language switch, web font load, the control becoming visible at the lg breakpoint).
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const nav = segmentedRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active || active.offsetWidth === 0) {
        setThumb(null);
        return;
      }
      setThumb((prev) =>
        prev && prev.left === active.offsetLeft && prev.width === active.offsetWidth
          ? prev
          : { left: active.offsetLeft, width: active.offsetWidth }
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeTab, showProfileTab, currentLang]);

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
            {/* Desktop tabs: iOS segmented control */}
            <nav ref={segmentedRef} className="glass-segmented isolate">
              {thumb && (
                <span
                  aria-hidden="true"
                  className="glass-segment-thumb top-1 bottom-1 left-0 right-auto"
                  style={{
                    width: thumb.width,
                    translate: `${thumb.left}px 0`,
                    transition: 'translate var(--dur-release) var(--ease-spring), width var(--dur-release) var(--ease-spring)',
                  }}
                />
              )}
              {desktopTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`glass-segment px-4 text-sm ${isActive ? 'font-bold' : 'font-medium'} ${
                      isActive && !thumb ? 'is-active' : ''
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-1 md:gap-2 shrink-0 h-full flex-1">
            <button
              type="button"
              className={`lg:hidden min-touch p-2.5 rounded-2xl border shadow-md pressable flex items-center justify-center ${
                isMobileMenuOpen
                  ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-rose-900/40'
                  : 'liquid-glass-menu-item text-white border-white/20'
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
                onClick={() => triggerHaptic(10)}
                className="min-touch inline-flex items-center justify-center rounded-full text-slate-300 hover:text-white pressable"
                title={t('common.whatsappHotline')}
                aria-label={t('common.whatsappHotline')}
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="min-touch px-3 inline-flex items-center justify-center rounded-full text-sm font-medium text-slate-300 hover:text-white uppercase pressable"
                  title={t('common.chooseLanguage', { language: currentLangMeta.nativeName })}
                  aria-label={t('common.chooseLanguage', { language: currentLangMeta.nativeName })}
                  aria-expanded={isLangMenuOpen}
                >
                  {currentLang}
                </button>
                {isLangMenuOpen && (
                  <div className="glass-menu absolute end-0 mt-4 w-52 max-h-[min(70vh,28rem)] overflow-y-auto z-50 animate-scale-in origin-top text-sm">
                    {LANGUAGES.map((lang) => (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => {
                          onSelectLang(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        aria-current={currentLang === lang.code ? 'true' : undefined}
                        className="glass-menu-item px-4"
                      >
                        <span className="truncate">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
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

      {/* Floating Mobile Dropdown Menu Overlay - LIQUID GLASS */}
      {isMobileMenuOpen && (
        <>
          {/* Dim backdrop: covers the page and the gov banner, stays under the navbar row (z-50) */}
          <div
            className="glass-overlay z-40 lg:hidden animate-fade-in touch-none"
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Liquid Glass Floating Menu Drawer */}
          <div className="lg:hidden absolute top-full left-0 right-0 w-full liquid-glass-menu p-4 sm:p-5 flex flex-col gap-2.5 max-h-[calc(100dvh-75px-var(--safe-top))] overflow-y-auto overscroll-contain z-50 rounded-b-3xl border-t-0 pb-[calc(1rem+var(--safe-bottom))] animate-fade-in">
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
                {/* Language Selection */}
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        aria-expanded={isLangMenuOpen}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white pressable-soft"
                    >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{currentLangMeta.nativeName} ({currentLang.toUpperCase()})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ease-ios ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLangMenuOpen && (
                        <div className="w-full grid grid-cols-2 gap-1 p-1.5 rounded-2xl glass-well border-purple-500/30 text-sm text-slate-100 max-h-56 overflow-y-auto overscroll-contain animate-fade-in">
                        {LANGUAGES.map((lang) => (
                            <button
                            type="button"
                            key={lang.code}
                            onClick={() => {
                                onSelectLang(lang.code);
                                setIsLangMenuOpen(false);
                            }}
                            aria-current={currentLang === lang.code ? 'true' : undefined}
                            className="glass-menu-item min-w-0 px-3"
                            >
                            <span className="truncate">{lang.nativeName}</span>
                            </button>
                        ))}
                        </div>
                    )}
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
                    className="flex items-center justify-center gap-2 p-3 min-h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 font-bold pressable mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.navLogout')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onOpenAuth(); handleCloseMobileMenu(); }}
                    className="flex items-center justify-center gap-2 p-3.5 min-h-11 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold pressable shadow-lg border border-white/20 mt-1"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>{t('common.navLogin')}</span>
                  </button>
                )}
             </div>
          </div>
        </>
      )}
    </header>
  );
};
