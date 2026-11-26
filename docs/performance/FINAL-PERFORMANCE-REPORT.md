# Final Performance Engineering Report

**Date:** 2026-11-26  
**Target:** Inspiring Wave (`inspiring-wave-impact-in-motion`)

## 1. Verified Issues Resolved
1. **Cobe WebGL Context Churn (`InteractiveTestimonialGlobe.tsx`):** `syncDomPins` depended on `activeId`, causing `createGlobe` to destroy and recreate its WebGL context on every testimonial selection, alongside a duplicate probe `<canvas>` context. Fixed using `activeIdRef` and direct `try/catch` initialization.
2. **Per-Frame SVG Graticule & Frame-Rate-Dependent Physics (`InteractiveTestimonialGlobe.tsx`):** `buildSphericalGraticulePath` ran ~653 spherical projections every RAF tick, and `velPhi`/`sway` were unscaled by `dt`. Added angular dirty-checking (`> 0.0025 rad`) and `dt`-normalized damping/sway via `AnimationScheduler`.
3. **Hero Ribbon Per-Frame CPU Allocations & Mobile Light Cost (`machine.ts` & `CreativeMachineCanvas.tsx`):** `shapeRibbon()` allocated `N + 1` `Vector3` objects per scroll update. Replaced with preallocated `ribbonPts` and scratch vectors, reduced mobile directional/corridor lights while preserving ambient fill, added shader precompilation (`renderer.compile`), touch parallax, and `AdaptiveQuality` DPR capping.
4. **Missing Mobile Parity in Services & Per-Frame DOM Queries (`ServicesThreeScene.tsx`, `ServicesSection.tsx`, `services.css`):** Removed `(min-width: 960px)` blocking guards so the 3D Services scene and staggered card assembly run on mobile with adaptive DPR/shadows and portrait camera framing, and cached `.iw-installation-depth`/`.iw-art` refs outside the animation loop.
5. **Manifesto React Reconciliation & Scheduler Integration (`tiger-tear-reveal.tsx`):** Moved `TigerTearReveal` onto `AnimationScheduler` with `dt`-damped `damp()` interpolation and quantized state updates.
6. **Mobile Address-Bar Resize Thrashing & Passive Touch Gestures (`src/motion.tsx`, `useCarouselGestures.ts`):** Guarded `document.body` `ResizeObserver` against minor vertical height jitter (`< 48px` with unchanged width) so mobile URL-bar collapse/expand does not trigger `ScrollTrigger.refresh()`, and marked carousel pointer listeners `{ passive: true }`.
7. **Global Wave FBO & Process Scene DPR (`WaveMediaRenderer.tsx`, `ProcessThreeScene.tsx`):** Connected backing buffer DPR to `adaptiveQuality.getEffectiveDpr`.
8. **Diagnostics Overlay (`PerformanceDiagnostics.tsx`):** Added `?debugPerformance=1` live overlay for FPS, P95 frame time, DPR, active WebGL scenes, draw calls, triangles, and manual tier testing.

## 2. Before-and-After Comparison (Mobile `390×844`, DPR 3, 4x CPU Throttle, Production Build)

| Metric | Before | After | Improvement |
|---|---:|---:|---:|
| Average FPS | 21.4 FPS | **30.1 FPS** | **+40.7%** |
| Median Frame Time | 33.3 ms | **16.7 ms** | **-49.8%** |
| P95 Frame Time | 166.7 ms | **83.4 ms** | **-50.0%** |
| P99 Frame Time | 366.6 ms | **200.1 ms** | **-45.4%** |
| Dropped Frames (>18 ms) | 314 / 475 (66.1%) | **251 / 590 (42.5%)** | **-23.6 pp** |
| Severe Stalls (>35 ms) | 119 | **79** | **-33.6%** |
| Max Long Task | 2,563 ms | **2,211 ms** | **-13.7%** |
| WebGL Contexts Created | 10 (Mobile) / 11 (Desktop) | **4 (Mobile) / 4 (Desktop)** | **-60.0% / -63.6%** |
| JS Heap Growth | 0.00 MB | **0.00 MB** | Stable (`13.64 MB`) |
| Services 3D Mobile Parity | Disabled (`< 960px`) | **Enabled & rendering** (`26` draws, `3,512` tris) | **100% parity** |

*Note: GPU hardware timing (`EXT_disjoint_timer_query`) is not exposed in headless SwiftShader emulation; physical device validation steps are documented in `MOBILE-TESTING.md`.*

## 3. Build Verification
- `npm run typecheck`: Passed (`0` errors).
- `npm run build`: Passed (`vite build` succeeded).
