"use client"

import * as React from "react"

/**
 * Tiger Tear Reveal: a poster that rips in two as you scroll.
 *
 * Optimized for locked 60fps scroll & pointer performance:
 * - Zero CPU-bound SVG feTurbulence / feDisplacementMap / dynamic feGaussianBlur
 *   re-rasterization during scroll transforms.
 * - Pre-computed static tear clipPaths, paper-core fibre geometry, and curls.
 * - Geometry culled to the visible artboard frame.
 * - Cached layout metrics (no per-frame offsetHeight / forced reflow).
 */

export interface TigerTearRevealProps {
  /** The big word that gets torn. */
  word?: string
  /** Small line above the word. Empty hides it. */
  tagline?: string
  /** Word colour. */
  ink?: string
  /** Paper colour, the sheet that tears. */
  paper?: string
  /** Tagline colour. */
  taglineColor?: string
  /** Iris colour. */
  eyeColor?: string
  /** Fur colour. */
  furColor?: string
  /** Font stack for the word. It is stretched to a fixed width, so any bold face fits. */
  fontFamily?: string
  /** Height of the pinned stage. A definite length, never a percentage. */
  height?: string
  /** Extra scroll distance the tear plays over, on top of `height`. */
  scrollDistance?: string
  /** 0..1. Drive the tear yourself instead of from scroll (1 = fully torn). */
  progress?: number
  /** Show the "scroll" hint before the tear starts. */
  hint?: boolean
  /** Extra root class names. */
  className?: string
}

// #region tear
export type Pt = [number, number]

/** Seeded PRNG (mulberry32), so the tear and the fur are the same every visit. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp01 = (x: number) => (x <= 0 ? 0 : x > 1 ? 1 : x)

export function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Overshoot ease: the eyes open a little too wide, then settle. */
export function easeOutBack(t: number) {
  const c = 1.70158
  const u = clamp01(t) - 1
  return 1 + (c + 1) * u * u * u + c * u * u
}

/** How far through the pinned scroll we are: 0 at the top, 1 when the stage lets go. */
export function scrollProgress(top: number, height: number, viewport: number) {
  const range = height - viewport
  if (range <= 0) return top <= 0 ? 1 : 0
  return clamp01(-top / range)
}

/** One scroll value drives five beats. */
export function stages(p: number) {
  return {
    crack: smooth(0.03, 0.2, p), // a crack runs out from the middle of the word
    open: smooth(0.18, 0.62, p), // the sheet tears and the halves pull apart
    rise: smooth(0.26, 0.74, p), // the tiger comes up from behind
    pop: smooth(0.58, 0.88, p), // and opens its eyes
    shake: smooth(0.16, 0.22, p) * (1 - smooth(0.26, 0.36, p)), // the jolt of the rip
  }
}

/**
 * The tear, left to right across the visible sheet: a slight rising diagonal,
 * a slow wander, fine fibres and the odd big tooth. `x` always increases.
 */
export function tearLine(seed = 11, from = -200, to = 1200, step = 12, cx = 500, cy = 318, angle = -7): Pt[] {
  const r = rng(seed)
  const slope = Math.tan((angle * Math.PI) / 180)
  const out: Pt[] = []
  for (let x = from; x <= to; x += step) {
    const fibre = (r() - 0.5) * 5
    const tooth = r() < 0.09 ? (r() - 0.5) * 26 : 0
    const wander = Math.sin(x * 0.019 + seed) * 10 + Math.sin(x * 0.053 + seed * 2) * 4
    out.push([x, cy + (x - cx) * slope + wander + fibre + tooth])
  }
  return out
}

/** Where each half goes as the tear opens. Both are still at open = 0. */
export function pieceMotion(open: number) {
  return {
    top: { dx: -10 * open, dy: -82 * open, rot: -2.6 * open },
    bottom: { dx: 12 * open, dy: 78 * open, rot: 2.1 * open },
  }
}

/** Width of the white paper core exposed along a torn edge. */
export function fibreWidths(n: number, open: number, seed = 5) {
  const r = rng(seed)
  const k = Math.min(1, open * 4)
  return Array.from({ length: n }, (_, i) => k * (2.5 + 6 * (0.5 + 0.5 * Math.sin(i * 0.37 + seed)) * (0.6 + r() * 0.8)))
}
// #endregion

// ---------------------------------------------------------------- geometry

const VIEW_W = 1000
const CX = 500
const CY = 318
const FAR = 2200
const FRAME = "36 44 928 468"
const EYES: Pt[] = [
  [-138, 6],
  [138, -4],
]

