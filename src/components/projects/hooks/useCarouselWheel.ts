import * as React from 'react';

export interface UseCarouselWheelOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  onStep: (delta: -1 | 1) => void;
}

/**
 * Localized infinite-orbit wheel handler attached ONLY to `.iwp-orbit-viewport`.
 * Normalizes mouse-wheel & trackpad deltas, advances one step per deliberate gesture,
 * and releases sustained continuous scrolling to normal page navigation after 3 consecutive
 * steps so visitors are never trapped inside the infinite loop.
 */
export function useCarouselWheel({ containerRef, enabled, onStep }: UseCarouselWheelOptions) {
  const stateRef = React.useRef({
    accumulated: 0,
    lockedUntil: 0,
    lastEventAt: 0,
    lastDirection: 0 as -1 | 0 | 1,
    consecutiveSteps: 0,
    escapeUntil: 0,
  });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const THRESHOLD = 52;
    const STEP_LOCK_MS = 460;
    const RESET_IDLE_MS = 280;
    const BURST_CAP = 3;
    const ESCAPE_WINDOW_MS = 900;

    const handleWheel = (e: WheelEvent) => {
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= 400;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.15) return;
      if (Math.abs(dy) < 0.5) return;

      const now = performance.now();
      const st = stateRef.current;
      const dir: -1 | 1 = dy > 0 ? 1 : -1;

      // Reset burst counter if user paused or reversed direction
      if (now - st.lastEventAt > ESCAPE_WINDOW_MS || (st.lastDirection !== 0 && st.lastDirection !== dir)) {
        st.consecutiveSteps = 0;
        st.escapeUntil = 0;
      }

      // Sustained continuous scrolling in one direction releases to page scroll
      if (now < st.escapeUntil || st.consecutiveSteps >= BURST_CAP) {
        st.escapeUntil = now + 450;
        st.lastEventAt = now;
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (now < st.lockedUntil) {
        st.lastEventAt = now;
        return;
      }

      if (now - st.lastEventAt > RESET_IDLE_MS) {
        st.accumulated = 0;
      }
      st.lastEventAt = now;
      st.lastDirection = dir;
      st.accumulated += dy;

      if (Math.abs(st.accumulated) >= THRESHOLD) {
        st.accumulated = 0;
        st.lockedUntil = now + STEP_LOCK_MS;
        st.consecutiveSteps += 1;
        onStep(dir);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, enabled, onStep]);
}
