import { lazy, Suspense, type ReactNode } from 'react';
import { useSiteTheme } from '../lib/themeContext';

const LiquidGlass = lazy(() => import('quick-liquid/react').then((m) => ({ default: m.LiquidGlass })));

interface FloatingGlassProps {
  className?: string;
  children: ReactNode;
  borderRadius?: number;
  material?: 'clear' | 'thin' | 'regular' | 'thick' | 'ultra' | 'adaptive';
  tintOpacity?: number;
}

/**
 * Crystal frosted liquid glass container powered by quick-liquid.
 * Configured in hardware CSS refraction mode (`refractionMode: 'css'`) with light frosted crystal material
 * (~65% translucent opacity, soft anime pastel sheen) staying lightning fast on VMware Ubuntu Linux and mobile devices.
 */
export default function FloatingGlass({
  className = '',
  children,
  borderRadius = 24,
  material,
  tintOpacity,
}: FloatingGlassProps) {
  const { theme } = useSiteTheme();
  const activeMaterial = material || theme.glassPreset || 'regular';
  const effectiveOpacity = tintOpacity ?? ((theme.cardFrostOpacity || 56) / 100);

  // Disable quick-liquid SVG displacement filters on coarse-pointer mobile devices
  // so the GPU never stalls when cards scroll under the header or floating submit bar.
  const isCoarseOrMobile = typeof window !== 'undefined' && (
    window.matchMedia('(pointer: coarse), (max-width: 768px)').matches ||
    Boolean(window.__KCC_PERF__?.autoLite) ||
    window.__KCC_PERF__?.pref === 'lite'
  );

  const cssGlass = (
    <div
      className={`glass-pill border border-white/80 bg-[rgba(255,255,255,0.72)] text-slate-900 shadow-[0_12px_36px_-8px_rgba(124,58,237,0.18)] backdrop-blur-[14px] ${className}`}
    >
      {children}
    </div>
  );

  if (isCoarseOrMobile) {
    return cssGlass;
  }

  return (
    <Suspense fallback={cssGlass}>
      <LiquidGlass
        config={{
          material: activeMaterial,
          appearance: 'light',
          tint: '255, 255, 255',
          tintOpacity: effectiveOpacity,
          borderRadius,
          quality: 'low',
          refractionMode: 'css',
          respectPreferences: true,
        }}
        className={`border border-white/80 bg-[rgba(255,255,255,0.72)] text-slate-900 shadow-[0_12px_36px_-8px_rgba(124,58,237,0.18)] ${className}`}
      >
        {children}
      </LiquidGlass>
    </Suspense>
  );
}
