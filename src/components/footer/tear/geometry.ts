/**
 * Procedural Paper-Tearing Geometry Engine
 * Adapted directly from PushpinTearFooter's deterministic 84-point ridge & 6-flap system,
 * tuned to Inspiring Wave's editorial poster silhouette and thick fibrous paper rim.
 */

export type Flap = {
  at: number;
  span: number;
  len: number;
  skew: number;
  dir: number;
  jag: number[];
};

export type Tear = {
  ys: number[];
  rim: number[];
  fibers: number[];
  lag: number[];
  flaps: Flap[];
};

export const RIDGE_N = 84;
/** Off-screen start: the ridge begins below the bottom edge, so the blue sheet starts whole. */
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

/** Ridge x positions, shared by every seed so one tear can morph smoothly into another. */
export const XS: number[] = (() => {
  const r = rng(911);
  const out: number[] = [];
  for (let i = 0; i < RIDGE_N; i++) {
    const u = i / (RIDGE_N - 1);
    const j = i > 0 && i < RIDGE_N - 1 ? (r() - 0.5) * (0.8 / RIDGE_N) : 0;
    out.push(-0.02 + u * 1.04 + j);
  }
  return out;
})();

/**
 * The highest (smallest Y) the ridge may climb at x, protecting the upper blue poster's
 * headline, navigation columns, and horizontal newsletter input across viewports.
 */
export function ridgeFloor(x: number, mobile = false) {
  if (mobile) {
    return 0.62;
  }
  // Far-right edge sweeps upward like a ripped corner (matching Reference A)
  if (x > 0.94) return 0.34;
  if (x > 0.86) return 0.45;
  // Under the headline (left) and newsletter (center-right)
  if (x < 0.36) return 0.49;
  if (Math.abs(x - 0.5) < 0.12) return 0.48;
  return 0.47;
}

/**
 * Generates an 84-point organic ripped-paper silhouette, variable-thickness white pulp rim,
 * per-vertex propagation lag from the central pushpin (`x ≈ 0.50`), and 6 curled paper flaps.
 */
export function makeTear(seed: number, n = RIDGE_N, mobile = false): Tear {
  const r = rng(seed);
  const ph = [r() * 6.283, r() * 6.283, r() * 6.283, r() * 6.283];
  const ys: number[] = [];
  const rim: number[] = [];
  const fibers: number[] = [];
  const lag: number[] = [];

  for (let i = 0; i < n; i++) {
    const x = XS[Math.min(i, XS.length - 1)];
    const d = Math.min(1, Math.abs(x - 0.5) * 2);

    // Sculpted editorial tear profile matching Reference A:
    // - Left corner dips slightly (~0.58), rises near x=0.12 (~0.52), dips at x=0.24 (~0.60),
    // - Central pushpin saddle sits around ~0.53,
    // - Right half undulates around ~0.50-0.55 and rips sharply upward at the far-right edge (x > 0.94 -> ~0.35)
    let base: number;
    if (mobile) {
      base = 0.655 + 0.024 * Math.sin(x * 5.2 + ph[0]) - (x > 0.9 ? (x - 0.9) * 0.32 : 0);
    } else {
      const leftDip = x < 0.08 ? (0.08 - x) * 0.85 : 0;
      const leftValley = 0.052 * Math.exp(-Math.pow((x - 0.245) / 0.065, 2));
      const rightValley = 0.046 * Math.exp(-Math.pow((x - 0.785) / 0.055, 2));
      const rightCornerRip = x > 0.92 ? Math.pow((x - 0.92) / 0.1, 1.35) * 0.19 : 0;
      base = 0.522 + leftDip + leftValley + rightValley - rightCornerRip - 0.018 * (x - 0.5);
    }

    const wander =
      (0.021 * Math.sin(x * 8.5 + ph[0]) +
        0.014 * Math.sin(x * 17.3 + ph[1]) +
        0.009 * Math.sin(x * 33.7 + ph[2])) *
      (0.55 + 0.45 * d);
    const spike = r() < 0.2 ? (mobile ? 1.5 : 2.2) : 1;
    const jag = (r() - 0.5) * (mobile ? 0.015 : 0.022) * spike;

    const floor = ridgeFloor(x, mobile);
    const maxCeil = mobile ? 0.705 : 0.635;
    ys.push(Math.min(maxCeil, Math.max(floor, base + wander + jag)));

    // Thick exposed cream/white paper fiber rim below the blue layer (8px to 24px in Reference A)
    const fiberBurst = r() < 0.26 ? 1.55 : 1;
    rim.push((mobile ? 5 + r() * 8 : 7.5 + r() * 13.5) * fiberBurst);
    fibers.push((r() - 0.5) * (mobile ? 3.5 : 5.5));

    // Tear propagates outward from the pushpin (x ≈ 0.50) toward both left & right edges
    lag.push(
      Math.min(
        0.48,
        d * 0.39 + 0.035 + 0.028 * Math.sin(x * 23 + ph[3]) + r() * 0.014
      )
    );
  }

  // Six curled paper flaps along the torn edge
  const slots = [0.045, 0.235, 0.37, 0.63, 0.785, 0.945];
  const up = r() < 0.35 ? [2] : [3];
  const flaps: Flap[] = slots.map((slot, k) => {
    const x = slot + (r() - 0.5) * 0.035;
    const span = k === 1 || k === 4 ? 5 + Math.floor(r() * 3) : 3 + Math.floor(r() * 4);
    const at = Math.max(0, Math.min(n - 1 - span, Math.round(x * (n - 1))));
    const dir = up.includes(k) ? -1 : 1;
    const prominent = k === 0 || k === 1 || k === 4 || k === 5;
    const lenScale = mobile ? 0.52 : 1;
    const len =
      (dir < 0
        ? 0.022 + r() * 0.016
        : prominent
          ? 0.052 + r() * 0.032
          : 0.034 + r() * 0.024) * lenScale;
    return {
      at,
      span,
      len,
      skew: (r() - 0.5) * 0.95,
      dir,
      jag: [r() - 0.5, r() - 0.5, r() - 0.5, r() - 0.5],
    };
  });

  return { ys, rim, fibers, lag, flaps };
}

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

