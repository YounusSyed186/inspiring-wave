/**
 * Living Capabilities – Main Component
 *
 * Assembles the scroll-pinned 3D service world matching the website theme.
 * Supports dark studio mode (matching website identity) and architectural cream mode.
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
          {/* Header typography (visible in initial overview) */}
          <div className={`lc-header ${progress > 0.08 ? 'lc-header--scrolled' : ''}`}>
            <div className="lc-badge-row">
              <span className="lc-marker">04 / CAPABILITIES</span>
              <button
                type="button"
                className="lc-theme-toggle"
                onClick={() => setTheme(t => t === 'dark' ? 'cream' : 'dark')}
                aria-label="Toggle exhibition theme"
              >
                <span>MODE:</span> <b>{theme.toUpperCase()}</b>
              </button>
            </div>
            <h2 className="lc-title">
              <span className="lc-title-line">SERVICES IN</span>
              <em className="lc-title-em">motion.</em>
            </h2>
            <p className="lc-subtitle">
              Integrated digital capabilities that connect strategy,
              design, and technology — built to create real
              momentum for your business.
            </p>
            <Link to="/services" className="lc-cta-btn">
              EXPLORE CAPABILITIES <span className="lc-cta-arrow">↗</span>
            </Link>
          </div>

          {/* Floating Infographic Callout Badges (matching reference artwork layout) */}
          {isDesktop && (
            <div className={`lc-callouts ${progress > 0.08 ? 'lc-callouts--scrolled' : ''}`} aria-hidden="true">
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
                  <span className="lc-pin-tag">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="lc-pin-label">{s.title.toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active station info panel (frosted editorial card) */}
          <div className={`lc-station-info ${isPinned && progress > 0.04 ? 'visible' : ''}`}>
            <div className="lc-station-badge">
              <span className="lc-badge-tag">{String(activeStation + 1).padStart(2, '0')}</span>
              <span className="lc-badge-discipline">DISCIPLINE</span>
            </div>
            <h3 className="lc-station-title">{station.title}</h3>
            <p className="lc-station-summary">{station.summary}</p>
            <div className="lc-station-deliverables">
              {station.deliverables.map(d => (
                <span key={d} className="lc-deliverable">{d}</span>
              ))}
            </div>
            <Link to={`/services/${station.slug}`} className="lc-station-link">
              EXPLORE SERVICE <span>→</span>
            </Link>
          </div>

          {/* Bottom scroll hint */}
          <div className={`lc-scroll-hint ${progress > 0.04 ? 'hidden' : ''}`}>
            <span>↓</span> SCROLL TO EXPLORE
          </div>
        </div>

        {/* Navigation */}
        <CapabilitiesNav
          activeStation={activeStation}
          onNavigate={navigateToStation}
          visible={isPinned && isDesktop}
        />

        {/* Progress bar */}
        <CapabilitiesProgress progress={progress} visible={isPinned} />
      </div>

      {/* Mobile fallback */}
      {!isDesktop && (
        <div className="lc-mobile">
          <div className="lc-mobile-header">
            <span className="lc-marker">04 / CAPABILITIES</span>
            <h2 className="lc-title">
              <span className="lc-title-line">SERVICES IN</span>
              <em className="lc-title-em">motion.</em>
            </h2>
          </div>
          <div className="lc-mobile-grid">
            {STATIONS.map((s, i) => (
              <Link to={`/services/${s.slug}`} key={s.slug} className="lc-mobile-card">
                <span className="lc-mobile-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                </div>
                <span className="lc-mobile-arrow">↗</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default LivingCapabilities;
