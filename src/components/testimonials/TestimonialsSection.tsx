import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  DEFAULT_TRUST_PILLARS,
  validateTestimonials,
  VERIFIED_TESTIMONIALS,
  type InspiringWaveTestimonial,
  type SupportingPillar,
} from './data/testimonials';
import { useTestimonialSelection } from './hooks/useTestimonialSelection';
import { TestimonialsHeading } from './TestimonialsHeading';
import { InteractiveTestimonialGlobe } from './InteractiveTestimonialGlobe';
import { TestimonialDeck } from './TestimonialDeck';
import { TestimonialControls } from './TestimonialControls';
import { TestimonialTornEdge } from './TestimonialTornEdge';
import './styles/testimonials.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type TestimonialsPhase = 'before' | 'entering' | 'ready' | 'leaving';

export interface TestimonialsSectionProps {
  testimonials?: InspiringWaveTestimonial[];
  pillars?: SupportingPillar[];
  className?: string;
}

export function TestimonialsSection({
  testimonials = VERIFIED_TESTIMONIALS,
  pillars = DEFAULT_TRUST_PILLARS,
  className = '',
}: TestimonialsSectionProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const phaseRef = React.useRef<TestimonialsPhase>('before');
  const validItems = React.useMemo(() => validateTestimonials(testimonials), [testimonials]);

  const setPhase = React.useCallback((next: TestimonialsPhase) => {
    phaseRef.current = next;
    if (sectionRef.current) {
      sectionRef.current.dataset.testimonialsPhase = next;
    }
  }, []);

  const [inView, setInView] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Offscreen IntersectionObserver pauses Cobe WebGL loop & autoplay when outside viewport
  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '180px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const controller = useTestimonialSelection({
    items: validItems,
    inView,
    reducedMotion,
    autoplayDelayMs: 8600,
  });

  // Master GSAP Entrance Timeline (Sections 17, 18, 19, 20)
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root || validItems.length === 0) return;

      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(
          '[data-tw-eyebrow], [data-tw-word], [data-tw-stay-bg], [data-tw-stay-text], [data-tw-lime-stroke], [data-tw-cream-mark], [data-tw-globe-reveal], [data-tw-bg-panel], [data-tw-main-card], [data-tw-bottom], [data-tw-torn-edge]',
          { clearProps: 'all', opacity: 1 }
        );
        setPhase('ready');
        controller.markEntranceComplete();
      });

      media.add('(prefers-reduced-motion: no-preference)', () => {
        setPhase('before');
        const limePaths = gsap.utils.toArray<SVGPathElement>('[data-tw-lime-stroke]', root);
        const creamMarks = gsap.utils.toArray<SVGPathElement>('[data-tw-cream-mark]', root);

        limePaths.forEach((p) => {
          const len = p.getTotalLength?.() || 1400;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });
        creamMarks.forEach((p) => {
          const len = p.getTotalLength?.() || 90;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
          onStart: () => setPhase('entering'),
          onComplete: () => {
            setPhase('ready');
            controller.markEntranceComplete();
          },
        });

        // 0–15%: Scene 01 — Eyebrow & top brand mark reveal
        tl.fromTo(
          '[data-tw-eyebrow]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 },
          0.02
        );

        // 12–49%: Scene 02 — Kinetic "WORDS THAT", cobalt "STAY." banner, lime ellipse & cream marks
        tl.fromTo(
          '[data-tw-word]',
          { yPercent: 118, skewY: 4, scale: 0.96 },
          { yPercent: 0, skewY: 0, scale: 1, duration: 0.58, stagger: 0.08, ease: 'power4.out' },
          0.08
        )
          .fromTo(
            '[data-tw-stay-bg]',
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.52, ease: 'expo.out' },
            0.2
          )
          .fromTo(
            '[data-tw-stay-text]',
            { yPercent: 115 },
            { yPercent: 0, duration: 0.52, ease: 'back.out(1.15)' },
            0.26
          )
          .to(limePaths, { opacity: 1, duration: 0.04 }, 0.3)
          .to(
            limePaths,
            { strokeDashoffset: 0, duration: 0.82, ease: 'power3.out' },
            0.3
          )
          .to(creamMarks, { opacity: 1, duration: 0.04, stagger: 0.05 }, 0.42)
          .to(
            creamMarks,
            { strokeDashoffset: 0, duration: 0.34, stagger: 0.05, ease: 'power2.out' },
            0.42
          );

        // 31–66%: Scene 03 — Smooth spherical globe reveal
        tl.fromTo(
          '[data-tw-globe-reveal]',
          { scale: 0.88, y: 18, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.82,
            ease: 'power3.out',
          },
          0.22
        );

        // 50–89%: Scene 04 & 05 — Layered editorial background panels & oversized cream quotation card
        tl.fromTo(
          '[data-tw-bg-panel]',
          { x: 46, y: 24, opacity: 0, scale: 0.94 },
          { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.62, stagger: 0.06, ease: 'power3.out' },
          0.38
        ).fromTo(
          '[data-tw-main-card]',
          { x: 42, y: 28, rotation: 2.2, opacity: 0, scale: 0.96 },
          { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, duration: 0.68, ease: 'back.out(1.12)' },
          0.48
        );

        // 80–100%: Scene 06 — Supporting pillars, navigation controls & torn-paper bottom edge
        tl.fromTo(
          '[data-tw-bottom]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.52, ease: 'power3.out' },
          0.68
        ).fromTo(
          '[data-tw-torn-edge]',
          { yPercent: 45, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          0.64
        );

        ScrollTrigger.create({
          id: 'tw-testimonials-reveal',
          trigger: root,
          start: 'top 76%',
          onEnter: () => tl.play(),
        });

        ScrollTrigger.create({
          id: 'tw-testimonials-leave',
          trigger: root,
          start: 'bottom 35%',
          onEnter: () => setPhase('leaving'),
          onLeaveBack: () => setPhase('ready'),
        });

        ScrollTrigger.create({
          id: 'tw-testimonials-reset',
          trigger: root,
          start: 'top 103%',
          onLeaveBack: () => {
            tl.pause(0);
            setPhase('before');
            controller.resetToEntering();
          },
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef, dependencies: [validItems.length] }
  );

  // Keyboard arrow navigation when focused inside the Testimonials widget
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      controller.selectNext('manual');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      controller.selectPrev();
    }
  };

  if (validItems.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="trust"
      data-testimonials-phase={phaseRef.current}
      className={`tw-testimonials-section ${className}`.trim()}
      aria-labelledby="testimonials-heading"
      onKeyDown={handleKeyDown}
    >
      {/* Subtle architectural dark grid & radial vignette */}
      <div className="tw-bg-atmosphere" aria-hidden="true" />

      <div className="tw-stage">
        <TestimonialsHeading />

        <div className="tw-main-composition">
          <InteractiveTestimonialGlobe
            items={validItems}
            activeId={controller.activeTestimonial.id}
            hoveredMarkerId={controller.hoveredMarkerId}
            inView={inView}
            reducedMotion={reducedMotion}
            mode={controller.mode}
            onSelectId={(id) => controller.selectById(id, 'manual')}
            onHoverMarker={controller.setHoveredMarkerId}
            onDragChange={controller.setDragging}
          />

          <TestimonialDeck
            activeItem={controller.activeTestimonial}
            direction={controller.direction}
            transitionRevision={controller.transitionRevision}
            reducedMotion={reducedMotion}
            onPauseChange={controller.setPausedByUser}
          />
        </div>

        <TestimonialControls
          pillars={pillars}
          activeIndex={controller.activeIndex}
          total={validItems.length}
          onPrev={controller.selectPrev}
          onNext={() => controller.selectNext('manual')}
        />
      </div>
      <TestimonialTornEdge />
    </section>
  );
}

export default TestimonialsSection;
