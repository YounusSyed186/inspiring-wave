# Production Performance Baseline

**Captured:** 2026-11-26 against production build (`vite preview` on `http://127.0.0.1:4174/`) using Playwright + Chrome DevTools Protocol (headless Chromium).  
**Note on Emulation:** Headless Chromium uses SwiftShader/ANGLE software rendering for WebGL and 4x CDP CPU throttling for mobile emulation. Physical mobile device traces should be collected separately per `MOBILE-TESTING.md`.

## 1. Baseline Metrics Summary

| Metric | Mobile (`390×844`, DPR 3, 4x CPU) | Desktop (`1440×900`, DPR 1) |
|---|---:|---:|
| Initial Load (`networkidle`) | 3,262 ms | 1,672 ms |
| Average FPS | **21.4 FPS** | 11.8 FPS (SwiftShader) |
| Median Frame Time | **33.3 ms** | 33.4 ms |
| P95 Frame Time | **166.7 ms** | 349.9 ms |
| P99 Frame Time | **366.6 ms** | 416.6 ms |
| Dropped Frames (>18 ms) | **314 / 475 (66.1%)** | 261 / 311 (83.9%) |
| Severe Stalls (>35 ms) | **119 / 475 (25.1%)** | 127 / 311 (40.8%) |
| Long Tasks Count | **118** | 119 |
| Max Long Task Duration | **2,563 ms** | 2,461 ms |
| WebGL Contexts Created | **10** | **11** |
| JS Heap (Start → End) | 11.35 MB → 11.35 MB | 11.35 MB → 11.35 MB |
| Console / Page Errors | 0 | 0 |

## 2. Active Canvas Dimensions at Baseline

| Canvas | Mobile Backing (`w×h` / CSS) | Desktop Backing (`w×h` / CSS) |
|---|---:|---:|
| `.cm-canvas` (Hero 3D) | `682×1477` (`390×844`) | `1440×900` (`1440×900`) |
| `.iw-three-canvas` (Services 3D) | **Not mounted (`< 960px`)** | `1440×900` (`32` draw calls, `4,292` tris) |
| `.tw-globe-canvas` (Testimonials) | `397×397` (`265×265`) | `454×454` (`454×454`) |
| `.wave-media-canvas` (Global Wave) | `585×1266` (`390×844`) | `1440×900` (`1440×900`) |

## 3. Primary Bottleneck Classification
1. **WebGL Context Churn (CPU + GPU):** 10–11 WebGL contexts created in a single pass, largely driven by `InteractiveTestimonialGlobe` destroying/recreating `createGlobe` on every `activeId` change plus probe canvas allocations.
2. **Main-Thread Long Tasks (CPU):** 118–119 long tasks (up to 2.56s) during preloader + scroll + 3D initialization.
3. **Missing Mobile Parity:** `ServicesThreeScene` and `ServicesSection` card assembly animations do not run below `960px`.
4. **No Adaptive Quality / Visibility Suspension:** Independent RAF loops lack shared frame-time monitoring, adaptive DPR scaling, and `document.hidden` recovery.
