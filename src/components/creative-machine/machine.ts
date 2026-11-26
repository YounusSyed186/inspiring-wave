import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { EXIT_Z, TUNNEL_Y, easeIn, easeInOut, lerp, range, win, type Layout } from './motion'
import {
  brushedTexture,
  checkerTexture,
  globeTexture,
  halftoneTexture,
  loadImageTexture,
  illuminatedEdgeTexture,
  plateTexture,
  radialTexture,
  ribbonTexture,
} from './textures'

/**
 * THE CREATIVE MACHINE — sculpture construction and choreography.
 *
 * Component groups (all independently animated from master progress `p`):
 *   A. core       — W-crowned portal gate, "I" pillar, plinth, bolts, edge light
 *   B. front      — cream / cobalt panels that hinge open around real pivots
 *   C. glass      — a staggered stack of tinted glass planes carrying artwork
 *   D. ribbon     — a thick printed band, morphing from an orbit to a gate ring
 *   E. halo       — suspended elliptical light ring
 *   F. interior   — telescoping corridor frames, light paths, wall plates
 *   G. exit       — doorway + an alpha "window" through which the DOM manifesto
 *                   is literally visible at the end of the corridor
 */

export const FLOOR_Y = -3.57

/** Hole through the portal — the camera's passage. */
const HOLE = { x: 1.2, y0: -1.75, y1: 2.05 }

type Mat = THREE.Material
type GlowMat = { mat: THREE.MeshBasicMaterial; base: THREE.Color }

function glow(color: THREE.ColorRepresentation): GlowMat {
  const base = new THREE.Color(color)
  return { mat: new THREE.MeshBasicMaterial({ color: base.clone(), toneMapped: false }), base }
}
function setGlow(g: GlowMat, k: number) {
  g.mat.color.copy(g.base).multiplyScalar(k)
}

/** A bar between two XY points, as a box of thickness `th` and depth `d` at depth `z`. */
function bar(ax: number, ay: number, bx: number, by: number, z: number, th: number, d: number) {
  const len = Math.hypot(bx - ax, by - ay)
  const g = new THREE.BoxGeometry(len, th, d)
  g.rotateZ(Math.atan2(by - ay, bx - ax))
  g.translate((ax + bx) / 2, (ay + by) / 2, z)
  return g
}

function rectRing(ox0: number, oy0: number, ox1: number, oy1: number, ix0: number, iy0: number, ix1: number, iy1: number, chamfer = 0) {
  const s = new THREE.Shape()
  if (chamfer > 0) {
    const c = chamfer
    s.moveTo(ox0 + c, oy0)
    s.lineTo(ox1 - c, oy0)
    s.lineTo(ox1, oy0 + c)
    s.lineTo(ox1, oy1 - c)
    s.lineTo(ox1 - c, oy1)
    s.lineTo(ox0 + c, oy1)
    s.lineTo(ox0, oy1 - c)
    s.lineTo(ox0, oy0 + c)
    s.closePath()
  } else {
    s.moveTo(ox0, oy0)
    s.lineTo(ox1, oy0)
    s.lineTo(ox1, oy1)
    s.lineTo(ox0, oy1)
    s.closePath()
  }
  const h = new THREE.Path()
  h.moveTo(ix0, iy0)
  h.lineTo(ix0, iy1)
  h.lineTo(ix1, iy1)
  h.lineTo(ix1, iy0)
  h.closePath()
  s.holes.push(h)
  return s
}

type Panel = { pivot: THREE.Group; base: THREE.Vector3; baseRot: THREE.Euler }
type Glass = { group: THREE.Group; base: THREE.Vector3; baseRY: number; i: number }
type Frame = { group: THREE.Group; stackZ: number; finalZ: number; i: number }
type Shard = { mesh: THREE.Mesh; base: THREE.Vector3; dir: THREE.Vector3; spin: THREE.Vector3; baseRot: THREE.Euler }

export class CreativeMachine {
  readonly root = new THREE.Group()
  readonly lights = new THREE.Group()
  private textures: THREE.Texture[] = []
  private disposables: { dispose(): void }[] = []

  private core = new THREE.Group()
  private pillar = new THREE.Group()
  private panels: Panel[] = []
  private glass: Glass[] = []
  private halo = new THREE.Group()
  private edgeLight!: THREE.MeshBasicMaterial
  private haloNode!: THREE.Mesh
  private haloRing!: GlowMat
  private haloLight!: THREE.PointLight
  private frames: Frame[] = []
  private corridorRun: THREE.Mesh[] = []
  private corridorLights: THREE.PointLight[] = []
  private exit = new THREE.Group()
  private exitLight!: THREE.PointLight
  private shards: Shard[] = []

  private crownGlow = glow('#5d7dff')
  private holeGlow = glow('#7d97ff')
  private plinthGlow = glow('#3f62ff')
  private frameGlow = glow('#5b7bff')
  private doorGlow = glow('#fff6dc')
  private limeGlow = glow('#dfff00')

  // ribbon
  private ribbon!: THREE.Mesh
  private ribbonGeo!: THREE.BufferGeometry
  private ribbonTex!: THREE.Texture
  private ribbonN: number
  private ribbonA: THREE.Vector3[] = []
  private ribbonB: THREE.Vector3[] = []
  private ribbonPts: THREE.Vector3[] = []
  private ribbonScratch = {
    axisY: new THREE.Vector3(0, 1, 0),
    axisZ: new THREE.Vector3(0, 0, 1),
    axis: new THREE.Vector3(),
    p: new THREE.Vector3(),
    prev: new THREE.Vector3(),
    next: new THREE.Vector3(),
    tan: new THREE.Vector3(),
    w: new THREE.Vector3(),
    n: new THREE.Vector3(),
    q: new THREE.Quaternion(),
  }
  private ribbonBlend = -1

