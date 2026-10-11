import React, { useState } from 'react';
import {
  Palette,
  X,
  Layout,
  Type,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Check,
  Sliders,
  Maximize2,
  Minimize2,
  Crown,
  Shield,
  Heart,
  Eye,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import {
  useSiteTheme,
  BackgroundTheme,
  FontTheme,
  ColorTheme,
  LayoutWidth,
  CardRadius,
  NavbarStyle,
  EmblemType,
} from '../lib/themeContext';
import { useI18n } from '../i18n';

export const SiteEditorModal: React.FC = () => {
  const { t } = useI18n();
  const { theme, updateTheme, resetTheme, isEditorOpen, setIsEditorOpen, saveError, clearSaveError } = useSiteTheme();
  const [activeTab, setActiveTab] = useState<'layout' | 'background' | 'colors' | 'font' | 'logo'>('layout');

  if (!isEditorOpen) return null;

  const backgroundPresets: {
    id: BackgroundTheme;
    name: string;
    desc: string;
    previewGrad: string;
  }[] = [
    {
      id: 'bright-purple-fluent',
      name: t('siteEditor.bgBrightPurpleName'),
      desc: t('siteEditor.bgBrightPurpleDesc'),
      previewGrad: 'linear-gradient(135deg, #2e1065 0%, #1e1145 40%, #3b0764 75%, #4c1d95 100%)',
    },
    {
      id: 'cyber-purple',
      name: t('siteEditor.bgCyberPurpleName'),
      desc: t('siteEditor.bgCyberPurpleDesc'),
      previewGrad: 'linear-gradient(135deg, #18052e 0%, #3b0764 50%, #581c87 100%)',
    },
    {
      id: 'cosmic-dark',
      name: t('siteEditor.bgCosmicDarkName'),
      desc: t('siteEditor.bgCosmicDarkDesc'),
      previewGrad: 'linear-gradient(135deg, #090614 0%, #170d2b 50%, #20133e 100%)',
    },
    {
      id: 'fluent-lavender',
      name: t('siteEditor.bgFluentLavenderName'),
      desc: t('siteEditor.bgFluentLavenderDesc'),
      previewGrad: 'linear-gradient(135deg, #371b58 0%, #4c2a76 50%, #5c3b88 100%)',
    },
    {
      id: 'dark-onyx',
      name: t('siteEditor.bgDarkOnyxName'),
      desc: t('siteEditor.bgDarkOnyxDesc'),
      previewGrad: 'linear-gradient(135deg, #0a0910 0%, #12101b 50%, #1a1727 100%)',
    },
  ];

  const colorPalettes: {
    id: ColorTheme;
    name: string;
    hex: string;
    secondaryHex: string;
  }[] = [
    { id: 'purple', name: t('siteEditor.colorPurple'), hex: '#a855f7', secondaryHex: '#c084fc' },
    { id: 'rose', name: t('siteEditor.colorRose'), hex: '#f43f5e', secondaryHex: '#fb7185' },
    { id: 'indigo', name: t('siteEditor.colorIndigo'), hex: '#6366f1', secondaryHex: '#818cf8' },
    { id: 'emerald', name: t('siteEditor.colorEmerald'), hex: '#10b981', secondaryHex: '#34d399' },
    { id: 'amber', name: t('siteEditor.colorAmber'), hex: '#f59e0b', secondaryHex: '#fbbf24' },
    { id: 'cyan', name: t('siteEditor.colorCyan'), hex: '#06b6d4', secondaryHex: '#22d3ee' },
  ];

  const fontOptions: {
    id: FontTheme;
    name: string;
    desc: string;
    family: string;
  }[] = [
    {
      id: 'din-next',
      name: t('siteEditor.fontDinNextName'),
      desc: t('siteEditor.fontDinNextDesc'),
      family: "'DIN Next', sans-serif",
    },
  ];

  const emblemOptions: {
    id: EmblemType;
    name: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'kitsune', name: t('siteEditor.emblemKitsune'), icon: <Sparkles className="w-5 h-5 text-rose-400" /> },
    { id: 'crown', name: t('siteEditor.emblemCrown'), icon: <Crown className="w-5 h-5 text-amber-400" /> },
    { id: 'shield', name: t('siteEditor.emblemShield'), icon: <Shield className="w-5 h-5 text-indigo-400" /> },
    { id: 'heart', name: t('siteEditor.emblemHeart'), icon: <Heart className="w-5 h-5 text-pink-400" /> },
    { id: 'sparkle', name: t('siteEditor.emblemSparkle'), icon: <Sparkles className="w-5 h-5 text-yellow-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {t('siteEditor.editorTitle')}
              </h2>
              <p className="text-xs text-purple-200/80">
                {t('siteEditor.editorDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTheme}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              title={t('siteEditor.resetTitle')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('siteEditor.resetDefault')}</span>
            </button>

            <button
              onClick={() => setIsEditorOpen(false)}
              aria-label={t('common.close')}
              title={t('common.close')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-1">
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
              activeTab === 'layout'
                ? 'bg-slate-900 text-white border-t border-x border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('siteEditor.tabLayout')}</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
              activeTab === 'background'
                ? 'bg-slate-900 text-white border-t border-x border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('siteEditor.tabBackground')}</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
              activeTab === 'colors'
                ? 'bg-slate-900 text-white border-t border-x border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>{t('siteEditor.tabColors')}</span>
          </button>

          <button
            onClick={() => setActiveTab('font')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
              activeTab === 'font'
                ? 'bg-slate-900 text-white border-t border-x border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('siteEditor.tabFont')}</span>
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
              activeTab === 'logo'
                ? 'bg-slate-900 text-white border-t border-x border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('siteEditor.tabLogo')}</span>
          </button>
        </div>

        {/* Save error (only a signed-in admin can save site settings) */}
        {saveError && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start justify-between gap-3">
            <span>{t('siteEditor.saveFailed', { error: saveError })}</span>
            <button
              type="button"
              onClick={clearSaveError}
              aria-label={t('common.close')}
              title={t('common.close')}
              className="p-1 rounded-lg hover:bg-rose-900/60 text-rose-300 hover:text-white transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: LAYOUT */}
          {activeTab === 'layout' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('siteEditor.layoutWidthLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: '7xl', label: t('siteEditor.widthNormal'), desc: t('siteEditor.widthNormalDesc') },
                    { id: '6xl', label: t('siteEditor.widthCompact'), desc: t('siteEditor.widthCompactDesc') },
                    { id: 'full', label: t('siteEditor.widthFull'), desc: t('siteEditor.widthFullDesc') },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateTheme({ layoutWidth: opt.id as LayoutWidth })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        theme.layoutWidth === opt.id
                          ? 'bg-purple-950/60 border-purple-400 shadow-md ring-1 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="font-bold text-white text-xs sm:text-sm">{opt.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('siteEditor.navbarStyleLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'glass-bar', label: t('siteEditor.navbarGlassBar'), desc: t('siteEditor.navbarGlassBarDesc') },
                    {
                      id: 'floating-pill',
                      label: t('siteEditor.navbarFloatingPill'),
                      desc: t('siteEditor.navbarFloatingPillDesc'),
                    },
                    { id: 'minimal', label: t('siteEditor.navbarMinimal'), desc: t('siteEditor.navbarMinimalDesc') },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateTheme({ navbarStyle: opt.id as NavbarStyle })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        theme.navbarStyle === opt.id
                          ? 'bg-purple-950/60 border-purple-400 shadow-md ring-1 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="font-bold text-white text-xs sm:text-sm">{opt.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('siteEditor.cardRadiusLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'rounded-3xl', label: t('siteEditor.radius3xl'), preview: 'rounded-3xl' },
                    { id: 'rounded-2xl', label: t('siteEditor.radius2xl'), preview: 'rounded-2xl' },
                    { id: 'rounded-xl', label: t('siteEditor.radiusXl'), preview: 'rounded-xl' },
                    { id: 'rounded-lg', label: t('siteEditor.radiusLg'), preview: 'rounded-lg' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateTheme({ cardRadius: opt.id as CardRadius })}
                      className={`p-3.5 border text-center transition-all ${opt.preview} ${
                        theme.cardRadius === opt.id
                          ? 'bg-purple-950/60 border-purple-400 ring-1 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND */}
          {activeTab === 'background' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('siteEditor.backgroundPresetsLabel')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {backgroundPresets.map((bg) => {
                  const isSelected = theme.background === bg.id;
                  return (
                    <div
                      key={bg.id}
                      onClick={() => updateTheme({ background: bg.id })}
                      className={`p-4 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-purple-400 shadow-xl ring-2 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white text-sm">{bg.name}</h4>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{bg.desc}</p>
                      <div
                        className="h-14 rounded-2xl border border-white/20 shadow-inner"
                        style={{ background: bg.previewGrad }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Custom CSS gradient option */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {t('siteEditor.customGradientTitle')}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {t('siteEditor.customGradientDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => updateTheme({ background: 'custom' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      theme.background === 'custom'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t('siteEditor.useCustom')}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="linear-gradient(135deg, #1e102e 0%, #3b0764 100%)"
                  aria-label={t('siteEditor.customGradientTitle')}
                  value={theme.customBgGradient || ''}
                  onChange={(e) => updateTheme({ customBgGradient: e.target.value, background: 'custom' })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('siteEditor.accentColorLabel')}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {colorPalettes.map((cp) => {
                  const isSelected = theme.colorScheme === cp.id;
                  return (
                    <button
                      key={cp.id}
                      onClick={() => updateTheme({ colorScheme: cp.id })}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-white shadow-xl ring-2 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full shadow-md border border-white/20 shrink-0"
                          style={{ background: cp.hex }}
                        ></div>
                        <span className="font-bold text-xs sm:text-sm text-white">{cp.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Picker */}
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t('siteEditor.customColorTitle')}
                  </h4>
                  <p className="text-[11px] text-slate-400">{t('siteEditor.customColorDesc')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={t('siteEditor.customColorTitle')}
                    value={theme.customPrimaryColor || '#a855f7'}
                    onChange={(e) => updateTheme({ customPrimaryColor: e.target.value, colorScheme: 'custom' })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    aria-label={t('siteEditor.customColorTitle')}
                    value={theme.customPrimaryColor || '#a855f7'}
                    onChange={(e) => updateTheme({ customPrimaryColor: e.target.value, colorScheme: 'custom' })}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FONT */}
          {activeTab === 'font' && (
            <div className="space-y-6 animate-fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('siteEditor.fontLabel')}
              </label>

              <div className="space-y-3">
                {fontOptions.map((f) => {
                  const isSelected = theme.font === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => updateTheme({ font: f.id })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-400 shadow-md ring-2 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className="text-base sm:text-lg font-bold text-white"
                            style={{ fontFamily: f.family }}
                          >
                            {f.name}
                          </h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500 text-white font-bold">
                              {t('siteEditor.fontActive')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
                        <p
                          className="text-xs text-purple-200 mt-2 tracking-wide font-medium"
                          style={{ fontFamily: f.family }}
                        >
                          {t('siteEditor.fontSample')}
                        </p>
                      </div>

                      {isSelected && <Check className="w-5 h-5 text-purple-400 shrink-0 ml-3" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('siteEditor.logoTextLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">{t('siteEditor.logoTitleLabel')}</label>
                    <input
                      type="text"
                      value={theme.logo.title}
                      onChange={(e) => updateTheme({ logo: { ...theme.logo, title: e.target.value } })}
                      placeholder="KawanCosplay"
                      aria-label={t('siteEditor.logoTitleLabel')}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">{t('siteEditor.logoSubtitleLabel')}</label>
                    <input
                      type="text"
                      value={theme.logo.subtitle}
                      onChange={(e) => updateTheme({ logo: { ...theme.logo, subtitle: e.target.value } })}
                      placeholder={t('siteEditor.logoSubtitlePlaceholder')}
                      aria-label={t('siteEditor.logoSubtitleLabel')}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('siteEditor.emblemLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {emblemOptions.map((emblem) => {
                    const isSelected = theme.logo.emblemType === emblem.id;
                    return (
                      <button
                        key={emblem.id}
                        type="button"
                        onClick={() => updateTheme({ logo: { ...theme.logo, emblemType: emblem.id } })}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-400 shadow-md ring-1 ring-purple-400'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {emblem.icon}
                        <span className="text-xs font-bold text-white truncate">{emblem.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('siteEditor.customLogoLabel')}
                </label>
                <input
                  type="url"
                  value={theme.logo.customLogoUrl || ''}
                  onChange={(e) =>
                    updateTheme({
                      logo: {
                        ...theme.logo,
                        customLogoUrl: e.target.value,
                        emblemType: e.target.value ? 'custom_img' : 'kitsune',
                      },
                    })
                  }
                  placeholder="https://domain.com/logo-kawancosplay.png"
                  aria-label={t('siteEditor.customLogoLabel')}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('siteEditor.customLogoHint')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer with Close & Save Confirmation */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{t('siteEditor.autoSaveNotice')}</span>
          </span>

          <button
            onClick={() => setIsEditorOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-lg transition-all"
          >
            {t('siteEditor.doneClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
