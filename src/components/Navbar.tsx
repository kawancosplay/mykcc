import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  IdCard,
  LogOut,
  Camera,
  User as UserIcon,
  Globe,
  ChevronDown,
  ShieldCheck,
  MessageCircle,
  Palette,
  Menu,
  X,
} from 'lucide-react';
import { Member } from '../types';
import { LanguageCode, LANGUAGES, TRANSLATIONS } from '../lib/i18n';
import { KawanCosplayLogo } from './KawanCosplayLogo';
import { useSiteTheme } from '../lib/themeContext';
import { PWAInstallButton } from './PWAInstallButton';
import { triggerHaptic } from '../lib/haptic';

interface NavbarProps {
  activeTab: 'form' | 'card' | 'gallery' | 'profile' | 'admin';
  setActiveTab: (tab: 'form' | 'card' | 'gallery' | 'profile' | 'admin') => void;
  user: User | null;
  currentMember: Member | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  memberCount: number;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  isVisible: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  currentMember,
  onOpenAuth,
  onLogout,
  currentLang,
  onSelectLang,
  isVisible,
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
  const { setIsEditorOpen } = useSiteTheme();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const shouldShrink = false;

  return (
    <header
      ref={navbarRef}
      className="left-0 right-0 z-50 border-b border-white/10 text-slate-100 shadow-xl relative liquid-glass transition-colors duration-200"
    >
      <div className="max-w-[100rem] mx-auto px-3 sm:px-4 h-14 md:h-16">
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
            <nav className="flex items-center gap-1 text-sm font-medium text-slate-300 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'form' ? 'text-white bg-white/10 font-bold' : ''}`}
              >
                Registration
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'card' ? 'text-white bg-white/10 font-bold' : ''}`}
              >
                KCC ID
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'gallery' ? 'text-white bg-white/10 font-bold' : ''}`}
              >
                Gallery
              </button>

              {(user || currentMember) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'profile' ? 'text-white bg-white/10 font-bold' : ''}`}
                >
                  {t.navProfile}
                </button>
              )}
            </nav>
          </div>

          <div className={`flex items-center justify-end gap-1 md:gap-2 shrink-0 h-full transition-transform duration-300 flex-1 ${shouldShrink ? 'scale-90' : 'scale-100'}`}>
            <button
              type="button"
              className={`lg:hidden p-2.5 sm:p-3 min-w-[42px] min-h-[42px] rounded-2xl border transition-all shadow-md active:scale-95 flex items-center justify-center ${
                isMobileMenuOpen
                  ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-rose-900/40'
                  : 'liquid-glass-menu-item text-white border-white/20 hover:bg-white/10'
              }`}
              onClick={handleToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Tutup Menu' : 'Buka Menu'}
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
                className="p-3 text-slate-300 hover:text-white transition-colors"
                title="Official WhatsApp Hotline: +62 857-1103-2782"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="p-3 text-sm font-medium text-slate-300 hover:text-white transition-colors uppercase"
                  title={`Pilih Bahasa (${currentLangMeta.nativeName})`}
                >
                  {currentLang}
                </button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-1 z-50 animate-fade-in text-sm text-slate-100">
                    {LANGUAGES.map((lang) => (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => {
                          onSelectLang(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                          currentLang === lang.code
                            ? 'bg-white/15 font-bold text-white'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title={currentLang === 'id' ? 'Editor Tampilan Situs' : 'Site Editor'}
              >
                <Palette className="w-5 h-5" />
              </button>
              
              <div className="hidden md:block">
                <PWAInstallButton />
              </div>

              {user || currentMember ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                  >
                    {currentMember?.avatarUrl || user?.photoURL ? (
                      <img
                        src={currentMember?.avatarUrl || user?.photoURL || ''}
                        alt={currentMember?.name || currentMember?.cosplayName || user?.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                        {((currentMember?.name || currentMember?.cosplayName || user?.displayName || 'U')[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onLogout}
                    title={t.navLogout}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm px-4 py-2 rounded-full transition-all"
                >
                  {t.navLogin}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Dropdown Menu Overlay - LIQUID GLASS */}
      {isMobileMenuOpen && (
        <>
          {/* Frosted Dim Backdrop Overlay */}
          <div
            className="fixed top-14 md:top-16 inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={handleCloseMobileMenu}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />

          {/* Liquid Glass Floating Menu Drawer */}
          <div className="lg:hidden absolute top-full left-0 right-0 w-full liquid-glass-menu p-4 sm:p-5 flex flex-col gap-2.5 max-h-[calc(100dvh-75px)] overflow-y-auto overscroll-contain z-50 rounded-b-3xl border-b border-x border-white/20 shadow-2xl animate-fade-in">
             {/* User Profile Info Card */}
             {currentMember && (
                <div className="flex items-center gap-3 p-3 rounded-2xl liquid-glass-card border border-purple-400/30 mb-1">
                    {currentMember?.avatarUrl || user?.photoURL ? (
                    <img
                        src={currentMember?.avatarUrl || user?.photoURL || ''}
                        alt={currentMember?.name || currentMember?.cosplayName || user?.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-purple-400/40"
                    />
                    ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-rose-700 flex items-center justify-center font-bold text-white shrink-0">
                        {((currentMember?.name || currentMember?.cosplayName || user?.displayName || 'U')[0] || 'U').toUpperCase()}
                    </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white truncate text-sm">{currentMember?.name || currentMember?.cosplayName || user?.displayName}</span>
                        <span className="text-xs font-mono text-purple-300">ID: {currentMember?.userId16?.slice(-4)}</span>
                    </div>
                </div>
             )}

             {/* Navigation Tabs with Liquid Glass Styling */}
             <button
               type="button"
               onClick={() => { setActiveTab('form'); handleCloseMobileMenu(); }}
               className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all border ${
                 activeTab === 'form'
                   ? 'bg-rose-500/25 text-white border-rose-500/50 shadow-lg font-bold'
                   : 'liquid-glass-menu-item text-slate-100 hover:text-white'
               }`}
             >
               <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                 <Sparkles className="w-4 h-4" />
               </div>
               <span className="text-sm font-semibold">{t.navForm}</span>
             </button>

             <button
               type="button"
               onClick={() => { setActiveTab('card'); handleCloseMobileMenu(); }}
               className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all border ${
                 activeTab === 'card'
                   ? 'bg-indigo-500/25 text-white border-indigo-500/50 shadow-lg font-bold'
                   : 'liquid-glass-menu-item text-slate-100 hover:text-white'
               }`}
             >
               <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                 <IdCard className="w-4 h-4" />
               </div>
               <span className="text-sm font-semibold">KCC ID</span>
             </button>

             <button
               type="button"
               onClick={() => { setActiveTab('gallery'); handleCloseMobileMenu(); }}
               className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all border ${
                 activeTab === 'gallery'
                   ? 'bg-pink-500/25 text-white border-pink-500/50 shadow-lg font-bold'
                   : 'liquid-glass-menu-item text-slate-100 hover:text-white'
               }`}
             >
               <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0">
                 <Camera className="w-4 h-4" />
               </div>
               <span className="text-sm font-semibold">{t.navGallery}</span>
             </button>

             {(user || currentMember) && (
               <button
                 type="button"
                 onClick={() => { setActiveTab('profile'); handleCloseMobileMenu(); }}
                 className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all border ${
                   activeTab === 'profile'
                     ? 'bg-cyan-500/25 text-white border-cyan-500/50 shadow-lg font-bold'
                     : 'liquid-glass-menu-item text-slate-100 hover:text-white'
                 }`}
               >
                 <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                   <UserIcon className="w-4 h-4" />
                 </div>
                 <span className="text-sm font-semibold">{t.navProfile}</span>
               </button>
             )}
             
             {/* Secondary Utilities Container */}
             <div className="border-t border-white/10 my-1 pt-2.5 flex flex-col gap-2">
                {/* Language Selection */}
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white"
                    >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{currentLangMeta.nativeName} ({currentLang.toUpperCase()})</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLangMenuOpen && (
                        <div className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-2xl liquid-glass-card border border-purple-500/30 text-xs text-slate-100 max-h-48 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                            <button
                            type="button"
                            key={lang.code}
                            onClick={() => {
                                onSelectLang(lang.code);
                                setIsLangMenuOpen(false);
                            }}
                            className={`text-left px-3 py-2 rounded-xl transition-colors truncate ${
                                currentLang === lang.code
                                ? 'bg-rose-600 text-white font-bold'
                                : 'hover:bg-white/10 text-slate-300'
                            }`}
                            >
                            {lang.nativeName}
                            </button>
                        ))}
                        </div>
                    )}
                </div>

                <a
                  href="https://wa.me/6285711032782"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">WhatsApp Community</span>
                </a>

                <button
                  type="button"
                  onClick={() => { setIsEditorOpen(true); handleCloseMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Theme Editor</span>
                </button>

                <div className="pt-1">
                   <PWAInstallButton />
                </div>

                {user || currentMember ? (
                  <button
                    type="button"
                    onClick={() => { onLogout(); handleCloseMobileMenu(); }}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 font-bold transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onOpenAuth(); handleCloseMobileMenu(); }}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg border border-white/20 mt-1"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Login / Sign In</span>
                  </button>
                )}
             </div>
          </div>
        </>
      )}
    </header>
  );
};
