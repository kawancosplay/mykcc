import FloatingGlass from './FloatingGlass';
import { KCC_HEADER_LOGO } from './KawanCosplayLogo';

/**
 * The member card a new member receives, drawn like a convention badge on a lanyard: the registration
 * page's one visual moment. Decorative (the form says the same in words), so hidden from screen readers.
 * The KCC ID is set like every KCC ID on the site: mono, two groups of four.
 */
export default function KccBadgePreview({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative w-44 rotate-3 ${className}`}>
      <FloatingGlass
        borderRadius={16}
        material="regular"
        tintOpacity={0.88}
        className="relative w-full rounded-2xl bg-zinc-100/95 p-4 pt-6 text-zinc-900 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]"
      >
        <span className="absolute left-1/2 top-2.5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-zinc-900/80"></span>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-zinc-900 p-1">
            <img src={KCC_HEADER_LOGO.src} alt="" width={28} height={28} className="h-7 w-7" />
          </span>
          <span className="text-[11px] font-medium leading-tight text-zinc-700">KawanCosplay Community</span>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400"></div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-600">
          <span>KCC ID</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> PASS
          </span>
        </div>
        <div className="font-mono text-base tabular-nums tracking-wide text-zinc-900 font-semibold">•••• ••••</div>
      </FloatingGlass>
    </div>
  );
}
