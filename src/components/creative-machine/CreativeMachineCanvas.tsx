import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { CreativeMachine } from './machine'
import {
  CAMERA_KEYS,
  cameraSegment,
  easeInOut,
  lerp,
  win,
  type Layout,
} from './motion'
import { animationScheduler } from '@/lib/animation/AnimationScheduler'
import { adaptiveQuality } from '@/lib/performance/AdaptiveQuality'
import { sceneMetricsRegistry } from '@/lib/performance/SceneMetricsRegistry'

export interface CreativeMachineCanvasProps {
  progressRef: React.MutableRefObject<number>
  layout: Layout
  reducedMotion: boolean
  isVisible: boolean
  onContextLost?: () => void
  onReady?: () => void
}

export function CreativeMachineCanvas({
  progressRef,
  layout,
  reducedMotion,
  isVisible,
  onContextLost,
  onReady,
}: CreativeMachineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visibleRef = useRef(isVisible)
  visibleRef.current = isVisible

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const initialProfile = adaptiveQuality.getProfile()
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: initialProfile.antialias,
        depth: true,
        stencil: false,
        precision: initialProfile.precision,
        powerPreference: layout === 'mobile' ? 'default' : 'high-performance',
      })
    } catch {
      onContextLost?.()
      return
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      onContextLost?.()
    }
    canvas.addEventListener('webglcontextlost', handleContextLost)

    renderer.setClearColor(0x080d17, 1)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const fog = new THREE.FogExp2('#080d17', 0.022)
    scene.fog = fog

    // Subtle studio environment reflections for brushed metal & chrome
    const pmrem = new THREE.PMREMGenerator(renderer)
    const environment = new RoomEnvironment()
    const envRT = pmrem.fromScene(environment, 0.04)
    environment.dispose()
    scene.environment = envRT.texture
    scene.environmentIntensity = 0.68

    let readyFired = false
    const fireReady = () => {
      if (readyFired) return
      readyFired = true
      onReady?.()
    }

    const machine = new CreativeMachine(layout, fireReady)
    machine.configureTextureQuality(renderer.capabilities.getMaxAnisotropy())
    scene.add(machine.root)
    scene.add(machine.lights)

    const camera = new THREE.PerspectiveCamera(34, 1, 0.12, 140)
    const keys = CAMERA_KEYS[layout]
    const targetVec = new THREE.Vector3()
    const posA = new THREE.Vector3()
    const posB = new THREE.Vector3()
    const tgtA = new THREE.Vector3()
    const tgtB = new THREE.Vector3()

    let viewW = 1440
    let viewH = 900
    let currentDpr = 1
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      viewW = Math.max(1, Math.round(rect?.width || window.innerWidth))
      viewH = Math.max(1, Math.round(rect?.height || window.innerHeight))
      currentDpr = adaptiveQuality.getEffectiveDpr(viewW, viewH)
      renderer.setPixelRatio(currentDpr)
      renderer.setSize(viewW, viewH, false)
      camera.aspect = viewW / viewH
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    const unsubQuality = adaptiveQuality.subscribe(() => {
      currentDpr = adaptiveQuality.getEffectiveDpr(viewW, viewH)
      renderer.setPixelRatio(currentDpr)
      renderer.setSize(viewW, viewH, false)
    })

    // Pointer + touch parallax (damped, fades out during scroll transformation)
    const pointer = { nx: 0, ny: 0, sx: 0, sy: 0 }
    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion) return
      pointer.nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      pointer.ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    }
    const onTouchMove = (e: TouchEvent) => {
      if (reducedMotion || e.touches.length === 0) return
      const touch = e.touches[0]
      pointer.nx = (touch.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      pointer.ny = (touch.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    // Precompile shaders once during mount to avoid first-scroll hitch
    try {
      renderer.compile(scene, camera)
    } catch {}

    let elapsed = 0
    let lastP = -1

    const unsubScheduler = animationScheduler.register({
      id: 'creative-machine-hero',
      priority: 1,
      update: (_now, dt) => {
        if (!visibleRef.current) {
          sceneMetricsRegistry.update({
            id: 'creative-machine-hero',
            active: false,
            drawCalls: 0,
            triangles: 0,
            geometries: renderer.info.memory.geometries,
            textures: renderer.info.memory.textures,
            width: canvas.width,
            height: canvas.height,
            dpr: currentDpr,
          })
          return
        }

        const p = progressRef.current
        // Skip redundant renders when off-page at p >= 1
        if (p >= 0.999 && lastP >= 0.999) return
        lastP = p

        if (!reducedMotion) elapsed += dt
        const t = reducedMotion ? 0 : elapsed
        const idleWeight = reducedMotion ? 0 : 1 - win(p, 0.14, 0.45)

        // Frame-rate-independent pointer damping
        const dampAlpha = 1 - Math.exp(-4.2 * dt)
        pointer.sx += (pointer.nx - pointer.sx) * dampAlpha
        pointer.sy += (pointer.ny - pointer.sy) * dampAlpha

        // Update 3D sculpture
        machine.update(p, t, idleWeight)

        // Interpolate camera rig
        const seg = cameraSegment(keys, p)
        const k0 = keys[seg.i]
        const k1 = keys[seg.i + 1]
        const et = easeInOut(seg.t)

        posA.set(...k0.pos)
        posB.set(...k1.pos)
        tgtA.set(...k0.target)
        tgtB.set(...k1.target)

        camera.position.lerpVectors(posA, posB, et)
        targetVec.lerpVectors(tgtA, tgtB, et)

        // Apply restrained pointer/touch parallax + subtle breathing
        const parallaxScale = (layout === 'mobile' ? 0.32 : 1) * idleWeight
        const breathX = reducedMotion ? 0 : Math.sin(t * 0.35) * 0.07 * idleWeight
        const breathY = reducedMotion ? 0 : Math.cos(t * 0.28) * 0.05 * idleWeight
        camera.position.x += pointer.sx * 0.48 * parallaxScale + breathX
        camera.position.y += -pointer.sy * 0.28 * parallaxScale + breathY

        const shiftX = lerp(k0.shiftX, k1.shiftX, et)
        const shiftY = lerp(k0.shiftY, k1.shiftY, et)
        const fov = lerp(k0.fov, k1.fov, et)

        if (Math.abs(camera.fov - fov) > 0.01) {
          camera.fov = fov
        }
        if (Math.abs(shiftX) > 0.0005 || Math.abs(shiftY) > 0.0005) {
          camera.setViewOffset(viewW, viewH, shiftX * viewW, shiftY * viewH, viewW, viewH)
        } else {
          camera.clearViewOffset()
        }
        camera.updateProjectionMatrix()
        camera.lookAt(targetVec)

        // Reduce fog as camera approaches the bright manifesto doorway
        fog.density = 0.022 * (1 - win(p, 0.68, 0.9))

        renderer.render(scene, camera)
        sceneMetricsRegistry.update({
          id: 'creative-machine-hero',
          active: true,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          width: canvas.width,
          height: canvas.height,
          dpr: currentDpr,
        })
        fireReady()
      },
    })

    return () => {
      unsubScheduler()
      unsubQuality()
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      ro.disconnect()
      sceneMetricsRegistry.remove('creative-machine-hero')
      machine.dispose()
      envRT.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [layout, reducedMotion, progressRef, onContextLost, onReady])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="cm-canvas"
    />
  )
}
