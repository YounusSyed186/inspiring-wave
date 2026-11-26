import * as React from 'react';
import { Link } from 'react-router-dom';
import type { SupportingPillar } from './data/testimonials';

export interface TestimonialControlsProps {
  pillars: SupportingPillar[];
  activeIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function TestimonialControls({
  pillars,
  activeIndex,
  total,
  onPrev,
  onNext,
}: TestimonialControlsProps) {
  const currentStr = String(activeIndex + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');

  return (
    <div className="tw-bottom-bar" data-tw-bottom>
      {/* Left: Three Compact Studio Trust Pillars with Angled Neon-Lime Dividers */}
      <div className="tw-pillars-row" aria-label="Partnership principles">
        {pillars.map((pillar, idx) => (
          <React.Fragment key={pillar.headline + idx}>
            <div className="tw-pillar-item" data-tw-pillar>
              <span className="tw-pillar-head">{pillar.headline}</span>
              <span className="tw-pillar-sub">{pillar.sublabel}</span>
            </div>
            {idx < pillars.length - 1 && (
              <span className="tw-pillar-slash" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Prev / Next Circle Pair + Counter + Explore More Voices CTA */}
      <div className="tw-nav-cluster">
        <div className="tw-nav-buttons" role="group" aria-label="Testimonial navigation">
          <button
            type="button"
            className="tw-nav-btn tw-nav-btn--prev"
            onClick={onPrev}
            aria-label="Previous client testimonial"
          >
            <svg viewBox="0 0 24 24" className="tw-nav-arrow" aria-hidden="true">
              <path
                d="M19 12H6M11.5 6.5L6 12l5.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="tw-nav-btn tw-nav-btn--next"
            onClick={onNext}
            aria-label="Next client testimonial"
          >
            <svg viewBox="0 0 24 24" className="tw-nav-arrow" aria-hidden="true">
              <path
                d="M5 12h13M12.5 6.5L18 12l-5.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="tw-nav-counter" aria-live="polite">
            {currentStr} / {totalStr}
          </span>
        </div>

        <Link to="/work" className="tw-explore-voices">
          <span>EXPLORE MORE VOICES</span>
          <i aria-hidden="true">↗</i>
        </Link>
      </div>
    </div>
  );
}
