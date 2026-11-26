/**
 * Procedural Vertical Paper-Tearing Geometry Engine (Right-to-Left Reveal)
 * Adapts the footer's 84-point ridge, micro-tooth fiber rim, and 6-flap system
 * to a vertical boundary x(y) that rips open from the right edge toward the left.
 */

import {
  FLAPS,
  Flap,
  MICRO_TEETH,
  RIDGE_N,
  START,
  clamp01,
  easeInOut,
  easeTear,
  mixHex,
  n1,
  polyD,
  rng,
} from '@/lib/paper-tear/math';

export { FLAPS, RIDGE_N, START, clamp01, easeInOut, easeTear, mixHex, polyD, rng };
export type { Flap };

export type VerticalTear = {
  xs: number[];
  rim: number[];
  fibers: number[];
  lag: number[];
  flaps: Flap[];
};

/** Shared normalized Y positions along the vertical tear (-0.02 .. 1.02). */
export const YS: number[] = (() => {
  const r = rng(917);
  const out: number[] = [];
  for (let i = 0; i < RIDGE_N; i++) {
    const u = i / (RIDGE_N - 1);
    const j = i > 0 && i < RIDGE_N - 1 ? (r() - 0.5) * (0.8 / RIDGE_N) : 0;
    out.push(-0.02 + u * 1.04 + j);
  }
  return out;
})();

/**
 * Generates an 84-point vertical ripped-paper ridge x(y) matching the approved split:
 * - Upper edge starts around x ≈ 0.66–0.70 (upper-right flap),
 * - Sweeps inward around mid-height x ≈ 0.50–0.54 (near the PEEL tab),
 * - Finishes around x ≈ 0.62–0.65 at the bottom, protecting the left headline & right form.
 */
export function makeVerticalTear(seed: number, n = RIDGE_N): VerticalTear {
  const r = rng(seed);
  const ph = [r() * 6.283, r() * 6.283, r() * 6.283, r() * 6.283];
  const xs: number[] = [];
  const rim: number[] = [];
  const fibers: number[] = [];
  const lag: number[] = [];

  for (let i = 0; i < n; i++) {
    const y = YS[Math.min(i, YS.length - 1)];
    const dCenter = Math.min(1, Math.abs(y - 0.52) * 2);

    // Sculpted vertical editorial curve matching Reference A:
    const topFlare = y < 0.22 ? Math.pow((0.22 - y) / 0.24, 1.35) * 0.14 : 0;
    const midDip = -0.055 * Math.exp(-Math.pow((y - 0.62) / 0.16, 2));
    const bottomFlare = y > 0.8 ? Math.pow((y - 0.8) / 0.22, 1.25) * 0.095 : 0;
    const base = 0.555 + topFlare + midDip + bottomFlare;

    const wander =
      (0.018 * Math.sin(y * 8.2 + ph[0]) +
        0.012 * Math.sin(y * 16.7 + ph[1]) +
        0.008 * Math.sin(y * 31.3 + ph[2])) *
      (0.55 + 0.45 * dCenter);
    const spike = r() < 0.2 ? 2.1 : 1;
    const jag = (r() - 0.5) * 0.018 * spike;

    xs.push(Math.min(0.72, Math.max(0.46, base + wander + jag)));

    const fiberBurst = r() < 0.26 ? 1.55 : 1;
    rim.push((7.5 + r() * 13.5) * fiberBurst);
    fibers.push((r() - 0.5) * 5.2);

    // Fracture starts near upper-middle (y ≈ 0.44) and propagates upward & downward
    const dFracture = Math.min(1, Math.abs(y - 0.44) * 1.85);
    lag.push(Math.min(0.46, dFracture * 0.36 + 0.03 + 0.025 * Math.sin(y * 21 + ph[3]) + r() * 0.012));
  }

  // Six curled paper flaps distributed along the vertical tear
  const slots = [0.06, 0.24, 0.42, 0.58, 0.76, 0.93];
  const backCurl = r() < 0.4 ? [2] : [3];
  const flaps: Flap[] = slots.map((slot, k) => {
    const y = slot + (r() - 0.5) * 0.035;
    const span = k === 0 || k === 4 ? 5 + Math.floor(r() * 3) : 3 + Math.floor(r() * 4);
    const at = Math.max(0, Math.min(n - 1 - span, Math.round(y * (n - 1))));
    const dir = backCurl.includes(k) ? -1 : 1; // +1 curls right over cream, -1 curls back over blue
    const prominent = k === 0 || k === 1 || k === 4 || k === 5;
    const len =
      dir < 0
        ? 0.02 + r() * 0.015
        : prominent
          ? 0.048 + r() * 0.032
          : 0.03 + r() * 0.022;
    return {
      at,
      span,
      len,
      skew: (r() - 0.5) * 0.9,
      dir,
      jag: [r() - 0.5, r() - 0.5, r() - 0.5, r() - 0.5],
    };
  });

  return { xs, rim, fibers, lag, flaps };
}