const d = (pts: Pt[], close = true) =>
  "M" + pts.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") + (close ? "Z" : "")

/** A stripe: a quadratic spine with a width that tapers to points at both ends. */
function stripe(p0: Pt, p1: Pt, p2: Pt, w: number, n = 12) {
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const m = 1 - t
    const x = m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0]
    const y = m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]
    const dx = 2 * m * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])
    const dy = 2 * m * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
    const l = Math.hypot(dx, dy) || 1
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.6)
    left.push([x - (dy / l) * h, y + (dx / l) * h])
    right.push([x + (dy / l) * h, y - (dx / l) * h])
  }
  return d(left.concat(right.reverse()))
}

/** The face's stripes and visible flanking body stripes. Deterministic. */
function buildStripes() {
  const r = rng(29)
  const j = (a: number) => (r() - 0.5) * a
  const out: string[] = []
  for (const k of [-2, -1, 0, 1, 2]) {
    out.push(stripe([k * 27 + j(8), -205], [k * 21 + j(6), -140], [k * 11, -72 + Math.abs(k) * 10], 13 - Math.abs(k) * 2))
  }
  for (const s of [-1, 1]) {
    out.push(stripe([s * 50, -108], [s * 138, -140 + j(8)], [s * 228, -96], 13))
    out.push(stripe([s * 72, -158], [s * 150, -188 + j(8)], [s * 250, -150], 11))
    for (const y of [-160, -104, -48, 14, 76, 138]) {
      out.push(stripe([s * 350, y + j(10)], [s * 292, y + j(26)], [s * (222 + r() * 30), y + j(34)], 18 + r() * 8))
    }
    out.push(stripe([s * 212, 38], [s * 256, 72], [s * 330, 98], 14))
    out.push(stripe([s * 182, 74], [s * 226, 120], [s * 312, 156], 12))
    out.push(stripe([s * 64, 22], [s * 50, 88], [s * 42, 178], 8))
    // Only generate visible flanking ruff stripes inside the viewBox
    for (let k = 0; k < 5; k++) {
      const x = s * (390 + k * 58 + j(22))
      out.push(stripe([x + j(30), -300], [x + s * 24 + j(30), j(50)], [x + s * 10 + j(30), 300], 20 + r() * 12))
    }
  }
  return out.join("")
}

/** Short hairs flowing outward from the nose inside the visible frame, in three tones. */
function buildHairs() {
  const r = rng(53)
  const tones = ["", "", ""]
  for (let i = 0; i < 720; i++) {
    const x = (r() - 0.5) * 1020
    const y = (r() - 0.5) * 420
    const a = Math.atan2(y - 150, x) + (r() - 0.5) * 0.5
    const l = 9 + r() * 12
    const seg = "M" + x.toFixed(1) + " " + y.toFixed(1) + "l" + (Math.cos(a) * l).toFixed(1) + " " + (Math.sin(a) * l).toFixed(1)
    tones[r() < 0.45 ? 0 : r() < 0.7 ? 1 : 2] += seg
  }
  return tones
}

/** Fine radial fibres in an iris. */
function buildFibres() {
  const r = rng(71)
  let s = ""
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + r() * 0.08
    const r0 = 12 + r() * 4
    const r1 = 30 + r() * 5
    s += "M" + (Math.cos(a) * r0).toFixed(1) + " " + (Math.sin(a) * r0).toFixed(1) + "L" + (Math.cos(a) * r1).toFixed(1) + " " + (Math.sin(a) * r1).toFixed(1)
  }
  return s
}

const ALMOND = "M-78 10 C-52 -40 30 -56 80 -8 C44 40 -30 50 -78 10Z"

// ---------------------------------------------------------------- the tiger

