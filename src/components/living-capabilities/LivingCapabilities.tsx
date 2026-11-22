/**
 * Living Capabilities – Multidimensional Editorial 3D Experience
 *
 * Reconstructs the approved "SERVICES IN MOTION" composition from media_1795368079976_6c362555.jpg:
 * - Left editorial: 04 / CAPABILITIES, SERVICES IN motion., description, EXPLORE CAPABILITIES ↗
 * - 3D WebGL Canvas: Hybrid 2.5D / 3D editorial art collage with 6 stations, ribbon, and lighting
 * - Interactive service annotations: 01 // DIGITAL STRATEGY ... 06 // SOFTWARE DEVELOPMENT
 * - Stickers: BUILD CREATE SCALE ↗, END-TO-END CREATIVE TECH
 * - Bottom torn paper edge transition into electric cobalt blue
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CapabilitiesCanvas } from './CapabilitiesCanvas';
import { CapabilitiesNav } from './CapabilitiesNav';
import { CapabilitiesProgress } from './CapabilitiesProgress';
import { STATIONS, SCROLL_HEIGHT_VH, DESKTOP_MIN } from './config';
import { getActiveStation } from './animations';
import type { CapabilitiesTheme } from './types';
import { ScrollTrigger, useGSAP } from '../../motion';
import './living-capabilities.css';

export function LivingCapabilities() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [theme, setTheme] = useState<CapabilitiesTheme>('dark');
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= DESKTOP_MIN : false
  );

  const activeStation = getActiveStation(progress);
  const station = STATIONS[activeStation];
  const isFinale = progress >= 0.85;

  // Check desktop on resize
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_MIN);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ScrollTrigger pin
  useGSAP(() => {
    if (!isDesktop) return;
    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      id: 'lc-trigger',
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (SCROLL_HEIGHT_VH / 100))}`,
      pin: viewportRef.current!,
      pinSpacing: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        setIsPinned(self.isActive);
      },
      onRefresh: (self) => {
        setProgress(self.progress);
        setIsPinned(self.isActive);
      },
      onEnter: () => setIsPinned(true),
      onLeave: () => setIsPinned(false),
      onEnterBack: () => setIsPinned(true),
      onLeaveBack: () => setIsPinned(false),
    });

    return () => trigger.kill();
  }, { dependencies: [isDesktop] });

  // Navigate to station
  const navigateToStation = useCallback((index: number) => {
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.getById('lc-trigger');
    const startY = st ? st.start : (section.getBoundingClientRect().top + window.scrollY);
    const totalScroll = st ? (st.end - st.start) : (SCROLL_HEIGHT_VH * window.innerHeight / 100);
    const midpoint = (STATIONS[index].scrollRange[0] + STATIONS[index].scrollRange[1]) / 2;
    const targetScroll = startY + totalScroll * midpoint;

    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`lc-section lc-theme-${theme}`}
      id="services"
      aria-label="Our capabilities"
    >
      {/* Pinned viewport */}
      <div ref={viewportRef} className="lc-viewport">
        {/* 3D Canvas */}
        {isDesktop && (
          <CapabilitiesCanvas
            progress={progress}
            theme={theme}
            containerRef={viewportRef}
          />
        )}

        {/* DOM Overlay */}
        <div className="lc-overlay">
          {/* Top-Right Angled Sticker */}
          <div className="lc-sticker-build" aria-hidden="true">
            <span>BUILD</span>
            <span>CREATE</span>
            <span>SCALE ↗</span>
          </div>

          {/* Bottom-Right Tech Pill */}
          <div className="lc-sticker-tech" aria-hidden="true">
            <span>END-TO-END</span>
            <span>CREATIVE TECH</span>
          </div>

          {/* Left Editorial Header (visible in overview and finale) */}
          <div className={`lc-header ${progress > 0.08 && !isFinale ? 'lc-header--scrolled' : ''}`}>
            <div className="lc-badge-row">
              <span className="lc-marker">04 / CAPABILITIES</span>
              <div className="lc-header-line" />
            </div>
            <h2 className="lc-title">
              <span className="lc-title-line">SERVICES IN</span>
              <em className="lc-title-em">MOTION.</em>
            </h2>
            <p className="lc-subtitle">
              Strategy, design, and technology capabilities that move brands,
              products, and cultures forward.
            </p>
            <div className="lc-cta-row">
              <Link to="/services" className="lc-cta-btn">
                <span>EXPLORE CAPABILITIES</span>
                <span className="lc-cta-arrow-circle">↗</span>
              </Link>
              <div className="lc-pill-tag">
                <span>6 CAPABILITIES ✦</span>
              </div>
            </div>
          </div>

          {/* Floating Infographic Callout Badges matching reference artwork */}
          {isDesktop && (
            <div className={`lc-callouts ${progress > 0.08 && !isFinale ? 'lc-callouts--scrolled' : ''}`} aria-hidden="true">
              {STATIONS.map((s, idx) => (
                <button
                  key={s.slug}
                  type="button"
                  className={`lc-callout-pin lc-callout-${idx} ${activeStation === idx ? 'is-active' : ''}`}
                  style={{
                    left: `${s.markerScreenPos[0]}%`,
                    top: `${s.markerScreenPos[1]}%`,
                  }}
                  onClick={() => navigateToStation(idx)}
                >
                  <span className="lc-pin-leader" />
                  <span className="lc-pin-badge">
                    <span className="lc-pin-tag">{String(idx + 1).padStart(2, '0')} //</span>
                    <span className="lc-pin-label">{s.title.toUpperCase()}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Active station info panel (frosted editorial card during scroll journey) */}
          <div className={`lc-station-info ${isPinned && progress > 0.08 && !isFinale ? 'visible' : ''}`}>
            <div className="lc-station-badge">
              <span className="lc-badge-tag">{String(activeStation + 1).padStart(2, '0')} // CAPABILITY</span>
            </div>
            <h4 className="lc-station-tagline">{station.tagline}</h4>
            <h3 className="lc-station-title">{station.title}</h3>
            <p className="lc-station-summary">{station.summary}</p>
            <div className="lc-station-deliverables">
              {station.deliverables.map((d) => (
                <span key={d} className="lc-deliverable">{d}</span>
              ))}
            </div>
            <Link to={`/services/${station.slug}`} className="lc-station-link">
              <span>EXPLORE SERVICE</span>
              <span className="lc-station-arrow">↗</span>
            </Link>
          </div>

          {/* Finale Panel (Phase 7: 85-100%) */}
          <div className={`lc-finale-panel ${isFinale ? 'visible' : ''}`}>
            <span className="lc-finale-tag">ALL DISCIPLINES UNITED</span>
            <h3 className="lc-finale-title">
              <span>SIX CAPABILITIES.</span>
              <em>ONE CREATIVE FORCE.</em>
            </h3>
            <p className="lc-finale-desc">
              Strategy, design, and technology working together to move ambitious ideas forward.
            </p>
            <Link to="/contact" className="lc-finale-cta">
              <span>LET'S BUILD SOMETHING</span>
              <span className="lc-cta-arrow-circle">↗</span>
            </Link>
          </div>

          {/* Bottom Center Scroll Prompt */}
          <div className={`lc-scroll-hint ${progress > 0.06 ? 'hidden' : ''}`}>
            <span className="lc-scroll-dot" />
            <span className="lc-scroll-text">SCROLL TO EXPLORE</span>
            <span className="lc-scroll-arrow">↓</span>
          </div>

          {/* Bottom Torn Paper Edge Transition */}
          <div className="lc-torn-transition" aria-hidden="true">
            <div className="lc-torn-paper" />
            <div className="lc-torn-blue" />
          </div>
        </div>

        {/* Navigation Dots */}
        <CapabilitiesNav
          activeStation={activeStation}
          onNavigate={navigateToStation}
          visible={isPinned && isDesktop && !isFinale}
        />

        {/* Progress Bar */}
        <CapabilitiesProgress progress={progress} visible={isPinned} />
      </div>

      {/* Mobile fallback */}
      {!isDesktop && (
        <div className="lc-mobile">
          <div className="lc-mobile-header">
            <span className="lc-marker">04 / CAPABILITIES</span>
            <h2 className="lc-title">
              <span className="lc-title-line">SERVICES IN</span>
              <em className="lc-title-em">MOTION.</em>
            </h2>
            <p className="lc-subtitle">
              Strategy, design, and technology capabilities that move brands,
              products, and cultures forward.
            </p>
          </div>
          <div className="lc-mobile-grid">
            {STATIONS.map((s, i) => (
              <Link to={`/services/${s.slug}`} key={s.slug} className="lc-mobile-card">
                <div className="lc-mobile-card-top">
                  <span className="lc-mobile-num">{String(i + 1).padStart(2, '0')} //</span>
                  <span className="lc-mobile-tagline">{s.tagline}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
                <div className="lc-mobile-deliverables">
                  {s.deliverables.map((d) => (
                    <span key={d} className="lc-mobile-deliv">{d}</span>
                  ))}
                </div>
                <div className="lc-mobile-link-row">
                  <span>EXPLORE SERVICE</span>
                  <span className="lc-mobile-arrow">↗</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default LivingCapabilities;
