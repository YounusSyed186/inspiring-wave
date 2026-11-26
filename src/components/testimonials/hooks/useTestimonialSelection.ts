import { useCallback, useEffect, useRef, useState } from 'react';
import type { InspiringWaveTestimonial } from '../data/testimonials';

export type InteractionMode =
  | 'entering'
  | 'idle'
  | 'dragging'
  | 'turning'
  | 'transitioning'
  | 'paused';

export type TransitionDirection = 1 | -1;

export interface UseTestimonialSelectionOptions {
  items: InspiringWaveTestimonial[];
  inView: boolean;
  reducedMotion: boolean;
  autoplayDelayMs?: number;
}

export function useTestimonialSelection({
  items,
  inView,
  reducedMotion,
  autoplayDelayMs = 8600,
}: UseTestimonialSelectionOptions) {
  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<TransitionDirection>(1);
  const [mode, setMode] = useState<InteractionMode>(reducedMotion ? 'idle' : 'entering');
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [isContentPaused, setIsContentPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [transitionRevision, setTransitionRevision] = useState(0);

  const activeIndexRef = useRef(0);
  const modeRef = useRef<InteractionMode>(mode);
  const lastManualAtRef = useRef(0);
  const settleTimerRef = useRef<number>(0);

  activeIndexRef.current = activeIndex;
  modeRef.current = mode;

  // Browser tab visibility pause
  useEffect(() => {
    const onVis = () => setIsTabHidden(document.hidden);
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(settleTimerRef.current);
  }, []);

  const markEntranceComplete = useCallback(() => {
    setMode((prev) => (prev === 'entering' ? 'idle' : prev));
  }, []);

  const resetToEntering = useCallback(() => {
    if (reducedMotion) return;
    window.clearTimeout(settleTimerRef.current);
    setMode('entering');
  }, [reducedMotion]);

  const selectIndex = useCallback(
    (nextRaw: number, explicitDir?: TransitionDirection, source: 'manual' | 'auto' = 'manual') => {
      if (count <= 1) return;
      const next = ((nextRaw % count) + count) % count;
      const current = activeIndexRef.current;
      if (next === current) return;

      if (source === 'manual') {
        lastManualAtRef.current = performance.now();
      }

      const computedDir: TransitionDirection =
        explicitDir ??
        (next > current || (current === count - 1 && next === 0) ? 1 : -1);

      window.clearTimeout(settleTimerRef.current);
      setDirection(computedDir);
      setActiveIndex(next);
      setTransitionRevision((r) => r + 1);

      if (reducedMotion) {
        setMode('idle');
        return;
      }

      setMode('turning');
      settleTimerRef.current = window.setTimeout(() => {
        setMode('transitioning');
        settleTimerRef.current = window.setTimeout(() => {
          setMode((m) => (m === 'dragging' ? 'dragging' : isContentPaused ? 'paused' : 'idle'));
        }, 480);
      }, 320);
    },
    [count, isContentPaused, reducedMotion]
  );

  const selectNext = useCallback(
    (source: 'manual' | 'auto' = 'manual') => {
      selectIndex(activeIndexRef.current + 1, 1, source);
    },
    [selectIndex]
  );

  const selectPrev = useCallback(() => {
    selectIndex(activeIndexRef.current - 1, -1, 'manual');
  }, [selectIndex]);

  const selectById = useCallback(
    (id: string, source: 'manual' | 'auto' = 'manual') => {
      const idx = items.findIndex((item) => item.id === id);
      if (idx >= 0) selectIndex(idx, undefined, source);
    },
    [items, selectIndex]
  );

  const setDragging = useCallback(
    (dragging: boolean) => {
      if (dragging) {
        lastManualAtRef.current = performance.now();
        window.clearTimeout(settleTimerRef.current);
        setMode('dragging');
      } else {
        setMode(isContentPaused ? 'paused' : 'idle');
      }
    },
    [isContentPaused]
  );

  const setPausedByUser = useCallback((paused: boolean) => {
    setIsContentPaused(paused);
    setMode((prev) => {
      if (prev === 'dragging' || prev === 'entering' || prev === 'turning' || prev === 'transitioning') {
        return prev;
      }
      return paused ? 'paused' : 'idle';
    });
  }, []);

  // Restrained autoplay — pauses on hover, focus, drag, offscreen, hidden tab, or reduced motion
  useEffect(() => {
    if (
      reducedMotion ||
      count <= 1 ||
      !inView ||
      isTabHidden ||
      isContentPaused ||
      hoveredMarkerId !== null ||
      mode !== 'idle'
    ) {
      return;
    }

    const sinceManual = performance.now() - lastManualAtRef.current;
    const waitMs = sinceManual < 4000 ? autoplayDelayMs + 3200 : autoplayDelayMs;

    const timer = window.setTimeout(() => {
      if (modeRef.current === 'idle') {
        selectNext('auto');
      }
    }, waitMs);

    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    autoplayDelayMs,
    count,
    hoveredMarkerId,
    inView,
    isContentPaused,
    isTabHidden,
    mode,
    reducedMotion,
    selectNext,
  ]);

  return {
    activeIndex,
    activeTestimonial: items[activeIndex] ?? items[0],
    direction,
    mode,
    transitionRevision,
    hoveredMarkerId,
    setHoveredMarkerId,
    selectIndex,
    selectNext,
    selectPrev,
    selectById,
    setDragging,
    setPausedByUser,
    markEntranceComplete,
    resetToEntering,
  };
}
