import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './Navbar';
import type { NavbarProps } from './Navbar';
import { OfficialGovBanner } from './OfficialGovBanner';

export type StickyHeaderProps = Omit<NavbarProps, 'isVisible' | 'isMobileMenuOpen' | 'onMobileMenuToggle'>;

/*
 * Public sticky header: ONE glass surface (painted on ::before, so the mobile menu's fixed overlay inside
 * is not trapped) for the gov banner + navbar, extended under the notch / status bar.
 *
 * Perf (F8): the scroll listener, the hide/show state and the mobile-menu state live HERE, so a change
 * of scroll direction re-renders only the header, never App or the registration form. Hidden by
 * translating it up (transform only, 300 ms; instant in lite mode via `.sticky-header` in index.css),
 * and only while the mobile menu is closed.
 */
export const StickyHeader = React.memo(function StickyHeader(props: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prevScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isMobileMenuOpen || ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const prev = prevScrollYRef.current;

        if (currentScrollY <= 20) {
          // Near the top: always visible
          setIsVisible(true);
        } else if (currentScrollY > prev + 15 && currentScrollY > 100) {
          // Significant scroll down
          setIsVisible(false);
        } else if (currentScrollY < prev - 10) {
          // Scroll up
          setIsVisible(true);
        }

        prevScrollYRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const handleMobileMenuToggle = useCallback((open: boolean) => {
    setIsMobileMenuOpen(open);
    if (open) setIsVisible(true);
  }, []);

  const hidden = !isMobileMenuOpen && !isVisible;

  return (
    <div
      className={`sticky-header sticky top-0 z-50 glass-bar pt-safe px-safe transition-[translate] duration-300 ease-ios ${
        hidden ? '-translate-y-full' : ''
      }`}
    >
      {/* Official Government-Style Verification Header */}
      <OfficialGovBanner currentLang={props.currentLang} />

      {/* Main Navbar */}
      <Navbar
        {...props}
        isVisible={isVisible}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
    </div>
  );
});
