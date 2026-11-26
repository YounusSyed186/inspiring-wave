import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  calculateDesktopOrbitPose,
  calculateMobileOrbitPose,
  getWrappedOffset,
} from './orbitGeometry';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type CarouselMode = 'initializing' | 'entering' | 'idle' | 'dragging' | 'transitioning';

export interface UseProjectOrbitOptions {
  sectionRef: React.RefObject<HTMLElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  cardRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  targetPosition: number;
  count: number;
  reducedMotion: boolean;
}

/**
 * Single authoritative GSAP orbital position controller.
 * Animates one unbounded continuous `position` value (e.g. ... -1, 0, 1, ..., 9, 10, 11 ...)
 * so Project 10 wraps seamlessly into Project 01 (and vice-versa) with zero resets.
 */
export function useProjectOrbit({
  sectionRef,
  viewportRef,
  cardRefs,
  targetPosition,
  count,
  reducedMotion,
}: UseProjectOrbitOptions) {
  const stateRef = React.useRef({
    position: targetPosition,
    mode: 'initializing' as CarouselMode,
    entranceProgress: reducedMotion ? 1 : 0,
    width: 760,
    height: 760,
    isMobile: false,
    tween: null as gsap.core.Tween | null,
  });

  const applyOrbitPoses = React.useCallback(
    (pos: number, entrance = stateRef.current.entranceProgress) => {
      const { width, height, isMobile } = stateRef.current;
      const calc = isMobile ? calculateMobileOrbitPose : calculateDesktopOrbitPose;

      for (let i = 0; i < count; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const offset = getWrappedOffset(i, pos, count);
        const pose = calc(offset, width, height);

        const cardDelay = Math.min(0.45, Math.abs(offset) * 0.08);
        const localT =
          entrance >= 0.999
            ? 1
            : Math.max(0, Math.min(1, (entrance - cardDelay) / Math.max(0.15, 1 - cardDelay)));
        const easeOut = 1 - Math.pow(1 - localT, 3);

        const enterY = (1 - easeOut) * (offset * 24 - 40);
        const enterScale = 0.88 + 0.12 * easeOut;

        const finalOpacity = pose.opacity * easeOut;
        el.style.transform = `translate3d(${pose.x.toFixed(2)}px, ${(pose.y + enterY).toFixed(2)}px, 0) rotate(${pose.rotation.toFixed(2)}deg) scale(${(pose.scale * enterScale).toFixed(4)})`;
        el.style.opacity = finalOpacity.toFixed(3);
        el.style.zIndex = String(pose.zIndex);
        el.style.pointerEvents = finalOpacity > 0.08 ? 'auto' : 'none';
        el.style.visibility = finalOpacity > 0.01 ? 'visible' : 'hidden';
      }
    },
    [cardRefs, count]
  );

  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const updateSize = () => {
      stateRef.current.width = vp.clientWidth || 760;
      stateRef.current.height = vp.clientHeight || 760;
      stateRef.current.isMobile =
        typeof window !== 'undefined' ? window.innerWidth < 768 : stateRef.current.width < 640;
      applyOrbitPoses(stateRef.current.position);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [viewportRef, applyOrbitPoses]);

  React.useEffect(() => {
    const s = stateRef.current;
    if (s.tween) {
      s.tween.kill();
      s.tween = null;
    }

    if (reducedMotion) {
      s.position = targetPosition;
      s.mode = 'idle';
      s.entranceProgress = 1;
      applyOrbitPoses(targetPosition, 1);
      return;
    }

    const dist = Math.abs(targetPosition - s.position);
    if (dist < 0.001) {
      applyOrbitPoses(targetPosition);
      return;
    }

    s.mode = 'transitioning';
    const duration = Math.min(1.15, 0.78 + Math.max(0, dist - 1) * 0.14);

    s.tween = gsap.to(s, {
      position: targetPosition,
      duration,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onUpdate: () => applyOrbitPoses(s.position),
      onComplete: () => {
        s.mode = 'idle';
        s.tween = null;
        applyOrbitPoses(targetPosition);
      },
    });
  }, [targetPosition, reducedMotion, applyOrbitPoses]);

  const setDragOffset = React.useCallback(
    (deltaSteps: number) => {
      const s = stateRef.current;
      if (s.tween) {
        s.tween.kill();
        s.tween = null;
      }
      s.mode = 'dragging';
      s.position = targetPosition + deltaSteps;
      applyOrbitPoses(s.position);
    },
    [targetPosition, applyOrbitPoses]
  );

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      if (reducedMotion) {
        stateRef.current.entranceProgress = 1;
        stateRef.current.mode = 'idle';
        applyOrbitPoses(targetPosition, 1);
        gsap.set('[data-iw-proj-enter]', { opacity: 1, y: 0, clearProps: 'transform' });
        return;
      }

      const proxy = { p: 0 };
      stateRef.current.entranceProgress = 0;
      stateRef.current.mode = 'entering';
      applyOrbitPoses(stateRef.current.position, 0);

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          stateRef.current.entranceProgress = 1;
          stateRef.current.mode = 'idle';
          applyOrbitPoses(stateRef.current.position, 1);
        },
      });

      tl.fromTo(
        '[data-iw-proj-enter]',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out' },
        0
      ).to(
        proxy,
        {
          p: 1,
          duration: 0.9,
          ease: 'power3.out',
          onUpdate: () => {
            stateRef.current.entranceProgress = proxy.p;
            applyOrbitPoses(stateRef.current.position, proxy.p);
          },
        },
        0.06
      );

      ScrollTrigger.create({
        id: 'iw-projects-orbit-enter',
        trigger: root,
        start: 'top 78%',
        once: true,
        onEnter: () => tl.play(),
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return {
    setDragOffset,
    stateRef,
  };
}
