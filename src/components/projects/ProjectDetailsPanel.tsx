import * as React from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { PortfolioProject } from './data/projects';

export interface ProjectDetailsPanelProps {
  projects: PortfolioProject[];
  activeIndex: number;
  reducedMotion: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
}

/**
 * Right-side editorial case-study detail panel.
 * Keeps panel geometry fixed while smoothly animating title, description, and metadata
 * whenever the active project changes.
 */
export function ProjectDetailsPanel({
  projects,
  activeIndex,
  reducedMotion,
  onPrev,
  onNext,
  onSelectIndex,
}: ProjectDetailsPanelProps) {
  const project = projects[activeIndex];
  const contentRef = React.useRef<HTMLDivElement>(null);
  const firstRenderRef = React.useRef(true);

  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const el = contentRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-iwp-detail-title]',
        { yPercent: 105, opacity: 0.2 },
        { yPercent: 0, opacity: 1, duration: 0.46, ease: 'power3.out', overwrite: 'auto' }
      );
      gsap.fromTo(
        '[data-iwp-detail-fade]',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.045, ease: 'power3.out', overwrite: 'auto' }
      );
    }, el);

    return () => ctx.revert();
  }, [activeIndex, reducedMotion]);

  const totalStr = String(projects.length).padStart(2, '0');

  return (
    <div className="iwp-details-panel">
      {/* Top Row: Counter + Segmented Progress Indicator */}
      <div className="iwp-details-topbar" data-iw-proj-enter>
        <div className="iwp-section-id">
          <span className="iwp-section-kicker">03 / SELECTED WORK</span>
        </div>

        <div className="iwp-counter-row" aria-live="polite">
          <span className="iwp-counter-text">
            <strong>{project.number}</strong> / {totalStr}
          </span>
          <div className="iwp-progress-segments" role="tablist" aria-label="Select project">
            {projects.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`Project ${p.number}: ${p.title}`}
                className={`iwp-progress-seg ${idx === activeIndex ? 'is-active' : ''}`}
                onClick={() => onSelectIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated Active Project Content */}
      <div ref={contentRef} className="iwp-details-body">
        <div className="iwp-featured-tag" data-iw-proj-enter>
          <span className="iwp-lime-square" aria-hidden="true" />
          <span>{project.featured ? 'FEATURED PROJECT' : project.category}</span>
        </div>

        <div className="iwp-title-slot" data-iw-proj-enter>
          <h2 id="work-heading" className="iwp-detail-title" data-iwp-detail-title>
            {project.title}
          </h2>
        </div>

        <p className="iwp-detail-desc" data-iw-proj-enter data-iwp-detail-fade>
          {project.description}
        </p>

        <div className="iwp-detail-divider" aria-hidden="true" data-iw-proj-enter />

        {/* Metadata Grid: Services / Year / Industry */}
        <dl className="iwp-meta-grid" data-iw-proj-enter data-iwp-detail-fade>
          <div className="iwp-meta-col">
            <dt>SERVICES</dt>
            <dd>{project.services.join(', ')}</dd>
          </div>
          {project.year && (
            <div className="iwp-meta-col">
              <dt>YEAR</dt>
              <dd>{project.year}</dd>
            </div>
          )}
          {project.industry && (
            <div className="iwp-meta-col">
              <dt>INDUSTRY</dt>
              <dd>{project.industry}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Bottom Row: Angled Ivory/Lime CTA + Previous/Next Controls */}
      <div className="iwp-details-actions" data-iw-proj-enter>
        {project.websiteUrl ? (
          <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="iwp-cta-angled">
            <span className="iwp-cta-lime-back" aria-hidden="true" />
            <span className="iwp-cta-face">
              <span>VISIT WEBSITE</span>
              <span className="iwp-cta-arrow" aria-hidden="true">↗</span>
            </span>
          </a>
        ) : project.caseStudyUrl ? (
          <Link to={project.caseStudyUrl} className="iwp-cta-angled">
            <span className="iwp-cta-lime-back" aria-hidden="true" />
            <span className="iwp-cta-face">
              <span>VIEW CASE STUDY</span>
              <span className="iwp-cta-arrow" aria-hidden="true">
                ↗
              </span>
            </span>
          </Link>
        ) : (
          <Link to="/work" className="iwp-cta-angled">
            <span className="iwp-cta-lime-back" aria-hidden="true" />
            <span className="iwp-cta-face">
              <span>EXPLORE ALL WORK</span>
              <span className="iwp-cta-arrow" aria-hidden="true">
                ↗
              </span>
            </span>
          </Link>
        )}

        <div className="iwp-nav-controls">
          <button
            type="button"
            className="iwp-nav-btn iwp-nav-btn--prev"
            onClick={onPrev}
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            type="button"
            className="iwp-nav-btn iwp-nav-btn--next"
            onClick={onNext}
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
