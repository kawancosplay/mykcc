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
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWidthSmall, setIsWidthSmall] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const { setIsEditorOpen } = useSiteTheme();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setIsWidthSmall(entry.contentRect.width < 768);
      }
    });

    if (navbarRef.current) {
      resizeObserver.observe(navbarRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  const shouldShrink = (isScrolled && !isExpanded) || isWidthSmall;

  return (
    <header
      ref={navbarRef}
      className={`sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-rose-500/20 text-slate-100 shadow-xl transition-all duration-300 ${shouldShrink ? 'py-1' : 'py-2'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={() => setIsExpanded(true)}
      onTouchEnd={() => setIsExpanded(false)}
    >
      <div className="max-w-[100rem] mx-auto px-1 md:px-2">
        <div className={`flex items-center w-full justify-between gap-1 transition-all duration-300 ${shouldShrink ? 'h-12 md:h-14' : 'h-16 md:h-20'}`}>
          <div
            className="cursor-pointer group flex items-center shrink-0"
            onClick={() => setActiveTab('form')}
          >
            <KawanCosplayLogo
              size={shouldShrink ? 'sm' : 'md'}
              showText={false}
              desktopLogoUrl="https://drive.google.com/drive-viewer/AKGpihYVfb6Fe6Wd3fjp-Rw4vXHGDZI463a97MLDFqVMSQlJnIzEidb5DtYwte6ixM0oKhRDvZQFl44KvF-GF3qpfffpPqlVOvM43vo=w2864-h1536-rw-v1?auditContext=forDisplay"
              mobileLogoUrl="https://drive.google.com/drive-viewer/AKGpihaHQE1zU4KxDHywFAmpAVKPjm3iI-9h6JchiuKGfZzO2m77KbfJxjKurVxw1QYfRNsLHJaHy4tMISdnztT47m7HmRArNCLHiSc=w2864-h1536-rw-v1?auditContext=forDisplay"
            />
          </div>

          <div className="hidden md:flex flex-grow items-center justify-center min-w-0 px-1">
            <nav className="flex items-center gap-1 lg:gap-4 bg-slate-900/70 backdrop-blur-md p-1.5 rounded-2xl border border-purple-400/20 text-xs font-semibold shadow-inner">
              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 group ${
                  activeTab === 'form'
                    ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-rose-300 shrink-0" />
                <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${activeTab === 'form' ? 'max-w-none opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'}`}>{t.navForm}</span>
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`inline-flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 group ${
                  activeTab === 'card'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <IdCard className="w-4 h-4 text-indigo-300 shrink-0" />
                <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${activeTab === 'card' ? 'max-w-none opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'}`}>{t.navCard}</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`inline-flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 group ${
                  activeTab === 'gallery'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Camera className="w-4 h-4 text-pink-400 shrink-0" />
                <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${activeTab === 'gallery' ? 'max-w-none opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'}`}>{t.navGallery}</span>
              </button>

              {currentMember && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`inline-flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 group ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-purple-300 shrink-0" />
                  <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${activeTab === 'profile' ? 'max-w-none opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'}`}>{t.navProfile}</span>
                </button>
              )}

              <div className="h-4 w-px bg-slate-700/80 mx-1" />

              <button
                onClick={() => {
                  setActiveTab('admin');
                  window.location.hash = 'admin';
                }}
                className={`inline-flex items-center gap-1 px-2.5 lg:px-3 py-2 rounded-xl text-xs transition-all duration-200 group ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md font-bold'
                    : 'text-amber-300 hover:text-amber-100 hover:bg-amber-950/40'
                }`}
                title="Admin Dashboard (Password Protected)"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${activeTab === 'admin' ? 'max-w-none opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'}`}>{t.navAdmin}</span>
              </button>
            </nav>
          </div>

          <div className={`flex items-center justify-end gap-2 shrink-0 transition-transform duration-300 ${shouldShrink ? 'scale-90' : 'scale-100'}`}>
            <button
              className="md:hidden p-2 bg-slate-900/80 hover:bg-slate-800 border border-purple-400/30 text-purple-200 rounded-xl transition-all shadow-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-xl transition-all shadow-sm"
              title="Official WhatsApp Hotline: +62 857-1103-2782"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            </a>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-purple-400/25 hover:border-purple-400/50 rounded-xl text-xs text-slate-200 hover:text-white transition-all shadow-sm"
                title={`Pilih Bahasa (${currentLangMeta.nativeName})`}
              >
                <Globe className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-mono font-bold text-xs uppercase">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 max-h-80 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-1.5 z-50 animate-fade-in text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Bahasa (20 Languages)
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLang(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        currentLang === lang.code
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-purple-400/30 text-purple-200 hover:text-white rounded-xl transition-all shadow-sm"
              title={currentLang === 'id' ? 'Editor Tampilan Situs (Layout, Warna, Font, Logo)' : 'Site Editor (Layout, Colors, Font, Logo)'}
            >
              <Palette className="w-4 h-4 text-pink-300 shrink-0" />
            </button>
            
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>

            {user || currentMember ? (
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-purple-400/25 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 px-1 hover:opacity-85 transition-opacity"
                  title="Lihat Profil Anda / View Profile"
                >
                  {currentMember?.avatarUrl || user?.photoURL ? (
                    <img
                      src={currentMember?.avatarUrl || user?.photoURL || ''}
                      alt={currentMember?.cosplayName || user?.displayName || 'User'}
                      className="w-6 h-6 rounded-full border border-rose-500/50 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-rose-500/30 flex items-center justify-center text-[11px] font-bold text-rose-300">
                      {(currentMember?.cosplayName || user?.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <span className="hidden xl:inline text-xs font-bold text-white max-w-[80px] truncate">
                    {currentMember?.cosplayName || user?.displayName || 'Member'}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title={t.navLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.navLogin}</span>
              </button>
            )}
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 p-2 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl animate-fade-in text-xs flex flex-col gap-1">
             <button onClick={() => { setActiveTab('form'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${activeTab === 'form' ? 'bg-purple-600/30 text-rose-300' : 'text-slate-300'}`}>
               <Sparkles className="w-4 h-4" /> {t.navForm}
             </button>
             <button onClick={() => { setActiveTab('card'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${activeTab === 'card' ? 'bg-rose-600/30 text-rose-300' : 'text-slate-300'}`}>
               <IdCard className="w-4 h-4" /> {t.navCard}
             </button>
             <button onClick={() => { setActiveTab('gallery'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${activeTab === 'gallery' ? 'bg-pink-600/30 text-pink-300' : 'text-slate-300'}`}>
               <Camera className="w-4 h-4" /> {t.navGallery}
             </button>
             {currentMember && (
               <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${activeTab === 'profile' ? 'bg-purple-600/30 text-purple-300' : 'text-slate-300'}`}>
                 <UserIcon className="w-4 h-4" /> {t.navProfile}
               </button>
             )}
             <div className="p-2">
               <PWAInstallButton />
             </div>
          </div>
        )}

      </div>
    </header>
  );
};
