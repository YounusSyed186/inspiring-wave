import * as React from 'react';

function buildUnifiedBottomTear() {
  const N = 96;
  const W = 1728;
  const H = 86;
  const fiberPts: string[] = [];
  const bluePts: string[] = [];
  const bottomPts: string[] = [];

  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = +(u * W).toFixed(1);
    const wave =
      Math.sin(u * Math.PI * 5.2 + 0.6) * 8 +
      Math.sin(u * Math.PI * 13.7 + 1.9) * 4 +
      Math.cos(u * Math.PI * 29.1) * 2.8;
    const micro = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 5;
    const edgeLift = u > 0.88 ? -(u - 0.88) * 68 : u < 0.08 ? (0.08 - u) * 42 : 0;

    const yFiber = Math.max(10, Math.min(44, 24 + wave + micro + edgeLift));
    const fiberThickness = 5 + Math.abs(Math.sin(i * 3.7)) * 4.5;
    const cobaltThickness = 14 + Math.abs(Math.cos(i * 5.1)) * 12;

    const yBlue = Math.min(58, yFiber + fiberThickness);
    const yBottom = Math.min(78, yBlue + cobaltThickness);

    fiberPts.push(`${i === 0 ? 'M' : 'L'}${x} ${yFiber.toFixed(1)}`);
    bluePts.push(`${i === 0 ? 'M' : 'L'}${x} ${yBlue.toFixed(1)}`);
    bottomPts.push(`${i === 0 ? 'M' : 'L'}${x} ${yBottom.toFixed(1)}`);
  }

  return {
    creamPath: `${fiberPts.join(' ')} L${W} ${H} L0 ${H} Z`,
    bluePath: `${bluePts.join(' ')} L${W} ${H} L0 ${H} Z`,
    finalePath: `${bottomPts.join(' ')} L${W} ${H} L0 ${H} Z`,
  };
}

const TORN_PATHS = buildUnifiedBottomTear();

/**
 * Single-owner torn-paper transition between Testimonials (#070B16) and Finale (#030506):
 * #070B16 (above) -> #F5EDE0 cream fiber rim -> #173CFF cobalt strip -> #030506 (Finale below).
 */
export function TestimonialTornEdge() {
  return (
    <div className="tw-torn-edge" aria-hidden="true" data-tw-torn-edge>
      <svg
        viewBox="0 0 1728 86"
        preserveAspectRatio="none"
        className="tw-torn-edge-svg"
      >
        <defs>
          <filter id="twTearShadow" x="-2%" y="-25%" width="104%" height="150%">
            <feDropShadow dx="0" dy="-3" stdDeviation="3" floodColor="#02040A" floodOpacity="0.65" />
          </filter>
        </defs>
        <path d={TORN_PATHS.creamPath} fill="#F5EDE0" filter="url(#twTearShadow)" />
        <path d={TORN_PATHS.bluePath} fill="#173CFF" />
        <path d={TORN_PATHS.finalePath} fill="#030506" />
      </svg>
    </div>
  );
}