/** The ridge during the opening rip (or scroll-linked scrub), `t` in 0..1. */
export function introYs(tear: Tear, t: number) {
  if (t <= 0.001) return tear.ys.map(() => START);
  return tear.ys.map((y, i) => START + (y - START) * easeTear((t - tear.lag[i] * 1.05) / 0.5));
}

/** The ridge while one tear re-rips into the next, `t` in 0..1. */
export function morphYs(from: number[], to: Tear, t: number) {
  return to.ys.map((y, i) => {
    const a = from[i] ?? y;
    return a + (y - a) * easeInOut((t - to.lag[i] * 0.6) / 0.6);
  });
}

/** How far a flap has unfolded during the opening rip. */
export function flapOpen(tear: Tear, f: Flap, t: number) {
  if (t <= 0.01) return 0;
  return easeTear((t - tear.lag[f.at] - 0.16) / 0.34);
}

/** A flap: the ridge segment it hangs from, then two jagged free edges meeting at its tip. */
export function flapPoly(ys: number[], f: Flap, W: number, H: number, open: number) {
  const b = Math.min(ys.length - 1, f.at + f.span);
  const top: number[][] = [];
  for (let k = f.at; k <= b; k++) top.push([XS[k] * W, ys[k] * H]);
  const A = top[0];
  const B = top[top.length - 1];
  const mx = (A[0] + B[0]) / 2;
  const my = (A[1] + B[1]) / 2;
  const L = f.len * H * Math.max(0, open);
  const tip = [mx + f.skew * L, my + f.dir * L];
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
  return [...top, ...side(B, tip, f.jag[0], f.jag[1]), tip, ...side(tip, A, f.jag[2], f.jag[3])];
}

const n1 = (v: number) => Math.round(v * 10) / 10;

export function polyD(pts: number[][]) {
  return pts.length ? 'M' + pts.map((p) => n1(p[0]) + ' ' + n1(p[1])).join('L') + 'Z' : '';
}

/** Deterministic micro-tooth table so every torn segment has fine ripped-paper fibers. */
const MICRO_TEETH: number[] = (() => {
  const r = rng(31337);
  return Array.from({ length: RIDGE_N * 4 }, () => (r() - 0.5) * 2);
})();

/**
 * The upper blue poster sheet: everything above the ridge, enriched with deterministic
 * micro-teeth between the 84 primary ridge vertices so the tear looks like real torn paper stock.
 */
export function sheetD(ys: number[], W: number, H: number, rimLift?: number[], scale = 1) {
  let d = 'M-24 -24L' + (W + 24) + ' -24';
  for (let i = ys.length - 1; i >= 0; i--) {
    const lift = rimLift ? rimLift[i] * scale : 0;
    const xCurr = XS[i] * W;
    const yCurr = ys[i] * H - lift;
    d += 'L' + n1(xCurr) + ' ' + n1(yCurr);
    if (i > 0 && scale > 0.02) {
      const liftPrev = rimLift ? rimLift[i - 1] * scale : 0;
      const xPrev = XS[i - 1] * W;
      const yPrev = ys[i - 1] * H - liftPrev;
      for (let sub = 1; sub <= 2; sub++) {
        const t = sub / 3;
        const micro = MICRO_TEETH[i * 3 + sub] * 2.8 * scale;
        d +=
          'L' +
          n1(xCurr + (xPrev - xCurr) * t) +
          ' ' +
          n1(yCurr + (yPrev - yCurr) * t + micro);
      }
    }
  }
  return d + 'Z';
}

/**
 * Generates a finely feathered secondary pulp edge along the white paper fiber rim
 * so the torn paper edge has deckled micro-teeth rather than smooth straight segments.
 */
export function fiberEdgeD(ys: number[], tear: Tear, W: number, H: number, revealScale = 1) {
  let d = 'M-24 -24L' + (W + 24) + ' -24';
  for (let i = ys.length - 1; i >= 0; i--) {
    const px = XS[i] * W;
    const py = ys[i] * H + tear.fibers[i] * revealScale;
    d += 'L' + n1(px) + ' ' + n1(py);
    if (i > 0 && revealScale > 0.02) {
      const nx = XS[i - 1] * W;
      const ny = ys[i - 1] * H + tear.fibers[i - 1] * revealScale;
      for (let sub = 1; sub <= 2; sub++) {
        const t = sub / 3;
        const tooth = MICRO_TEETH[i * 3 + sub + 1] * 4.2 * revealScale;
        const swell = (sub === 1 ? 0.34 : 0.18) * tear.rim[i] * revealScale;
        d += 'L' + n1(px + (nx - px) * t) + ' ' + n1(py + (ny - py) * t + swell + tooth);
      }
    }
  }
  return d + 'Z';
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
