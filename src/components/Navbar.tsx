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
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const { setIsEditorOpen } = useSiteTheme();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const shouldShrink = false;

  return (
    <header
      ref={navbarRef}
      className="left-0 right-0 z-50 liquid-glass border-b border-white/10 text-slate-100 shadow-xl transition-transform duration-500 ease-in-out"
    >
      <div className="max-w-[100rem] mx-auto px-2 md:px-4 h-full">
        <div className="flex items-center justify-between h-full w-full">
          <div
            className="cursor-pointer group flex items-center justify-start shrink-0 h-full flex-1"
            onClick={() => setActiveTab('form')}
          >
            <KawanCosplayLogo
              size="sm"
              showText={false}
              desktopLogoUrl="https://i.postimg.cc/sXbd1FgB/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png"
              mobileLogoUrl="https://i.postimg.cc/sXbd1FgB/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png"
            />
          </div>

          <div className="hidden lg:flex items-center justify-center h-full flex-none px-4">
            <nav className="flex items-center gap-1 text-sm font-medium text-slate-300 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('form')}
                className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'form' ? 'text-white bg-white/10' : ''}`}
              >
                Registration
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'card' ? 'text-white bg-white/10' : ''}`}
              >
                KCC ID
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'gallery' ? 'text-white bg-white/10' : ''}`}
              >
                Gallery
              </button>

              {(user || currentMember) && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`transition-colors px-4 py-2 rounded-xl hover:text-white whitespace-nowrap ${activeTab === 'profile' ? 'text-white bg-white/10' : ''}`}
                >
                  {t.navProfile}
                </button>
              )}
            </nav>
          </div>

          <div className={`flex items-center justify-end gap-1 md:gap-2 shrink-0 h-full transition-transform duration-300 flex-1 ${shouldShrink ? 'scale-90' : 'scale-100'}`}>
            <button
              className="lg:hidden p-3 liquid-glass-card hover:bg-slate-800 border border-purple-400/30 text-purple-200 rounded-xl transition-all shadow-sm"
              onClick={() => {
                triggerHaptic(10);
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  <div className="absolute right-0 mt-4 w-48 liquid-glass-card rounded-2xl shadow-xl p-1 z-50 animate-fade-in text-sm text-slate-100">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onSelectLang(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                          currentLang === lang.code
                            ? 'bg-white/10 font-bold'
                            : 'hover:bg-white/5'
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
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                  >
                    {currentMember?.avatarUrl || user?.photoURL ? (
                      <img
                        src={currentMember?.avatarUrl || user?.photoURL || ''}
                        alt={currentMember?.cosplayName || user?.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                        {(currentMember?.cosplayName || user?.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  <button
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
        
         {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 p-3 liquid-glass rounded-3xl shadow-2xl animate-fade-in text-sm flex flex-col gap-2 max-h-[80vh] overflow-y-auto z-[60]">
             {/* User Profile Info */}
             {currentMember && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-2">
                    {currentMember?.avatarUrl || user?.photoURL ? (
                    <img
                        src={currentMember?.avatarUrl || user?.photoURL || ''}
                        alt={currentMember?.cosplayName || user?.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                        {(currentMember?.cosplayName || user?.displayName || 'U')[0].toUpperCase()}
                    </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-white">{currentMember?.cosplayName || user?.displayName}</span>
                        <span className="text-xs text-slate-400">KCC ID</span>
                    </div>
                </div>
             )}

             <button onClick={() => { setActiveTab('form'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${activeTab === 'form' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
               <Sparkles className="w-5 h-5" /> {t.navForm}
             </button>
             <button onClick={() => { setActiveTab('card'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${activeTab === 'card' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
               <IdCard className="w-5 h-5" /> KCC ID
             </button>
             <button onClick={() => { setActiveTab('gallery'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${activeTab === 'gallery' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
               <Camera className="w-5 h-5" /> {t.navGallery}
             </button>

             {(user || currentMember) && (
               <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                 <UserIcon className="w-5 h-5" /> {t.navProfile}
               </button>
             )}
             
             <div className="border-t border-white/10 my-1 pt-2 flex flex-col gap-2">
                {/* Language Selection */}
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-300 hover:bg-white/5 uppercase"
                    >
                        <Globe className="w-5 h-5" /> {currentLang}
                    </button>
                    {isLangMenuOpen && (
                        <div className="w-full liquid-glass rounded-2xl p-1 z-50 text-sm text-slate-100 flex flex-col gap-1">
                        {LANGUAGES.map((lang) => (
                            <button
                            key={lang.code}
                            onClick={() => {
                                onSelectLang(lang.code);
                                setIsLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                                currentLang === lang.code
                                ? 'bg-white/10 font-bold'
                                : 'hover:bg-white/5'
                            }`}
                            >
                            {lang.nativeName}
                            </button>
                        ))}
                        </div>
                    )}
                </div>

                <a href="https://wa.me/6285711032782" target="_blank" className="flex items-center gap-3 p-3 rounded-2xl text-slate-300 hover:bg-white/5">
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </a>
                <button onClick={() => setIsEditorOpen(true)} className="flex items-center gap-3 p-3 rounded-2xl text-slate-300 hover:bg-white/5">
                  <Palette className="w-5 h-5" /> Editor
                </button>
                <div className="p-2">
                   <PWAInstallButton />
                </div>
                {user || currentMember ? (
                  <button onClick={onLogout} className="flex items-center gap-3 p-3 rounded-2xl text-rose-300 hover:bg-rose-500/10">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                ) : (
                  <button onClick={onOpenAuth} className="flex items-center gap-3 p-3 rounded-2xl text-emerald-300 hover:bg-emerald-500/10">
                    <UserIcon className="w-5 h-5" /> Login
                  </button>
                )}
             </div>
          </div>
         )}

      </div>
    </header>
  );
};
