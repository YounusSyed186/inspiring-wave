import * as React from 'react';
import { PORTFOLIO_PROJECTS, PortfolioProject } from './data/projects';
import { ProjectOrbitCard } from './ProjectOrbitCard';
import { ProjectDetailsPanel } from './ProjectDetailsPanel';
import { getWrappedOffset } from './animations/orbitGeometry';
import { useProjectOrbit } from './animations/useProjectOrbit';
import { useCarouselWheel } from './hooks/useCarouselWheel';
import { useCarouselGestures } from './hooks/useCarouselGestures';
import { TornPaperSeam } from '@/components/ui/TornPaperSeam';
import './styles/projects.css';

export interface ProjectsSectionProps {
  projects?: PortfolioProject[];
  initialIndex?: number;
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

/**
 * THE EDITORIAL ORBIT — Infinite 10-Project Vertical Circular Carousel (`#work`).
 * Ten oversized pitch-deck pages travel continuously around an invisible vertical Ferris-wheel
 * trajectory anchored off the left edge: entering from upper-left, activating at center-left,
 * exiting through lower-left, and wrapping seamlessly from Project 10 to Project 01.
 */
export function ProjectsSection({
  projects = PORTFOLIO_PROJECTS,
  initialIndex = 0,
  className = '',
}: ProjectsSectionProps) {
  const count = projects.length;
  const safeInitial = ((initialIndex % count) + count) % count;

  // Unbounded continuous target position (can advance infinitely: ... -1, 0, 1, ..., 9, 10, 11 ...)
  const [targetPosition, setTargetPosition] = React.useState(safeInitial);
  const activeIndex = ((Math.round(targetPosition) % count) + count) % count;
  const reducedMotion = useReducedMotion();

  const sectionRef = React.useRef<HTMLElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const { setDragOffset } = useProjectOrbit({
    sectionRef,
    viewportRef,
    cardRefs,
    targetPosition,
    count,
    reducedMotion,
  });

  const stepBy = React.useCallback((delta: -1 | 1) => {
    setTargetPosition((prev) => prev + delta);
  }, []);

  const handlePrev = React.useCallback(() => stepBy(-1), [stepBy]);
  const handleNext = React.useCallback(() => stepBy(1), [stepBy]);

  // Move along shortest circular arc to the clicked card or progress segment
  const selectByShortestPath = React.useCallback(
    (targetIdx: number) => {
      setTargetPosition((prev) => prev + getWrappedOffset(targetIdx, prev, count));
    },
    [count]
  );

  useCarouselWheel({
    containerRef: viewportRef,
    enabled: true,
    onStep: stepBy,
  });

  useCarouselGestures({
    containerRef: viewportRef,
    targetPosition,
    enabled: true,
    onDragOffset: setDragOffset,
    onDragCommit: setTargetPosition,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className={`iw-projects-orbit ${className}`.trim()}
      aria-labelledby="work-heading"
      onKeyDown={handleKeyDown}
    >
      {/* Seamless torn-paper top seam from Capabilities (#f3efe4) */}
      <TornPaperSeam
        topColor="#f3efe4"
        fiberColor="#FFFFFF"
        accentColor="#173CFF"
        seed={37}
        heightClass="h-8 sm:h-11 md:h-14"
      />

      {/* Restrained midnight-navy atmosphere (no visible orbital track or hub) */}
      <div className="iwp-bg-atmosphere" aria-hidden="true" />

      <div className="iwp-layout">
        {/* Left 54%: Clipped Invisible Vertical Orbital Viewport */}
        <div
          ref={viewportRef}
          className="iwp-orbit-viewport"
          aria-roledescription="carousel"
          aria-label="Selected work project deck"
        >
          <div className="iwp-orbit-stage">
            {projects.map((project, index) => (
              <ProjectOrbitCard
                key={project.id}
                project={project}
                index={index}
                isActive={index === activeIndex}
                onSelect={selectByShortestPath}
                cardRef={(el) => {
                  cardRefs.current[index] = el;
                }}
              />
            ))}
          </div>
        </div>

        {/* Right 46%: Independent Editorial Details Panel */}
        <div className="iwp-details-column">
          <ProjectDetailsPanel
            projects={projects}
            activeIndex={activeIndex}
            reducedMotion={reducedMotion}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelectIndex={selectByShortestPath}
          />
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
