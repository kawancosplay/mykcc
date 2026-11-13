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
 * Substantial, dense iOS thick frosted glass container powered by quick-liquid.
 * Configured in hardware CSS refraction mode (`refractionMode: 'css'`) with thick iOS frosted material
 * (~82-86% opacity, dark plum tone) staying lightning fast on VMware Ubuntu Linux and mobile devices.
 */
export default function FloatingGlass({
  className = '',
  children,
  borderRadius = 22,
  material,
  tintOpacity = 0.82,
}: FloatingGlassProps) {
  const { theme } = useSiteTheme();
  const activeMaterial = material || theme.glassPreset || 'thick';

  const cssGlass = (
    <div
      className={`glass-pill border border-white/15 bg-[rgba(32,22,58,0.86)] text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-[20px] ${className}`}
    >
      {children}
    </div>
  );

  return (
    <Suspense fallback={cssGlass}>
      <LiquidGlass
        config={{
          material: activeMaterial,
          appearance: 'dark',
          tint: '32, 22, 58',
          tintOpacity,
          borderRadius,
          quality: 'low',
          refractionMode: 'css',
          respectPreferences: true,
        }}
        className={`border border-white/15 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] ${className}`}
      >
        {children}
      </LiquidGlass>
    </Suspense>
  );
}
