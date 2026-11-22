import * as THREE from 'three'

/**
 * Procedural artwork for the Creative Machine. Everything is drawn once into
 * small canvases (no network, no large bitmaps) and uploaded as textures.
 * A seeded PRNG keeps the grain identical on every visit.
 */

export const PALETTE = {
  navy: '#080d17',
  ink: '#04070d',
  cobalt: '#2045ff',
  cobaltDeep: '#1433c9',
  cream: '#f1efe7',
  lime: '#dfff00',
  steel: '#17253c',
  silver: '#aab7c8',
} as const

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return { c, ctx }
}

function toTexture(c: HTMLCanvasElement, opts: { repeat?: boolean; srgb?: boolean; aniso?: number } = {}) {
  const tex = new THREE.CanvasTexture(c)
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace
  if (opts.repeat) {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
  }
  tex.anisotropy = opts.aniso ?? 4
  tex.needsUpdate = true
  return tex
}

/** Fine paper grain over an existing drawing. */
function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed = 3) {
  const r = rng(seed)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

/**
 * Halftone eye — a small material detail on one front panel. A soft eye is
 * painted in greyscale, then resampled into a dot screen in ink on cream
 * with a cobalt wash over the left third (as in the approved key art).
 */
export function eyeTexture(scale = 1) {
  const W = Math.round(640 * scale)
  const H = Math.round(800 * scale)
  const src = canvas(W, H)
  const g = src.ctx
  g.fillStyle = '#d9d9d9'
  g.fillRect(0, 0, W, H)
  // brow + lid shading
  const cx = W * 0.52
  const cy = H * 0.5
  const shade = g.createRadialGradient(cx, cy - H * 0.05, W * 0.05, cx, cy, W * 0.62)
  shade.addColorStop(0, '#9a9a9a')
  shade.addColorStop(0.55, '#c6c6c6')
  shade.addColorStop(1, '#efefef')
  g.fillStyle = shade
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#2a2a2a'
  g.beginPath()
  g.ellipse(cx, cy - H * 0.2, W * 0.42, H * 0.045, -0.08, 0, Math.PI * 2)
  g.fill()
  // almond eye
  g.save()
  g.beginPath()
  g.moveTo(cx - W * 0.4, cy)
  g.quadraticCurveTo(cx, cy - H * 0.2, cx + W * 0.4, cy - H * 0.01)
  g.quadraticCurveTo(cx, cy + H * 0.15, cx - W * 0.4, cy)
  g.closePath()
  g.fillStyle = '#f4f4f4'
  g.fill()
  g.clip()
  const iris = g.createRadialGradient(cx, cy - H * 0.01, 0, cx, cy - H * 0.01, W * 0.16)
  iris.addColorStop(0, '#050505')
  iris.addColorStop(0.32, '#121212')
  iris.addColorStop(0.36, '#5b5b5b')
  iris.addColorStop(0.9, '#262626')
  iris.addColorStop(1, '#0a0a0a')
  g.fillStyle = iris
  g.beginPath()
  g.arc(cx, cy - H * 0.01, W * 0.16, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = 'rgba(0,0,0,.55)'
  g.fillRect(cx - W * 0.45, cy - H * 0.2, W * 0.9, H * 0.07)
  g.restore()
  // upper lid crease
  g.strokeStyle = '#3a3a3a'
  g.lineWidth = W * 0.012
  g.beginPath()
  g.moveTo(cx - W * 0.42, cy - H * 0.02)
  g.quadraticCurveTo(cx, cy - H * 0.27, cx + W * 0.43, cy - H * 0.04)
  g.stroke()

  const lum = g.getImageData(0, 0, W, H).data
  const out = canvas(W, H)
  const o = out.ctx
  o.fillStyle = PALETTE.cream
  o.fillRect(0, 0, W, H)
  const cell = Math.max(5, Math.round(9 * scale))
  for (let y = cell / 2; y < H; y += cell) {
    for (let x = cell / 2; x < W; x += cell) {
      const i = (Math.floor(y) * W + Math.floor(x)) * 4
      const dark = 1 - lum[i] / 255
      const r = (cell / 2) * Math.sqrt(dark) * 1.08
      if (r < 0.4) continue
      o.fillStyle = x < W * 0.36 ? PALETTE.cobalt : '#0b0f1a'
      o.beginPath()
      o.arc(x, y, r, 0, Math.PI * 2)
      o.fill()
    }
  }
  // cobalt wash band, kept graphic
  o.globalCompositeOperation = 'multiply'
  o.fillStyle = 'rgba(32,69,255,.55)'
  o.fillRect(0, 0, W * 0.36, H)
  o.globalCompositeOperation = 'source-over'
  // the lime iris highlight — the only fluorescent note on the panel
  o.fillStyle = PALETTE.lime
  o.globalAlpha = 0.85
  o.beginPath()
  o.arc(cx, cy - H * 0.01, W * 0.055, 0, Math.PI * 2)
  o.fill()
  o.globalAlpha = 1
  o.fillStyle = '#05070c'
  o.beginPath()
  o.arc(cx, cy - H * 0.01, W * 0.03, 0, Math.PI * 2)
  o.fill()
  grain(o, W, H, 18, 7)
  return toTexture(out.c)
}

/** Cobalt / cream checker — the graphic accent carried on panels and the ribbon. */
export function checkerTexture(cells = 8) {
  const S = 256
  const { c, ctx } = canvas(S, S)
  const k = S / cells
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      ctx.fillStyle = (x + y) % 2 ? PALETTE.cream : PALETTE.cobalt
      ctx.fillRect(x * k, y * k, k, k)
    }
  }
  const tex = toTexture(c, { repeat: true })
  tex.magFilter = THREE.NearestFilter
  return tex
}

