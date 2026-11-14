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
  tintOpacity = 0.90,
}: FloatingGlassProps) {
  const { theme } = useSiteTheme();
  const activeMaterial = material || theme.glassPreset || 'regular';
  const effectiveOpacity = Math.max(0.90, (theme.cardFrostOpacity || 90) / 100);

  const cssGlass = (
    <div
      className={`glass-pill border border-white/85 bg-[rgba(255,255,255,0.92)] text-slate-900 shadow-[0_16px_40px_-8px_rgba(124,58,237,0.18)] backdrop-blur-[14px] ${className}`}
    >
      {children}
    </div>
  );

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
        className={`border border-white/85 bg-[rgba(255,255,255,0.92)] text-slate-900 shadow-[0_16px_40px_-8px_rgba(124,58,237,0.18)] ${className}`}
      >
        {children}
      </LiquidGlass>
    </Suspense>
  );
}
