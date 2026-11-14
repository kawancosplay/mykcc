import React, { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Palette,
  X,
  Layout,
  Type,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Check,
  Crown,
  Shield,
  Heart,
  Sun,
  Moon,
  Grid,
  Eye,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  useSiteTheme,
  BackgroundTheme,
  GlassPreset,
  PerfTier,
  LayoutWidth,
  CardRadius,
  CardDensity,
  NavbarStyle,
  SurfaceMode,
  ButtonStyle,
  FontFamily,
  HeadingStyle,
  FontScale,
  GridType,
  GradientAngle,
  ColorTheme,
  EmblemType,
} from '../lib/themeContext';
import { useI18n } from '../i18n';
import { haptic } from '../lib/haptic';
import {
  LAYOUT_IDS,
  usePresenceMotion,
  useScrollLock,
  useSheetDrag,
  useThumbTransition,
} from '../lib/motion';

type EditorTab = 'layout' | 'background' | 'colors' | 'font' | 'visibility';
const EDITOR_TAB_ORDER: readonly EditorTab[] = ['layout', 'background', 'colors', 'font', 'visibility'];

// Strict high-contrast styling tokens
const OPTION_SELECTED =
  'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] border-[#7C3AED] text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400';
const OPTION_IDLE =
  'bg-white/85 border border-purple-500/20 text-slate-800 shadow-sm hover:border-purple-400/50 hover:bg-white transition-all';
const SECTION_LABEL = 'block text-xs font-bold uppercase tracking-wider text-[#475569] mb-2';