const Fur = React.memo(function Fur({ id, fur }: { id: string; fur: string }) {
  const stripes = React.useMemo(buildStripes, [])
  const hairs = React.useMemo(buildHairs, [])
  return (
    <g>
      <rect x={-900} y={-380} width={1800} height={760} fill={fur} />
      <rect x={-900} y={-380} width={1800} height={760} fill={"url(#" + id + "-shade)"} />
      <rect x={-900} y={-380} width={1800} height={760} fill={"url(#" + id + "-vignette)"} />
      <g fill="#fbf6ec" opacity={0.88}>
        {EYES.map(([x, y], i) => (
          <React.Fragment key={i}>
            <ellipse cx={x} cy={y - 52} rx={78} ry={22} opacity={0.75} />
            <ellipse cx={x} cy={y + 44} rx={64} ry={15} opacity={0.68} />
          </React.Fragment>
        ))}
        <ellipse cx={0} cy={188} rx={96} ry={52} opacity={0.65} />
      </g>
      <path d={stripes} fill="#04070d" />
      <path d={hairs[0]} stroke="#050b18" strokeWidth={1.4} opacity={0.45} strokeLinecap="round" />
      <path d={hairs[1]} stroke="#6b8aff" strokeWidth={1.2} opacity={0.42} strokeLinecap="round" />
      <path d={hairs[2]} stroke="#d8f03c" strokeWidth={1} opacity={0.28} strokeLinecap="round" />
    </g>
  )
})

function Eye({
  id,
  x,
  y,
  flip,
  look,
  blink,
  pupil,
  scale,
  fibres,
}: {
  id: string
  x: number
  y: number
  flip: boolean
  look: Pt
  blink: number
  pupil: number
  scale: number
  fibres: string
}) {
  const clip = id + (flip ? "-cl" : "-cr")
  const lx = look[0] * (flip ? -1 : 1)
  return (
    <g transform={"translate(" + x + " " + y + ") scale(" + (flip ? -scale : scale) + " " + scale + ")"}>
      <clipPath id={clip}>
        <path d={ALMOND} />
      </clipPath>
      <path d={ALMOND} fill="#04070d" stroke="#04070d" strokeWidth={11} strokeLinejoin="round" />
      <path d="M-80 8 C-86 20 -96 30 -98 44 C-90 34 -80 24 -70 18Z" fill="#04070d" />
      <g clipPath={"url(#" + clip + ")"}>
        <ellipse cx={0} cy={0} rx={80} ry={52} fill="#071126" />
        <g transform={"translate(" + (lx * 13).toFixed(2) + " " + (4 + look[1] * 7).toFixed(2) + ")"}>
          <circle r={38} fill={"url(#" + id + "-iris)"} />
          <path d={fibres} stroke="#0a2463" strokeWidth={1} opacity={0.42} />
          <circle r={38} fill="none" stroke="#04070d" strokeWidth={3} opacity={0.85} />
          <circle r={13 * pupil} fill="#030508" />
          <ellipse cx={-12} cy={-13} rx={7.5} ry={5.5} fill="#fff" opacity={0.94} />
          <circle cx={9} cy={10} r={2.6} fill="#d8f03c" opacity={0.75} />
        </g>
        <ellipse cx={0} cy={-46} rx={90} ry={34} fill={"url(#" + id + "-lid)"} />
        <g transform={"translate(0 " + (-62 + blink * 72).toFixed(2) + ")"}>
          <rect x={-90} y={-80} width={180} height={80} fill="#0e2578" />
          <path d="M-90 0 H90" stroke="#04070d" strokeWidth={8} />
        </g>
      </g>
    </g>
  )
}

// ---------------------------------------------------------------- the paper

const CURLS: Record<"top" | "bottom", [number, number, number][]> = {
  top: [
    [300, 44, 30],
    [575, 30, 20],
    [790, 52, 34],
  ],
  bottom: [
    [205, 50, 32],
    [470, 34, 22],
    [690, 40, 28],
  ],
}

interface PrecomputedHalfGeometry {
  lineD: string
  shapeD: string
  coreFullD: string
  curlsFullD: string[]
}

function precomputeHalfGeometry(line: Pt[], side: "top" | "bottom"): PrecomputedHalfGeometry {
  const up = side === "top"
  const shape = up
    ? ([[line[0][0], -FAR] as Pt, [line[line.length - 1][0], -FAR] as Pt, ...[...line].reverse()])
    : ([...line, [line[line.length - 1][0], FAR] as Pt, [line[0][0], FAR] as Pt])
  const widths = fibreWidths(line.length, 1, up ? 5 : 8)
  const core = line.concat(line.map(([x, y], i) => [x, y + (up ? -widths[i] : widths[i])] as Pt).reverse())
  const curlsFullD = CURLS[side].map(([cx, hw, depth]) => {
    const pts = line.filter(([x]) => Math.abs(x - cx) <= hw)
    const back = pts.map(([x, y]) => {
      const s = Math.cos(((x - cx) / hw) * (Math.PI / 2))
      return [x + (up ? 6 : -6) * s, y + (up ? 1 : -1) * depth * s * s] as Pt
    })
    return d(pts.concat(back.reverse()))
  })

  return {
    lineD: d(line, false),
    shapeD: d(shape),
    coreFullD: d(core),
    curlsFullD,
  }
}

