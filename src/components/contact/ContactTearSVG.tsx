import * as React from 'react';
import { FLAPS, mixHex } from './tear/verticalGeometry';

export interface ContactTearSVGProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  sheetRef: React.RefObject<SVGPathElement | null>;
  rimRef: React.RefObject<SVGPathElement | null>;
  fiberRef: React.RefObject<SVGPathElement | null>;
  flapRefs: React.MutableRefObject<(SVGPathElement | null)[]>;
  gradRefs: React.MutableRefObject<(SVGLinearGradientElement | null)[]>;
  uid: string;
  grainUrl: string;
}

export function ContactTearSVG({
  svgRef,
  sheetRef,
  rimRef,
  fiberRef,
  flapRefs,
  gradRefs,
  uid,
  grainUrl,
}: ContactTearSVGProps) {
  const flapBase = '#FAF3E8';

  return (
    <svg ref={svgRef} className="iwc-tear-svg" aria-hidden="true">
      <defs>
        {/* Subtle printed paper sheen across the obsidian bluish-black poster */}
        <linearGradient id={`${uid}c-sheen`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.015" />
          <stop offset="78%" stopColor="#070B16" stopOpacity="0" />
          <stop offset="100%" stopColor="#070B16" stopOpacity="0" />
        </linearGradient>

        {/* WORDS THAT STAY. radial bluish-navy glow & 64px architectural grid */}
        <radialGradient id={`${uid}c-glow`} cx="0.28" cy="0.54" r="0.55">
          <stop offset="0%" stopColor="#173CFF" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#1232D4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#070B16" stopOpacity="0" />
        </radialGradient>

        <pattern id={`${uid}c-grid`} width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(155, 163, 179, 0.045)" strokeWidth="1" />
        </pattern>

        {grainUrl && (
          <pattern id={`${uid}c-grain`} width="160" height="160" patternUnits="userSpaceOnUse">
            <image href={grainUrl} width="160" height="160" />
          </pattern>
        )}

        {/* Drop shadow cast by the torn cobalt sheet onto the cream form */}
        <filter id={`${uid}c-sheet-shadow`} x="-8%" y="-8%" width="120%" height="116%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="5" dy="4" stdDeviation="6.5" floodColor="#070B19" floodOpacity="0.34" />
        </filter>

        {/* Soft local shadow under each curled paper flap */}
        <filter id={`${uid}c-flap-shadow`} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="#070E29" floodOpacity="0.26" />
        </filter>

        {/* 12 gradient slots (6 active + 6 morphing) for paper undersides */}
        {Array.from({ length: FLAPS * 2 }, (_, k) => (
          <linearGradient
            key={k}
            id={`${uid}c-fg${k}`}
            ref={(el) => {
              gradRefs.current[k] = el;
            }}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={mixHex(flapBase, '#162544', 0.34)} />
            <stop offset="48%" stopColor={mixHex(flapBase, '#162544', 0.08)} />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        ))}

        <path id={`${uid}c-sheet`} ref={sheetRef} />
      </defs>

      {/* Torn poster drop shadow + thick fibrous cream pulp rim */}
      <g className="iwc-sheet-group" filter={`url(#${uid}c-sheet-shadow)`}>
        <path ref={fiberRef} fill="#E6DDD0" />
        <path ref={rimRef} fill="#FAF3E8" />
        <use href={`#${uid}c-sheet`} className="iwc-sheet-fill" />
      </g>

      {/* Crisp unfiltered #070B16 sheet fill so it matches Testimonials & Footer pixel-for-pixel */}
      <use href={`#${uid}c-sheet`} className="iwc-sheet-fill" />

      {/* 6 Curled Paper Flaps (+ 6 outgoing morph slots) */}
      <g filter={`url(#${uid}c-flap-shadow)`}>
        {Array.from({ length: FLAPS * 2 }, (_, k) => (
          <path
            key={k}
            ref={(el) => {
              flapRefs.current[k] = el;
            }}
            fill={`url(#${uid}c-fg${k})`}
          />
        ))}
      </g>
    </svg>
  );
}