  constructor(private layout: Layout, onAsset?: () => void) {
    const lite = layout === 'mobile'
    this.ribbonN = lite ? 320 : 560
    this.buildMaterials()
    this.buildEnvironment()
    this.buildCore()
    this.buildFront()
    this.buildGlass(onAsset)
    this.buildRibbon(lite)
    this.buildHalo()
    this.buildInterior(lite ? 6 : 8)
    this.root.add(this.exit)
    this.buildExit()
    this.buildLights()
  }

  configureTextureQuality(maxAnisotropy: number) {
    const anisotropy = Math.min(maxAnisotropy, this.layout === 'mobile' ? 8 : 16)
    for (const texture of this.textures) {
      texture.anisotropy = anisotropy
      texture.magFilter = THREE.LinearFilter
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.generateMipmaps = true
      texture.needsUpdate = true
    }
  }

  /* ------------------------------------------------------------------ */
  /* materials                                                          */
  /* ------------------------------------------------------------------ */

  private m!: {
    cobalt: THREE.MeshStandardMaterial
    cobaltDeep: THREE.MeshStandardMaterial
    cream: THREE.MeshStandardMaterial
    brushed: THREE.MeshStandardMaterial
    steel: THREE.MeshStandardMaterial
    chrome: THREE.MeshStandardMaterial
    glass: THREE.MeshStandardMaterial
    floor: THREE.MeshStandardMaterial
  }

  private tex<T extends THREE.Texture>(t: T) {
    this.textures.push(t)
    return t
  }

