import * as React from 'react';
import { FLAPS, mixHex } from './tear/geometry';

export interface FooterTearSVGProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  sheetRef: React.RefObject<SVGPathElement | null>;
  rimRef: React.RefObject<SVGPathElement | null>;
  fiberRef: React.RefObject<SVGPathElement | null>;
  flapRefs: React.MutableRefObject<(SVGPathElement | null)[]>;
  gradRefs: React.MutableRefObject<(SVGLinearGradientElement | null)[]>;
  uid: string;
  grainUrl: string;
  grainOffsetY?: number;
  paperColor?: string;
}

/**
 * Layer 2 SVG Stage: renders the cast drop shadow onto the underlying INSPIRING WAVE wordmark,
 * the deckled cream/white paper-pulp fiber rim, the flat saturated cobalt-blue poster sheet
 * with subtle creased poster paper lighting & grain, and the 6 dynamic curled flaps.
 */
export function FooterTearSVG({
  svgRef,
  sheetRef,
  rimRef,
  fiberRef,
  flapRefs,
  gradRefs,
  uid,
  grainUrl,
  grainOffsetY = 0,
  paperColor = '#F8F2E8',
}: FooterTearSVGProps) {
  const flapBase = mixHex(paperColor, '#ffffff', 0.48);

  return (
    <svg ref={svgRef} className="iwf-tear-svg" aria-hidden="true">
      <defs>
        {/* Soft midnight-navy poster paper sheen matching dark sections (#070B16) */}
        <linearGradient id={uid + '-crease-a'} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#070B16" stopOpacity="0" />
          <stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.045" />
          <stop offset="0.65" stopColor="#040710" stopOpacity="0.16" />
          <stop offset="1" stopColor="#040710" stopOpacity="0.28" />
        </linearGradient>

        {/* Subtle pulp shading gradient for the exposed white paper fiber rim */}
        <linearGradient id={uid + '-pulp'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.58" stopColor="#F8F3EA" />
          <stop offset="1" stopColor="#E4DBD0" />
        </linearGradient>

        {/* WORDS THAT STAY. radial bluish-navy glow & 64px architectural grid */}
        <radialGradient id={uid + '-glow'} cx="0.24" cy="0.52" r="0.55">
          <stop offset="0%" stopColor="#173CFF" stopOpacity="0.2" />
          <stop offset="55%" stopColor="#1232D4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#070B16" stopOpacity="0" />
        </radialGradient>

        <pattern id={uid + '-grid'} width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(155, 163, 179, 0.045)" strokeWidth="1" />
        </pattern>

        {grainUrl && (
          <pattern
            id={uid + '-grain'}
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0, ${grainOffsetY})`}
          >
            <image href={grainUrl} width="160" height="160" />
          </pattern>
        )}

        {/* Realistic shadow cast by the torn poster onto the cream paper & wordmark below */}
        <filter id={uid + '-sheet-shadow'} x="-4%" y="-4%" width="108%" height="122%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="9" stdDeviation="7.5" floodColor="#090d16" floodOpacity="0.38" />
        </filter>

        {/* Crisp local shadow under each curled paper flap */}
        <filter id={uid + '-flap-shadow'} x="-35%" y="-35%" width="170%" height="185%">
          <feDropShadow dx="-2" dy="6" stdDeviation="4.5" floodColor="#090d16" floodOpacity="0.34" />
        </filter>

        {/* Dynamic userSpaceOnUse gradients for current 6 flaps + previous 6 morphing flaps */}
        {Array.from({ length: FLAPS * 2 }, (_, k) => (
          <linearGradient
            key={k}
            id={uid + '-flap-grad-' + k}
            ref={(el) => {
              gradRefs.current[k] = el;
            }}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor={mixHex(flapBase, '#2a3346', 0.28)} />
            <stop offset="0.45" stopColor={mixHex(flapBase, '#ffffff', 0.35)} />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
        ))}

        <path id={uid + '-blue-sheet'} ref={sheetRef} />
      </defs>

      {/* Torn sheet group: feathered pulp edge + main fiber rim + drop shadow */}
      <g className="iwf-sheet-group" filter={`url(#${uid}-sheet-shadow)`}>
        <path ref={fiberRef} fill="#EFE7DA" opacity="0.92" />
        <path ref={rimRef} fill={`url(#${uid}-pulp)`} />
        <use href={`#${uid}-blue-sheet`} className="iwf-sheet-fill" />
      </g>

      {/* Crisp unfiltered #070B16 sheet fill so top edge matches Get in Touch pixel-for-pixel */}
      <use href={`#${uid}-blue-sheet`} className="iwf-sheet-fill" />

      {/* Clip path for elements painted strictly onto the cobalt poster surface */}
      <clipPath id={uid + '-sheet-clip'}>
        <use href={`#${uid}-blue-sheet`} />
      </clipPath>

      {/* Hand-drawn diagonal white chalk marks near the right side of the blue sheet (Reference A) */}
      <g clipPath={`url(#${uid}-sheet-clip)`} className="iwf-sheet-chalk">
        <path
          d="M 1556 368 Q 1592 342 1624 323 M 1602 365 Q 1630 342 1656 324"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* Six curled paper flaps (plus 6 morph-transition slots during re-tear) */}
      <g filter={`url(#${uid}-flap-shadow)`}>
        {Array.from({ length: FLAPS * 2 }, (_, k) => (
          <path
            key={k}
            ref={(el) => {
              flapRefs.current[k] = el;
            }}
            fill={`url(#${uid}-flap-grad-${k})`}
          />
        ))}
      </g>
    </svg>
  );
}
