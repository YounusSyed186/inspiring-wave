# Mobile Performance & Animation Architecture

## 1. Centralized Animation Runtime (`src/lib/animation/AnimationScheduler.ts`)
- Coordinates active animation loops through a single priority-ordered `requestAnimationFrame` driver.
- Clamps frame delta time (`dt <= 0.05s`) to prevent jumps after GC pauses or backgrounded browser tabs.
- Automatically suspends ticks when `document.hidden` is true and resets frame timestamps + `adaptiveQuality` warmup on resume.
- Exposes `damp(current, target, smoothing, dt)` for frame-rate-independent exponential smoothing across 60Hz and 120Hz displays.

## 2. Adaptive Quality Engine (`src/lib/performance/AdaptiveQuality.ts` & `DeviceCapabilities.ts`)
- Probes initial capabilities (`deviceMemory`, `hardwareConcurrency`, `devicePixelRatio`, `pointer: coarse`, `prefers-reduced-motion`).
- Selects an initial tier (`ultra`, `high`, `balanced`, or `low`) and samples rolling frame-time windows (`90` frames) during active rendering.
- Automatically steps down quality if sustained average frame time exceeds `28.5 ms` and recovers upward only after `8s` of `< 17.5 ms` frames.
- Computes `effectiveDpr` bounded by both `profile.maxDpr` and `profile.maxPixels` so high-DPR phones (`DPR 3`) never allocate 9x oversized WebGL backing buffers.

## 3. Scene Metrics & Diagnostics (`src/lib/performance/SceneMetricsRegistry.ts` & `PerformanceDiagnostics.tsx`)
- Active WebGL scenes (`creative-machine-hero`, `services-3d`, `testimonial-globe`, `wave-media`) report draw calls, triangles, geometries, textures, and backing dimensions without triggering React state updates.
- Visiting any route with `?debugPerformance=1` renders the live diagnostics overlay with controls to force a quality tier or freeze DPR.

## 4. Per-Scene Optimizations
- **Hero (`CreativeMachineCanvas.tsx` + `machine.ts`):** Zero-allocation `shapeRibbon()` using preallocated `ribbonPts` & scratch vectors, shader precompilation (`renderer.compile`), touch parallax parity, and `AnimationScheduler` + `AdaptiveQuality` integration.
- **Services (`ServicesSection.tsx` + `ServicesThreeScene.tsx`):** Restored 3D WebGL scene and GSAP card-assembly choreography below `960px` with mobile camera framing (`fov: 46`, `z: 16.5`) and adaptive shadow/DPR scaling.
- **Testimonials (`InteractiveTestimonialGlobe.tsx`):** Eliminated WebGL context recreation on `activeId` changes via `activeIdRef`, removed redundant probe canvas context, dirty-checked spherical graticule SVG path updates, and normalized physics with `dt`.
- **Global Wave (`WaveMediaRenderer.tsx`):** Connected full-viewport WebGL2 FBO sizing to `adaptiveQuality.getEffectiveDpr`.
