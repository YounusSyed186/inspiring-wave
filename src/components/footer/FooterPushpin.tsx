import * as React from 'react';
import { mixHex } from './tear/geometry';

export interface FooterPushpinProps {
  pinRef: React.RefObject<HTMLButtonElement | null>;
  pinState: 'idle' | 'lift' | 'stab';
  onRepin: () => void;
  uid: string;
  baseColor?: string;
}

/**
 * Glossy electric-blue physical pushpin adapted from PushpinTearFooter's SVG Pin,
 * shaded in Inspiring Wave cobalt (#1739E8 -> deep royal #081878 -> specular white)
 * with tapered steel needle, ground cast shadow, and hand-drawn impact ticks.
 */
function PushpinGraphic({ base, id }: { base: string; id: string }) {
  const hi = mixHex(base, '#ffffff', 0.68);
  const bright = mixHex(base, '#5882ff', 0.35);
  const mid = base;
  const lo = mixHex(base, '#030938', 0.52);
  const deep = mixHex(base, '#01041c', 0.76);

  const sideGrad = (gid: string) => (
    <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={lo} />
      <stop offset="0.22" stopColor={mid} />
      <stop offset="0.38" stopColor={hi} />
      <stop offset="0.56" stopColor={bright} />
      <stop offset="0.82" stopColor={lo} />
      <stop offset="1" stopColor={deep} />
    </linearGradient>
  );

  return (
    <svg viewBox="0 0 110 210" className="iwf-pin-svg" aria-hidden="true">
      <defs>
        {sideGrad(id + '-side')}
        <radialGradient id={id + '-top'} cx="0.35" cy="0.28" r="0.78">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.36" stopColor={bright} />
          <stop offset="0.68" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
        <linearGradient id={id + '-needle'} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2a313d" />
          <stop offset="0.38" stopColor="#f5f7fa" />
          <stop offset="0.68" stopColor="#8d96a5" />
          <stop offset="1" stopColor="#1e242e" />
        </linearGradient>
        <filter id={id + '-gloss'} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
      </defs>

      {/* Tapered steel needle penetrating the paper */}
      <path d="M52.4 114h5.2l-1.3 76-1.3 7-1.3-7z" fill={`url(#${id}-needle)`} />
      {/* Tiny puncture shadow */}
      <ellipse cx="55" cy="196" rx="4.2" ry="1.5" fill="#0d0d0d" opacity="0.48" />

      {/* Lower wide collar / flange */}
      <path d="M26 101v8.5a29 10.5 0 0 0 58 0V101z" fill={`url(#${id}-side)`} />
      <ellipse cx="55" cy="101" rx="29" ry="10.5" fill={`url(#${id}-top)`} />
      <ellipse
        cx="55"
        cy="100.5"
        rx="27.5"
        ry="9.4"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.32"
        strokeWidth="0.9"
      />

      {/* Waisted cylindrical neck */}
      <path
        d="M44.5 38c1.8 16 4.8 27 3 37-2 10.5-13.8 19.5-15.6 28h46.2c-1.8-8.5-13.6-17.5-15.6-28-1.8-10 1.2-21 3-37z"
        fill={`url(#${id}-side)`}
      />

      {/* Upper rounded cap */}
      <path d="M21 22v14.5a34 13.5 0 0 0 68 0V22z" fill={`url(#${id}-side)`} />
      <ellipse cx="55" cy="22" rx="34" ry="13.5" fill={`url(#${id}-top)`} />
      <ellipse
        cx="55"
        cy="22"
        rx="32.8"
        ry="12.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.38"
        strokeWidth="0.9"
      />

      {/* Glossy studio highlights */}
      <ellipse
        cx="41"
        cy="17.5"
        rx="12.5"
        ry="4.2"
        fill="#ffffff"
        opacity="0.78"
        filter={`url(#${id}-gloss)`}
      />
      <ellipse
        cx="38"
        cy="98"
        rx="9.5"
        ry="3.1"
        fill="#ffffff"
        opacity="0.58"
        filter={`url(#${id}-gloss)`}
      />
      <path
        d="M27 38c4.5 4.8 10.5 6.8 16.5 7.4"
        stroke="#ffffff"
        strokeOpacity="0.4"
        strokeWidth="2.1"
        fill="none"
        strokeLinecap="round"
        filter={`url(#${id}-gloss)`}
      />
      <path
        d="M48.5 50c0.9 8.5 1.7 15 0.9 23.5"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FooterPushpin({
  pinRef,
  pinState,
  onRepin,
  uid,
  baseColor = '#1739E8',
}: FooterPushpinProps) {
  return (
    <div className="iwf-pin-zone">
      {/* Three restrained white motion ticks near the upper-left of the pin head (Reference A) */}
      <svg
        viewBox="0 0 56 52"
        className="iwf-pin-ticks"
        aria-hidden="true"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
      >
        <path d="M36 6 L46 23" />
        <path d="M16 15 L36 31" />
        <path d="M8 34 L27 40" />
      </svg>

      <button
        ref={pinRef}
        type="button"
        className="iwf-pin"
        data-pin={pinState}
        onClick={onRepin}
        aria-label="Create a new paper tear"
        title="Click to tear a new paper edge"
      >
        <span className="iwf-pin-shadow" aria-hidden="true" />
        <span className="iwf-pin-tilt">
          <span className="iwf-pin-drop">
            <span className="iwf-pin-body">
              <PushpinGraphic base={baseColor} id={uid + '-pin'} />
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