const Half = React.memo(function Half({
  id,
  side,
  geom,
  open,
  children,
}: {
  id: string
  side: "top" | "bottom"
  geom: PrecomputedHalfGeometry
  open: number
  children: React.ReactNode
}) {
  const up = side === "top"
  const m = pieceMotion(open)[side]
  const transform =
    "translate(" + m.dx.toFixed(2) + " " + m.dy.toFixed(2) + ") rotate(" + m.rot.toFixed(3) + " " + CX + " " + CY + ")"
  const clip = id + "-" + side
  return (
    <g transform={transform}>
      {/* Fast layered stroke shadow instead of per-frame CPU feGaussianBlur */}
      {open > 0 ? (
        <g transform={"translate(0 " + (up ? 11 : -11) + ")"}>
          <path
            d={geom.lineD}
            fill="none"
            stroke="#000"
            strokeOpacity={0.22 * Math.min(1, open * 3)}
            strokeWidth={34}
            strokeLinecap="round"
          />
          <path
            d={geom.lineD}
            fill="none"
            stroke="#000"
            strokeOpacity={0.36 * Math.min(1, open * 3)}
            strokeWidth={16}
            strokeLinecap="round"
          />
        </g>
      ) : null}
      <clipPath id={clip}>
        <path d={geom.shapeD} />
      </clipPath>
      <g clipPath={"url(#" + clip + ")"}>{children}</g>
      {open > 0 ? (
        <g opacity={Math.min(1, open * 4)}>
          <path d={geom.coreFullD} fill="#ffffff" />
          {geom.curlsFullD.map((c, i) => (
            <path key={i} d={c} fill={"url(#" + id + "-curl-" + side + ")"} stroke="#fff" strokeWidth={1} />
          ))}
        </g>
      ) : null}
    </g>
  )
})

// ---------------------------------------------------------------- component

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])
  return reduced
}

type Frame = { p: number; look: Pt; blink: number; squint: number }

