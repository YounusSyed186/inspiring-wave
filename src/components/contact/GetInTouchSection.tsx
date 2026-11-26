import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  FLAPS,
  Flap,
  RIDGE_N,
  VerticalTear,
  YS,
  clamp01,
  easeInOut,
  easeTear,
  introXs,
  makeVerticalTear,
  morphXs,
  polyD,
  rng,
  verticalFiberEdgeD,
  verticalFlapOpen,
  verticalFlapPoly,
  verticalSheetD,
} from './tear/verticalGeometry';
import { ContactBluePoster } from './ContactBluePoster';
import { ContactForm } from './ContactForm';
import { ContactTearSVG } from './ContactTearSVG';
import { TornPaperSeam } from '@/components/ui/TornPaperSeam';
import './styles/contact.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface GetInTouchSectionProps {
  seed?: number;
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

export function GetInTouchSection({ seed = 29, className = '' }: GetInTouchSectionProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const sheetRef = React.useRef<SVGPathElement>(null);
  const rimRef = React.useRef<SVGPathElement>(null);
  const fiberRef = React.useRef<SVGPathElement>(null);
  const flapRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const gradRefs = React.useRef<(SVGLinearGradientElement | null)[]>([]);
  const peelBtnRef = React.useRef<HTMLButtonElement>(null);
  const timersRef = React.useRef<number[]>([]);

  const reducedMotion = useReducedMotion();
  const [grainUrl, setGrainUrl] = React.useState('');
  const [formBusy, setFormBusy] = React.useState(false);
  const [isPeeling, setIsPeeling] = React.useState(false);

  const s = React.useRef({
    W: 0,
    H: 0,
    mobile: false,
    seed,
    tear: makeVerticalTear(seed, RIDGE_N),
    prev: null as VerticalTear | null,
    from: [] as number[],
    xs: [] as number[],
    tearProgress: 0,
    mode: 'intro' as 'intro' | 'morph' | 'rest',
    morphT0: 0,
    morphDur: 920,
    raf: 0,
    px: -1e4,
    py: -1e4,
    lift: new Array(FLAPS).fill(0) as number[],
    inView: true,
    busy: false,
    reduced: false,
    revealed: false,
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

  // Deterministic paper grain tile generated once on mount
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

  // Core procedural vertical SVG tear renderer (single rAF owner)
  const renderTearFrame = React.useCallback(
    (now: number) => {
      s.raf = 0;
      const { W, H, tear } = s;
      if (!W || !H || s.mobile) return;

      let keepRunning = false;
      let xs: number[];
      const open = new Array(FLAPS).fill(0);
      const openOld = new Array(FLAPS).fill(0);
      let rimScale = 1;

      if (s.reduced) {
        xs = tear.xs;
        open.fill(1);
        rimScale = 1;
      } else if (s.mode === 'morph') {
        const p = clamp01((now - s.morphT0) / s.morphDur);
        xs = morphXs(s.from, tear, p);
        open.fill(easeTear((p - 0.4) / 0.6));
        openOld.fill(1 - easeInOut(p / 0.36));
        rimScale = 1;
        if (p >= 1) {
          s.mode = 'rest';
          s.prev = null;
        } else {
          keepRunning = true;
        }
      } else {
        const tp = clamp01(s.tearProgress);
        xs = introXs(tear, tp);
        tear.flaps.forEach((f, k) => {
          open[k] = verticalFlapOpen(tear, f, tp);
        });
        rimScale = clamp01(tp * 1.45);
      }

      s.xs = xs;

      // Distance-based localized pointer flap lift along the vertical tear
      const canLift = !s.reduced && (s.tearProgress > 0.72 || s.mode === 'rest' || s.mode === 'morph');
      tear.flaps.forEach((f, k) => {
        const b = Math.min(xs.length - 1, f.at + f.span);
        const mx = ((xs[f.at] + xs[b]) * 0.5) * W;
        const my = ((YS[f.at] + YS[b]) * 0.5) * H;
        const target = canLift
          ? clamp01(1 - Math.hypot(s.px - mx, s.py - my) / (0.18 * Math.max(W, 640)))
          : 0;
        s.lift[k] += (target - s.lift[k]) * 0.15;
        if (Math.abs(target - s.lift[k]) > 0.002) keepRunning = true;
        open[k] *= 1 + 0.36 * s.lift[k];
      });

      sheetRef.current?.setAttribute('d', verticalSheetD(xs, W, H, tear.rim, rimScale));
      rimRef.current?.setAttribute('d', verticalSheetD(xs, W, H));
      fiberRef.current?.setAttribute('d', verticalFiberEdgeD(xs, tear, W, H, rimScale));

      const drawFlap = (slotIdx: number, flap: Flap | undefined, amt: number) => {
        const pathEl = flapRefs.current[slotIdx];
        const gradEl = gradRefs.current[slotIdx];
        if (!pathEl || !gradEl) return;
        if (!flap || amt < 0.01) {
          pathEl.setAttribute('d', '');
          return;
        }
        const pts = verticalFlapPoly(xs, flap, W, H, amt);
        pathEl.setAttribute('d', polyD(pts));
        const b = Math.min(xs.length - 1, flap.at + flap.span);
        const tip = pts[flap.span + 3];
        if (tip) {
          gradEl.setAttribute('x1', String(((xs[flap.at] + xs[b]) * 0.5) * W));
          gradEl.setAttribute('y1', String(((YS[flap.at] + YS[b]) * 0.5) * H));
          gradEl.setAttribute('x2', String(tip[0]));
          gradEl.setAttribute('y2', String(tip[1]));
        }
      };

      for (let k = 0; k < FLAPS; k++) {
        drawFlap(k, tear.flaps[k], open[k]);
        drawFlap(FLAPS + k, s.prev?.flaps[k], openOld[k]);
      }

      // Keep PEEL ↗ tab anchored right on the vertical torn edge at ~58% height
      if (peelBtnRef.current) {
        const anchorIdx = Math.round(0.58 * (RIDGE_N - 1));
        const px = xs[anchorIdx] * W;
        const py = YS[anchorIdx] * H;
        peelBtnRef.current.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-55%, -50%) rotate(-9deg)`;
        peelBtnRef.current.style.opacity = s.tearProgress > 0.72 || s.reduced ? '1' : '0';
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

  // ResizeObserver + IntersectionObserver
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      s.mobile = w < 768;
      s.W = w;
      s.H = h;
      const svg = svgRef.current;
      if (svg) {
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
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
      { rootMargin: '180px 0px' }
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

  // Coordinated GSAP Entrance (once: true — the tear stays open so the form never covers typed input!)
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: reduce)', () => {
        s.tearProgress = 1;
        s.mode = 'rest';
        s.revealed = true;
        gsap.set(
          '[data-iwc-assemble], [data-iwc-headline-line], [data-iwc-banner], [data-iwc-lime-stroke], [data-iwc-form-reveal], [data-iwc-form-stroke]',
          { clearProps: 'all', opacity: 1 }
        );
        kick();
      });

      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (s.revealed) {
          s.tearProgress = 1;
          s.mode = 'rest';
          kick();
          return;
        }

        const limeStrokes = gsap.utils.toArray<SVGPathElement>('[data-iwc-lime-stroke]', root);
        const formStrokes = gsap.utils.toArray<SVGPathElement>('[data-iwc-form-stroke]', root);

        [...limeStrokes, ...formStrokes].forEach((p) => {
          const len = p.getTotalLength?.() || 600;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });

        const proxy = { tear: 0 };
        s.tearProgress = 0;
        kick();

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            s.revealed = true;
            s.mode = 'rest';
          },
        });

        // 0.00–0.30s: Left blue poster kicker & eyebrow
        tl.fromTo(
          '[data-iwc-assemble]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.42, stagger: 0.06 },
          0.02
        );

        // 0.08–0.52s: Kinetic LET'S MAKE / IT REAL. & neon-lime elliptical stroke
        tl.fromTo(
          '[data-iwc-headline-line="1"]',
          { yPercent: 115 },
          { yPercent: 0, duration: 0.48, ease: 'power3.out' },
          0.08
        )
          .fromTo(
            '[data-iwc-banner]',
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.44, ease: 'expo.out' },
            0.16
          )
          .fromTo(
            '[data-iwc-headline-line="2"]',
            { yPercent: 118 },
            { yPercent: 0, duration: 0.48, ease: 'back.out(1.15)' },
            0.22
          )
          .to(limeStrokes, { opacity: 1, duration: 0.04, stagger: 0.06 }, 0.28)
          .to(
            limeStrokes,
            { strokeDashoffset: 0, duration: 0.72, stagger: 0.08, ease: 'power2.out' },
            0.28
          );

        // 0.36–1.32s: Right-to-left procedural paper tear opens to reveal the cream form
        tl.fromTo(
          proxy,
          { tear: 0 },
          {
            tear: 1,
            duration: 0.96,
            ease: 'power2.inOut',
            onUpdate: () => {
              s.tearProgress = proxy.tear;
              if (s.mode !== 'morph') kick();
            },
          },
          0.36
        );

        // 0.62–1.38s: Form heading, lime underline & fields stagger in beneath the opening paper
        tl.fromTo(
          '[data-iwc-form-reveal]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.46, stagger: 0.06, ease: 'power3.out' },
          0.62
        )
          .to(formStrokes, { opacity: 1, duration: 0.04 }, 0.72)
          .to(formStrokes, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, 0.72);

        ScrollTrigger.create({
          id: 'iw-contact-tear-reveal',
          trigger: root,
          start: 'top 76%',
          refreshPriority: -1,
          invalidateOnRefresh: true,
          onEnter: () => {
            s.mode = 'intro';
            tl.play();
          },
        });

        ScrollTrigger.create({
          id: 'iw-contact-tear-reset',
          trigger: root,
          start: 'top 102%',
          refreshPriority: -1,
          invalidateOnRefresh: true,
          onLeaveBack: () => {
            if (s.busy) return;
            tl.pause(0);
            proxy.tear = 0;
            s.tearProgress = 0;
            s.revealed = false;
            s.mode = 'intro';
            kick();
          },
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef, dependencies: [kick] }
  );

  // Pointer-reactive flaps along the vertical tear
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || s.reduced || s.mobile) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    s.px = e.clientX - rect.left;
    s.py = e.clientY - rect.top;
    kick();
  };

  const handlePointerLeave = () => {
    s.px = -1e4;
    s.py = -1e4;
    kick();
  };

  // PEEL ↗ button replays a fresh seeded vertical tear while preserving all form values
  const handlePeelRetear = () => {
    if (s.busy || formBusy || s.mobile) return;
    const nextSeed = s.seed + 11;

    if (s.reduced) {
      s.seed = nextSeed;
      s.tear = makeVerticalTear(nextSeed, RIDGE_N);
      s.mode = 'rest';
      kick();
      return;
    }

    s.busy = true;
    setIsPeeling(true);
    s.seed = nextSeed;
    s.prev = s.tear;
    s.from = s.xs.length ? [...s.xs] : [...s.tear.xs];
    s.tear = makeVerticalTear(nextSeed, RIDGE_N);
    s.mode = 'morph';
    s.morphT0 = performance.now();
    s.morphDur = 880;
    kick();

    scheduleTimer(() => {
      s.busy = false;
      setIsPeeling(false);
    }, 920);
  };

  return (
    <section
      ref={sectionRef}
      id="contact-cta"
      className={`iw-get-in-touch ${className}`.trim()}
      aria-labelledby="contact-cta-heading"
    >
      <div
        ref={stageRef}
        className="iwc-stage"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Layer 1: Cream Backing & Interactive HTML Contact Form (Right Side) */}
        <ContactForm uid={uid} grainUrl={grainUrl} onBusyChange={setFormBusy} />

        {/* Layer 2: Procedural Vertical Torn Cobalt Poster SVG (Desktop/Tablet) */}
        <ContactTearSVG
          svgRef={svgRef}
          sheetRef={sheetRef}
          rimRef={rimRef}
          fiberRef={fiberRef}
          flapRefs={flapRefs}
          gradRefs={gradRefs}
          uid={uid}
          grainUrl={grainUrl}
        />

        {/* Mobile-only horizontal torn-paper divider between Blue Poster & Cream Form */}
        <div className="iwc-mobile-divider" aria-hidden="true">
          <TornPaperSeam
            topColor="#070B16"
            fiberColor="#FAF3E8"
            seed={83}
            heightClass="h-8"
          />
        </div>

        {/* Layer 3: Left Editorial Cobalt Poster Typography */}
        <ContactBluePoster />

        {/* Layer 4: Interactive PEEL ↗ Neon-Lime Tab on the Torn Vertical Edge */}
        <button
          ref={peelBtnRef}
          type="button"
          className={`iwc-peel-tab ${isPeeling ? 'is-peeling' : ''}`}
          onClick={handlePeelRetear}
          disabled={isPeeling || formBusy}
          aria-label="Replay paper tear animation"
          title="Peel a new paper edge"
        >
          <span>PEEL</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}

export default GetInTouchSection;
