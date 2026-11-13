import { lazy, Suspense, type ReactNode } from 'react';

// Loaded after the first paint, so the refraction engine never delays startup; the CSS glass shows until then
const LiquidGlass = lazy(() => import('quick-liquid/react').then((m) => ({ default: m.LiquidGlass })));

interface FloatingGlassProps {
  className?: string;
  children: ReactNode;
  borderRadius?: number;
  material?: 'clear' | 'thin' | 'regular' | 'thick' | 'ultra' | 'adaptive';
  tintOpacity?: number;
}

/**
 * Ultra-optimized liquid glass container powered by quick-liquid with physical rim lighting & refraction.
 * Applied across the entire site with full blur enabled on all devices and VMs.
 */
export default function FloatingGlass({
  className = '',
  children,
  borderRadius = 22,
  material = 'regular',
  tintOpacity = 0.55,
}: FloatingGlassProps) {
  const cssGlass = <div className={`glass-pill ${className}`}>{children}</div>;
  return (
    <Suspense fallback={cssGlass}>
      <LiquidGlass
        config={{
          material,
          appearance: 'dark',
          tint: '22, 22, 27',
          tintOpacity,
          borderRadius,
          quality: 'medium',
        }}
        className={`border border-white/10 ${className}`}
      >
        {children}
      </LiquidGlass>
    </Suspense>
  );
}
