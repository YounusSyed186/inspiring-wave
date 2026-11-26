import * as React from 'react';
import { PortfolioProject } from './data/projects';

export interface ProjectOrbitCardProps {
  project: PortfolioProject;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

/**
 * Individual art-directed pitch-deck card on the invisible orbital curve.
 * Uses real HTML typography, distinct card-theme layouts, and subtle hover lift only.
 */
export const ProjectOrbitCard = React.memo(function ProjectOrbitCard({
  project,
  index,
  isActive,
  onSelect,
  cardRef,
}: ProjectOrbitCardProps) {
  const themeClass = `iwp-card--${project.cardTheme}`;

  return (
    <button
      ref={cardRef}
      type="button"
      className={`iwp-orbit-card ${themeClass} ${isActive ? 'is-active' : ''}`}
      onClick={() => onSelect(index)}
      aria-pressed={isActive}
      aria-label={`Select project ${project.number}: ${project.title}, ${project.category}`}
    >
      {/* Subtle printed paper grain overlay */}
      <span className="iwp-card-grain" aria-hidden="true" />

      {/* Card header: 0X / CATEGORY */}
      <span className="iwp-card-top">
        <span className="iwp-card-kicker">
          <span className="iwp-card-num">{project.number}</span>
          <span className="iwp-card-slash">/</span>
          <span className="iwp-card-cat">{project.category}</span>
        </span>
        {project.cardTheme === 'ivory' && (
          <span className="iwp-card-cross" aria-hidden="true">
            +
          </span>
        )}
      </span>

      {project.subtitle && project.cardTheme === 'ivory' && (
        <span className="iwp-card-micro-specs" aria-hidden="true">
          {project.subtitle.split(' · ').map((part) => (
            <span key={part}>{part}</span>
          ))}
        </span>
      )}

      {/* Artwork layer (clipped & art-directed per card theme) */}
      <span
        className="iwp-card-media-wrap"
        aria-hidden="true"
        style={{ backgroundImage: `url(${project.coverImage})` }}
      >
        <img
          src={project.coverImage}
          alt=""
          loading="eager"
          decoding="async"
          className="iwp-card-img"
        />
        <span className="iwp-card-media-scrim" />
      </span>

      {/* Theme-specific editorial vector accents */}
      {project.cardTheme === 'ivory' && (
        <svg
          className="iwp-card-ivory-wave"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 0 0 L 445 0 C 405 128, 315 190, 285 292 C 262 356, 224 388, 178 400 L 0 400 Z"
            fill="currentColor"
          />
          <path
            d="M 410 0 C 370 132, 280 194, 248 298"
            fill="none"
            stroke="rgba(17,17,17,0.12)"
            strokeWidth="1.2"
          />
        </svg>
      )}

      {project.cardTheme === 'editorial' && (
        <svg
          className="iwp-card-editorial-lines"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -20 340 Q 190 230 620 315 M -20 364 Q 210 258 620 338 M -20 388 Q 230 286 620 360"
            fill="none"
            stroke="rgba(255,240,224,0.22)"
            strokeWidth="1.2"
          />
        </svg>
      )}

      {project.cardTheme === 'blue' && (
        <svg
          className="iwp-card-blue-arcs"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <circle cx="460" cy="240" r="150" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.2" />
          <circle cx="515" cy="275" r="110" fill="none" stroke="rgba(217,255,0,0.22)" strokeWidth="1" />
        </svg>
      )}

      {/* Editorial typography inside the card cover */}
      <span className="iwp-card-body">
        <span className="iwp-card-title">{project.title}</span>
      </span>

      {/* Corner editorial indicator */}
      <span className="iwp-card-footer" aria-hidden="true">
        {project.cardTheme === 'ivory' ? (
          <span className="iwp-card-arrow">↗</span>
        ) : (
          <span className="iwp-card-corner-tick" />
        )}
      </span>
    </button>
  );
});
