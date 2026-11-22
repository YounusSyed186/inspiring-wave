import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SERVICES_DATA, ServiceItem } from './services-data';
import './services.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const thinkerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

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

  // GSAP Coordinated Entrance Timeline & ScrollTrigger
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(
          [
            sunRef.current,
            thinkerRef.current,
            characterRef.current,
            waveRef.current,
            bannerRef.current,
            headlineRef.current,
            '.service-editorial-card',
          ],
          { opacity: 1, clearProps: 'all' },
        );
      });

      media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'bottom 85%',
            toggleActions: 'play none none reverse',
          },
          defaults: { ease: 'power3.out' },
        });

        // 1. Blue sun scales in
        if (sunRef.current) {
          tl.fromTo(
            sunRef.current,
            { scale: 0.65, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'back.out(1.2)' },
            0,
          );
        }

        // 2. Creative thinker photo unmasks
        if (thinkerRef.current) {
          tl.fromTo(
            thinkerRef.current,
            { clipPath: 'inset(100% 0 0 0)', opacity: 0, y: 25 },
            { clipPath: 'inset(0% 0 0 0)', opacity: 1, y: 0, duration: 1.0 },
            0.15,
          );
        }

        // 3. Anime character emerges from waves
        if (characterRef.current) {
          tl.fromTo(
            characterRef.current,
            { y: 80, opacity: 0, scale: 0.94 },
            { y: 0, opacity: 1, scale: 1, duration: 1.25, ease: 'power4.out' },
            0.2,
          );
        }

        // 4. Wave rises
        if (waveRef.current) {
          tl.fromTo(
            waveRef.current,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0 },
            0.1,
          );
        }

        // 5. Headline words reveal
        if (headlineRef.current) {
          tl.from(
            headlineRef.current.querySelectorAll('.editorial-title-line'),
            {
              y: 50,
              opacity: 0,
              stagger: 0.1,
              duration: 0.85,
              ease: 'power3.out',
            },
            0.25,
          );
        }

        // 6. Inspiring Wave Banner sweeps across
        if (bannerRef.current) {
          tl.fromTo(
            bannerRef.current,
            { scaleX: 0, opacity: 0, transformOrigin: 'left center' },
            { scaleX: 1, opacity: 1, duration: 0.85, ease: 'back.out(1.15)' },
            0.35,
          );
        }

        // 7. Staggered Service Cards assembly from varied angles
        const cards = section.querySelectorAll<HTMLElement>('.service-editorial-card');
        tl.from(
          cards,
          {
            y: (idx) => (idx % 2 === 0 ? 70 : 90),
            x: (idx) => (idx === 0 ? -40 : idx === 1 ? 40 : 0),
            opacity: 0,
            scale: 0.96,
            stagger: 0.08,
            duration: 1.0,
            ease: 'power3.out',
          },
          0.4,
        );

        // Ambient wave drift
        if (waveRef.current) {
          gsap.to(waveRef.current, {
            y: 8,
            duration: 3.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  const handleCardClick = useCallback((service: ServiceItem) => {
    setActiveModal(service);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="editorial-services-section"
      aria-label="Our Services — What We Create"
    >
      <div className="services-canvas-container">
        {/* Top Monospace Section Marker */}
        <div className="services-meta-tag">
          <span>SERVICES / 001 — 006</span>
        </div>

        {/* Master Editorial Layout: Left Zone + Right Collage */}
        <div className="services-editorial-grid">
          {/* ================================================================
              LEFT EDITORIAL COLUMN
             ================================================================ */}
          <div ref={leftColRef} className="editorial-left-col">
            <div className="editorial-headline-group">
              <h2 ref={headlineRef} className="editorial-main-title">
                <span className="editorial-title-line">WHAT WE</span>
                <span className="editorial-title-line">CREATE AT</span>
              </h2>

              <div ref={bannerRef} className="editorial-banner-wrap">
                <div className="editorial-banner-box">
                  <span>INSPIRING WAVE</span>
                </div>
                {/* Hand-drawn Energy Marks */}
                <svg
                  className="banner-energy-marks"
                  viewBox="0 0 50 50"
                  fill="none"
                  aria-hidden="true"
                >
                  <line x1="8" y1="12" x2="2" y2="4" stroke="#101010" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="22" y1="8" x2="22" y2="1" stroke="#101010" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="36" y1="12" x2="44" y2="5" stroke="#101010" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <p className="editorial-intro-copy">
                A full-spectrum digital studio turning essential ideas into scalable, real-world experiences.
              </p>

              <Link
                to="/services"
                className="editorial-action-btn"
                aria-label="Explore all services"
              >
                <span>→</span>
              </Link>
            </div>

            {/* Background Graphic Layers: Sun, Clouds, Thinker, Manga Character, Waves */}
            <div className="left-art-collage" aria-hidden="true">
              {/* Electric Blue Sun */}
              <div ref={sunRef} className="art-blue-sun">
                <svg
                  className="sun-flying-birds"
                  viewBox="0 0 60 45"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 14 Q10 4 18 14 Q26 4 34 14" stroke="#101010" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M24 28 Q30 20 36 28 Q42 20 48 28" stroke="#101010" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Hand-drawn Clouds */}
              <svg
                className="sun-clouds-svg"
                viewBox="0 0 240 100"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 80 Q30 40 70 50 Q110 20 150 55 Q190 35 230 75"
                  stroke="#101010"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M40 75 Q60 55 90 60 Q120 45 150 70"
                  stroke="#101010"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Creative Thinker (Torn-paper Photo Cutout) */}
              <div ref={thinkerRef} className="art-thinker-photo-wrap">
                <img
                  src="/assets/services/creative-thinker.webp"
                  alt=""
                  loading="lazy"
                />
              </div>

              {/* Anime / Manga Character with Headphones */}
              <div ref={characterRef} className="art-character-wrap">
                <img
                  src="/assets/services/character-full-illustration.webp"
                  alt=""
                  loading="lazy"
                />
              </div>

              {/* Layered Ocean Waves */}
              <div ref={waveRef} className="art-bottom-wave">
                <img
                  src="/assets/services/sweeping-wave-bottom.webp"
                  alt=""
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT ASYMMETRIC COLLAGE: 6 EDITORIAL CARDS
             ================================================================ */}
          <div ref={cardsRef} className="services-cards-collage">
            {/* --------------------------------------------------------------
                CARD 01: DIGITAL STRATEGY
               -------------------------------------------------------------- */}
            <article
              className="service-editorial-card card-theme-ivory card-01-strategy"
              onClick={() => handleCardClick(SERVICES_DATA[0])}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(SERVICES_DATA[0])}
              tabIndex={0}
              role="button"
              aria-label="View Digital Strategy details"
            >
              <div>
                <div className="card-meta-head">
                  <span>01 / STRATEGY</span>
                </div>
                <h3 className="card-title-text">
                  DIGITAL<br />STRATEGY
                </h3>
                <div className="card-strategy-underline" />
              </div>

              {/* Vector Target with Arrow */}
              <svg
                className="card-strategy-target"
                viewBox="0 0 120 120"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="60" cy="60" r="54" stroke="#101010" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="42" fill="#2448f5" />
                <circle cx="60" cy="60" r="30" fill="#faf8f2" stroke="#101010" strokeWidth="2" />
                <circle cx="60" cy="60" r="18" fill="#2448f5" />
                <circle cx="60" cy="60" r="7" fill="#101010" />
                {/* Arrow embedded in bullseye */}
                <path d="M96 24 L60 60" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M104 16 L92 20 L98 28 Z" fill="#101010" />
                <path d="M108 20 L98 24 L102 32 Z" fill="#2448f5" />
                {/* Speed ticks */}
                <line x1="84" y1="18" x2="76" y2="10" stroke="#101010" strokeWidth="2" strokeLinecap="round" />
                <line x1="94" y1="36" x2="102" y2="44" stroke="#101010" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* Mountain Ridge Cutout */}
              <div className="card-strategy-mountains">
                <img
                  src="/assets/services/strategy-mountain.webp"
                  alt=""
                  loading="lazy"
                />
              </div>

              <div className="card-arrow-pill" aria-hidden="true">
                <span>→</span>
              </div>
            </article>

            {/* --------------------------------------------------------------
                CARD 02: WEB DEVELOPMENT
               -------------------------------------------------------------- */}
            <article
              className="service-editorial-card card-theme-black card-02-web"
              onClick={() => handleCardClick(SERVICES_DATA[1])}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(SERVICES_DATA[1])}
              tabIndex={0}
              role="button"
              aria-label="View Web Development details"
            >
              <div>
                <div className="card-meta-head">
                  <span>02 / DEVELOPMENT</span>
                </div>
                <h3 className="card-title-text">
                  WEB<br />DEVELOPMENT
                </h3>
              </div>

              {/* Code Brackets */}
              <div className="card-web-code-tag" aria-hidden="true">
                <span>&lt;/&gt;</span>
              </div>

              {/* Laptop Photo with Website Preview */}
              <div className="card-web-laptop">
                <img
                  src="/assets/services/web-laptop.webp"
                  alt="Laptop displaying scalable website product"
                  loading="lazy"
                />
              </div>

              <div className="card-arrow-pill" aria-hidden="true">
                <span>→</span>
              </div>
            </article>

            {/* --------------------------------------------------------------
                CARD 03: UI/UX DESIGN (PROMINENT CENTER BANNER)
               -------------------------------------------------------------- */}
            <article
              className="service-editorial-card card-theme-blue card-03-uiux"
              onClick={() => handleCardClick(SERVICES_DATA[2])}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(SERVICES_DATA[2])}
              tabIndex={0}
              role="button"
              aria-label="View UI/UX Design details"
            >
              <div>
                <div className="card-meta-head">
                  <span>03 / EXPERIENCE</span>
                </div>
                <h3 className="card-title-text">
                  UI/UX DESIGN
                </h3>
              </div>

              {/* Typography Tool Frame [T] + Cursor */}
              <div className="card-uiux-tool-frame" aria-hidden="true">
                <span>T</span>
                <svg
                  className="card-uiux-cursor-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M4 4 L11 20 L14 13 L21 10 Z" fill="#ffffff" stroke="#101010" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Tablet & Wireframe Hands Photo */}
              <div className="card-uiux-tablet">
                <img
                  src="/assets/services/uiux-tablet.webp"
                  alt="Hands sketching wireframe layouts on tablet"
                  loading="lazy"
                />
              </div>

              <div className="card-arrow-pill" aria-hidden="true">
                <span>→</span>
              </div>
            </article>

            {/* --------------------------------------------------------------
                CARD 04: SOCIAL MEDIA
               -------------------------------------------------------------- */}
            <article
              className="service-editorial-card card-theme-ivory card-04-social"
              onClick={() => handleCardClick(SERVICES_DATA[3])}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(SERVICES_DATA[3])}
              tabIndex={0}
              role="button"
              aria-label="View Social Media details"
            >
              <div>
                <div className="card-meta-head">
                  <span>04 / SOCIAL</span>
                </div>
                <h3 className="card-title-text">
                  SOCIAL<br />MEDIA
                </h3>
              </div>

              {/* Social Badges: Instagram + Likes */}
              <div className="card-social-badges" aria-hidden="true">
                <div className="social-badge-insta">
                  <span>📷</span>
                </div>
                <div className="social-badge-likes">
                  <span>♥ 1.2K</span>
                </div>
              </div>

              {/* Illustrated Megaphone with Sound Waves */}
              <svg
                className="card-social-megaphone"
                viewBox="0 0 80 60"
                fill="none"
                aria-hidden="true"
              >
                <path d="M12 28 L28 22 L52 14 L52 46 L28 38 L12 32 Z" fill="#ffffff" stroke="#101010" strokeWidth="2.5" />
                <path d="M24 38 L22 52 L30 52 L32 38" fill="#101010" />
                <ellipse cx="52" cy="30" rx="4" ry="16" fill="#2448f5" stroke="#101010" strokeWidth="2" />
                {/* Sound waves */}
                <path d="M62 20 Q68 30 62 40" stroke="#101010" strokeWidth="2" strokeLinecap="round" />
                <path d="M70 14 Q78 30 70 46" stroke="#2448f5" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              {/* Creative Woman Portrait */}
              <div className="card-social-portrait">
                <img
                  src="/assets/services/social-woman.webp"
                  alt="Editorial portrait of creative woman with sunglasses"
                  loading="lazy"
                />
              </div>

              <div className="card-arrow-pill" aria-hidden="true">
                <span>→</span>
              </div>
            </article>

            {/* --------------------------------------------------------------
                CARD 05: MOBILE APP DEVELOPMENT
               -------------------------------------------------------------- */}
            <article
              className="service-editorial-card card-theme-black card-05-mobile"
              onClick={() => handleCardClick(SERVICES_DATA[4])}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(SERVICES_DATA[4])}
              tabIndex={0}
              role="button"
              aria-label="View Mobile App Development details"
            >
              <div>
                <div className="card-meta-head">
                  <span>05 / MOBILE</span>
                </div>
                <h3 className="card-title-text">
                  MOBILE APP<br />DEVELOPMENT
                </h3>
              </div>

              {/* Smartphone in Hand Photo */}
              <div className="card-mobile-phone">
                <img
                  src="/assets/services/mobile-phone.webp"
                  alt="Smartphone displaying mobile app interface in hand"
                  loading="lazy"
                />
              </div>

              <div className="card-arrow-pill" aria-hidden="true">
                <span>→</span>
              </div>
            </article>

            {/* --------------------------------------------------------------
                CARD 06: SOFTWARE DEVELOPMENT
               -------------------------------------------------------------- */}
            <article
              className="service-editorial-card card-theme-ivory card-06-software"
              onClick={() => handleCardClick(SERVICES_DATA[5])}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(SERVICES_DATA[5])}
              tabIndex={0}
              role="button"
              aria-label="View Software Development details"
            >
              <div>
                <div className="card-meta-head">
                  <span>06 / ENGINEERING</span>
                </div>
                <h3 className="card-title-text">
                  SOFTWARE<br />DEVELOPMENT
                </h3>
              </div>

              {/* Dual Interlocking Blue Gears */}
              <svg
                className="card-software-gears"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                {/* Large gear */}
                <g stroke="#2448f5" strokeWidth="2.5">
                  <circle cx="26" cy="26" r="14" fill="#faf8f2" />
                  <circle cx="26" cy="26" r="6" fill="#2448f5" />
                  <path d="M26 6 L26 12 M26 40 L26 46 M6 26 L12 26 M40 26 L46 26 M12 12 L16 16 M36 36 L40 40 M12 40 L16 36 M36 16 L40 12" strokeLinecap="round" />
                </g>
                {/* Small gear */}
                <g stroke="#2448f5" strokeWidth="2">
                  <circle cx="48" cy="48" r="9" fill="#faf8f2" />
                  <circle cx="48" cy="48" r="4" fill="#2448f5" />
                  <path d="M48 35 L48 39 M48 57 L48 61 M35 48 L39 48 M57 48 L61 48" strokeLinecap="round" />
                </g>
              </svg>

              {/* Laptop Photo with Code Editor */}
              <div className="card-software-laptop">
                <img
                  src="/assets/services/software-laptop.webp"
                  alt="Laptop displaying code IDE and mountains"
                  loading="lazy"
                />
              </div>

              <div className="card-arrow-pill" aria-hidden="true">
                <span>→</span>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* ====================================================================
          EXPANDED EDITORIAL DETAIL MODAL
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
                <span className="card-meta-head">
                  {activeModal.number} // {activeModal.category}
                </span>

                <h3 id="modal-service-title">
                  {activeModal.title}
                </h3>

                <p className="modal-tagline">
                  {activeModal.tagline}
                </p>

                <p className="modal-description">
                  {activeModal.description}
                </p>

                <ul className="modal-capabilities-list" aria-label="Key deliverables">
                  {activeModal.capabilities.map((cap) => (
                    <li key={cap}>
                      <span aria-hidden="true" />
                      <strong>{cap}</strong>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className={`modal-cta-link ${
                    activeModal.theme === 'ivory'
                      ? 'bg-[#101010] text-[#f3f0e8]'
                      : 'bg-[#ffffff] text-[#101010]'
                  }`}
                  onClick={() => setActiveModal(null)}
                >
                  <span>START A PROJECT WITH US</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="modal-image-col">
                <img
                  src={activeModal.image}
                  alt={activeModal.imageAlt}
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