/** Right-to-left opening ridge `x(y)` for normalized tear progress `t` in 0..1. */
export function introXs(tear: VerticalTear, t: number) {
  if (t <= 0.001) return tear.xs.map(() => START);
  return tear.xs.map((x, i) => START + (x - START) * easeTear((t - tear.lag[i] * 1.02) / 0.52));
}

/** Morph between two vertical tears during PEEL re-tear, `t` in 0..1. */
export function morphXs(from: number[], to: VerticalTear, t: number) {
  return to.xs.map((x, i) => {
    const a = from[i] ?? x;
    return a + (x - a) * easeInOut((t - to.lag[i] * 0.6) / 0.6);
  });
}

export function verticalFlapOpen(tear: VerticalTear, f: Flap, t: number) {
  if (t <= 0.01) return 0;
  return easeTear((t - tear.lag[f.at] - 0.16) / 0.34);
}

/** A vertical flap hanging from ridge segment `[at..at+span]` and curling horizontally (`dir * L`). */
export function verticalFlapPoly(xs: number[], f: Flap, W: number, H: number, open: number) {
  const b = Math.min(xs.length - 1, f.at + f.span);
  const anchor: number[][] = [];
  for (let k = f.at; k <= b; k++) anchor.push([xs[k] * W, YS[k] * H]);
  const A = anchor[0];
  const B = anchor[anchor.length - 1];
  const mx = (A[0] + B[0]) / 2;
  const my = (A[1] + B[1]) / 2;
  const L = f.len * W * Math.max(0, open);
  const tip = [mx + f.dir * L, my + f.skew * L];

  const side = (P: number[], Q: number[], j0: number, j1: number) => {
    const dx = Q[0] - P[0];
    const dy = Q[1] - P[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return [
      [P[0] + dx / 3 + nx * j0 * 0.24 * L, P[1] + dy / 3 + ny * j0 * 0.24 * L],
      [P[0] + (dx * 2) / 3 + nx * j1 * 0.24 * L, P[1] + (dy * 2) / 3 + ny * j1 * 0.24 * L],
    ];
  };

  return [...anchor, ...side(B, tip, f.jag[0], f.jag[1]), tip, ...side(tip, A, f.jag[2], f.jag[3])];
}

/** Left cobalt poster sheet: everything to the left of the vertical ridge `xs`, with micro-teeth. */
export function verticalSheetD(xs: number[], W: number, H: number, rimLift?: number[], scale = 1) {
  let d = 'M-24 -24L-24 ' + (H + 24);
  for (let i = xs.length - 1; i >= 0; i--) {
    const lift = rimLift ? rimLift[i] * scale : 0;
    const xCurr = xs[i] * W - lift;
    const yCurr = YS[i] * H;
    d += 'L' + n1(xCurr) + ' ' + n1(yCurr);
    if (i > 0 && scale > 0.02) {
      const liftPrev = rimLift ? rimLift[i - 1] * scale : 0;
      const xPrev = xs[i - 1] * W - liftPrev;
      const yPrev = YS[i - 1] * H;
      for (let sub = 1; sub <= 2; sub++) {
        const t = sub / 3;
        const micro = MICRO_TEETH[i * 3 + sub] * 2.8 * scale;
        d +=
          'L' +
          n1(xCurr + (xPrev - xCurr) * t + micro) +
          ' ' +
          n1(yCurr + (yPrev - yCurr) * t);
      }
    }
  }
  return d + 'Z';
}

/** Secondary feathered white/cream pulp rim along the vertical tear. */
export function verticalFiberEdgeD(xs: number[], tear: VerticalTear, W: number, H: number, revealScale = 1) {
  let d = 'M-24 -24L-24 ' + (H + 24);
  for (let i = xs.length - 1; i >= 0; i--) {
    const px = xs[i] * W + tear.fibers[i] * revealScale;
    const py = YS[i] * H;
    d += 'L' + n1(px) + ' ' + n1(py);
    if (i > 0 && revealScale > 0.02) {
      const nx = xs[i - 1] * W + tear.fibers[i - 1] * revealScale;
      const ny = YS[i - 1] * H;
      for (let sub = 1; sub <= 2; sub++) {
        const t = sub / 3;
        const tooth = MICRO_TEETH[i * 3 + sub + 1] * 4.2 * revealScale;
        const swell = (sub === 1 ? 0.34 : 0.18) * tear.rim[i] * revealScale;
        d += 'L' + n1(px + (nx - px) * t + swell + tooth) + ' ' + n1(py + (ny - py) * t);
      }
    }
  }
  return d + 'Z';
}
