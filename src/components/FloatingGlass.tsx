import { lazy, Suspense, type ReactNode } from 'react';
import { usePerfMode } from '../lib/perfMode';

// Loaded after the first paint, so the refraction engine never delays startup; the CSS glass shows until then
const LiquidGlass = lazy(() => import('quick-liquid/react').then((m) => ({ default: m.LiquidGlass })));

interface FloatingGlassProps {
  className: string;
  children: ReactNode;
}

/**
 * A bar that floats over scrolling content (the form's submit bar, the profile's save bar). Real liquid
 * refraction (QuickLiquid) only here: on a calm page background it would be invisible, and it costs GPU
 * time on every scroll frame, so cards keep the plain CSS glass. Lite mode and other browsers than
 * Chromium get the CSS glass / QuickLiquid's own frosted fallback.
 */
export default function FloatingGlass({ className, children }: FloatingGlassProps) {
  const { lite } = usePerfMode();
  const cssGlass = <div className={`glass-pill ${className}`}>{children}</div>;
  if (lite) return cssGlass;
  return (
    <Suspense fallback={cssGlass}>
      <LiquidGlass
        config={{
          material: 'regular',
          appearance: 'dark',
          tint: '22, 22, 27',
          tintOpacity: 0.55,
          borderRadius: 22,
          quality: 'medium',
        }}
        className={`border border-white/10 ${className}`}
      >
        {children}
      </LiquidGlass>
    </Suspense>
  );
}
