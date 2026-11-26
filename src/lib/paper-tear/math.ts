/**
 * Shared deterministic paper-tearing math & color utilities
 * Used by both the horizontal InspiringWaveFooter and the vertical GetInTouchSection.
 */

export type Flap = {
  at: number;
  span: number;
  len: number;
  skew: number;
  dir: number;
  jag: number[];
};

export const RIDGE_N = 84;
export const START = 1.06;
export const FLAPS = 6;

export const clamp01 = (v: number) => (Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0);

/** mulberry32 — small, seedable, identical tear for the same seed everywhere. */
export function rng(seed: number) {
  let a = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic micro-tooth table so every torn segment has fine ripped-paper fibers. */
export const MICRO_TEETH: number[] = (() => {
  const r = rng(31337);
  return Array.from({ length: RIDGE_N * 4 }, () => (r() - 0.5) * 2);
})();

/** Ease out with a small physical paper overshoot before settling. */
export function easeTear(t: number) {
  const x = clamp01(t);
  if (x === 0 || x === 1) return x;
  const c1 = 0.92;
  return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const n1 = (v: number) => Math.round(v * 10) / 10;

export function polyD(pts: number[][]) {
  return pts.length ? 'M' + pts.map((p) => n1(p[0]) + ' ' + n1(p[1])).join('L') + 'Z' : '';
}

/** Mix two #rrggbb colours. */
export function mixHex(a: string, b: string, t: number) {
  const p = (h: string) => {
    const s = h.replace('#', '');
    const f =
      s.length === 3
        ? s
            .split('')
            .map((c) => c + c)
            .join('')
        : s.padEnd(6, '0').slice(0, 6);
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0);
  };
  const x = p(a);
  const y = p(b);
  const k = clamp01(t);
  return (
    '#' +
    x
      .map((v, i) =>
        Math.round(v + (y[i] - v) * k)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}
