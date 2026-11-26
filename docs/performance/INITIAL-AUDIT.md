# Initial Performance & Mobile Parity Audit

**Date:** 2026-11-26  
**Codebase:** `inspiring-wave-impact-in-motion` (Vite 8.3.8 + React 19 + TypeScript + Three.js `^0.187.0` + GSAP `^3.15.1` + Lenis `^1.3.27` + Cobe `^2.0.1` + Framer Motion `^14.14.0`)

## 1. Stack & Architecture Inventory
- **Build / Framework:** Vite (`vite.config.ts`), React, `react-router-dom`.
- **Smooth Scroll & Motion:** `MotionProvider` (`src/motion.tsx`) initializes `Lenis` on `(min-width: 901px)` only, ticks `lenis.raf(time * 1000)` and `scrollMotion.sample(...)` inside `gsap.ticker`.
- **3D / WebGL Engines:**
  1. `CreativeMachineCanvas` (`src/components/creative-machine/CreativeMachineCanvas.tsx` + `machine.ts`): Three.js `WebGLRenderer`, `PMREMGenerator` + `RoomEnvironment`, dynamic point lights, CPU-deformed orbital ribbon.
  2. `ServicesThreeScene` (`src/components/services/ServicesThreeScene.tsx`): Three.js `WebGLRenderer` with `PCFShadowMap` directional shadows and 6 installation groups.
  3. `InteractiveTestimonialGlobe` (`src/components/testimonials/InteractiveTestimonialGlobe.tsx`): `cobe` WebGL globe + SVG spherical graticule + HTML pin projection.
  4. `WaveMediaRenderer` (`src/motion/WaveMediaRenderer.tsx`): Fixed full-viewport `webgl2` post-process canvas subscribing to `scrollMotion`.
  5. `ProcessThreeScene` (`src/components/infinite-process/ProcessThreeScene.tsx`): Present in repo (`ArtisticMethodSection` is currently commented out in `src/App.tsx`).

---

## 2. Verified Bottlenecks & Parity Defects

### Finding 1 — Cobe WebGL Context Thrashing on Testimonial Change
- **File:** `src/components/testimonials/InteractiveTestimonialGlobe.tsx:232, 394`
- **Component:** `InteractiveTestimonialGlobe`
- **Problem:** `syncDomPins` includes `activeId` in its `useCallback` dependency array, and the `useEffect` that initializes `createGlobe` depends on `[syncDomPins]`. Every time `activeId` changes, the entire WebGL context is destroyed and recreated, plus an extra probe `<canvas>` WebGL context is created each time.
- **Evidence:** Baseline profiler recorded **10–11 WebGL contexts created** during a single page pass with 3 testimonial clicks.
- **CPU / GPU / Memory / Mobile Impact:** High — causes ~100–300ms frame spikes on mobile, shader recompilation, and GPU memory churn; risks hitting Safari/Chrome WebGL context limits (8–16 contexts).
- **Proposed Solution:** Store `activeId` in a mutable ref (`activeIdRef.current = activeId`), keep `syncDomPins` referentially stable, and remove `syncDomPins` from the `createGlobe` mount `useEffect`. Remove the redundant probe canvas creation when `createGlobe` itself is wrapped in `try/catch`.
- **Priority:** P0 (Critical)
- **Expected Improvement:** Eliminates ~6–8 redundant WebGL context creations per session and removes testimonial switch frame spikes.

### Finding 2 — Per-Frame CPU SVG Graticule String Rebuild & Frame-Rate-Dependent Globe Physics
- **File:** `src/components/testimonials/InteractiveTestimonialGlobe.tsx:106-138, 229-231, 349-380`
- **Component:** `InteractiveTestimonialGlobe`
- **Problem:** `syncDomPins()` calls `buildSphericalGraticulePath(g.phi, g.theta)` on every `requestAnimationFrame` tick (computing ~653 spherical trig projections and concatenating SVG path strings into `setAttribute('d', ...)` even when `phi`/`theta` have not moved). Additionally, `velPhi *= 0.93` and `sway = Math.sin(now * 0.00045) * 0.00075` are per-frame rather than delta-time-normalized, running 2x faster on 120Hz mobile displays.
- **CPU / Mobile Impact:** High — unnecessary main-thread trig + SVG DOM mutation every frame on mobile.
- **Proposed Solution:** Normalize globe physics with clamped `dt`, skip `globe.update` and `syncDomPins` when `|phi - lastPhi| < 1e-5 && |theta - lastTheta| < 1e-5` (dirty-check), and throttle graticule SVG updates to meaningful angular deltas.
- **Priority:** P0
- **Expected Improvement:** Eliminates idle per-frame SVG DOM writes and normalizes 60Hz/120Hz motion parity.

