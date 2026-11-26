import * as React from 'react';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTopSeamPaths(seed: number) {
  const r = mulberry32(seed);
  const N = 92;
  const W = 1440;
  const fiberPts: string[] = [];
  const accentPts: string[] = [];
  const topPts: string[] = [];

  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = +(u * W).toFixed(1);
    const wave =
      Math.sin(u * Math.PI * 4.8 + seed * 0.13) * 10 +
      Math.cos(u * Math.PI * 13.5 + seed * 0.27) * 4.8;
    const tooth = r() < 0.15 ? (r() - 0.5) * 14 : (r() - 0.5) * 5;
    const yTop = Math.max(10, Math.min(54, 30 + wave + tooth));
    const fiberThickness = 5 + r() * 6;
    const accentThickness = 8 + r() * 8;

    topPts.push(`${i === 0 ? 'M' : 'L'}${x} ${yTop.toFixed(1)}`);
    fiberPts.push(`${i === 0 ? 'M' : 'L'}${x} ${(yTop + fiberThickness).toFixed(1)}`);
    accentPts.push(`${i === 0 ? 'M' : 'L'}${x} ${(yTop + fiberThickness + accentThickness).toFixed(1)}`);
  }

  return {
    topSheet: `${topPts.join(' ')} L${W} 0 L0 0 Z`,
    fiberRim: `${fiberPts.join(' ')} L${W} 0 L0 0 Z`,
    accentStrip: `${accentPts.join(' ')} L${W} 0 L0 0 Z`,
  };
}

export interface TornPaperSeamProps {
  /** Solid background color of the section directly ABOVE this seam */
  topColor: string;
  /** Exposed paper fiber edge color (defaults to studio warm ivory) */
  fiberColor?: string;
  /** Optional secondary torn paper strip peeking beneath the fiber rim (e.g., #173CFF) */
  accentColor?: string;
  seed?: number;
  heightClass?: string;
  className?: string;
}

/**
 * Single-owner procedural torn-paper transition seam placed at the top edge of a section
 * with `-top-[1px]` overlap to eliminate 1px sub-pixel gaps and black slivers.
 */
export function TornPaperSeam({
  topColor,
  fiberColor = '#F5EDE0',
  accentColor,
  seed = 31,
  heightClass = 'h-9 sm:h-12 md:h-16',
  className = '',
}: TornPaperSeamProps) {
  const paths = React.useMemo(() => buildTopSeamPaths(seed), [seed]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -top-[1px] left-0 right-0 z-30 w-full overflow-hidden leading-none ${className}`.trim()}
    >
      <svg
        viewBox="0 0 1440 84"
        preserveAspectRatio="none"
        className={`block w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)] ${heightClass}`}
      >
        {accentColor && <path d={paths.accentStrip} fill={accentColor} opacity="0.92" />}
        <path d={paths.fiberRim} fill={fiberColor} opacity="0.94" />
        <path d={paths.topSheet} fill={topColor} />
      </svg>
    </div>
  );
}
