import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PANELS_CONFIG, PanelLayout } from './panelGeometry';
import { ServicePanel } from './ServicePanel';
import { SERVICES_DATA, ServiceItem } from './services-data';
import './services.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<SVGPathElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const worktableRef = useRef<HTMLDivElement>(null);

  const [activeModal, setActiveModal] = useState<ServiceItem | null>(null);

  // Close modal with Escape key
  useEffect(() => {
    if (!activeModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  // Coordinated Entrance Motion System
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const media = gsap.matchMedia();

      // Reduced motion fallback
      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(
          [
            sunRef.current,
            worktableRef.current,
            waveRef.current,
            headlineRef.current,
            stripRef.current,
            underlineRef.current,
            '.service-panel-bounding-box',
          ],
          { opacity: 1, clearProps: 'all' },
        );
      });

      // Desktop and large screens entrance timeline
      media.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'bottom 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          defaults: { ease: 'power3.out' },
        });

        // 1. Blue sun & clouds scale in
        if (sunRef.current) {
          tl.fromTo(
            sunRef.current,
            { scale: 0.75, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.15)' },
            0,
          );
        }

        // 2. Grayscale worktable collage unmasks
        if (worktableRef.current) {
          tl.fromTo(
            worktableRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.85 },
            0.1,
          );
        }

        // 3. Headline lines come up through shallow overflow masks
        if (headlineRef.current) {
          const lines = headlineRef.current.querySelectorAll('.headline-text-inner');
          tl.fromTo(
            lines,
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.06, duration: 0.65, ease: 'power3.out' },
            0.15,
          );
        }

        // 4. Cobalt name strip rises
        if (stripRef.current) {
          tl.fromTo(
            stripRef.current,
            { scale: 0.92, opacity: 0, rotate: -4 },
            { scale: 1, opacity: 1, rotate: -2.2, duration: 0.75, ease: 'back.out(1.2)' },
            0.25,
          );
        }

        // 5. Draw the hand-drawn cobalt underline
        if (underlineRef.current) {
          const pathLen = underlineRef.current.getTotalLength?.() || 200;
          tl.fromTo(
            underlineRef.current,
            { strokeDasharray: pathLen, strokeDashoffset: pathLen },
            { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' },
            0.4,
          );
        }

        // 6. Breaking wave crest rises subtly while ribbon reveals
        if (waveRef.current) {
          tl.fromTo(
            waveRef.current,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.95 },
            0.2,
          );
        }

        // 7. Staggered reveal of the 6 uneven service boxes:
        // Top row (Strategy, Web) -> Middle band (UI/UX) -> Lower row (Social, Mobile, Software)
        const panelStrategy = section.querySelector('.panel-strategy');
        const panelWeb = section.querySelector('.panel-web');
        const panelUiux = section.querySelector('.panel-uiux');
        const panelSocial = section.querySelector('.panel-social');
        const panelMobile = section.querySelector('.panel-mobile');
        const panelSoftware = section.querySelector('.panel-software');

        const cardSequence = [
          panelStrategy,
          panelWeb,
          panelUiux,
          panelSocial,
          panelMobile,
          panelSoftware,
        ].filter(Boolean);

        tl.fromTo(
          cardSequence,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.055, duration: 0.75, ease: 'power3.out' },
          0.32,
        );
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  const handleCardClick = useCallback((slug: string) => {
    const item = SERVICES_DATA.find((s) => s.slug === slug);
    if (item) setActiveModal(item);
  }, []);

  const panels = [
    PANELS_CONFIG.strategy,
    PANELS_CONFIG.web,
    PANELS_CONFIG.uiux,
    PANELS_CONFIG.social,
    PANELS_CONFIG.mobile,
    PANELS_CONFIG.software,
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="editorial-services-section"
      aria-label="Inspiring Wave Services Overview"
    >
      {/* Background print paper grain */}
      <div className="services-paper-texture" aria-hidden="true" />

      <div className="services-editorial-wrap">
        {/* ==================================================================
            1. DESKTOP COMPOSITION (1672 x 875 Artboard Stage)
           ================================================================== */}
        <div ref={stageRef} className="services-desktop-stage" role="region" aria-label="Services Interactive Collage">
          {/* Back Layer: Electric Cobalt Sun + Birds + Cloud */}
          <div ref={sunRef} className="editorial-sun-cluster" aria-hidden="true">
            <div className="editorial-cobalt-sun">
              {/* Flying birds */}
              <svg className="editorial-sun-birds" viewBox="0 0 60 45" fill="none">
                <path d="M2 14 Q10 4 18 14 Q26 4 34 14" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 28 Q30 20 36 28 Q42 20 48 28" stroke="#111110" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {/* Cream cloud with loose cobalt contour */}
            <svg className="editorial-sun-cloud" viewBox="0 0 200 80" fill="none">
              <path
                d="M20 60 C15 50, 25 35, 45 35 C50 20, 75 15, 95 25 C110 15, 140 18, 150 32 C170 32, 185 45, 180 60 Z"
                fill="#FFFDF5"
                stroke="#1738FF"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Middle Layer: Grayscale Studio Worktable Collage */}
          <div ref={worktableRef} className="editorial-worktable-collage" aria-hidden="true">
            <div className="editorial-worktable-inner">
              <img
                src="/images/services/studio-worktable.webp"
                alt=""
                loading="lazy"
              />
            </div>
          </div>

          {/* Headline Layer: Eyebrow + 2-line title + Blue Name Strip */}
          <div className="editorial-headline-cluster">
            <span className="editorial-meta-kicker">SERVICES / 001 — 006</span>

            <h2 ref={headlineRef} className="editorial-big-heading relative">
              {/* Three ink energy marks radiating from upper-left */}
              <svg className="absolute -top-6 -left-3 w-9 h-9 pointer-events-none" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <line x1="24" y1="26" x2="14" y2="10" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="28" y1="22" x2="32" y2="6" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="28" x2="6" y2="24" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="headline-overflow-line">
                <span className="headline-text-inner">WHAT WE</span>
              </span>
              <span className="headline-overflow-line">
                <span className="headline-text-inner">CREATE AT</span>
              </span>
            </h2>

            {/* Cobalt Printed Name Strip */}
            <div ref={stripRef} className="editorial-name-strip-wrap">
              <div className="editorial-name-strip">
                <span>INSPIRING WAVE</span>
              </div>

              {/* Three ink energy marks radiating from upper-right */}
              <svg className="name-strip-sparks" viewBox="0 0 50 50" fill="none" aria-hidden="true">
                <line x1="8" y1="12" x2="2" y2="4" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="22" y1="8" x2="22" y2="1" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="36" y1="12" x2="44" y2="5" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              {/* Hand-drawn cobalt underline */}
              <svg className="name-strip-underline" viewBox="0 0 280 14" fill="none" aria-hidden="true">
                <path
                  ref={underlineRef}
                  d="M4 6 Q90 2, 180 8 T276 5"
                  stroke="#1738FF"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Body Copy & Circular Action Button */}
          <div className="editorial-intro-cluster">
            <p className="editorial-intro-text">
              A full-spectrum digital studio turning essential ideas into scalable, real-world experiences.
            </p>
            <Link
              to="/services"
              className="editorial-intro-arrow-btn"
              aria-label="Explore all services"
            >
              <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Foreground Layer: Breaking Wave anchored to lower-left corner */}
          <div ref={waveRef} className="editorial-wave-crest" aria-hidden="true">
            <img
              src="/images/services/wave-crest.webp"
              alt=""
              loading="lazy"
            />
          </div>

          {/* Sweeping Bottom Wave Foundation under Cards 04, 05, 06 */}
          <svg
            className="editorial-sweeping-bottom-wave"
            viewBox="0 0 1200 90"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="wave-halftone-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#111110" opacity="0.32" />
                <circle cx="6" cy="6" r="1.2" fill="#111110" opacity="0.32" />
              </pattern>
            </defs>
            {/* 1. Base Cobalt Blue Wave Ribbon */}
            <path
              d="M0 65 C120 45, 240 75, 360 48 C480 20, 600 68, 740 40 C880 16, 1040 55, 1200 42 L1200 90 L0 90 Z"
              fill="#1738FF"
            />
            {/* 2. Halftone Dot Shading on Lower Swell */}
            <path
              d="M0 72 C120 54, 240 80, 360 58 C480 34, 600 74, 740 50 C880 28, 1040 62, 1200 52 L1200 90 L0 90 Z"
              fill="url(#wave-halftone-pattern)"
            />
            {/* 3. Deep Ink Engraved Wave Curves */}
            <path
              d="M0 65 C120 45, 240 75, 360 48 C480 20, 600 68, 740 40 C880 16, 1040 55, 1200 42"
              stroke="#111110"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M50 72 C160 55, 270 78, 380 56 C500 32, 620 72, 760 48 C890 28, 1050 60, 1180 50"
              stroke="#111110"
              strokeWidth="1.6"
              strokeDasharray="4 6"
            />
            {/* 4. Warm Ivory Foam Crest Ribbons */}
            <path
              d="M20 62 C80 48, 160 58, 220 50 C280 42, 340 38, 370 46 C340 52, 260 58, 200 64 C140 70, 70 72, 20 62 Z"
              fill="#FFFDF5"
              stroke="#111110"
              strokeWidth="1.8"
            />
            <path
              d="M400 44 C460 28, 540 38, 620 32 C700 24, 760 32, 780 42 C740 48, 660 52, 580 56 C500 60, 440 54, 400 44 Z"
              fill="#FFFDF5"
              stroke="#111110"
              strokeWidth="1.8"
            />
            <path
              d="M800 36 C860 22, 940 32, 1020 28 C1100 24, 1160 36, 1190 44 C1150 48, 1080 52, 1000 54 C920 56, 850 48, 800 36 Z"
              fill="#FFFDF5"
              stroke="#111110"
              strokeWidth="1.8"
            />
            {/* 5. Second Parallel Undulating Ribbon along the very bottom */}
            <path
              d="M0 80 C150 72, 320 84, 490 75 C660 65, 840 82, 1020 74 C1110 70, 1160 76, 1200 78 L1200 90 L0 90 Z"
              fill="#111110"
              opacity="0.85"
            />
          </svg>

          {/* Canvas Decorative Marks (Stars and Rays) */}
          <svg className="canvas-spark-star spark-top-right" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M16 0 L19 13 L32 16 L19 19 L16 32 L13 19 L0 16 L13 13 Z" />
          </svg>

          <svg className="canvas-spark-star spark-rays-top" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <line x1="8" y1="20" x2="2" y2="20" stroke="#1738FF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="12" x2="6" y2="6" stroke="#1738FF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="8" x2="20" y2="2" stroke="#1738FF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          {/* The Six Uneven Service Panels */}
          {panels.map((panel) => (
            <ServicePanel
              key={panel.id}
              layout={panel}
              onClick={() => handleCardClick(panel.slug)}
            />
          ))}
        </div>

        {/* ==================================================================
            2. TABLET RESPONSIVE FLOW (641px - 959px)
           ================================================================== */}
        <div className="services-tablet-flow">
          <div className="tablet-intro-banner">
            <div>
              <span className="editorial-meta-kicker">SERVICES / 001 — 006</span>
              <h2 className="editorial-big-heading !text-5xl">
                <span>WHAT WE</span>
                <span>CREATE AT</span>
              </h2>
              <div className="editorial-name-strip-wrap">
                <div className="editorial-name-strip !text-3xl !py-2 !px-4">
                  <span>INSPIRING WAVE</span>
                </div>
              </div>
              <p className="editorial-intro-text mt-4">
                A full-spectrum digital studio turning essential ideas into scalable, real-world experiences.
              </p>
            </div>

            <div className="relative">
              <img
                src="/images/services/wave-crest.webp"
                alt=""
                className="w-full h-auto max-h-[240px] object-contain"
              />
            </div>
          </div>

          <div className="tablet-cards-grid">
            <div className="tablet-card-strategy">
              <ServicePanel layout={PANELS_CONFIG.strategy} isDesktop={false} onClick={() => handleCardClick(PANELS_CONFIG.strategy.slug)} />
            </div>
            <div className="tablet-card-web">
              <ServicePanel layout={PANELS_CONFIG.web} isDesktop={false} onClick={() => handleCardClick(PANELS_CONFIG.web.slug)} />
            </div>
            <div className="tablet-card-uiux">
              <ServicePanel layout={PANELS_CONFIG.uiux} isDesktop={false} onClick={() => handleCardClick(PANELS_CONFIG.uiux.slug)} />
            </div>
            <div className="tablet-card-social">
              <ServicePanel layout={PANELS_CONFIG.social} isDesktop={false} onClick={() => handleCardClick(PANELS_CONFIG.social.slug)} />
            </div>
            <div className="tablet-card-mobile">
              <ServicePanel layout={PANELS_CONFIG.mobile} isDesktop={false} onClick={() => handleCardClick(PANELS_CONFIG.mobile.slug)} />
            </div>
            <div className="tablet-card-software">
              <ServicePanel layout={PANELS_CONFIG.software} isDesktop={false} onClick={() => handleCardClick(PANELS_CONFIG.software.slug)} />
            </div>
          </div>
        </div>

        {/* ==================================================================
            3. MOBILE RESPONSIVE FLOW (< 640px)
           ================================================================== */}
        <div className="services-mobile-flow">
          <div className="mobile-intro-section">
            <span className="editorial-meta-kicker">SERVICES / 001 — 006</span>
            <h2 className="mobile-main-title">
              WHAT WE<br />CREATE AT
            </h2>
            <div className="mobile-name-strip">
              INSPIRING WAVE
            </div>
            <p className="mobile-intro-copy">
              A full-spectrum digital studio turning essential ideas into scalable, real-world experiences.
            </p>
            <img
              src="/images/services/wave-crest.webp"
              alt=""
              className="mobile-wave-thumb"
            />
          </div>

          <div className="mobile-cards-stack">
            {panels.map((panel) => (
              <ServicePanel
                key={panel.id}
                layout={panel}
                isDesktop={false}
                onClick={() => handleCardClick(panel.slug)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          ACCESSIBLE EDITORIAL DETAIL MODAL
         ==================================================================== */}
      {activeModal && (
        <div
          className="service-detail-modal-backdrop"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
        >
          <div
            className={`service-detail-modal-card card-theme-${activeModal.theme}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close service details"
            >
              ✕
            </button>

            <div className="modal-grid-layout">
              <div className="modal-content-col">
                <span className="font-mono text-xs uppercase tracking-widest block mb-2 opacity-80">
                  {activeModal.number} // {activeModal.category}
                </span>

                <h3 id="modal-service-title" className="font-display font-black text-4xl sm:text-5xl uppercase italic mb-3">
                  {activeModal.title}
                </h3>

                <p className="text-base sm:text-lg font-sans mb-4 opacity-90 leading-snug">
                  {activeModal.tagline}
                </p>

                <p className="text-sm font-sans mb-6 opacity-80 leading-relaxed">
                  {activeModal.description}
                </p>

                <div className="mb-6">
                  <span className="font-mono text-xs uppercase tracking-wider block mb-2 font-bold">
                    Key Deliverables:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono">
                    {activeModal.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/contact"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-transform hover:scale-105 ${
                    activeModal.theme === 'ivory'
                      ? 'bg-[#111110] text-[#FAF4E9]'
                      : 'bg-[#FFFDF5] text-[#111110]'
                  }`}
                  onClick={() => setActiveModal(null)}
                >
                  <span>START A PROJECT WITH US</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="modal-image-col flex items-center justify-center p-4">
                <img
                  src={activeModal.image}
                  alt={activeModal.imageAlt}
                  className="max-h-[260px] w-auto object-contain filter drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ServicesSection;