### Finding 3 — Services 3D Scene & Card Assembly Motion Completely Disabled Below 960px
- **File:** `src/components/services/ServicesThreeScene.tsx:166`, `src/components/services/ServicesSection.tsx:165, 200, 247`
- **Component:** `ServicesSection`, `ServicesThreeScene`
- **Problem:** Both `ServicesThreeScene` and `ServicesSection` gate 3D rendering and GSAP card-assembly animations behind `window.matchMedia('(min-width: 960px)').matches`. Below 960px, `ServicesThreeScene` is never mounted and `applyAssembly(1)` immediately skips all entrance choreography.
- **Mobile Impact:** High — violates desktop/mobile animation parity.
- **Proposed Solution:** Enable `ServicesThreeScene` on mobile with adaptive DPR, reduced shadow/geometry cost (no `PCFShadowMap` overhead on low/balanced tiers), and mobile-composed camera framing, plus enable smooth GPU-composited (`transform`/`opacity`) GSAP card entrance choreography on mobile viewports.
- **Priority:** P0
- **Expected Improvement:** 100% animation parity on Services without exceeding mobile GPU budget.

### Finding 4 — Hero 3D Ribbon CPU Allocation & Unthrottled Idle Render Loop
- **File:** `src/components/creative-machine/machine.ts:500-540`, `src/components/creative-machine/CreativeMachineCanvas.tsx:63, 133-195`
- **Component:** `CreativeMachine`, `CreativeMachineCanvas`
- **Problem:**
  1. `shapeRibbon(s)` allocates `(N + 1)` `new THREE.Vector3()` instances plus temporary vectors every time `s` changes during scroll.
  2. `CreativeMachineCanvas` uses `maxDpr = 1.75` on mobile with `antialias: true`, `precision: 'highp'`, `RoomEnvironment` PMREM, and runs an independent `requestAnimationFrame` loop without `document.hidden` pause or adaptive quality scaling.
  3. On touch devices, pointer parallax (`pointermove`) has no touch-drag / scroll-coupled parallax equivalent.
- **Proposed Solution:** Preallocate all scratch `Vector3`/`Quaternion` and point arrays once in `CreativeMachine`, integrate with the centralized `AnimationScheduler` + `AdaptiveQuality` engine (capping mobile DPR dynamically `1.0–1.5`, disabling MSAA on `low`/`balanced` tiers, pausing on `document.hidden`), and add subtle touch/scroll parallax parity.
- **Priority:** P1
- **Expected Improvement:** Zero per-frame GC allocations during hero scroll; lower mobile fragment shader cost.

### Finding 5 — Uncoordinated `requestAnimationFrame` Loops & Missing Adaptive Quality Engine
- **Files:** `CreativeMachineCanvas.tsx`, `InteractiveTestimonialGlobe.tsx`, `GetInTouchSection.tsx`, `InspiringWaveFooter.tsx`, `src/motion.tsx`
- **Problem:** Multiple independent `requestAnimationFrame` loops run concurrently without shared delta-time clamping, visibility/background-tab recovery, or sustained frame-time quality adaptation.
- **Proposed Solution:** Introduce `src/lib/animation/AnimationScheduler.ts`, `src/lib/performance/AdaptiveQuality.ts`, `src/lib/performance/DeviceCapabilities.ts`, `src/lib/animation/VisibilityManager.ts`, and `src/components/performance/PerformanceDiagnostics.tsx` (`?debugPerformance=1`).
- **Priority:** P1

### Finding 6 — Homepage & Detail Motion Gated to Desktop (`>= 901px`)
- **File:** `src/motion.tsx:130, 231`
- **Problem:** `useHomepageMotion` and `usePageMotion` place key scroll-linked scale/reveal animations exclusively inside `(min-width: 901px)`.
- **Proposed Solution:** Provide mobile-tuned `transform`/`opacity` equivalents inside `(max-width: 900px) and (prefers-reduced-motion: no-preference)`.
- **Priority:** P1