export default function TigerTearReveal({
  word = "NEITHER DO WE.",
  tagline = "02 / MANIFESTO — THE WORLD DOESN’T STAND STILL.",
  ink = "#1945f5",
  paper = "#f1efe7",
  taglineColor = "#080c12",
  eyeColor = "#d8f03c",
  furColor = "#1945f5",
  fontFamily = '"Barlow Condensed", "Anton", Impact, sans-serif',
  height = "100svh",
  scrollDistance = "160svh",
  progress,
  hint = true,
  className = "",
}: TigerTearRevealProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const id = "ttr" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const fibres = React.useMemo(buildFibres, [])
  const line = React.useMemo(() => tearLine(), [])
  const topGeom = React.useMemo(() => precomputeHalfGeometry(line, "top"), [line])
  const bottomGeom = React.useMemo(() => precomputeHalfGeometry(line, "bottom"), [line])

  const [f, setF] = React.useState<Frame>({ p: progress ?? 0, look: [0, 0], blink: 0, squint: 0 })

  const controlled = progress !== undefined
  const cfg = React.useRef({ progress, controlled, reduced })
  cfg.current = { progress, controlled, reduced }
  const pointer = React.useRef<{ x: number; y: number } | null>(null)
  const squintAt = React.useRef(-1e9)

  React.useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    let raf = 0
    let visible = true
    let p = cfg.current.progress ?? 0
    let look: Pt = [0, 0]
    let nextBlink = performance.now() + 2800
    let last: Frame | null = null

    // Cache heights via ResizeObserver to avoid forced synchronous reflow in rAF
    let rootH = root.offsetHeight
    let stageH = stage.offsetHeight
    let stageW = stage.offsetWidth
    const ro = new ResizeObserver(() => {
      rootH = root.offsetHeight
      stageH = stage.offsetHeight
      stageW = stage.offsetWidth
    })
    ro.observe(root)
    ro.observe(stage)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(tick)
    })
    io.observe(root)

    function tick(now: number) {
      raf = 0
      if (!visible) return
      const c = cfg.current
      const rootRect = root!.getBoundingClientRect()
      const target = c.controlled
        ? clamp01(c.progress ?? 0)
        : scrollProgress(rootRect.top, rootH, stageH)
      p = c.reduced ? (target > 0.3 ? 1 : 0) : p + (target - p) * 0.18
      if (Math.abs(target - p) < 0.0005) p = target

      let want: Pt = [0, 0]
      if (pointer.current && p > 0.45) {
        want = [
          Math.max(-1, Math.min(1, (pointer.current.x - rootRect.left - stageW / 2) / (stageW * 0.35))),
          Math.max(-1, Math.min(1, (pointer.current.y - Math.max(0, rootRect.top) - stageH * 0.58) / (stageH * 0.35))),
        ]
      }
      look = [
        Math.abs(want[0] - look[0]) < 0.001 ? want[0] : look[0] + (want[0] - look[0]) * 0.16,
        Math.abs(want[1] - look[1]) < 0.001 ? want[1] : look[1] + (want[1] - look[1]) * 0.16,
      ]

      let blink = 0
      if (!c.reduced && p > 0.55) {
        const since = now - nextBlink
        if (since > 0) blink = since < 90 ? since / 90 : since < 200 ? 1 - (since - 90) / 110 : 0
        if (since > 200) nextBlink = now + 3200 + Math.random() * 3400
      }
      const squint = c.reduced ? 0 : Math.max(0, 1 - (now - squintAt.current) / 900)

      const next: Frame = { p, look, blink, squint }
      if (
        !last ||
        Math.abs(next.p - last.p) > 4e-4 ||
        Math.abs(next.look[0] - last.look[0]) > 2e-3 ||
        Math.abs(next.look[1] - last.look[1]) > 2e-3 ||
        Math.abs(next.blink - last.blink) > 1e-2 ||
        Math.abs(next.squint - last.squint) > 1e-2
      ) {
        last = next
        setF(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [])

  const s = stages(f.p)
  const pop = reduced ? s.pop : easeOutBack(s.pop)
  const eyeScale = 0.9 + 0.1 * pop
  const pupil = 1.3 - 0.5 * s.pop + 0.35 * f.squint
  const blink = Math.max(1 - clamp01(pop), f.blink, f.squint * 0.45)
  const rise = (1 - s.rise) * 150
  const shake = reduced ? 0 : Math.sin(f.p * 900) * 6 * s.shake
  const crackReach = s.crack * 620
  const crack = React.useMemo(
    () => (s.crack > 0 && s.open < 0.15 ? line.filter(([x]) => Math.abs(x - CX) <= crackReach) : []),
    [line, s.crack, s.open, crackReach]
  )
  const tiger =
    "translate(" + CX + " " + (CY + rise).toFixed(2) + ") rotate(-7) scale(" + (1.34 - 0.06 * s.rise).toFixed(4) + ")"

  const sheet = React.useMemo(
    () => (
      <>
        <rect x={-FAR} y={-FAR} width={FAR * 2 + VIEW_W} height={FAR * 2} fill={paper} />
        {/* Subtle studio registration crosshairs & vector frame lines on the ivory poster */}
        <g stroke="rgba(25,69,245,0.16)" strokeWidth="1" fill="none">
          <line x1={60} y1={95} x2={940} y2={95} strokeDasharray="4 6" />
          <line x1={60} y1={465} x2={940} y2={465} strokeDasharray="4 6" />
          <rect x={80} y={185} width={840} height={248} stroke="rgba(25,69,245,0.28)" strokeWidth="1.5" />
          <rect x={75} y={180} width={10} height={10} fill={paper} stroke="#1945f5" strokeWidth="2" />
          <rect x={915} y={180} width={10} height={10} fill={paper} stroke="#1945f5" strokeWidth="2" />
          <rect x={75} y={428} width={10} height={10} fill={paper} stroke="#1945f5" strokeWidth="2" />
          <rect x={915} y={428} width={10} height={10} fill={paper} stroke="#1945f5" strokeWidth="2" />
        </g>
        {tagline ? (
          <g>
            {/* Top compact index tag */}
            <rect x={CX - 88} y={78} width={176} height={24} rx={12} fill="#080c12" />
            <circle cx={CX - 70} cy={90} r={3.5} fill="#d8f03c" />
            <text
              x={CX + 8}
              y={94}
              textAnchor="middle"
              fill="#f1efe7"
              style={{ font: '700 10px "IBM Plex Mono", monospace', letterSpacing: "0.22em" }}
            >
              02 // MANIFESTO
            </text>

            {/* Clean unboxed editorial tagline with flanking architectural ticks */}
            <line x1={120} y1={138} x2={168} y2={138} stroke="#1945f5" strokeWidth="2" />
            <text
              x={CX}
              y={144}
              textAnchor="middle"
              fill={taglineColor}
              style={{ font: '700 18px "IBM Plex Mono", monospace', letterSpacing: "0.26em" }}
            >
              THE WORLD DOESN’T STAND STILL.
            </text>
            <line x1={832} y1={138} x2={880} y2={138} stroke="#1945f5" strokeWidth="2" />
          </g>
        ) : null}
        <text
          x={CX}
          y={398}
          textAnchor="middle"
          textLength={820}
          lengthAdjust="spacingAndGlyphs"
          fill={ink}
          style={{ fontFamily, fontSize: 236, fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          {word}
        </text>
      </>
    ),
    [paper, tagline, taglineColor, ink, fontFamily, word]
  )

  return (
    <section
      ref={rootRef}
      className={"relative w-full " + className}
      style={{
        height: controlled ? height : "calc(" + height + " + " + scrollDistance + ")",
        background: paper,
        overflow: "clip",
      }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{
          height,
          cursor: s.pop > 0.9 ? "crosshair" : undefined,
          willChange: "transform",
          contain: "layout paint",
        }}
        onPointerMove={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
        onPointerLeave={() => (pointer.current = null)}
        onPointerDown={() => s.pop > 0.5 && (squintAt.current = performance.now())}
      >
        <svg
          viewBox={FRAME}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={(tagline ? tagline + ". " : "") + word + ", torn in two by a tiger looking through."}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", display: "block" }}
        >
          <defs>
            <linearGradient id={id + "-shade"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#04070d" stopOpacity={0.62} />
              <stop offset="0.45" stopColor="#5676ff" stopOpacity={0.18} />
              <stop offset="1" stopColor="#04070d" stopOpacity={0.68} />
            </linearGradient>
            <radialGradient id={id + "-vignette"} cx="0.5" cy="0.5" r="0.5" gradientTransform="translate(0.5 0.5) scale(0.25 1) translate(-0.5 -0.5)">
              <stop offset="0.45" stopColor="#04070d" stopOpacity={0} />
              <stop offset="1" stopColor="#04070d" stopOpacity={0.72} />
            </radialGradient>
            <radialGradient id={id + "-iris"}>
              <stop offset="0" stopColor="#f7ffad" />
              <stop offset="0.38" stopColor={eyeColor} />
              <stop offset="0.78" stopColor="#16a6a1" />
              <stop offset="1" stopColor="#06162e" />
            </radialGradient>
            <linearGradient id={id + "-lid"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#020408" stopOpacity={0.82} />
              <stop offset="1" stopColor="#020408" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={id + "-curl-top"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#cfd6e6" />
            </linearGradient>
            <linearGradient id={id + "-curl-bottom"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#cfd6e6" />
            </linearGradient>
          </defs>

          <g transform={"translate(" + shake.toFixed(2) + " " + (shake * 0.4).toFixed(2) + ")"}>
            {/* behind the paper: the tiger, rising into the gap */}
            {s.open > 0 ? (
              <g transform={tiger}>
                <Fur id={id} fur={furColor} />
                <g>
                  {EYES.map(([x, y], i) => (
                    <Eye
                      key={i}
                      id={id}
                      x={x}
                      y={y}
                      flip={i === 0}
                      look={f.look}
                      blink={blink}
                      pupil={pupil}
                      scale={eyeScale}
                      fibres={fibres}
                    />
                  ))}
                </g>
              </g>
            ) : null}

            {/* the sheet: whole until it tears, then in two halves that part along the tear */}
            {s.open > 0 ? (
              <>
                <Half id={id} side="top" geom={topGeom} open={s.open}>
                  {sheet}
                </Half>
                <Half id={id} side="bottom" geom={bottomGeom} open={s.open}>
                  {sheet}
                </Half>
              </>
            ) : (
              sheet
            )}

            {/* the crack, running out from the middle before it gives way */}
            {s.crack > 0 && s.open < 0.15 && crack.length > 1 ? (
              <path d={d(crack, false)} fill="none" stroke="#1d0f07" strokeWidth={2.4} strokeLinejoin="bevel" opacity={1 - s.open / 0.15} />
            ) : null}
          </g>
        </svg>

        {hint && !controlled ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em]"
            style={{ color: taglineColor, opacity: Math.max(0, 0.7 - s.crack * 3) }}
          >
            scroll
            <span className="block h-6 w-px animate-pulse motion-reduce:animate-none" style={{ background: taglineColor }} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
