export interface PanelLayout {
  id: string;
  number: string;
  category: string;
  title: string[];
  theme: 'cream' | 'ink' | 'cobalt';
  slug: string;
  // Bounding box in 1672x875 coordinate system
  left: number;
  top: number;
  width: number;
  height: number;
  // Normalized 0-100 corners: [TL, TR, BR, BL]
  corners: [number, number][];
}

export const STAGE_WIDTH = 1672;
export const STAGE_HEIGHT = 875;

export const PANELS_CONFIG: Record<string, PanelLayout> = {
  strategy: {
    id: 'strategy',
    number: '01',
    category: 'STRATEGY',
    title: ['DIGITAL', 'STRATEGY'],
    theme: 'cream',
    slug: 'digital-strategy',
    left: 590,
    top: 61,
    width: 477,
    height: 297,
    corners: [[11, 13], [96, 0], [100, 94], [0, 100]],
  },
  web: {
    id: 'web',
    number: '02',
    category: 'DEVELOPMENT',
    title: ['WEB', 'DEVELOPMENT'],
    theme: 'ink',
    slug: 'web-development',
    left: 1064,
    top: 51,
    width: 576,
    height: 287,
    corners: [[7, 11], [100, 0], [97, 94], [0, 100]],
  },
  uiux: {
    id: 'uiux',
    number: '03',
    category: 'EXPERIENCE',
    title: ['UI/UX DESIGN'],
    theme: 'cobalt',
    slug: 'ui-ux-design',
    left: 525,
    top: 321,
    width: 1117,
    height: 248,
    corners: [[6, 13], [98, 0], [100, 93], [0, 100]],
  },
  social: {
    id: 'social',
    number: '04',
    category: 'SOCIAL',
    title: ['SOCIAL', 'MEDIA'],
    theme: 'cream',
    slug: 'social-media',
    left: 458,
    top: 558,
    width: 393,
    height: 277,
    corners: [[13, 8], [100, 0], [87, 100], [0, 99]],
  },
  mobile: {
    id: 'mobile',
    number: '05',
    category: 'MOBILE',
    title: ['MOBILE APP', 'DEVELOPMENT'],
    theme: 'ink',
    slug: 'mobile-app-development',
    left: 811,
    top: 571,
    width: 424,
    height: 262,
    corners: [[13, 4], [100, 0], [92, 99], [0, 100]],
  },
  software: {
    id: 'software',
    number: '06',
    category: 'ENGINEERING',
    title: ['SOFTWARE', 'DEVELOPMENT'],
    theme: 'cream',
    slug: 'software-development',
    left: 1224,
    top: 571,
    width: 420,
    height: 264,
    corners: [[10, 2], [100, 0], [97, 100], [0, 99]],
  },
};

/**
 * Calculates a rounded quadrilateral SVG path.
 * The corner rounding uses design-pixel distances (r ~ 22px) before normalizing,
 * guaranteeing uniform, undistorted rounded corners even on elongated panels.
 */
export function computePanelGeometry(
  corners: [number, number][],
  w: number,
  h: number,
  radius: number = 22
) {
  const pts = corners.map(([x, y]) => [ (x * w) / 100, (y * h) / 100 ]);
  const A: [number, number][] = [];
  const B: [number, number][] = [];

  for (let i = 0; i < 4; i++) {
    const prev = (i + 3) % 4;
    const next = (i + 1) % 4;
    const P = pts[i];
    const Pprev = pts[prev];
    const Pnext = pts[next];

    const din = [Pprev[0] - P[0], Pprev[1] - P[1]];
    const lin = Math.hypot(din[0], din[1]);
    const uin = [din[0] / lin, din[1] / lin];

    const dout = [Pnext[0] - P[0], Pnext[1] - P[1]];
    const lout = Math.hypot(dout[0], dout[1]);
    const uout = [dout[0] / lout, dout[1] / lout];

    const radIn = Math.min(radius, lin * 0.45);
    const radOut = Math.min(radius, lout * 0.45);

    A.push([P[0] + uin[0] * radIn, P[1] + uin[1] * radIn]);
    B.push([P[0] + uout[0] * radOut, P[1] + uout[1] * radOut]);
  }

  const norm = (pt: number[] | [number, number]) => `${(pt[0] / w).toFixed(4)} ${(pt[1] / h).toFixed(4)}`;
  const pix = (pt: number[] | [number, number]) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;

  const normalizedPath =
    `M ${norm(B[3])} ` +
    `L ${norm(A[0])} Q ${norm(pts[0])} ${norm(B[0])} ` +
    `L ${norm(A[1])} Q ${norm(pts[1])} ${norm(B[1])} ` +
    `L ${norm(A[2])} Q ${norm(pts[2])} ${norm(B[2])} ` +
    `L ${norm(A[3])} Q ${norm(pts[3])} ${norm(B[3])} Z`;

  const pixelPath =
    `M ${pix(B[3])} ` +
    `L ${pix(A[0])} Q ${pix(pts[0])} ${pix(B[0])} ` +
    `L ${pix(A[1])} Q ${pix(pts[1])} ${pix(B[1])} ` +
    `L ${pix(A[2])} Q ${pix(pts[2])} ${pix(B[2])} ` +
    `L ${pix(A[3])} Q ${pix(pts[3])} ${pix(B[3])} Z`;

  return { normalizedPath, pixelPath };
}
