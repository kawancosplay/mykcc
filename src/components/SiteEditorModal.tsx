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
import { haptic } from '../lib/haptic';
import {
  LAYOUT_IDS,
  usePresenceMotion,
  useScrollLock,
  useSheetDrag,
  useThumbTransition,
} from '../lib/motion';

type EditorTab = 'layout' | 'background' | 'colors' | 'font' | 'logo';
/** Tab order (left to right in LTR), used for the direction of the content slide. */
const EDITOR_TAB_ORDER: readonly EditorTab[] = ['layout', 'background', 'colors', 'font', 'logo'];

// Option tiles: selected = purple accent, idle = recessed glass well
const OPTION_SELECTED = 'bg-purple-950/60 border-purple-400 shadow-md ring-1 ring-purple-400';
const OPTION_IDLE = 'glass-well hover:border-white/20';
const SECTION_LABEL = 'block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2';

export const SiteEditorModal: React.FC = () => {
  const { t, isRtl } = useI18n();
  const { theme, updateTheme, resetTheme, isEditorOpen, setIsEditorOpen, saveError, clearSaveError } = useSiteTheme();
  const [activeTab, setActiveTab] = useState<EditorTab>('layout');
  // Direction of the last tab change for the content slide: 1 = in from the right, -1 = from the left
  const [tabDirection, setTabDirection] = useState(0);
  const titleId = useId();

  // Closing never loses anything (see below), so a swipe down on the header may close the sheet too
  const closeEditor = useCallback(() => setIsEditorOpen(false), [setIsEditorOpen]);
  useScrollLock(isEditorOpen);
  const overlayMotion = usePresenceMotion('overlay');
  const sheetMotion = usePresenceMotion('sheet');
  const tabMotion = usePresenceMotion('tab');
  const thumbTransition = useThumbTransition();
  const drag = useSheetDrag(closeEditor);

  // Changes are saved as they are made, so Escape can close the editor like the close button
  useEffect(() => {
    if (!isEditorOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditorOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen, setIsEditorOpen]);

  // Reopening shows the last tab without a content slide (the sheet itself is animating in)
  useEffect(() => {
    if (!isEditorOpen) setTabDirection(0);
  }, [isEditorOpen]);

  const selectTab = (tab: EditorTab) => {
    if (tab === activeTab) return;
    // A later tab sits to the right in LTR (to the left in RTL): its content slides in from that side
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

  const editorTabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'layout', label: t('siteEditor.tabLayout'), icon: <Layout className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'background', label: t('siteEditor.tabBackground'), icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'colors', label: t('siteEditor.tabColors'), icon: <Palette className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'font', label: t('siteEditor.tabFont'), icon: <Type className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'logo', label: t('siteEditor.tabLogo'), icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  // Bottom sheet on phones, centered dialog from 640px. Portaled to <body> so no transformed or z-indexed
  // ancestor can trap it; z-[100] / z-[101] keep it above every other overlay as before. AnimatePresence
  // keeps it mounted until the exit animation (slide down / fade) has finished.
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
            className="glass-sheet sm:max-w-4xl"
            {...sheetMotion}
            {...drag.sheetProps}
          >
            {/* Top Header (also the drag handle on phones: grabber + title area, buttons excluded) */}
            <div className="sheet-handle border-b border-white/10" {...drag.handleProps}>
              <div className="sheet-grabber" aria-hidden="true" />
              <div className="px-4 sm:px-6 pt-1 pb-4 sm:pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 id={titleId} className="text-base sm:text-lg font-black text-white">
                      {t('siteEditor.editorTitle')}
                    </h2>
                    <p className="text-xs text-purple-200/80">
                      {t('siteEditor.editorDesc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={resetTheme}
                    className="glass-button pressable px-3 text-xs"
                    title={t('siteEditor.resetTitle')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('siteEditor.resetDefault')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeEditor}
                    aria-label={t('common.close')}
                    title={t('common.close')}
                    className="glass-icon-button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Navigation Tabs (segmented control, scrolls sideways on narrow screens). The active
                thumb slides between tabs (shared layoutId); layoutScroll keeps it right when scrolled. */}
            <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/10">
              <motion.div
                role="tablist"
                aria-label={t('siteEditor.editorTitle')}
                className="glass-segmented glass-segmented-scroll"
                layoutScroll
              >
                {editorTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectTab(tab.id)}
                      className="glass-segment"
                    >
                      {/* borderRadius is set inline (same value as the CSS) so framer-motion keeps the pill
                          round while the thumb scales between tabs of different widths */}
                      {isActive && (
                        <motion.span
                          layoutId={LAYOUT_IDS.siteEditorTabs}
                          className="glass-segment-thumb"
                          style={{ borderRadius: 9999 }}
                          transition={thumbTransition}
                          aria-hidden="true"
                        />
                      )}
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </div>

            {/* Save error (only a signed-in admin can save site settings) */}
            {saveError && (
              <div
                role="alert"
                className="shrink-0 mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start justify-between gap-3"
              >
                <span>{t('siteEditor.saveFailed', { error: saveError })}</span>
                <button
                  type="button"
                  onClick={clearSaveError}
                  aria-label={t('common.close')}
                  title={t('common.close')}
                  className="touch-target p-1 rounded-lg hover:bg-rose-900/60 text-rose-300 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab Body. The keyed wrapper re-mounts per tab and slides the new content in from the side of
                the chosen tab (no exit: the old tab is gone at once). overflow-x-hidden: the 16px slide
                must not flash a horizontal scrollbar. Opacity + translate only, no fixed children inside. */}
            <div className="glass-scroll overflow-x-hidden p-4 sm:p-6 space-y-6">
              <motion.div
                key={activeTab}
                custom={tabDirection}
                {...tabMotion}
                initial={tabDirection === 0 ? false : tabMotion.initial}
              >
                {/* TAB 1: LAYOUT */}
                {activeTab === 'layout' && (
                  <div className="space-y-6">
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.layoutWidthLabel')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: '7xl', label: t('siteEditor.widthNormal'), desc: t('siteEditor.widthNormalDesc') },
                          { id: '6xl', label: t('siteEditor.widthCompact'), desc: t('siteEditor.widthCompactDesc') },
                          { id: 'full', label: t('siteEditor.widthFull'), desc: t('siteEditor.widthFullDesc') },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={theme.layoutWidth === opt.id}
                            onClick={() => updateTheme({ layoutWidth: opt.id as LayoutWidth })}
                            className={`pressable-soft p-4 rounded-2xl border text-left whitespace-normal ${
                              theme.layoutWidth === opt.id ? OPTION_SELECTED : OPTION_IDLE
                            }`}
                          >
                            <h4 className="font-bold text-white text-xs sm:text-sm">{opt.label}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.navbarStyleLabel')}</label>
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
                            type="button"
                            aria-pressed={theme.navbarStyle === opt.id}
                            onClick={() => updateTheme({ navbarStyle: opt.id as NavbarStyle })}
                            className={`pressable-soft p-4 rounded-2xl border text-left whitespace-normal ${
                              theme.navbarStyle === opt.id ? OPTION_SELECTED : OPTION_IDLE
                            }`}
                          >
                            <h4 className="font-bold text-white text-xs sm:text-sm">{opt.label}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.cardRadiusLabel')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'rounded-3xl', label: t('siteEditor.radius3xl'), preview: 'rounded-3xl' },
                          { id: 'rounded-2xl', label: t('siteEditor.radius2xl'), preview: 'rounded-2xl' },
                          { id: 'rounded-xl', label: t('siteEditor.radiusXl'), preview: 'rounded-xl' },
                          { id: 'rounded-lg', label: t('siteEditor.radiusLg'), preview: 'rounded-lg' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={theme.cardRadius === opt.id}
                            onClick={() => updateTheme({ cardRadius: opt.id as CardRadius })}
                            className={`pressable-soft p-3.5 border text-center ${opt.preview} ${
                              theme.cardRadius === opt.id
                                ? 'bg-purple-950/60 border-purple-400 ring-1 ring-purple-400'
                                : OPTION_IDLE
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
                  <div className="space-y-6">
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
                            className={`pressable-soft w-full p-4 rounded-3xl border text-left whitespace-normal flex flex-col justify-between ${
                              isSelected
                                ? 'bg-purple-950/40 border-purple-400 shadow-xl ring-2 ring-purple-400'
                                : 'glass-well hover:border-purple-500/40'
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
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom CSS gradient option */}
                    <div className="glass-well p-4 rounded-3xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {t('siteEditor.customGradientTitle')}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {t('siteEditor.customGradientDesc')}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-pressed={theme.background === 'custom'}
                          onClick={() => updateTheme({ background: 'custom' })}
                          className={`glass-button pressable px-3 text-xs font-bold shrink-0 ${
                            theme.background === 'custom' ? 'bg-purple-600 border-purple-400/60 text-white' : ''
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
                        className="w-full glass-input font-mono text-purple-200 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: COLORS */}
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    <label className={SECTION_LABEL}>{t('siteEditor.accentColorLabel')}</label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                      {colorPalettes.map((cp) => {
                        const isSelected = theme.colorScheme === cp.id;
                        return (
                          <button
                            key={cp.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => updateTheme({ colorScheme: cp.id })}
                            className={`pressable-soft p-4 rounded-2xl border text-left flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-950/40 border-white shadow-xl ring-2 ring-purple-400'
                                : OPTION_IDLE
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-7 h-7 rounded-full shadow-md border border-white/20 shrink-0"
                                style={{ background: cp.hex }}
                              ></div>
                              <span className="font-bold text-xs sm:text-sm text-white truncate">{cp.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="glass-well p-4 rounded-3xl flex items-center justify-between flex-wrap gap-3">
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
                          className="w-11 h-11 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          aria-label={t('siteEditor.customColorTitle')}
                          value={theme.customPrimaryColor || '#a855f7'}
                          onChange={(e) => updateTheme({ customPrimaryColor: e.target.value, colorScheme: 'custom' })}
                          className="w-28 glass-input px-3 font-mono text-base sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: FONT */}
                {activeTab === 'font' && (
                  <div className="space-y-6">
                    <label className={SECTION_LABEL}>{t('siteEditor.fontLabel')}</label>

                    <div className="space-y-3">
                      {fontOptions.map((f) => {
                        const isSelected = theme.font === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => updateTheme({ font: f.id })}
                            className={`pressable-soft w-full p-4 rounded-2xl border text-left whitespace-normal flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-950/60 border-purple-400 shadow-md ring-2 ring-purple-400'
                                : 'glass-well hover:border-purple-500/30'
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
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 5: LOGO */}
                {activeTab === 'logo' && (
                  <div className="space-y-6">
                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.logoTextLabel')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">{t('siteEditor.logoTitleLabel')}</label>
                          <input
                            type="text"
                            value={theme.logo.title}
                            onChange={(e) => updateTheme({ logo: { ...theme.logo, title: e.target.value } })}
                            placeholder="KawanCosplay"
                            aria-label={t('siteEditor.logoTitleLabel')}
                            className="w-full glass-input text-base sm:text-sm"
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
                            className="w-full glass-input text-base sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={SECTION_LABEL}>{t('siteEditor.emblemLabel')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {emblemOptions.map((emblem) => {
                          const isSelected = theme.logo.emblemType === emblem.id;
                          return (
                            <button
                              key={emblem.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateTheme({ logo: { ...theme.logo, emblemType: emblem.id } })}
                              className={`pressable-soft p-3.5 rounded-2xl border text-left flex items-center gap-2.5 ${
                                isSelected ? OPTION_SELECTED : OPTION_IDLE
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
                      <label className={SECTION_LABEL}>{t('siteEditor.customLogoLabel')}</label>
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
                        className="w-full glass-input text-base sm:text-sm"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        {t('siteEditor.customLogoHint')}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Modal Bottom Footer with Close & Save Confirmation */}
            <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-purple-300 font-semibold flex items-center gap-1.5 min-w-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('siteEditor.autoSaveNotice')}</span>
              </span>

              <button
                type="button"
                onClick={closeEditor}
                className="btn-primary pressable px-5 text-xs sm:text-sm shrink-0"
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
