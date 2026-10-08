import React, { useState } from 'react';
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
} from 'lucide-react';
import { Member } from '../types';
import { LanguageCode, LANGUAGES, TRANSLATIONS } from '../lib/i18n';
import { KawanCosplayLogo } from './KawanCosplayLogo';
import { useSiteTheme } from '../lib/themeContext';

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
  const { setIsEditorOpen } = useSiteTheme();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-rose-500/20 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand: Official KawanCosplay Logo */}
          <div
            className="cursor-pointer group flex items-center"
            onClick={() => setActiveTab('form')}
          >
            <KawanCosplayLogo size="lg" showText={false} noContainer={true} />
          </div>

          {/* Navigation Tabs (Unified Sleek Glass Pill) */}
          <div className="hidden lg:flex items-center">
            <nav className="flex items-center gap-4 bg-slate-900/70 backdrop-blur-md p-1.5 rounded-2xl border border-purple-400/20 text-xs font-semibold shadow-inner">
              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'form'
                    ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-rose-300 shrink-0" />
                <span>{t.navForm}</span>
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'card'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <IdCard className="w-4 h-4 text-indigo-300 shrink-0" />
                <span>{t.navCard}</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'gallery'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Camera className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{t.navGallery}</span>
              </button>

              {currentMember && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-purple-300 shrink-0" />
                  <span>{t.navProfile}</span>
                </button>
              )}

              <div className="h-4 w-px bg-slate-700/80 mx-1" />

              {/* Integrated Admin Button */}
              <button
                onClick={() => {
                  setActiveTab('admin');
                  window.location.hash = 'admin';
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md font-bold'
                    : 'text-amber-300 hover:text-amber-100 hover:bg-amber-950/40'
                }`}
                title="Admin Dashboard (Password Protected)"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Admin</span>
              </button>
            </nav>
          </div>

          {/* Right Actions: Compact & Spacious Utility Cluster */}
          <div className="flex items-center gap-2">
            {/* WhatsApp Hotline quick icon button */}
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-xl transition-all shadow-sm"
              title="Official WhatsApp Hotline: +62 857-1103-2782"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            </a>

            {/* Multi-language Dropdown (Compact 2-letter Code Badge) */}
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

            {/* Site Editor button */}
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-purple-400/30 text-purple-200 hover:text-white rounded-xl transition-all shadow-sm"
              title={currentLang === 'id' ? 'Editor Tampilan Situs (Layout, Warna, Font, Logo)' : 'Site Editor (Layout, Colors, Font, Logo)'}
            >
              <Palette className="w-4 h-4 text-pink-300 shrink-0" />
            </button>

            {/* Auth Button or Member Profile */}
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

        {/* Mobile Navigation Bar & Separate Admin Menu */}
        <div className="flex lg:hidden items-center justify-between py-1.5 border-t border-purple-500/20 text-[11px] gap-1 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
                activeTab === 'form'
                  ? 'bg-purple-600/30 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.navForm}</span>
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
                activeTab === 'card'
                  ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <IdCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.navCard}</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-pink-600/30 text-pink-300 font-bold border border-pink-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.navGallery}</span>
            </button>
            {currentMember && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.navProfile}</span>
              </button>
            )}
          </div>

          {/* Separate Admin Menu Button on Mobile */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-1 py-1 px-2 rounded-lg border border-purple-500/30 bg-purple-950/50 text-purple-200 text-[10px] font-semibold"
              title="Editor Tampilan Situs"
            >
              <Palette className="w-3 h-3 text-pink-400" />
              <span>Tema</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                window.location.hash = 'admin';
              }}
              className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-lg border transition-colors shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-amber-500/30 text-amber-200 border-amber-400 font-bold'
                  : 'bg-amber-950/50 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
