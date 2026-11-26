import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  FLAPS,
  Flap,
  RIDGE_N,
  START,
  Tear,
  XS,
  clamp01,
  easeInOut,
  easeTear,
  fiberEdgeD,
  flapOpen,
  flapPoly,
  introYs,
  makeTear,
  morphYs,
  polyD,
  rng,
  sheetD,
} from './tear/geometry';
import { FooterBlueSheet } from './FooterBlueSheet';
import { FooterPaperReveal } from './FooterPaperReveal';
import { FooterPushpin } from './FooterPushpin';
import { FooterTearSVG } from './FooterTearSVG';
import { TornPaperSeam } from '@/components/ui/TornPaperSeam';
import './styles/footer.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface InspiringWaveFooterProps {
  seed?: number;
  copyright?: string;
  onSubscribe?: (email: string) => Promise<void> | void;
  onRepin?: (seed: number) => void;
  className?: string;
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export function InspiringWaveFooter({
  seed = 19,
  copyright = '© 2026 Inspiring Wave Digitech Pvt. Ltd.',
  onSubscribe,
  onRepin,
  className = '',
}: InspiringWaveFooterProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const sheetRef = React.useRef<SVGPathElement>(null);
  const rimRef = React.useRef<SVGPathElement>(null);
  const fiberRef = React.useRef<SVGPathElement>(null);
  const flapRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const gradRefs = React.useRef<(SVGLinearGradientElement | null)[]>([]);
  const pinRef = React.useRef<HTMLButtonElement>(null);
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);
  const timersRef = React.useRef<number[]>([]);

  const reducedMotion = useReducedMotion();
  const [pinState, setPinState] = React.useState<'idle' | 'lift' | 'stab'>('idle');
  const [hit, setHit] = React.useState(false);
  const [grainUrl, setGrainUrl] = React.useState('');
  const [grainOffsetY, setGrainOffsetY] = React.useState(0);

  // Mutable procedural state — avoids React re-renders during 60fps scroll & pointer loops
  const s = React.useRef({
    W: 0,
    H: 0,
    mobile: false,
    seed,
    tear: makeTear(seed, RIDGE_N, false),
    prev: null as Tear | null,
    from: [] as number[],
    ys: [] as number[],
    scrollTearProgress: 0,
    visualTearProgress: 0,
    mode: 'scroll' as 'scroll' | 'morph' | 'rest',
    morphT0: 0,
    morphDur: 1120,
    raf: 0,
    px: -1e4,
    py: -1e4,
    lift: new Array(FLAPS).fill(0) as number[],
    inView: true,
    busy: false,
    reduced: false,
  }).current;
  s.reduced = reducedMotion;

  const scheduleTimer = React.useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  // Generate deterministic paper grain tile once on mount
  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(160, 160);
    const r = rng(73);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() < 0.5 ? 12 : 248;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = Math.floor(r() * 32);
    }
    ctx.putImageData(img, 0, 0);
    setGrainUrl(canvas.toDataURL());
  }, []);

  // Core procedural SVG renderer (single rAF owner for all tear & flap paths)
  const renderTearFrame = React.useCallback(
    (now: number) => {
      s.raf = 0;
      const { W, H, tear } = s;
      if (!W || !H) return;

      let keepRunning = false;
      let ys: number[];
      const open = new Array(FLAPS).fill(0);
      const openOld = new Array(FLAPS).fill(0);
      let rimScale = 1;

      if (s.reduced) {
        ys = tear.ys;
        open.fill(1);
        rimScale = 1;
      } else if (s.mode === 'morph') {
        const p = clamp01((now - s.morphT0) / s.morphDur);
        ys = morphYs(s.from, tear, p);
        open.fill(easeTear((p - 0.42) / 0.58));
        openOld.fill(1 - easeInOut(p / 0.36));
        rimScale = 1;
        if (p >= 1) {
          s.mode = 'scroll';
          s.prev = null;
        } else {
          keepRunning = true;
        }
      } else {
        const tp = clamp01(s.scrollTearProgress);
        s.visualTearProgress = tp;
        ys = introYs(tear, tp);
        tear.flaps.forEach((f, k) => {
          open[k] = flapOpen(tear, f, tp);
        });
        rimScale = clamp01(tp * 1.45);
      }

      s.ys = ys;

      // Distance-based localized pointer flap lift
      const canLiftFlaps = !s.reduced && (s.scrollTearProgress > 0.35 || s.mode === 'morph');
      tear.flaps.forEach((f, k) => {
        const b = Math.min(ys.length - 1, f.at + f.span);
        const mx = ((XS[f.at] + XS[b]) * 0.5) * W;
        const my = ((ys[f.at] + ys[b]) * 0.5) * H;
        const target = canLiftFlaps
          ? clamp01(1 - Math.hypot(s.px - mx, s.py - my) / (0.18 * Math.max(W, 540)))
          : 0;
        s.lift[k] += (target - s.lift[k]) * 0.15;
        if (Math.abs(target - s.lift[k]) > 0.002) keepRunning = true;
        open[k] *= 1 + 0.34 * s.lift[k];
      });

      // Update SVG sheet, exposed cream paper fiber rim, and feathered pulp edge
      sheetRef.current?.setAttribute('d', sheetD(ys, W, H, tear.rim, rimScale));
      rimRef.current?.setAttribute('d', sheetD(ys, W, H));
      fiberRef.current?.setAttribute('d', fiberEdgeD(ys, tear, W, H, rimScale));

      const drawFlap = (slotIdx: number, flap: Flap | undefined, amt: number) => {
        const pathEl = flapRefs.current[slotIdx];
        const gradEl = gradRefs.current[slotIdx];
        if (!pathEl || !gradEl) return;
        if (!flap || amt < 0.01) {
          pathEl.setAttribute('d', '');
          return;
        }
        const pts = flapPoly(ys, flap, W, H, amt);
        pathEl.setAttribute('d', polyD(pts));
        const b = Math.min(ys.length - 1, flap.at + flap.span);
        const tip = pts[flap.span + 3];
        if (tip) {
          gradEl.setAttribute('x1', String(((XS[flap.at] + XS[b]) * 0.5) * W));
          gradEl.setAttribute('y1', String(((ys[flap.at] + ys[b]) * 0.5) * H));
          gradEl.setAttribute('x2', String(tip[0]));
          gradEl.setAttribute('y2', String(tip[1]));
        }
      };

      for (let k = 0; k < FLAPS; k++) {
        drawFlap(k, tear.flaps[k], open[k]);
        drawFlap(FLAPS + k, s.prev?.flaps[k], openOld[k]);
      }

      if (keepRunning && s.inView) {
        s.raf = requestAnimationFrame(renderTearFrame);
      }
    },
    [s]
  );

  const kick = React.useCallback(() => {
    if (!s.raf && typeof requestAnimationFrame !== 'undefined') {
      s.raf = requestAnimationFrame(renderTearFrame);
    }
  }, [s, renderTearFrame]);

  // ResizeObserver keeps SVG pixel coordinates synced to exact stage dimensions
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const isMobile = w < 768;
      if (isMobile !== s.mobile) {
        s.mobile = isMobile;
        s.tear = makeTear(s.seed, RIDGE_N, isMobile);
      }
      s.W = w;
      s.H = h;
      const svg = svgRef.current;
      if (svg) {
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }
      const prev = rootRef.current?.previousElementSibling as HTMLElement | null;
      if (prev) {
        setGrainOffsetY(-((prev.offsetHeight - 2) % 160));
      }
      kick();
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);

    const io = new IntersectionObserver(
      ([entry]) => {
        s.inView = entry.isIntersecting;
        if (entry.isIntersecting) kick();
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (s.raf) {
        cancelAnimationFrame(s.raf);
        s.raf = 0;
      }
    };
  }, [s, kick]);

  // External seed prop sync
  React.useEffect(() => {
    if (seed === s.seed) return;
    s.seed = seed;
    s.prev = s.tear;
    s.from = s.ys.length ? s.ys : s.tear.ys;
    s.tear = makeTear(seed, RIDGE_N, s.mobile);
    s.mode = s.reduced ? 'rest' : 'morph';
    s.morphT0 = performance.now();
    kick();
  }, [seed, s, kick]);

  // System C: Scroll-linked GSAP Choreography (0 -> 1 reversible progress)
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const media = gsap.matchMedia();

      // Reduced Motion: immediately show completed torn-paper composition cleanly
      media.add('(prefers-reduced-motion: reduce)', () => {
        s.scrollTearProgress = 1;
        s.visualTearProgress = 1;
        s.mode = 'rest';
        gsap.set(
          '[data-iwf-assemble], [data-iwf-headline-line], [data-iwf-nav-col], [data-iwf-stroke], [data-iwf-blue-stroke], .iwf-pin-drop, .iwf-pin-shadow, .iwf-pin-ticks, [data-iwf-wordmark], [data-iwf-wave], [data-iwf-birds], [data-iwf-legal]',
          { clearProps: 'all', opacity: 1 }
        );
        kick();
      });

      // Full Motion: Normal footer height — plays a crisp, punchy ~1.4s entrance & paper-tear
      // sequence immediately as the footer enters view (no extra scrolling or waiting).
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const strokes = gsap.utils.toArray<SVGPathElement>('[data-iwf-stroke]', root);
        const blueStrokes = gsap.utils.toArray<SVGPathElement>('[data-iwf-blue-stroke]', root);

        strokes.forEach((path) => {
          const len = path.getTotalLength?.() || 460;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });
        blueStrokes.forEach((path) => {
          const len = path.getTotalLength?.() || 580;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });

        const proxy = { tear: 0 };
        s.scrollTearProgress = 0;
        s.visualTearProgress = 0;
        kick();

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
        });
        tlRef.current = tl;

        // 0.00s–0.38s: Scene 01 — Intact cobalt poster top bar & eyebrow snap in
        tl.fromTo(
          '[data-iwf-assemble]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.34, stagger: 0.04 },
          0.0
        );

        // 0.05s–0.48s: Scene 02 — Headline lines mask-reveal, hand-drawn strokes draw, nav columns stagger
        tl.fromTo(
          '[data-iwf-headline-line="1"]',
          { yPercent: 115 },
          { yPercent: 0, duration: 0.38, ease: 'power3.out' },
          0.05
        )
          .fromTo(
            '[data-iwf-headline-line="2"]',
            { yPercent: 120 },
            { yPercent: 0, duration: 0.4, ease: 'back.out(1.15)' },
            0.11
          )
          .to(strokes, { opacity: 1, duration: 0.04, stagger: 0.04 }, 0.25)
          .to(
            strokes,
            { strokeDashoffset: 0, duration: 0.32, stagger: 0.04, ease: 'power2.out' },
            0.25
          )
          .fromTo(
            '[data-iwf-nav-col]',
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.34, stagger: 0.04 },
            0.09
          );

        // 0.28s–0.56s: Scene 03 — Glossy blue pushpin drops fast & strikes the poster
        tl.fromTo(
          '.iwf-pin-drop',
          { yPercent: -210, rotation: -26, scale: 1.32, opacity: 0 },
          { yPercent: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.28, ease: 'power3.in' },
          0.28
        )
          .fromTo(
            '.iwf-pin-shadow',
            { scale: 2.2, xPercent: -45, opacity: 0 },
            { scale: 1, xPercent: 0, opacity: 1, duration: 0.28, ease: 'power3.in' },
            0.28
          )
          .to(
            '.iwf-pin-drop',
            { scaleX: 1.06, scaleY: 0.93, duration: 0.05, yoyo: true, repeat: 1 },
            0.56
          )
          .fromTo(
            '.iwf-pin-ticks',
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.16, ease: 'back.out(2)' },
            0.54
          );

        // 0.53s–1.33s: Scene 04 — Crisp 0.8s paper tear rips outward from the pushpin
        tl.fromTo(
          proxy,
          { tear: 0 },
          {
            tear: 1,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => {
              s.scrollTearProgress = proxy.tear;
              if (s.mode !== 'morph') kick();
            },
          },
          0.53
        );

        // 0.70s–1.32s: Scene 05 — Enormous INSPIRING WAVE wordmark rises underneath
        tl.fromTo(
          '[data-iwf-wordmark]',
          { yPercent: 32, opacity: 0.25 },
          { yPercent: 0, opacity: 1, duration: 0.58, ease: 'power3.out' },
          0.7
        )
          .to(blueStrokes, { opacity: 1, duration: 0.04, stagger: 0.06 }, 0.98)
          .to(
            blueStrokes,
            { strokeDashoffset: 0, duration: 0.36, stagger: 0.06, ease: 'power2.out' },
            0.98
          );

        // 0.92s–1.40s: Scene 06 — Ocean wave corner illustrations, birds & legal bar snap into place
        tl.fromTo(
          '[data-iwf-wave="left"]',
          { xPercent: -16, yPercent: 20, opacity: 0 },
          { xPercent: 0, yPercent: 0, opacity: 1, duration: 0.44, ease: 'power3.out' },
          0.92
        )
          .fromTo(
            '[data-iwf-wave="right"]',
            { xPercent: 16, yPercent: 20, opacity: 0 },
            { xPercent: 0, yPercent: 0, opacity: 1, duration: 0.44, ease: 'power3.out' },
            0.96
          )
          .fromTo(
            '[data-iwf-birds]',
            { y: 12, scale: 0.82, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.34, ease: 'power2.out' },
            1.04
          )
          .fromTo(
            '[data-iwf-legal]',
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.34, ease: 'power2.out' },
            1.06
          );

        // Trigger only once the footer has meaningfully entered the viewport;
        // refreshPriority: -1 ensures pinned sections above are measured first.
        ScrollTrigger.create({
          id: 'iw-tear-footer-reveal',
          trigger: root,
          start: 'top 65%',
          refreshPriority: -1,
          invalidateOnRefresh: true,
          onEnter: () => {
            s.mode = 'scroll';
            tl.play();
          },
        });

        ScrollTrigger.create({
          id: 'iw-tear-footer-reset',
          trigger: root,
          start: 'top 102%',
          refreshPriority: -1,
          invalidateOnRefresh: true,
          onLeaveBack: () => {
            if (s.busy) return;
            tl.pause(0);
            proxy.tear = 0;
            s.scrollTearProgress = 0;
            s.visualTearProgress = 0;
            kick();
          },
        });
      });

      return () => media.revert();
    },
    { scope: rootRef, dependencies: [kick] }
  );

  // System D: Pointer-responsive paper flaps + subtle pin tilt (coarse pointers ignored)
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch' || s.reduced) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    s.px = e.clientX - rect.left;
    s.py = e.clientY - rect.top;
    const tilt = Math.max(-7, Math.min(7, (s.px / Math.max(1, rect.width) - 0.5) * 14));
    pinRef.current?.style.setProperty('--pin-hover-tilt', `${tilt.toFixed(2)}deg`);
    kick();
  };

  const handlePointerLeave = () => {
    s.px = -1e4;
    s.py = -1e4;
    pinRef.current?.style.setProperty('--pin-hover-tilt', '0deg');
    kick();
  };

  // System D: Pushpin click re-tears a brand new seeded jagged edge continuously
  const handleRepin = () => {
    if (s.busy) return;
    if (tlRef.current && tlRef.current.progress() < 1) {
      tlRef.current.progress(1);
    }
    if (s.scrollTearProgress < 0.85) {
      s.scrollTearProgress = 1;
      s.visualTearProgress = 1;
    }

    const nextSeed = s.seed + 7;
    const commitSwap = () => {
      s.seed = nextSeed;
      s.prev = s.tear;
      s.from = s.ys.length ? [...s.ys] : [...s.tear.ys];
      s.tear = makeTear(nextSeed, RIDGE_N, s.mobile);
    };

    if (s.reduced) {
      commitSwap();
      s.prev = null;
      s.mode = 'rest';
      kick();
      onRepin?.(nextSeed);
      return;
    }

    s.busy = true;
    setPinState('lift');

    scheduleTimer(() => {
      commitSwap();
      s.mode = 'morph';
      s.morphT0 = performance.now();
      s.morphDur = 760;
      kick();
    }, 180);

    scheduleTimer(() => {
      setPinState('stab');
      setHit(true);
    }, 720);

    scheduleTimer(() => {
      setHit(false);
      setPinState('idle');
      s.busy = false;
      onRepin?.(nextSeed);
    }, 1040);
  };

  const handleBackToTop = () => {
    window.dispatchEvent(
      new CustomEvent('iw:scroll-top', { detail: { immediate: reducedMotion } })
    );
  };

  return (
    <footer
      ref={rootRef}
      id="site-footer"
      aria-label="Inspiring Wave footer"
      className={`iw-tear-footer ${hit ? 'is-hit' : ''} ${className}`.trim()}
    >
      <div
        ref={stageRef}
        className="iw-tear-stage"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Layers 0, 1 & bottom legal strip: Cream backing, giant INSPIRING WAVE, waves, legal bar */}
        <FooterPaperReveal
          uid={uid}
          grainUrl={grainUrl}
          copyright={copyright}
          onBackToTop={handleBackToTop}
        />

        {/* Layer 2: Procedural torn cobalt poster SVG + white fiber rim + 6 curled flaps */}
        <FooterTearSVG
          svgRef={svgRef}
          sheetRef={sheetRef}
          rimRef={rimRef}
          fiberRef={fiberRef}
          flapRefs={flapRefs}
          gradRefs={gradRefs}
          uid={uid}
          grainUrl={grainUrl}
          grainOffsetY={grainOffsetY}
        />

        {/* Layer 3: Interactive editorial blue sheet content (top bar, headline, nav, newsletter) */}
        <FooterBlueSheet uid={uid} onSubscribe={onSubscribe} />

        {/* Layer 4: Glossy physical cobalt pushpin button */}
        <FooterPushpin
          pinRef={pinRef}
          pinState={pinState}
          onRepin={handleRepin}
          uid={uid}
          baseColor="#1739E8"
        />
      </div>
    </footer>
  );
}

export default InspiringWaveFooter;