  private buildMaterials() {
    const brushed = this.tex(brushedTexture())
    brushed.repeat.set(2, 6)
    this.m = {
      cobalt: new THREE.MeshStandardMaterial({ color: '#2045ff', metalness: 0.35, roughness: 0.36 }),
      cobaltDeep: new THREE.MeshStandardMaterial({ color: '#1530b8', metalness: 0.55, roughness: 0.3 }),
      cream: new THREE.MeshStandardMaterial({ color: '#efebe0', metalness: 0, roughness: 0.74 }),
      brushed: new THREE.MeshStandardMaterial({ color: '#b8c3d0', metalness: 0.92, roughness: 0.4, roughnessMap: brushed }),
      steel: new THREE.MeshStandardMaterial({ color: '#17253c', metalness: 0.72, roughness: 0.42 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#e6ecf4', metalness: 1, roughness: 0.14 }),
      glass: new THREE.MeshStandardMaterial({
        color: '#a9bdff',
        metalness: 0.15,
        roughness: 0.05,
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      floor: new THREE.MeshStandardMaterial({ envMapIntensity: 0.015, color: '#070b14', metalness: 0.6, roughness: 0.3 }),
    }
  }

  private add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: Mat | Mat[], name?: string) {
    const mesh = new THREE.Mesh(geo, mat)
    if (name) mesh.name = name
    parent.add(mesh)
    return mesh
  }

  /* ------------------------------------------------------------------ */
  /* environment: floor, glow pool, contact shadow, horizon             */
  /* ------------------------------------------------------------------ */

  private buildEnvironment() {
    const floor = this.add(this.root, new THREE.PlaneGeometry(160, 160), new THREE.MeshBasicMaterial({ color: '#080d17', toneMapped: false }))
    floor.rotation.x = -Math.PI / 2
    floor.position.set(0, FLOOR_Y, -20)

    const pool = new THREE.MeshBasicMaterial({
      map: this.tex(radialTexture('rgba(40,80,255,.55)', 'rgba(40,80,255,0)')),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const poolMesh = this.add(this.root, new THREE.PlaneGeometry(22, 14), pool)
    poolMesh.rotation.x = -Math.PI / 2
    poolMesh.position.set(0.6, FLOOR_Y + 0.01, 0.5)

    const shadow = new THREE.MeshBasicMaterial({
      map: this.tex(radialTexture('rgba(0,0,0,.85)', 'rgba(0,0,0,0)')),
      transparent: true,
      depthWrite: false,
    })
    const shadowMesh = this.add(this.root, new THREE.PlaneGeometry(12, 6), shadow)
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.set(0, FLOOR_Y + 0.02, 0)

    // faint horizon line, swallowed by fog into atmosphere
    const horizon = this.add(this.root, new THREE.BoxGeometry(220, 0.02, 0.02), this.frameGlow.mat)
    horizon.position.set(0, FLOOR_Y + 0.02, -55)
  }

  /* ------------------------------------------------------------------ */
  /* A. core structure                                                  */
  /* ------------------------------------------------------------------ */

  private buildCore() {
    const { cobalt, cream, brushed, steel, chrome } = this.m
    this.root.add(this.core)

    // W-crowned portal: the gate silhouette reads as a monumental "W"
    const crown: [number, number][] = [
      [-2.7, -3.25], [2.7, -3.25], [2.7, 3.55], [1.36, 2.42], [0, 3.12], [-1.36, 2.42], [-2.7, 3.55],
    ]
    const s = new THREE.Shape()
    crown.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
    s.closePath()
    const hole = new THREE.Path()
    hole.moveTo(-HOLE.x, HOLE.y0)
    hole.lineTo(-HOLE.x, HOLE.y1)
    hole.lineTo(HOLE.x, HOLE.y1)
    hole.lineTo(HOLE.x, HOLE.y0)
    hole.closePath()
    s.holes.push(hole)
    const depth = 1.3
    const portalGeo = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.05,
      bevelSegments: 2,
      curveSegments: 4,
    })
    portalGeo.translate(0, 0, -depth / 2)
    // caps cobalt, extruded sides (incl. the passage walls) cream
    this.add(this.core, portalGeo, [cobalt, cream], 'portal')

    // inset chrome trim around the passage
    const z = depth / 2 + 0.075
    const trim = mergeGeometries([
      bar(-HOLE.x - 0.1, HOLE.y0 - 0.1, HOLE.x + 0.1, HOLE.y0 - 0.1, z, 0.06, 0.05),
      bar(-HOLE.x - 0.1, HOLE.y1 + 0.1, HOLE.x + 0.1, HOLE.y1 + 0.1, z, 0.06, 0.05),
      bar(-HOLE.x - 0.1, HOLE.y0 - 0.1, -HOLE.x - 0.1, HOLE.y1 + 0.1, z, 0.06, 0.05),
      bar(HOLE.x + 0.1, HOLE.y0 - 0.1, HOLE.x + 0.1, HOLE.y1 + 0.1, z, 0.06, 0.05),
    ])!
    this.add(this.core, trim, chrome)

    // illuminated edges: crown silhouette and passage
    const crownBars: THREE.BufferGeometry[] = []
    for (let i = 2; i < crown.length; i++) {
      const [ax, ay] = crown[i]
      const [bx, by] = crown[(i + 1) % crown.length === 0 ? 0 : i + 1] ?? crown[0]
      if (i === crown.length - 1) break
      crownBars.push(bar(ax, ay, bx, by, z - 0.02, 0.035, 0.03))
    }
    this.add(this.core, mergeGeometries(crownBars)!, this.crownGlow.mat)
    const holeBars = mergeGeometries([
      bar(-HOLE.x + 0.02, HOLE.y0 + 0.02, HOLE.x - 0.02, HOLE.y0 + 0.02, z - 0.03, 0.03, 0.02),
      bar(-HOLE.x + 0.02, HOLE.y1 - 0.02, HOLE.x - 0.02, HOLE.y1 - 0.02, z - 0.03, 0.03, 0.02),
      bar(-HOLE.x + 0.02, HOLE.y0, -HOLE.x + 0.02, HOLE.y1, z - 0.03, 0.03, 0.02),
      bar(HOLE.x - 0.02, HOLE.y0, HOLE.x - 0.02, HOLE.y1, z - 0.03, 0.03, 0.02),
    ])!
    this.add(this.core, holeBars, this.holeGlow.mat)

    // chrome bolts around the passage (instanced)
    const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10)
    boltGeo.rotateX(Math.PI / 2)
    const bolts: [number, number][] = []
    for (let i = 0; i < 6; i++) {
      const y = lerp(HOLE.y0 - 0.35, HOLE.y1 + 0.2, i / 5)
      bolts.push([-HOLE.x - 0.45, y], [HOLE.x + 0.45, y])
    }
    for (let i = 0; i < 5; i++) bolts.push([lerp(-1.9, 1.9, i / 4), -2.85])
    const boltMesh = new THREE.InstancedMesh(boltGeo, chrome, bolts.length)
    const mtx = new THREE.Matrix4()
    bolts.forEach(([x, y], i) => boltMesh.setMatrixAt(i, mtx.makeTranslation(x, y, depth / 2 + 0.08)))
    this.core.add(boltMesh)

    // plinth
    const plinth = this.add(this.core, new THREE.BoxGeometry(8.6, 0.32, 3.6), steel)
    plinth.position.set(0.2, -3.41, 0)
    const plinthEdge = this.add(this.core, new THREE.BoxGeometry(8.6, 0.022, 0.02), this.plinthGlow.mat)
    plinthEdge.position.set(0.2, -3.27, 1.81)
    const limeTick = this.add(this.core, new THREE.BoxGeometry(0.9, 0.035, 0.02), this.limeGlow.mat)
    limeTick.position.set(3.4, -3.33, 1.82)

    // the "I": a slender brushed-metal pillar with a cobalt spine and vents
    this.core.add(this.pillar)
    this.pillar.position.set(-3.8, 0.6, 0.15)
    this.pillar.rotation.y = 0.14
    this.add(this.pillar, new THREE.BoxGeometry(0.82, 7.7, 1.1), brushed)
    const cap = this.add(this.pillar, new THREE.BoxGeometry(0.96, 0.24, 1.22), cream)
    cap.position.y = 3.9
    const spine = this.add(this.pillar, new THREE.BoxGeometry(0.11, 6.2, 0.04), cobalt)
    spine.position.set(-0.2, -0.2, 0.56)
    const ventGeo = new THREE.BoxGeometry(0.3, 0.045, 0.03)
    const vents = new THREE.InstancedMesh(ventGeo, steel, 12)
    for (let i = 0; i < 12; i++) vents.setMatrixAt(i, mtx.makeTranslation(0.14, 2.6 - i * 0.16, 0.56))
    this.pillar.add(vents)
  }

  /* ------------------------------------------------------------------ */
  /* B. front exterior panels                                           */
  /* ------------------------------------------------------------------ */

  private panel(pivotAt: THREE.Vector3, offsetX: number, geo: THREE.BufferGeometry, mats: Mat | Mat[], rot = new THREE.Euler()) {
    const pivot = new THREE.Group()
    pivot.position.copy(pivotAt)
    pivot.rotation.copy(rot)
    const mesh = this.add(pivot, geo, mats)
    mesh.position.x = offsetX
    this.root.add(pivot)
    this.panels.push({ pivot, base: pivotAt.clone(), baseRot: rot.clone() })
    return mesh
  }

  private buildFront() {
    const { cream, cobalt, cobaltDeep } = this.m
    const eye = new THREE.MeshBasicMaterial({
      map: this.tex(loadImageTexture('/assets/hero/machine-eye-cobalt.webp')),
      toneMapped: false,
    })
    // 1 — halftone eye plate, hinged on its left edge
    const p1 = this.panel(new THREE.Vector3(-1.75, 0.5, 1.05), 1.3, new THREE.BoxGeometry(2.6, 3.2, 0.08), [cream, cream, cream, cream, eye, cream], new THREE.Euler(0, 0.07, 0))
    const back1 = this.add(p1, new THREE.BoxGeometry(2.74, 3.34, 0.05), cobaltDeep)
    back1.position.z = -0.09

    // 2 — cobalt module plate, hinged on its right edge
    const plate = new THREE.MeshStandardMaterial({ map: this.tex(plateTexture('02', 'cobalt')), roughness: 0.5, metalness: 0.2 })
    const p2 = this.panel(new THREE.Vector3(1.85, -0.05, 0.86), -0.78, new THREE.BoxGeometry(1.56, 4.3, 0.14), [cobalt, cobalt, cobalt, cobalt, plate, cobalt], new THREE.Euler(0, -0.05, 0))
    const checker = this.tex(checkerTexture(6))
    checker.repeat.set(1, 0.5)
    const strip = this.add(p2, new THREE.PlaneGeometry(1.56, 0.52), new THREE.MeshStandardMaterial({ map: checker, roughness: 0.6 }))
    strip.position.set(0, -1.62, 0.075)

    // 3 — small cream index plate with a strip of lime tape
    const plate1 = new THREE.MeshStandardMaterial({ map: this.tex(plateTexture('01', 'cream')), roughness: 0.7 })
    const p3 = this.panel(new THREE.Vector3(-1.95, 2.1, 1.3), 0.65, new THREE.BoxGeometry(1.3, 1.62, 0.06), [cream, cream, cream, cream, plate1, cream], new THREE.Euler(0, 0.1, 0.07))
    const tape = this.add(p3, new THREE.BoxGeometry(0.46, 0.13, 0.012), this.limeGlow.mat)
    tape.position.set(0, 0.8, 0.04)
    tape.rotation.z = -0.06
  }

  /* ------------------------------------------------------------------ */
  /* C. glass display planes                                            */
  /* ------------------------------------------------------------------ */

  private buildGlass(onAsset?: () => void) {
    const { glass, chrome } = this.m
    const art = (map: THREE.Texture, transparent = false) => {
      const mat = new THREE.MeshBasicMaterial({
        map, toneMapped: false, fog: false,
        transparent,
        depthWrite: !transparent,
        side: THREE.DoubleSide,
      })
      return mat
    }
    this.edgeLight = new THREE.MeshBasicMaterial({
      map: this.tex(illuminatedEdgeTexture()), transparent: true, depthWrite: false,
      toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })
    const sources: (() => THREE.Material)[] = [
      () => art(this.tex(loadImageTexture('/assets/hero/machine-eye-cobalt.webp', onAsset))),
      () => art(this.tex(loadImageTexture('/assets/hero/machine-cloud.webp', onAsset))),
      () => new THREE.MeshStandardMaterial({ color: '#b6ff00', emissive: '#74b900', emissiveIntensity: 0.2, toneMapped: false }),
      () => art(this.tex(globeTexture()), true),
      () => art(this.tex(loadImageTexture('/assets/fabric.webp', onAsset))),
    ]
    const spec: [number, number, number, number, number][] = [
      // x, y, z, height, width
      [-1.1, 0.65, 2.4, 4.5, 4.15],
      [0.75, 0.85, 1.25, 4.65, 3.4],
      [1.95, 0.7, 0.1, 4.35, 2.8],
      [3.25, 0.48, -0.55, 3.7, 2.65],
      [4.35, 0.82, 0.05, 2.5, 1.7],
    ]
    spec.forEach(([x, y, z, h, w], i) => {
      const group = new THREE.Group()
      group.position.set(x, y, z)
      const baseRY = -0.52
      group.rotation.z = 0.08
      group.rotation.x = -0.25
      group.rotation.y = baseRY
      const artMesh = this.add(group, new THREE.PlaneGeometry(w * 0.995, h * 0.995), sources[i]())
      artMesh.position.z = -0.025
      this.add(group, new THREE.PlaneGeometry(w, h), glass)
      const fw = w / 2
      const fh = h / 2
      const frame = mergeGeometries([
        bar(-fw, -fh, fw, -fh, 0, 0.025, 0.025),
        bar(-fw, fh, fw, fh, 0, 0.025, 0.025),
        bar(-fw, -fh, -fw, fh, 0, 0.025, 0.025),
        bar(fw, -fh, fw, fh, 0, 0.025, 0.025),
      ])!
      this.add(group, frame, i < 2 ? this.frameGlow.mat : chrome)
      if (i < 3) {
        const light = this.add(group, new THREE.PlaneGeometry(w * 8 / 7, h * 8 / 7), this.edgeLight)
        light.position.z = 0.025
      }
      const rake = new THREE.Matrix4().makeShear(0, 0, 0.18, 0, 0, 0)
      for (const layer of group.children) (layer as THREE.Mesh).geometry.applyMatrix4(rake)
      this.root.add(group)
      this.glass.push({ group, base: group.position.clone(), baseRY, i })
    })
  }

  /* ------------------------------------------------------------------ */
  /* D. orbital ribbon                                                  */
  /* ------------------------------------------------------------------ */

  private buildRibbon(lite: boolean) {
    const N = this.ribbonN
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2
      // A: orbit wrapping the sculpture — low across the front, high behind
      this.ribbonA.push(
        new THREE.Vector3(0.5 + 5.1 * Math.cos(th), -0.7 - 1.25 * Math.sin(th) + 0.9 * Math.cos(th) + 0.9 * Math.sin(2 * th), 0.35 + 3.05 * Math.sin(th)),
      )
      // B: a gate ring standing in front of the passage — the camera flies through it
      this.ribbonB.push(
        new THREE.Vector3(3.55 * Math.cos(th + Math.PI / 2), TUNNEL_Y + 3.95 * Math.sin(th + Math.PI / 2) * 0.98, 2.2 + 0.55 * Math.sin(2 * th)),
      )
      this.ribbonPts.push(new THREE.Vector3())
    }
    const verts = (N + 1) * 4
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts * 3), 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(verts * 3), 3))
    const uv = new Float32Array(verts * 2)
    const repeats = 3
    for (let i = 0; i <= N; i++) {
      const u = (1 - i / N) * repeats
      // front strip (2 verts), back strip (2 verts)
      uv.set([u, 1, u, 0, u, 1, u, 0], i * 8)
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const idx: number[] = []
    for (let i = 0; i < N; i++) {
      const a = i * 4
      const b = (i + 1) * 4
      idx.push(a, a + 1, b, b, a + 1, b + 1) // front
      idx.push(a + 2, b + 2, a + 3, b + 2, b + 3, a + 3) // back
      idx.push(a, b, a + 2, a + 2, b, b + 2) // top edge
      idx.push(a + 1, a + 3, b + 1, b + 1, a + 3, b + 3) // bottom edge
    }
    geo.setIndex(idx)
    this.ribbonGeo = geo
    this.ribbonTex = this.tex(ribbonTexture(lite ? 0.8 : 1.5))
    const mat = new THREE.MeshStandardMaterial({
      map: this.ribbonTex,
      color: '#fff1dc',
      envMapIntensity: 0.18,
      roughness: 0.58,
      metalness: 0.05,
      side: THREE.DoubleSide,
      emissive: '#ffffff',
      emissiveMap: this.ribbonTex,
      emissiveIntensity: 0.08,
    })
    this.ribbon = this.add(this.root, geo, mat, 'ribbon')
    this.ribbon.frustumCulled = false
    this.shapeRibbon(0)
  }

  private shapeRibbon(s: number) {
    if (Math.abs(s - this.ribbonBlend) < 1e-4) return
    this.ribbonBlend = s
    const N = this.ribbonN
    const pos = this.ribbonGeo.attributes.position as THREE.BufferAttribute
    const nor = this.ribbonGeo.attributes.normal as THREE.BufferAttribute
    const W = 0.78
    const TH = 0.035
    const { axisY, axisZ, axis, p, prev, next, tan, w, n, q } = this.ribbonScratch
    axis.lerpVectors(axisY, axisZ, s).normalize()
    const pts = this.ribbonPts
    for (let i = 0; i <= N; i++) pts[i].lerpVectors(this.ribbonA[i], this.ribbonB[i], s)
    for (let i = 0; i <= N; i++) {
      p.copy(pts[i])
      prev.copy(pts[i === 0 ? N - 1 : i - 1])
      next.copy(pts[i === N ? 1 : i + 1])
      tan.subVectors(next, prev).normalize()
      w.copy(axis).addScaledVector(tan, -axis.dot(tan)).normalize()
      // a slow Möbius-like twist, strongest across the front of the orbit
      const th = (i / N) * Math.PI * 2
      q.setFromAxisAngle(tan, 1.05 * Math.sin(th - 0.4) * (1 - s))
      w.applyQuaternion(q)
      n.crossVectors(tan, w).normalize()
      const o = i * 4
      for (let k = 0; k < 4; k++) {
        const side = k % 2 === 0 ? 0.5 : -0.5
        const face = k < 2 ? 0.5 : -0.5
        pos.setXYZ(o + k, p.x + w.x * W * side + n.x * TH * face, p.y + w.y * W * side + n.y * TH * face, p.z + w.z * W * side + n.z * TH * face)
        const f = k < 2 ? 1 : -1
        nor.setXYZ(o + k, n.x * f, n.y * f, n.z * f)
      }
    }
    pos.needsUpdate = true
    nor.needsUpdate = true
  }

  /* ------------------------------------------------------------------ */
  /* E. suspended halo                                                  */
  /* ------------------------------------------------------------------ */

  private buildHalo() {
    this.root.add(this.halo)
    this.halo.position.set(0.7, 4.25, -1.0)
    this.haloRing = glow('#d6e2ff')
    const ring = this.add(this.halo, new THREE.TorusGeometry(2.55, 0.045, 10, 200), this.haloRing.mat)
    ring.scale.set(1, 0.62, 1)
    const halo = new THREE.MeshBasicMaterial({
      color: '#3b62ff',
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const bloom = this.add(this.halo, new THREE.TorusGeometry(2.55, 0.2, 8, 160), halo)
    bloom.scale.set(1, 0.62, 1)
    this.haloNode = this.add(this.halo, new THREE.SphereGeometry(0.075, 16, 12), this.limeGlow.mat)
    this.haloLight = new THREE.PointLight('#8fb0ff', 14, 16, 1.6)
    this.halo.add(this.haloLight)
  }

  /* ------------------------------------------------------------------ */
  /* F. internal mechanical structure (telescoping corridor)            */
  /* ------------------------------------------------------------------ */

  private buildInterior(count: number) {
    const { steel, cobaltDeep, cream } = this.m
    const halftone = this.tex(halftoneTexture(false))
    const plates = [
      new THREE.MeshStandardMaterial({ map: halftone, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: this.tex(plateTexture('03', 'cobalt')), roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ map: this.tex(plateTexture('04', 'cream')), roughness: 0.6 }),
    ]
    const ox = 1.86
    const oy0 = -2.3
    const oy1 = 2.38
    const ix = 1.34
    const iy0 = -1.8
    const iy1 = 2.18
    for (let i = 0; i < count; i++) {
      const group = new THREE.Group()
      const variant = i % 3
      const shape = rectRing(-ox, oy0, ox, oy1, -ix, iy0, ix, iy1, variant === 1 ? 0.32 : 0)
      const d = variant === 2 ? 0.16 : 0.28
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
      geo.translate(0, 0, -d / 2)
      const mat = variant === 1 ? cobaltDeep : steel
      this.add(group, geo, mat)
      // inner light trim
      const zz = d / 2 + 0.01
      const trim = mergeGeometries([
        bar(-ix, iy0 + 0.02, ix, iy0 + 0.02, zz, 0.025, 0.02),
        bar(-ix, iy1 - 0.02, ix, iy1 - 0.02, zz, 0.025, 0.02),
        bar(-ix + 0.02, iy0, -ix + 0.02, iy1, zz, 0.025, 0.02),
        bar(ix - 0.02, iy0, ix - 0.02, iy1, zz, 0.025, 0.02),
      ])!
      this.add(group, trim, this.frameGlow.mat)
      // wall plate on alternating sides, mounted inside the frame
      if (i % 2 === 1 || i === 0) {
        const side = i % 4 === 1 ? -1 : 1
        const plate = this.add(group, new THREE.BoxGeometry(0.05, 1.7, 1.25), [cream, cream, cream, cream, cream, cream])
        const face = this.add(group, new THREE.PlaneGeometry(1.25, 1.7), plates[i % 3])
        plate.position.set(side * (ix - 0.06), 0.2, -0.9)
        face.position.set(side * (ix - 0.09), 0.2, -0.9)
        face.rotation.y = -side * Math.PI / 2
      }
      group.rotation.z = (i % 2 ? 1 : -1) * 0.022 * (i % 3)
      const finalZ = -2.0 - i * 2.05
      const stackZ = -0.9 - i * 0.3
      group.position.set(0, 0, stackZ)
      this.root.add(group)
      this.frames.push({ group, stackZ, finalZ, i })
    }
    // light paths and floor, stretched as the corridor telescopes
    const runGeo = (x: number, y: number, w: number, h: number) => {
      const g = new THREE.BoxGeometry(w, h, 1)
      g.translate(x, y, -0.5)
      return g
    }
    const paths = this.add(this.root, mergeGeometries([runGeo(-0.9, iy0 + 0.012, 0.03, 0.012), runGeo(0.9, iy0 + 0.012, 0.03, 0.012), runGeo(0, iy1 - 0.012, 0.03, 0.012)])!, this.frameGlow.mat)
    const floor = this.add(this.root, runGeo(0, iy0 - 0.01, ix * 2, 0.02), this.m.floor)
    paths.position.z = floor.position.z = -0.72
    this.corridorRun.push(paths, floor)
  }

  /* ------------------------------------------------------------------ */
  /* G. exit: doorway + alpha window onto the manifesto                 */
  /* ------------------------------------------------------------------ */

  private buildExit() {
    const { steel } = this.m
    const wallZ = EXIT_Z + 2.0
    const dx = 1.25
    const dy0 = -1.65
    const dy1 = 2.05
    const wall = new THREE.ExtrudeGeometry(rectRing(-9, -6, 9, 7, -dx, dy0, dx, dy1), { depth: 0.3, bevelEnabled: false })
    wall.translate(0, 0, wallZ - 0.15)
    this.add(this.exit, wall, steel)
    const trim = mergeGeometries([
      bar(-dx, dy0, dx, dy0, wallZ + 0.17, 0.05, 0.03),
      bar(-dx, dy0, -dx, dy1, wallZ + 0.17, 0.05, 0.03),
      bar(dx, dy0, dx, dy1, wallZ + 0.17, 0.05, 0.03),
    ])!
    this.add(this.exit, trim, this.doorGlow.mat)
    const lintel = this.add(this.exit, bar(-dx, dy1, dx, dy1, wallZ + 0.17, 0.05, 0.03), this.limeGlow.mat)
    void lintel

    // The window: writes transparent black, punching through the canvas so
    // the real DOM (cream veil + manifesto) is seen at the end of the corridor.
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      blending: THREE.NoBlending,
      fog: false,
      toneMapped: false,
    })
    const win = this.add(this.exit, new THREE.PlaneGeometry(40, 30), windowMat, 'manifesto-window')
    win.position.set(0, TUNNEL_Y, EXIT_Z)
    win.renderOrder = 10

    // fragments of the machine drifting just beyond the doorway
    const { cobalt, cream } = this.m
    const checker = this.tex(checkerTexture(4))
    const checkerMat = new THREE.MeshStandardMaterial({ map: checker, roughness: 0.6, side: THREE.DoubleSide })
    const ribbonBit = new THREE.MeshStandardMaterial({ map: this.ribbonTex, roughness: 0.6, side: THREE.DoubleSide })
    const defs: [THREE.BufferGeometry, Mat, [number, number, number], [number, number, number], [number, number, number]][] = [
      [new THREE.BoxGeometry(0.9, 1.3, 0.04), cobalt, [-1.05, 1.35, EXIT_Z + 1.2], [-1, 0.6, 0.2], [0.3, 0.5, 0.2]],
      [new THREE.PlaneGeometry(0.7, 0.7), checkerMat, [1.0, 1.25, EXIT_Z + 0.9], [1, 0.7, 0.1], [0.2, -0.4, 0.5]],
      [new THREE.BoxGeometry(1.4, 0.32, 0.03), ribbonBit, [-0.95, -1.0, EXIT_Z + 1.0], [-1, -0.5, 0.2], [0.1, 0.4, -0.6]],
      [new THREE.BoxGeometry(0.5, 0.9, 0.04), cream, [1.05, -0.95, EXIT_Z + 1.3], [1, -0.6, 0.2], [-0.4, 0.3, 0.3]],
      [new THREE.PlaneGeometry(0.42, 0.42), checkerMat, [0.55, 1.62, EXIT_Z + 1.5], [0.4, 1, 0.2], [0.5, 0.2, -0.3]],
      [new THREE.BoxGeometry(0.28, 0.6, 0.03), cobalt, [-0.45, -1.45, EXIT_Z + 1.5], [-0.3, -1, 0.2], [0.2, -0.5, 0.4]],
    ]
    defs.forEach(([geo, mat, pos, dir, spin], i) => {
      const mesh = this.add(this.exit, geo, mat)
      mesh.position.set(...pos)
      const baseRot = new THREE.Euler(0.15 * (i % 3) - 0.1, 0.4 * ((i % 2) * 2 - 1), 0.2 * (i - 2.5))
      mesh.rotation.copy(baseRot)
      this.shards.push({ mesh, base: new THREE.Vector3(...pos), dir: new THREE.Vector3(...dir).normalize(), spin: new THREE.Vector3(...spin), baseRot })
    })
  }

  /* ------------------------------------------------------------------ */
  /* lights                                                             */
  /* ------------------------------------------------------------------ */

  private buildLights() {
    const L = this.lights
    const lite = this.layout === 'mobile'
    L.add(new THREE.HemisphereLight('#cdd7ff', '#04060b', lite ? 0.72 : 0.5))
    const key = new THREE.DirectionalLight('#ffe7cc', 2.4)
    key.position.set(-7, 9, 10)
    const rim = new THREE.DirectionalLight('#3d66ff', 3.4)
    rim.position.set(8, 4, -9)
    L.add(key, rim)
    if (!lite) {
      const fill = new THREE.DirectionalLight('#8ea6ff', 0.6)
      fill.position.set(7, -2, 7)
      const front = new THREE.DirectionalLight('#f5efe4', 0.7)
      front.position.set(0, 2, 14)
      L.add(fill, front)
    }
    const corridorCount = lite ? 1 : 2
    for (let i = 0; i < corridorCount; i++) {
      const l = new THREE.PointLight('#2f5bff', 0, 9, 1.4)
      l.position.set(0, 1.7, -5 - i * 6)
      this.corridorLights.push(l)
      L.add(l)
    }
    this.exitLight = new THREE.PointLight('#fff1d6', 0, 12, 1.3)
    this.exitLight.position.set(0, TUNNEL_Y, EXIT_Z + 3)
    L.add(this.exitLight)
  }

  /* ------------------------------------------------------------------ */
  /* choreography                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Deterministic pose for master progress `p`. `t` (seconds) and `idle`
   * (0..1) add restrained life on top; they never drive the sequence.
   */
  update(p: number, t: number, idle: number) {
    // stage windows (staggered so one part seems to wake the next)
    const hold = win(p, 0, 0.2)
    const haloA = win(p, 0.2, 0.33)
    const ribA = win(p, 0.25, 0.4)
    const panA = win(p, 0.3, 0.45)
    const sepF = easeInOut(range(p, 0.44, 0.585))
    const sepR = easeInOut(range(p, 0.45, 0.62))
    const enter = range(p, 0.6, 0.75)
    const rev = range(p, 0.9, 1)

    // A. core: a controlled breath of rotation that returns to true before entry
    this.root.rotation.y = -0.05 * hold * (1 - win(p, 0.4, 0.56)) + 0.035 * Math.sin(Math.PI * range(p, 0.2, 0.56))
    this.exit.visible = p > 0.55
    this.edgeLight.opacity = 0.42 + 0.58 * win(p, 0.2, 0.45)
    const unfolding = win(p, 0.38, 0.58)
    this.core.scale.setScalar(0.04 + 0.96 * unfolding)
    this.halo.visible = unfolding > 0.08
    this.halo.scale.setScalar(0.04 + 0.96 * unfolding)
    for (const panel of this.panels) panel.pivot.scale.setScalar(0.04 + 0.96 * unfolding)
    this.pillar.position.x = -3.8 - 1.1 * sepF
    this.pillar.rotation.z = 0.06 * sepF
    setGlow(this.crownGlow, 0.35 + 1.4 * win(p, 0.22, 0.34) + 0.1 * Math.sin(t * 1.3) * idle)
    setGlow(this.holeGlow, 0.25 + 1.6 * win(p, 0.3, 0.44))
    setGlow(this.plinthGlow, 0.5 + 0.9 * win(p, 0.26, 0.4))

    // B. front panels hinge open around their edges
    const [p1, p2, p3] = this.panels
    const f = (i: number) => 0.025 * Math.sin(t * 0.7 + i * 1.7) * idle
    p1.pivot.rotation.y = p1.baseRot.y - 0.08 * panA - 1.32 * sepF
    p1.pivot.position.set(p1.base.x - 0.9 * sepF, p1.base.y + f(0), p1.base.z + 0.5 * sepF)
    p2.pivot.rotation.y = p2.baseRot.y + 0.07 * panA + 1.25 * sepF
    p2.pivot.position.set(p2.base.x + 1.0 * sepF, p2.base.y + f(1), p2.base.z + 0.35 * sepF)
    p3.pivot.position.set(p3.base.x - 1.1 * sepF, p3.base.y + 2.4 * sepF + f(2), p3.base.z + 0.3 * sepF)
    p3.pivot.rotation.z = p3.baseRot.z + 0.05 * panA + 0.3 * sepF

    // C. glass planes fan outward along depth
    for (const g of this.glass) {
      const s = easeInOut(range(p, 0.455 + g.i * 0.018, 0.585 + g.i * 0.018))
      const a = win(p, 0.3 + g.i * 0.02, 0.44 + g.i * 0.02)
      g.group.position.set(
        g.base.x + (g.i === 0 ? -2.85 : 1.65 + g.i * 0.5) * s,
        g.base.y + 0.03 * Math.sin(t * 0.55 + g.i) * idle + 0.12 * a,
        g.base.z + (0.9 - g.i * 0.32) * s + 0.12 * a * (g.i % 2 ? 1 : -1),
      )
      g.group.rotation.y = g.baseRY - 0.08 * a - 0.42 * s
    }

    // D. ribbon: orbit → gate ring; the print keeps flowing along the band
    this.shapeRibbon(sepR)
    this.ribbon.rotation.y = (0.32 * ribA + 0.05 * Math.sin(t * 0.12) * idle) * (1 - sepR)
    this.ribbonTex.offset.x = -(t * 0.01 * (0.6 + ribA) * Math.max(idle, 0.35) + p * 1.6)

    // E. halo: wakes first, tilts dramatically, then lifts clear of the path
    this.halo.position.y = 4.25 + 0.45 * haloA + 3.2 * win(p, 0.52, 0.7)
    this.halo.rotation.x = 1.18 + 0.32 * haloA + 0.025 * Math.sin(t * 0.3) * idle
    this.halo.rotation.z = -0.22 - 0.28 * haloA + 0.02 * Math.sin(t * 0.21) * idle
    setGlow(this.haloRing, 0.75 + 0.75 * haloA + 0.05 * Math.sin(t * 0.9) * idle)
    const nodeA = t * 0.22 * Math.max(idle, 0.4) + p * 7
    this.haloNode.position.set(2.55 * Math.cos(nodeA), 2.55 * 0.62 * Math.sin(nodeA), 0)
    this.haloLight.intensity = 10 + 32 * haloA

    // F. corridor telescopes out from behind the gate
    let lastZ = -0.9
    for (const fr of this.frames) {
      const k = easeInOut(range(p, 0.36 + fr.i * 0.018, 0.56 + fr.i * 0.018))
      fr.group.position.z = lerp(fr.stackZ, fr.finalZ, k)
      lastZ = Math.min(lastZ, fr.group.position.z)
    }
    const run = Math.max(0.01, -0.72 - lastZ)
    for (const m of this.corridorRun) m.scale.z = run
    setGlow(this.frameGlow, 0.25 + 1.25 * win(p, 0.45, 0.62))
    this.corridorLights.forEach((l, i) => (l.intensity = 26 * win(p, 0.44 + i * 0.05, 0.62 + i * 0.05)))
    this.exitLight.intensity = 34 * win(p, 0.6, 0.82)
    setGlow(this.doorGlow, 0.7 + 0.9 * enter)

    // G. fragments drift out past the edges as the manifesto takes over
    const out = easeIn(rev)
    for (const s of this.shards) {
      s.mesh.position.copy(s.base).addScaledVector(s.dir, 3.2 * out)
      s.mesh.position.y += 0.04 * Math.sin(t * 0.8 + s.base.x * 3) * idle
      s.mesh.rotation.set(s.baseRot.x + s.spin.x * out * 2, s.baseRot.y + s.spin.y * out * 2, s.baseRot.z + s.spin.z * out * 2)
    }
  }

  dispose() {
    this.root.traverse(o => {
      const mesh = o as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const mat = mesh.material as Mat | Mat[] | undefined
      if (Array.isArray(mat)) mat.forEach(m => m.dispose())
      else mat?.dispose()
    })
    this.textures.forEach(t => t.dispose())
    this.disposables.forEach(d => d.dispose())
  }
}