export const SiteEditorModal: React.FC = () => {
  const { t, isRtl } = useI18n();
  const { theme, updateTheme, resetTheme, isEditorOpen, setIsEditorOpen, saveError, clearSaveError } = useSiteTheme();
  const [activeTab, setActiveTab] = useState<EditorTab>('layout');
  const [tabDirection, setTabDirection] = useState(0);
  const titleId = useId();

  const closeEditor = useCallback(() => setIsEditorOpen(false), [setIsEditorOpen]);
  useScrollLock(isEditorOpen);
  const overlayMotion = usePresenceMotion('overlay');
  const sheetMotion = usePresenceMotion('sheet');
  const tabMotion = usePresenceMotion('tab');
  const thumbTransition = useThumbTransition();
  const drag = useSheetDrag(closeEditor);

  useEffect(() => {
    if (!isEditorOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditorOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen, setIsEditorOpen]);

  useEffect(() => {
    if (!isEditorOpen) setTabDirection(0);
  }, [isEditorOpen]);

  const selectTab = (tab: EditorTab) => {
    if (tab === activeTab) return;
    const step = Math.sign(EDITOR_TAB_ORDER.indexOf(tab) - EDITOR_TAB_ORDER.indexOf(activeTab));
    setTabDirection(isRtl ? -step : step);
    setActiveTab(tab);
    haptic('selection');
  };

  const backgroundPresets: {
    id: BackgroundTheme;
    name: string;
    desc: string;
    previewGrad: string;
  }[] = [
    {
      id: 'lavender-mint-sticker',
      name: t('siteEditor.bgKccPastelName'),
      desc: t('siteEditor.bgKccPastelDesc'),
      previewGrad: 'linear-gradient(135deg, #B18CFE 0%, #93C5FD 50%, #6EE7B7 100%)',
    },
    {
      id: 'lavender-poster',
      name: t('siteEditor.bgLavenderPosterName'),
      desc: t('siteEditor.bgLavenderPosterDesc'),
      previewGrad: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #818CF8 100%)',
    },
    {
      id: 'mint-breeze',
      name: t('siteEditor.bgMintBreezeName'),
      desc: t('siteEditor.bgMintBreezeDesc'),
      previewGrad: 'linear-gradient(135deg, #6EE7B7 0%, #34D399 50%, #059669 100%)',
    },
    {
      id: 'sakura-otaku',
      name: t('siteEditor.bgSakuraOtakuName'),
      desc: t('siteEditor.bgSakuraOtakuDesc'),
      previewGrad: 'linear-gradient(135deg, #FBCFE8 0%, #F472B6 50%, #FB7185 100%)',
    },
    {
      id: 'ios-dark-glass',
      name: t('siteEditor.bgIosDarkName'),
      desc: t('siteEditor.bgIosDarkDesc'),
      previewGrad: 'linear-gradient(135deg, #0B0A10 0%, #171523 50%, #1A162B 100%)',
    },
  ];

  const colorPalettes: {
    id: ColorTheme;
    name: string;
    hex: string;
  }[] = [
    { id: 'purple', name: t('siteEditor.colorPurple'), hex: '#7C3AED' },
    { id: 'rose', name: t('siteEditor.colorRose'), hex: '#F43F5E' },
    { id: 'indigo', name: t('siteEditor.colorIndigo'), hex: '#6366F1' },
    { id: 'emerald', name: t('siteEditor.colorEmerald'), hex: '#10B981' },
    { id: 'amber', name: t('siteEditor.colorAmber'), hex: '#F59E0B' },
    { id: 'cyan', name: t('siteEditor.colorCyan'), hex: '#06B6D4' },
  ];

  const fontOptions: {
    id: FontFamily;
    name: string;
    family: string;
  }[] = [
    { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif" },
    { id: 'Inter', name: 'Inter', family: "'Inter', sans-serif" },
    { id: 'Nunito', name: 'Nunito', family: "'Nunito', sans-serif" },
    { id: 'Poppins', name: 'Poppins', family: "'Poppins', sans-serif" },
    { id: 'Space Grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
    { id: 'din-next', name: 'Google Sans Flex', family: "'Google Sans Flex', sans-serif" },
  ];

  const emblemOptions: {
    id: EmblemType;
    name: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'kitsune', name: t('siteEditor.emblemKitsune'), icon: <Sparkles className="w-5 h-5 text-rose-500" /> },
    { id: 'crown', name: t('siteEditor.emblemCrown'), icon: <Crown className="w-5 h-5 text-amber-500" /> },
    { id: 'shield', name: t('siteEditor.emblemShield'), icon: <Shield className="w-5 h-5 text-indigo-500" /> },
    { id: 'heart', name: t('siteEditor.emblemHeart'), icon: <Heart className="w-5 h-5 text-pink-500" /> },
    { id: 'sparkle', name: t('siteEditor.emblemSparkle'), icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
  ];

  const editorTabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'layout', label: t('siteEditor.tabLayout'), icon: <Layout className="w-4 h-4" /> },
    { id: 'background', label: t('siteEditor.tabBackground'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'colors', label: t('siteEditor.tabColors'), icon: <Palette className="w-4 h-4" /> },
    { id: 'font', label: t('siteEditor.tabFont'), icon: <Type className="w-4 h-4" /> },
    { id: 'visibility', label: t('siteEditor.tabVisibility'), icon: <Eye className="w-4 h-4" /> },
  ];

  return createPortal(
    <AnimatePresence>
      {isEditorOpen && (
        <motion.div
          key="site-editor-overlay"
          className="glass-overlay z-[100] touch-none"
          aria-hidden="true"
          {...overlayMotion}
        />
      )}
      {isEditorOpen && (
        <div key="site-editor-sheet" className="sheet-viewport z-[101]">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="glass-sheet sm:max-w-4xl bg-[rgba(255,255,255,0.95)] border border-purple-200/60 shadow-2xl overflow-hidden rounded-3xl"
            {...sheetMotion}
            {...drag.sheetProps}
          >
            {/* Header */}
            <div className="sheet-handle border-b border-purple-100 bg-white/60" {...drag.handleProps}>
              <div className="sheet-grabber bg-slate-300" aria-hidden="true" />
              <div className="px-4 sm:px-6 pt-1 pb-4 sm:pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 shadow-sm">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 id={titleId} className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                      <span>{t('siteEditor.editorTitle')}</span>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-300">
                        QuickLiquid Studio
                      </span>
                    </h2>
                    <p className="text-xs text-[#475569]">
                      {t('siteEditor.editorDesc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={resetTheme}
                    className="glass-button pressable px-3 text-xs font-semibold text-[#475569] hover:text-[#0F172A] border border-purple-200"
                    title={t('siteEditor.resetTitle')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('siteEditor.resetDefault')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeEditor}
                    aria-label={t('common.close')}
                    className="glass-icon-button overflow-hidden text-slate-600 hover:text-slate-900 bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="shrink-0 px-4 sm:px-6 py-2.5 border-b border-purple-100 bg-purple-50/40">
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {editorTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectTab(tab.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-md shadow-purple-500/20'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/80'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save error notice */}
            {saveError && (
              <div
                role="alert"
                className="shrink-0 mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start justify-between gap-3"
              >
                <span>{t('siteEditor.saveFailed', { error: saveError })}</span>
                <button
                  type="button"
                  onClick={clearSaveError}
                  aria-label={t('common.close')}
                  className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable Tab Body */}
            <div className="glass-scroll max-h-[68vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
              <motion.div
                key={activeTab}
                custom={tabDirection}
                {...tabMotion}
                initial={tabDirection === 0 ? false : tabMotion.initial}
              >
                {/* TAB 1: LAYOUT & QUICKLIQUID */}
                {activeTab === 'layout' && (
                  <div className="space-y-6">
                    {/* Content Width */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.layoutWidthLabel')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: '5xl', label: t('siteEditor.width5xl'), desc: t('siteEditor.width5xlDesc') },
                          { id: '7xl', label: t('siteEditor.widthNormal'), desc: t('siteEditor.widthNormalDesc') },
                          { id: 'full', label: t('siteEditor.widthFull'), desc: t('siteEditor.widthFullDesc') },
                        ].map((opt) => {
                          const isSelected = theme.layoutWidth === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ layoutWidth: opt.id as LayoutWidth })}
                              className={`p-4 rounded-2xl border text-left whitespace-normal relative ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>{opt.label}</h4>
                                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                              </div>
                              <p className={`text-[11px] ${isSelected ? 'text-white/90' : 'text-[#475569]'}`}>{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navbar Style */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.navbarStyleLabel')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'glass-bar', label: t('siteEditor.navbarGlassBar'), desc: t('siteEditor.navbarGlassBarDesc') },
                          { id: 'floating-pill', label: t('siteEditor.navbarFloatingPill'), desc: t('siteEditor.navbarFloatingPillDesc') },
                          { id: 'minimal', label: t('siteEditor.navbarMinimal'), desc: t('siteEditor.navbarMinimalDesc') },
                        ].map((opt) => {
                          const isSelected = theme.navbarStyle === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ navbarStyle: opt.id as NavbarStyle })}
                              className={`p-4 rounded-2xl border text-left whitespace-normal relative ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>{opt.label}</h4>
                                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                              </div>
                              <p className={`text-[11px] ${isSelected ? 'text-white/90' : 'text-[#475569]'}`}>{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card Radius */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.cardRadiusLabel')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'rounded-xl', label: t('siteEditor.radiusXl'), cls: 'rounded-xl' },
                          { id: 'rounded-2xl', label: t('siteEditor.radius2xl'), cls: 'rounded-2xl' },
                          { id: 'rounded-3xl', label: t('siteEditor.radius3xl'), cls: 'rounded-3xl' },
                          { id: 'rounded-4xl', label: t('siteEditor.radius4xl'), cls: 'rounded-[2rem]' },
                        ].map((opt) => {
                          const isSelected = theme.cardRadius === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ cardRadius: opt.id as CardRadius })}
                              className={`p-3.5 border text-center ${opt.cls} ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card Padding & Density */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.cardPaddingLabel')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'compact', label: t('siteEditor.densityCompact') },
                          { id: 'normal', label: t('siteEditor.densityNormal') },
                          { id: 'spacious', label: t('siteEditor.densitySpacious') },
                        ].map((opt) => {
                          const isSelected = theme.cardDensity === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ cardDensity: opt.id as CardDensity })}
                              className={`p-3 rounded-2xl border text-center ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* QuickLiquid Controls */}
                    <div className="p-5 rounded-3xl bg-purple-50/50 border border-purple-200/60 space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-[#0F172A] text-sm flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#7C3AED]" />
                          <span>{t('siteEditor.quickLiquidHeading')}</span>
                        </h3>
                      </div>

                      {/* Presets */}
                      <div>
                        <label className={SECTION_LABEL}>{t('siteEditor.glassPresetLabel')}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'clear', label: t('siteEditor.presetClear') },
                            { id: 'thin', label: t('siteEditor.presetThin') },
                            { id: 'regular', label: t('siteEditor.presetRegular') },
                            { id: 'thick', label: t('siteEditor.presetThick') },
                            { id: 'adaptive', label: t('siteEditor.presetAdaptive') },
                          ].map((opt) => {
                            const isSelected = (theme.glassPreset || 'regular') === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => updateTheme({ glassPreset: opt.id as GlassPreset })}
                                className={`p-2.5 rounded-xl border text-center ${
                                  isSelected ? OPTION_SELECTED : OPTION_IDLE
                                }`}
                              >
                                <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                  {opt.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Blur Strength Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={SECTION_LABEL}>{t('siteEditor.blurStrengthLabel')}</label>
                          <span className="text-xs font-mono font-bold text-[#7C3AED]">
                            {theme.glassBlur ?? 14}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          step="2"
                          value={theme.glassBlur ?? 14}
                          onChange={(e) => updateTheme({ glassBlur: Number(e.target.value) })}
                          className="studio-range-slider w-full"
                        />
                      </div>

                      {/* Card Frost Opacity Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={SECTION_LABEL}>{t('siteEditor.frostOpacityLabel')}</label>
                          <span className="text-xs font-mono font-bold text-[#7C3AED]">
                            {theme.cardFrostOpacity ?? 65}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="45"
                          max="98"
                          step="1"
                          value={theme.cardFrostOpacity ?? 65}
                          onChange={(e) => updateTheme({ cardFrostOpacity: Number(e.target.value) })}
                          className="studio-range-slider w-full"
                        />
                      </div>

                      {/* Specular Rim Highlight Toggle & Performance Tier */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center justify-between p-3.5 bg-white/80 rounded-2xl border border-purple-200/50">
                          <div>
                            <h4 className="text-xs font-bold text-[#0F172A]">{t('siteEditor.specularRimLabel')}</h4>
                          </div>
                          <input
                            type="checkbox"
                            checked={theme.specularRim ?? true}
                            onChange={(e) => updateTheme({ specularRim: e.target.checked })}
                            className="w-5 h-5 accent-[#7C3AED] cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className={SECTION_LABEL}>{t('siteEditor.perfTierLabel')}</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'auto', label: t('siteEditor.tierAuto') },
                              { id: 'high', label: t('siteEditor.tierHigh') },
                              { id: 'fast', label: t('siteEditor.tierFast') },
                            ].map((tier) => {
                              const isSelected = (theme.perfTier || 'auto') === tier.id;
                              return (
                                <button
                                  key={tier.id}
                                  type="button"
                                  onClick={() => updateTheme({ perfTier: tier.id as PerfTier })}
                                  className={`p-2 rounded-xl text-[11px] font-bold border text-center ${
                                    isSelected ? OPTION_SELECTED : OPTION_IDLE
                                  }`}
                                >
                                  {tier.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: BACKGROUND & GRID */}
                {activeTab === 'background' && (
                  <div className="space-y-6">
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.backgroundPresetsLabel')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {backgroundPresets.map((bg) => {
                          const isSelected = theme.background === bg.id;
                          return (
                            <button
                              key={bg.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ background: bg.id })}
                              className={`p-4 rounded-3xl border text-left whitespace-normal flex flex-col justify-between ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                  {bg.name}
                                </h4>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-white text-[#7C3AED] flex items-center justify-center font-bold">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs mb-3 ${isSelected ? 'text-white/90' : 'text-[#475569]'}`}>
                                {bg.desc}
                              </p>
                              <div
                                className="h-12 rounded-2xl border border-black/10 shadow-inner"
                                style={{ background: bg.previewGrad }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3-Stop Custom Gradient Controls */}
                    <div className="p-5 rounded-3xl bg-purple-50/50 border border-purple-200/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                            {t('siteEditor.custom3StopGradientTitle')}
                          </h4>
                          <p className="text-[11px] text-[#475569]">{t('siteEditor.custom3StopGradientDesc')}</p>
                        </div>
                        <button
                          type="button"
                          aria-pressed={theme.background === 'custom'}
                          onClick={() => updateTheme({ background: 'custom' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            theme.background === 'custom'
                              ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                              : 'bg-white text-[#475569] border-purple-200 hover:text-[#0F172A]'
                          }`}
                        >
                          {t('siteEditor.useCustom')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-purple-100">
                          <span className="text-xs font-bold text-[#334155]">Stop 1</span>
                          <input
                            type="color"
                            value={theme.bgGradientStop1 || '#B18CFE'}
                            onChange={(e) => updateTheme({ bgGradientStop1: e.target.value, background: 'custom' })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-purple-100">
                          <span className="text-xs font-bold text-[#334155]">Stop 2</span>
                          <input
                            type="color"
                            value={theme.bgGradientStop2 || '#93C5FD'}
                            onChange={(e) => updateTheme({ bgGradientStop2: e.target.value, background: 'custom' })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-purple-100">
                          <span className="text-xs font-bold text-[#334155]">Stop 3</span>
                          <input
                            type="color"
                            value={theme.bgGradientStop3 || '#6EE7B7'}
                            onChange={(e) => updateTheme({ bgGradientStop3: e.target.value, background: 'custom' })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={SECTION_LABEL}>{t('siteEditor.gradientAngleLabel')}</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['135deg', '180deg', '90deg', 'radial'] as const).map((angle) => {
                            const isSelected = (theme.bgGradientAngle || '135deg') === angle;
                            return (
                              <button
                                key={angle}
                                type="button"
                                onClick={() => updateTheme({ bgGradientAngle: angle, background: 'custom' })}
                                className={`p-2 rounded-xl text-xs font-bold border text-center ${
                                  isSelected ? OPTION_SELECTED : OPTION_IDLE
                                }`}
                              >
                                {angle}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stationery Grid Controls */}
                    <div className="p-5 rounded-3xl bg-purple-50/50 border border-purple-200/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                          <Grid className="w-4 h-4 text-[#7C3AED]" />
                          <span>{t('siteEditor.gridHeading')}</span>
                        </h4>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs font-bold text-[#334155]">{t('siteEditor.gridToggleLabel')}</span>
                          <input
                            type="checkbox"
                            checked={theme.gridEnabled ?? true}
                            onChange={(e) => updateTheme({ gridEnabled: e.target.checked })}
                            className="w-5 h-5 accent-[#7C3AED] cursor-pointer"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={SECTION_LABEL}>{t('siteEditor.gridTypeLabel')}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'lines', label: t('siteEditor.gridLines') },
                              { id: 'dots', label: t('siteEditor.gridDots') },
                            ].map((g) => {
                              const isSelected = (theme.gridType || 'lines') === g.id;
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => updateTheme({ gridType: g.id as GridType })}
                                  className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                                    isSelected ? OPTION_SELECTED : OPTION_IDLE
                                  }`}
                                >
                                  {g.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={SECTION_LABEL}>{t('siteEditor.gridOpacityLabel')}</label>
                            <span className="text-xs font-mono font-bold text-[#7C3AED]">
                              {theme.gridOpacity ?? 7}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            step="1"
                            value={theme.gridOpacity ?? 7}
                            onChange={(e) => updateTheme({ gridOpacity: Number(e.target.value) })}
                            className="studio-range-slider w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: COLORS & SURFACE MODE */}
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    {/* Surface Mode Toggle */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.surfaceModeHeading')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {[
                          {
                            id: 'light',
                            label: t('siteEditor.surfaceLight'),
                            desc: t('siteEditor.surfaceLightDesc'),
                            icon: <Sun className="w-5 h-5 text-amber-500" />,
                          },
                          {
                            id: 'dark',
                            label: t('siteEditor.surfaceDark'),
                            desc: t('siteEditor.surfaceDarkDesc'),
                            icon: <Moon className="w-5 h-5 text-indigo-400" />,
                          },
                        ].map((mode) => {
                          const isSelected = (theme.surfaceMode || 'light') === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ surfaceMode: mode.id as SurfaceMode })}
                              className={`p-4 rounded-3xl border text-left whitespace-normal flex items-start gap-3 ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-white shadow-sm shrink-0 mt-0.5">
                                {mode.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                    {mode.label}
                                  </h4>
                                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                                </div>
                                <p className={`text-xs mt-1 ${isSelected ? 'text-white/90' : 'text-[#475569]'}`}>
                                  {mode.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Accent Color Palettes */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.accentColorLabel')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {colorPalettes.map((cp) => {
                          const isSelected = theme.colorScheme === cp.id;
                          return (
                            <button
                              key={cp.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ colorScheme: cp.id, primaryAccentColor: cp.hex })}
                              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className="w-6 h-6 rounded-full shadow-sm border border-black/10 shrink-0"
                                  style={{ background: cp.hex }}
                                />
                                <span className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                  {cp.name}
                                </span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Primary & Secondary Color Pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-3xl bg-white border border-purple-200/50 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A]">{t('siteEditor.customColorTitle')}</h4>
                          <span className="font-mono text-xs font-bold text-[#7C3AED]">
                            {theme.primaryAccentColor || theme.customPrimaryColor || '#7C3AED'}
                          </span>
                        </div>
                        <input
                          type="color"
                          value={theme.primaryAccentColor || theme.customPrimaryColor || '#7C3AED'}
                          onChange={(e) => updateTheme({ primaryAccentColor: e.target.value, customPrimaryColor: e.target.value, colorScheme: 'custom' })}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-purple-200/50 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A]">{t('siteEditor.secondaryAccentLabel')}</h4>
                          <span className="font-mono text-xs font-bold text-[#10B981]">
                            {theme.secondaryAccentColor || theme.mintColor || '#10B981'}
                          </span>
                        </div>
                        <input
                          type="color"
                          value={theme.secondaryAccentColor || theme.mintColor || '#10B981'}
                          onChange={(e) => updateTheme({ secondaryAccentColor: e.target.value, mintColor: e.target.value })}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    </div>

                    {/* Button Style Selector */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.buttonStyleLabel')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'solid', label: t('siteEditor.buttonStyleSolid') },
                          { id: 'gradient', label: t('siteEditor.buttonStyleGradient') },
                          { id: 'outline', label: t('siteEditor.buttonStyleOutline') },
                        ].map((btn) => {
                          const isSelected = (theme.buttonStyle || 'gradient') === btn.id;
                          return (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() => updateTheme({ buttonStyle: btn.id as ButtonStyle })}
                              className={`p-3 rounded-2xl border text-center ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {btn.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: TYPOGRAPHY */}
                {activeTab === 'font' && (
                  <div className="space-y-6">
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.fontLabel')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fontOptions.map((f) => {
                          const isSelected = theme.font === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ font: f.id })}
                              className={`p-4 rounded-2xl border text-left whitespace-normal flex items-center justify-between ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <div>
                                <h4
                                  className={`text-base font-bold ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}
                                  style={{ fontFamily: f.family }}
                                >
                                  {f.name}
                                </h4>
                                <p
                                  className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-[#475569]'}`}
                                  style={{ fontFamily: f.family }}
                                >
                                  Aa Bb Cc 123
                                </p>
                              </div>
                              {isSelected && <Check className="w-5 h-5 text-white shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Heading Style */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.headingStyleLabel')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'clean', label: t('siteEditor.headingClean') },
                          { id: 'sticker', label: t('siteEditor.headingSticker') },
                          { id: 'gradient', label: t('siteEditor.headingGradient') },
                        ].map((hs) => {
                          const isSelected = (theme.headingStyle || 'clean') === hs.id;
                          return (
                            <button
                              key={hs.id}
                              type="button"
                              onClick={() => updateTheme({ headingStyle: hs.id as HeadingStyle })}
                              className={`p-3 rounded-2xl border text-center ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {hs.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Scale */}
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.fontScaleLabel')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: '95', label: '95%' },
                          { id: '100', label: '100%' },
                          { id: '105', label: '105%' },
                        ].map((scale) => {
                          const isSelected = (theme.fontScale || '100') === scale.id;
                          return (
                            <button
                              key={scale.id}
                              type="button"
                              onClick={() => updateTheme({ fontScale: scale.id as FontScale })}
                              className={`p-3 rounded-2xl border text-center ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {scale.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: BRAND & SECTION VISIBILITY TOGGLES */}
                {activeTab === 'visibility' && (
                  <div className="space-y-6">
                    <label className={SECTION_LABEL}>{t('siteEditor.visibilityHeading')}</label>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'showOfficialBanner',
                          label: t('siteEditor.toggleOfficialBanner'),
                          desc: t('siteEditor.toggleOfficialBannerDesc'),
                          val: theme.showOfficialBanner ?? true,
                        },
                        {
                          key: 'showRegistrationIntro',
                          label: t('siteEditor.toggleRegistrationIntro'),
                          desc: t('siteEditor.toggleRegistrationIntroDesc'),
                          val: theme.showRegistrationIntro ?? true,
                        },
                        {
                          key: 'showWhatsAppHotline',
                          label: t('siteEditor.toggleWhatsAppHotline'),
                          desc: t('siteEditor.toggleWhatsAppHotlineDesc'),
                          val: theme.showWhatsAppHotline ?? false,
                        },
                        {
                          key: 'showMemberStats',
                          label: t('siteEditor.toggleMemberStats'),
                          desc: t('siteEditor.toggleMemberStatsDesc'),
                          val: theme.showMemberStats ?? true,
                        },
                        {
                          key: 'registrationOpen',
                          label: t('siteEditor.toggleRegistrationOpen'),
                          desc: t('siteEditor.toggleRegistrationOpenDesc'),
                          val: theme.registrationOpen ?? true,
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="p-4 rounded-2xl bg-white border border-purple-200/50 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">{item.label}</h4>
                            <p className="text-[11px] text-[#475569] mt-0.5">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={item.val}
                            onChange={(e) => updateTheme({ [item.key]: e.target.checked } as Partial<typeof theme>)}
                            className="w-5 h-5 accent-[#7C3AED] cursor-pointer shrink-0"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Logo & Emblem Customization */}
                    <div className="pt-4 border-t border-purple-100 space-y-4">
                      <label className={SECTION_LABEL}>{t('siteEditor.emblemLabel')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {emblemOptions.map((emblem) => {
                          const isSelected = theme.logo.emblemType === emblem.id;
                          return (
                            <button
                              key={emblem.id}
                              type="button"
                              onClick={() => updateTheme({ logo: { ...theme.logo, emblemType: emblem.id } })}
                              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
                              }`}
                            >
                              {emblem.icon}
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                                {emblem.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-purple-100 flex items-center justify-between gap-3 bg-slate-50/90">
              <span className="text-xs text-[#334155] font-semibold flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] shrink-0" />
                <span>{t('siteEditor.autoSaveNotice')}</span>
              </span>

              <button
                type="button"
                onClick={closeEditor}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-purple-500/25 pressable shrink-0"
              >
                {t('siteEditor.doneClose')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
