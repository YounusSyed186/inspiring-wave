import * as React from 'react';

export interface UseCarouselGesturesOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  targetPosition: number;
  enabled: boolean;
  onDragOffset: (offsetSteps: number) => void;
  onDragCommit: (nextTargetPosition: number) => void;
}

/**
 * Touch & pointer vertical swipe controller for the infinite orbital card deck.
 * Supports smooth unbounded dragging and nearest-project snapping on release.
 */
export function useCarouselGestures({
  containerRef,
  targetPosition,
  enabled,
  onDragOffset,
  onDragCommit,
}: UseCarouselGesturesOptions) {
  const dragRef = React.useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    startX: 0,
    engaged: false,
    deltaSteps: 0,
  });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const DRAG_UNIT_PX = 130;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const d = dragRef.current;
      d.active = true;
      d.pointerId = e.pointerId;
      d.startY = e.clientY;
      d.startX = e.clientX;
      d.engaged = false;
      d.deltaSteps = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || e.pointerId !== d.pointerId) return;

      const dy = e.clientY - d.startY;
      const dx = e.clientX - d.startX;

      if (!d.engaged) {
        if (Math.abs(dy) < 10) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          d.active = false;
          return;
        }
        d.engaged = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Ignore if unavailable
        }
      }

      // Swiping up (dy < 0) advances forward (+steps)
      d.deltaSteps = Math.max(-2.5, Math.min(2.5, -dy / DRAG_UNIT_PX));
      onDragOffset(d.deltaSteps);
    };

    const finishDrag = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || e.pointerId !== d.pointerId) return;
      const wasEngaged = d.engaged;
      const steps = d.deltaSteps;
      d.active = false;
      d.engaged = false;
      d.deltaSteps = 0;

      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }

      if (!wasEngaged) return;

      const threshold = 0.22;
      let delta = 0;
      if (steps > threshold) delta = Math.round(Math.max(1, steps));
      else if (steps < -threshold) delta = Math.round(Math.min(-1, steps));

      onDragCommit(targetPosition + delta);
    };

    el.addEventListener('pointerdown', onPointerDown, { passive: true });
    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerup', finishDrag, { passive: true });
    el.addEventListener('pointercancel', finishDrag, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', finishDrag);
      el.removeEventListener('pointercancel', finishDrag);
    };
  }, [containerRef, targetPosition, enabled, onDragOffset, onDragCommit]);
}
