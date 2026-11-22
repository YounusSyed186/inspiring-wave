import { useEffect, useRef } from 'react';
import { scrollMotion } from '@/motion/scroll-engine';

export function CustomScrollbar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const updateProgress = (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      el.style.transform = `scaleX(${clamped})`;
    };

    // 1. Listen to scrollMotion engine (synchronized with Lenis and GSAP ticker)
    const unsubscribe = scrollMotion.subscribe((state) => {
      updateProgress(state.scrollProgress);
    });

    // 2. Direct window scroll & resize listener for immediate updates
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        updateProgress(window.scrollY / docHeight);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[10001] pointer-events-none overflow-hidden"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-[#05df72] via-[#00e676] to-[#d8f03c] origin-left shadow-[0_0_12px_rgba(0,230,118,0.75)] will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}

export default CustomScrollbar;