/** The orbital ribbon skin: cream stock, typeset metadata, checker blocks. */
export function ribbonTexture(scale = 1) {
  const W = Math.round(2048 * scale)
  const H = Math.round(160 * scale)
  const { c, ctx } = canvas(W, H)
  ctx.fillStyle = '#fff0d5'
  ctx.fillRect(0, 0, W, H)
  // soft printed edge lines
  ctx.fillStyle = 'rgba(8,13,23,.75)'
  ctx.fillRect(0, H * 0.08, W, Math.max(1, H * 0.012))
  ctx.fillRect(0, H * 0.9, W, Math.max(1, H * 0.012))
  ctx.fillStyle = '#0b0f1a'
  ctx.font = `600 ${Math.round(H * 0.3)}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textBaseline = 'middle'
  const words = ['STRATEGY', '/', 'DESIGN', '/', 'TECHNOLOGY', '/', 'IN MOTION', '/']
  let x = W * 0.02
  const gap = H * 0.42
  for (let i = 0; x < W * 0.7; i++) {
    const w = words[i % words.length]
    ctx.fillText(w, x, H * 0.5)
    x += ctx.measureText(w).width + gap
  }
  // cobalt checker block in a rotated grid
  const k = H * 0.22
  const bx = W * 0.76
  for (let yy = 0; yy < 4; yy++) {
    for (let xx = 0; xx < 12; xx++) {
      if ((xx + yy) % 2) continue
      ctx.save()
      ctx.translate(bx + xx * k + yy * k * 0.5, H * 0.12 + yy * k)
      ctx.transform(1, 0, -0.5, 1, 0, 0)
      ctx.fillStyle = PALETTE.cobalt
      ctx.fillRect(0, 0, k, k)
      ctx.restore()
    }
  }
  // tiny lime registration tick
  ctx.fillStyle = PALETTE.lime
  ctx.fillRect(W * 0.735, H * 0.3, H * 0.08, H * 0.4)
  grain(ctx, W, H, 22, 11)
  return toTexture(c, { repeat: true, aniso: 8 })
}

/** Wireframe globe drawn in cream on transparent — mounted inside a glass plane. */
export function globeTexture() {
  const S = 1024
  const { c, ctx } = canvas(S, S)
  ctx.strokeStyle = 'rgba(104,156,255,.96)'
  ctx.lineWidth = 2
  const r = S * 0.36
  ctx.translate(S / 2, S / 2)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 1; i < 6; i++) {
    const rx = r * Math.cos((i / 6) * Math.PI * 0.5 + 0.2)
    ctx.beginPath()
    ctx.ellipse(0, 0, Math.abs(r - (i * r) / 6), r, 0, 0, Math.PI * 2)
    ctx.stroke()
    void rx
  }
  for (let i = -3; i <= 3; i++) {
    const y = (i / 4) * r
    const w = Math.sqrt(Math.max(0, r * r - y * y))
    ctx.beginPath()
    ctx.ellipse(0, y, w, w * 0.12, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.fillStyle = PALETTE.lime
  ctx.beginPath()
  ctx.arc(r * 0.42, -r * 0.3, 6, 0, Math.PI * 2)
  ctx.fill()
  return toTexture(c)
}

/** Halftone gradient field — cobalt dots fading across cream. Used on wall plates. */
export function halftoneTexture(dark = false) {
  const S = 512
  const { c, ctx } = canvas(S, S)
  ctx.fillStyle = dark ? '#0b1120' : PALETTE.cream
  ctx.fillRect(0, 0, S, S)
  const cell = 14
  for (let y = 0; y < S; y += cell) {
    for (let x = 0; x < S; x += cell) {
      const t = (x + y * 0.6) / (S * 1.6)
      const r = (cell / 2) * (1 - t) * 0.95
      if (r < 0.5) continue
      ctx.fillStyle = dark ? 'rgba(90,123,255,.85)' : PALETTE.cobalt
      ctx.beginPath()
      ctx.arc(x + cell / 2, y + cell / 2, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  grain(ctx, S, S, 14, 19)
  return toTexture(c, { repeat: true })
}

/** Brushed metal streaks (used as roughness + subtle albedo variation). */
export function brushedTexture() {
  const W = 512
  const H = 128
  const { c, ctx } = canvas(W, H)
  const r = rng(29)
  ctx.fillStyle = '#9aa3ad'
  ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 1400; i++) {
    const y = r() * H
    const l = 40 + r() * 260
    const x = r() * W
    const v = 130 + Math.floor(r() * 90)
    ctx.strokeStyle = `rgba(${v},${v + 4},${v + 10},${0.08 + r() * 0.18})`
    ctx.lineWidth = 0.6 + r() * 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + l, y + (r() - 0.5) * 0.6)
    ctx.stroke()
  }
  return toTexture(c, { repeat: true, srgb: false })
}

/** Soft radial falloff, white centre → transparent. Glows and contact shadows. */
export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const S = 256
  const { c, ctx } = canvas(S, S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  return toTexture(c)
}

/** Etched technical plate: grid, registration marks and index numbers. */
export function plateTexture(index: string, tone: 'cream' | 'cobalt' = 'cream') {
  const W = 512
  const H = 640
  const { c, ctx } = canvas(W, H)
  const bg = tone === 'cream' ? PALETTE.cream : PALETTE.cobalt
  const fg = tone === 'cream' ? '#0b0f1a' : PALETTE.cream
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = tone === 'cream' ? 'rgba(32,69,255,.35)' : 'rgba(241,239,231,.28)'
  ctx.lineWidth = 1
  for (let x = 32; x < W; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 32; y < H; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.fillStyle = fg
  ctx.font = '900 260px "Barlow Condensed", Impact, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(index, 34, H - 60)
  ctx.font = '500 18px "IBM Plex Mono", monospace'
  ctx.fillText('IW / CREATIVE MACHINE', 36, 52)
  ctx.fillText('MODULE ' + index, 36, 80)
  ctx.fillStyle = PALETTE.lime
  ctx.fillRect(W - 92, 36, 56, 14)
  grain(ctx, W, H, 16, 31)
  return toTexture(c)
}

export function illuminatedEdgeTexture() {
  const { c, ctx } = canvas(512, 512)
  ctx.strokeStyle = '#dce7ff'
  ctx.shadowColor = '#1643ff'
  ctx.lineWidth = 2.5
  for (const blur of [28, 14, 5]) {
    ctx.shadowBlur = blur
    ctx.strokeRect(28, 28, 456, 456)
  }
  return toTexture(c, { aniso: 16 })
}

export function loadImageTexture(url: string, onLoad?: () => void) {
  const tex = new THREE.TextureLoader().load(url, () => onLoad?.())
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.anisotropy = 16
  return tex
}
