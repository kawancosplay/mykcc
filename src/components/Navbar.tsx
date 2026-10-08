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
      className={`fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-rose-500/20 text-slate-100 shadow-xl py-1 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-[100rem] mx-auto px-1 md:px-2">
        <div className="flex items-center w-full justify-between gap-1 h-12 md:h-14">
          <div
            className="cursor-pointer group flex items-center shrink-0 mt-1"
            onClick={() => setActiveTab('form')}
          >
            <KawanCosplayLogo
              size="md"
              showText={false}
              desktopLogoUrl="https://i.postimg.cc/kg52x8yb/Logo-Kawan-Cosplay-Community-Redesigned.png"
              mobileLogoUrl="https://i.postimg.cc/sXbd1FgB/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png"
            />
          </div>

          <div className="hidden md:flex flex-grow items-center justify-center min-w-0 px-1">
            <nav className="flex items-center gap-8 text-sm font-medium text-slate-300">
              <button
                onClick={() => setActiveTab('form')}
                className={`transition-colors hover:text-white ${activeTab === 'form' ? 'text-white' : ''}`}
              >
                {t.navForm}
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`transition-colors hover:text-white ${activeTab === 'card' ? 'text-white' : ''}`}
              >
                {t.navCard}
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`transition-colors hover:text-white ${activeTab === 'gallery' ? 'text-white' : ''}`}
              >
                {t.navGallery}
              </button>

              {currentMember && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`transition-colors hover:text-white ${activeTab === 'profile' ? 'text-white' : ''}`}
                >
                  {t.navProfile}
                </button>
              )}
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
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Official WhatsApp Hotline: +62 857-1103-2782"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors uppercase"
                title={`Pilih Bahasa (${currentLangMeta.nativeName})`}
              >
                {currentLang}
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50 animate-fade-in text-sm text-slate-900">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLang(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                        currentLang === lang.code
                          ? 'bg-slate-100 font-bold'
                          : 'hover:bg-slate-50'
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
