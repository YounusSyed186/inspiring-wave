import { ReactNode, RefObject, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { scrollMotion } from './motion/scroll-engine';
import { WaveDebugPanel } from './motion/WaveDebugPanel';
import { WaveMediaRenderer } from './motion/WaveMediaRenderer';

export * from './motion/animations';

gsap.registerPlugin(ScrollTrigger, useGSAP);
if (typeof window !== 'undefined') {
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
}

type MotionProviderProps = { children: ReactNode };

export function MotionProvider({ children }: MotionProviderProps) {
  const location = useLocation();
  const wipe = useRef<HTMLDivElement>(null);
  const previousPath = useRef(location.pathname);
  const wipePath = useRef(location.pathname);

  useEffect(() => {
    if (previousPath.current !== location.pathname) window.scrollTo(0, 0);
    previousPath.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lenis = desktop.matches && !reduced.matches ? new Lenis({
      duration: 1,
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1,
    }) : null;
    const update = (time: number) => {
      lenis?.raf(time * 1000);
      scrollMotion.sample(
        time,
        lenis?.animatedScroll ?? window.scrollY,
        lenis?.targetScroll ?? window.scrollY,
      );
    };
    const settleForRail = () => {
      if (lenis) lenis.scrollTo(lenis.animatedScroll, { immediate: true });
    };
    lenis?.on('scroll', ScrollTrigger.update);
    window.addEventListener('iw:rail-enter', settleForRail);
    (window as any).__lenis = lenis;
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    if (lenis) document.documentElement.classList.add('lenis-active');

    return () => {
      (window as any).__lenis = null;
      document.documentElement.classList.remove('lenis-active');
      gsap.ticker.remove(update);
      window.removeEventListener('iw:rail-enter', settleForRail);
      lenis?.destroy();
      scrollMotion.reset();
    };
  }, []);

  useGSAP(() => {
    const element = wipe.current;
    const navigating = wipePath.current !== location.pathname;
    wipePath.current = location.pathname;
    if (navigating && element && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(element, { scaleY: 1, transformOrigin: 'top' }, {
        scaleY: 0,
        duration: .72,
        ease: 'power4.inOut',
        clearProps: 'transform',
      });
    }
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    const timer = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timer);
  }, { dependencies: [location.pathname] });

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');
    if (!header) return;
    const trigger = ScrollTrigger.create({
      start: 100,
      end: 'max',
      onUpdate: self => header.classList.toggle('is-hidden', self.direction > 0 && self.scroll() > 180),
    });
    return () => trigger.kill();
  }, []);

  return <>
    {children}
    <WaveMediaRenderer />
    <WaveDebugPanel />
    <div ref={wipe} className="route-wipe" aria-hidden="true" />
  </>;
}

export function useHomepageMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.reveal, [data-motion-line], .work-item, .service-row', { clearProps: 'all', opacity: 1 });
    });

    media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set('.reveal', { opacity: 1, y: 0 });

      const scenes = Array.from(scope.current?.children ?? [])
        .filter((element): element is HTMLElement => element instanceof HTMLElement && element.matches('section') && !element.classList.contains('parallax-showcase') && !element.classList.contains('manifesto-section') && !element.classList.contains('lc-section'));
      scenes.forEach((incoming, index) => {
        if (!index) return;
        const transition = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: incoming,
            start: 'top bottom',
            end: 'top top',
            scrub: .35,
            invalidateOnRefresh: true,
            onUpdate: self => {
              incoming.style.setProperty('--stack-progress', self.progress.toFixed(4));
              incoming.style.setProperty('--stack-arc', `${((1 - self.progress) * 24).toFixed(2)}px`);
              incoming.style.setProperty('--stack-arc-mid', `${((1 - self.progress) * 17).toFixed(2)}px`);
              incoming.style.setProperty('--stack-arc-inner', `${((1 - self.progress) * 7).toFixed(2)}px`);
              scrollMotion.setTransition(index, self.progress);
            },
          },
        });
      });


      gsap.from('.work-group:nth-child(2) .work-item', {
        y: index => index % 2 ? 120 : 75,
        clipPath: 'inset(18% 0 0)',
        opacity: 0,
        stagger: .12,
        duration: 1.25,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.work-viewport', start: 'top 82%' },
      });

      gsap.from('.service-row', {
        xPercent: index => index % 2 ? 8 : -5,
        opacity: 0,
        stagger: .08,
        duration: .9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.service-list', start: 'top 80%' },
      });

      gsap.fromTo('.studio-layout figure img', { scale: 1.14, filter: 'saturate(0)' }, {
        scale: 1,
        filter: 'saturate(1)',
        scrollTrigger: { trigger: '.studio-layout', start: 'top 90%', end: 'bottom 20%', scrub: 1 },
      });

      gsap.to('.journal-visual .orbit', {
        rotate: 110,
        scale: 1.18,
        scrollTrigger: { trigger: '.journal', start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: '.finale',
          start: 'top 70%',
          end: 'top top',
          scrub: 1,
        },
      })
        .fromTo('.finale-bg', { opacity: .45, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1 }, 0);

      return () => {
        scenes.forEach(scene => scene.classList.remove('stack-transition-source-hidden'));
      };
    });

    media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set('.reveal', { opacity: 1, y: 0 });
      ScrollTrigger.batch('.work-item, .service-row, .method-layout li, .client-line span', {
        start: 'top 92%',
        once: true,
        onEnter: batch => gsap.from(batch, {
          y: 45,
          opacity: 0,
          duration: .72,
          stagger: .06,
          ease: 'power3.out',
          overwrite: true,
        }),
      });
      gsap.fromTo('.studio-layout figure img', { scale: 1.08 }, {
        scale: 1,
        scrollTrigger: { trigger: '.studio-layout', start: 'top 90%', end: 'bottom 35%', scrub: .8 },
      });
    });

    return () => media.revert();
  }, { scope });
}

export function usePageMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 901px)', () => {
      gsap.utils.toArray<HTMLElement>('.detail-media img').forEach(image => {
        gsap.from(image, {
          objectPosition: '38% center',
          scale: 1.08,
          ease: 'none',
          scrollTrigger: { trigger: image.parentElement, start: 'top 85%', end: 'center 40%', scrub: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('.detail-image, .detail-media, .listing-work > a, .listing-editorial img').forEach((element, index) => {
        gsap.from(element, {
          y: index % 2 ? 100 : 65,
          clipPath: index % 2 ? 'inset(0 0 25% 0)' : 'inset(20% 0 0 0)',
          opacity: 0,
          scrollTrigger: { trigger: element, start: 'top 88%', end: 'top 48%', scrub: .7 },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-chapter-color]').forEach(element => {
        ScrollTrigger.create({
          trigger: element,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => gsap.to(scope.current, { backgroundColor: element.dataset.chapterColor, duration: .55 }),
          onEnterBack: () => gsap.to(scope.current, { backgroundColor: element.dataset.chapterColor, duration: .55 }),
        });
      });
    });
    return () => media.revert();
  }, { scope });
}

export { gsap, ScrollTrigger, useGSAP };
