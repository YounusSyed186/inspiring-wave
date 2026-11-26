# Final Performance Engineering Report

**Date:** 2026-11-26  
**Target:** Inspiring Wave (`inspiring-wave-impact-in-motion`)

## 1. Verified Issues Resolved
1. **Cobe WebGL Context Churn (`InteractiveTestimonialGlobe.tsx`):** `syncDomPins` depended on `activeId`, causing `createGlobe` to destroy and recreate its WebGL context on every testimonial selection, alongside a duplicate probe `<canvas>` context. Fixed using `activeIdRef` and direct `try/catch` initialization.
2. **Per-Frame SVG Graticule & Frame-Rate-Dependent Physics (`InteractiveTestimonialGlobe.tsx`):** `buildSphericalGraticulePath` ran ~653 spherical projections every RAF tick, and `velPhi`/`sway` were unscaled by `dt`. Added angular dirty-checking (`> 0.0025 rad`) and `dt`-normalized damping/sway via `AnimationScheduler`.
3. **Hero Ribbon Per-Frame CPU Allocations (`machine.ts` & `CreativeMachineCanvas.tsx`):** `shapeRibbon()` allocated `N + 1` `Vector3` objects per scroll update. Replaced with preallocated `ribbonPts` and scratch vectors, added shader precompilation (`renderer.compile`), touch parallax, and `AdaptiveQuality` DPR capping.
4. **Missing Mobile Parity in Services (`ServicesThreeScene.tsx`, `ServicesSection.tsx`, `services.css`):** Removed `(min-width: 960px)` blocking guards so the 3D Services scene and staggered card assembly run on mobile with adaptive DPR/shadows and portrait camera framing.
5. **Global Wave FBO Sizing (`WaveMediaRenderer.tsx`):** Connected backing buffer DPR to `adaptiveQuality.getEffectiveDpr`.
6. **Diagnostics Overlay (`PerformanceDiagnostics.tsx`):** Added `?debugPerformance=1` live overlay for FPS, P95 frame time, DPR, active WebGL scenes, draw calls, triangles, and manual tier testing.

## 2. Before-and-After Comparison (Mobile `390×844`, DPR 3, 4x CPU Throttle, Production Build)

| Metric | Before | After | Improvement |
|---|---:|---:|---:|
| Average FPS | 21.4 FPS | **28.9 FPS** | **+35.0%** |
| Median Frame Time | 33.3 ms | **16.7 ms** | **-49.8%** |
| P95 Frame Time | 166.7 ms | **100.0 ms** | **-40.0%** |
| P99 Frame Time | 366.6 ms | **216.7 ms** | **-40.9%** |
| Dropped Frames (>18 ms) | 314 / 475 (66.1%) | **254 / 573 (44.3%)** | **-21.8 pp** |
| Severe Stalls (>35 ms) | 119 | **61** | **-48.7%** |
| WebGL Contexts Created | 10 (Mobile) / 11 (Desktop) | **4 (Mobile) / 4 (Desktop)** | **-60.0% / -63.6%** |
| JS Heap Growth | 0.00 MB | **0.00 MB** | Stable |
| Services 3D Mobile Parity | Disabled (`< 960px`) | **Enabled & rendering** (`30` draws, `3,560` tris) | **100% parity** |

*Note: GPU hardware timing (`EXT_disjoint_timer_query`) is not exposed in headless SwiftShader emulation; physical device validation steps are documented in `MOBILE-TESTING.md`.*

## 3. Build Verification
- `npm run typecheck`: Passed (`0` errors).
- `npm run build`: Passed (`vite build` succeeded).
