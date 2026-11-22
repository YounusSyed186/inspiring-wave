/**
 * Creative Machine — motion configuration.
 *
 * Everything in the hero is a pure function of one normalised scroll value
 * `p` (0 → 1). Given the same `p`, the scene reproduces the same state:
 * no accumulated mutations, no autoplay timelines for the main sequence.
 */

export const PHASES = {
  hold: [0.0, 0.2],
  activation: [0.2, 0.45],
  separation: [0.45, 0.6],
  enter: [0.6, 0.75],
  transformation: [0.75, 0.9],
  reveal: [0.9, 1.0],
} as const

export const PHASE_LABELS = [
  'HERO HOLD',
  'ACTIVATION',
  'LAYER SEPARATION',
  'ENTER THE MACHINE',
  'TRANSFORMATION',
  'MANIFESTO',
] as const

export type Layout = 'desktop' | 'tablet' | 'mobile'

export const clamp01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Local 0..1 progress of `p` inside [a, b]. */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const smooth = (t: number) => t * t * (3 - 2 * t)
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeIn = (t: number) => t * t * t
/** Smoothstep over a window, the workhorse of the choreography. */
export const win = (p: number, a: number, b: number) => smooth(range(p, a, b))

export function phaseIndex(p: number) {
  if (p < PHASES.hold[1]) return 0
  if (p < PHASES.activation[1]) return 1
  if (p < PHASES.separation[1]) return 2
  if (p < PHASES.enter[1]) return 3
  if (p < PHASES.transformation[1]) return 4
  return 5
}

export function layoutFor(width: number): Layout {
  if (width < 768) return 'mobile'
  if (width < 1280) return 'tablet'
  return 'desktop'
}

/* -------------------------------------------------------------------------- */
/* Camera keyframes                                                           */
/* -------------------------------------------------------------------------- */

export type V3 = [number, number, number]

export type CameraKey = {
  /** Master progress at which this key is reached. */
  p: number
  pos: V3
  target: V3
  /** Lens shift in NDC: moves the subject without perspective distortion. */
  shiftX: number
  shiftY: number
  fov: number
}

/**
 * The machine sits around the origin, its portal opening facing +Z, the
 * corridor running to -Z and the cream exit plane at z = EXIT_Z.
 * Camera tunnel height is TUNNEL_Y.
 */
export const TUNNEL_Y = 0.2
export const EXIT_Z = -18.5

const T = TUNNEL_Y

export const CAMERA_KEYS: Record<Layout, CameraKey[]> = {
  desktop: [
    { p: 0.0, pos: [4.2, 2.55, 14.8], target: [0.5, 0.35, 0], shiftX: -0.16, shiftY: -0.06, fov: 34 },
    { p: 0.2, pos: [3.8, 2.15, 14.2], target: [0.4, 0.3, 0], shiftX: -0.15, shiftY: -0.05, fov: 34 },
    { p: 0.45, pos: [-4.4, 1.0, 11.4], target: [0.5, 0.25, -1.2], shiftX: -0.1, shiftY: 0, fov: 35 },
    { p: 0.6, pos: [-1.0, 0.5, 6.6], target: [0, T, -4], shiftX: 0, shiftY: 0, fov: 36 },
    { p: 0.675, pos: [-0.05, T + 0.05, 1.6], target: [0, T, -8], shiftX: 0, shiftY: 0, fov: 38 },
    { p: 0.75, pos: [0, T, -5.2], target: [0, T, -14], shiftX: 0, shiftY: 0, fov: 40 },
    { p: 0.9, pos: [0, T, EXIT_Z + 4.6], target: [0, T, EXIT_Z - 6], shiftX: 0, shiftY: 0, fov: 40 },
    { p: 1.0, pos: [0, T, EXIT_Z + 1.4], target: [0, T, EXIT_Z - 6], shiftX: 0, shiftY: 0, fov: 40 },
  ],
  tablet: [
    { p: 0.0, pos: [2.6, 1.3, 20.5], target: [0.4, 0.4, 0], shiftX: -0.16, shiftY: -0.1, fov: 36 },
    { p: 0.2, pos: [2.1, 1.1, 18.0], target: [0.3, 0.3, 0], shiftX: -0.14, shiftY: -0.08, fov: 36 },
    { p: 0.45, pos: [-3.2, 0.9, 13.0], target: [0.4, 0.2, -1], shiftX: -0.05, shiftY: -0.02, fov: 38 },
    { p: 0.6, pos: [-0.8, 0.5, 7.4], target: [0, T, -4], shiftX: 0, shiftY: 0, fov: 40 },
    { p: 0.675, pos: [0, T + 0.05, 1.8], target: [0, T, -8], shiftX: 0, shiftY: 0, fov: 42 },
    { p: 0.75, pos: [0, T, -5.2], target: [0, T, -14], shiftX: 0, shiftY: 0, fov: 44 },
    { p: 0.9, pos: [0, T, EXIT_Z + 4.6], target: [0, T, EXIT_Z - 6], shiftX: 0, shiftY: 0, fov: 44 },
    { p: 1.0, pos: [0, T, EXIT_Z + 1.4], target: [0, T, EXIT_Z - 6], shiftX: 0, shiftY: 0, fov: 44 },
  ],
  mobile: [
    { p: 0.0, pos: [1.6, 0.9, 25.0], target: [0.3, 0.6, 0], shiftX: 0, shiftY: -0.035, fov: 46 },
    { p: 0.2, pos: [1.3, 0.8, 22.5], target: [0.2, 0.5, 0], shiftX: 0, shiftY: -0.03, fov: 46 },
    { p: 0.45, pos: [-1.6, 0.7, 16.0], target: [0.2, 0.3, -1], shiftX: 0, shiftY: -0.1, fov: 48 },
    { p: 0.6, pos: [-0.4, 0.4, 9.0], target: [0, T, -4], shiftX: 0, shiftY: 0, fov: 52 },
    { p: 0.675, pos: [0, T, 2.2], target: [0, T, -8], shiftX: 0, shiftY: 0, fov: 56 },
    { p: 0.75, pos: [0, T, -5.0], target: [0, T, -14], shiftX: 0, shiftY: 0, fov: 58 },
    { p: 0.9, pos: [0, T, EXIT_Z + 4.0], target: [0, T, EXIT_Z - 6], shiftX: 0, shiftY: 0, fov: 58 },
    { p: 1.0, pos: [0, T, EXIT_Z + 1.2], target: [0, T, EXIT_Z - 6], shiftX: 0, shiftY: 0, fov: 58 },
  ],
}

/** Locate the camera segment for `p`; returns the key index and eased local t. */
export function cameraSegment(keys: CameraKey[], p: number) {
  const last = keys.length - 1
  if (p <= keys[0].p) return { i: 0, t: 0 }
  if (p >= keys[last].p) return { i: last - 1, t: 1 }
  let i = 0
  while (i < last - 1 && p > keys[i + 1].p) i++
  const t = (p - keys[i].p) / (keys[i + 1].p - keys[i].p)
  return { i, t: clamp01(t) }
}
