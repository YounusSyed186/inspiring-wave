# Lemo-Opuscar Architectural Integration Contract

## 1. Absolute Foundation
The autonomous video studio utilizes **Lemo-Opuscar** (`https://github.com/lemomo-ai/lemo-opuscar`) as its primary, code-driven video generation engine.
Random text-to-video diffusion models (Veo, Runway, Kling, Pika), stock footage montages, and basic text templates are prohibited.

Every video consists of original, programmatically animated scenes authored in Canvas 2D, SVG, WebGL, or Three.js adhering to Lemo-Opuscar's deterministic rendering interface.

---

## 2. Deterministic Rendering Contract

Every film and scene directory (`films/<film_name>/index.html`) exposes the documented globals:

| Global | Type | Description |
| :--- | :--- | :--- |
| `window.DUR` | `number` | Total duration of the film in seconds (e.g. `46.20`). |
| `window.render(t)` | `(t: number) => void` | Pure deterministic function rendering visual state at second `t`. |
| `window.READY` | `boolean` | Set to `true` once fonts, assets, and shaders are initialized. |
| `window.TEXTS(t)` | `(t: number) => TextEntry[]` | Array of `{ id, text, x0, y0, x1, y1 }` for reading time validation (`readcheck.mjs`). |
| `window.EV` | `Array` | Sound, foley, and cue events. |

---

## 3. End-to-End Production Sequence

```
1. USER THEME & CHANNEL SELECTION
       ↓
2. GEMINI RESEARCH & NARRATIVE SCRIPT
       ↓
3. STRUCTURED STORYBOARD (5-Act Technical Breakdown)
       ↓
4. LEMO-OPUSCAR STYLE SELECTION (Out of 80+ supported styles)
       ↓
5. SCENE-BY-SCENE ANIMATION CODE GENERATION (Pure HTML5 / Canvas / WebGL)
       ↓
6. SANDBOXED VALIDATION (`node core/render/still.mjs`)
       ↓
7. BROWSER-BASED MULTI-WORKER RENDERING (`node core/render/video.mjs`)
       ↓
8. NEURAL SPEECH & BROADCAST SCORE MIXING (`edge-tts` / Kokoro + -14.0 LUFS mastering)
       ↓
9. CAPTION SYNCHRONIZATION & READABILITY AUDIT (`readcheck.mjs`)
       ↓
10. FFMPEG FASTSTART MULTI-STREAM MUXING
       ↓
11. AUTOMATED QA INSPECTION (Duration, bit-rate, black frame audit)
       ↓
12. YOUTUBE OAUTH PUBLISHING PIPELINE
```

---

## 4. Case Study Implementation: "The House of Wisdom"

The autonomous studio produced the complete 46.20-second film located at `C:\Users\DELL\lemo-opuscar\films\house-of-wisdom\index.html`:

- **Scene 1 (0:00 - 0:09.5)**: Abbasid World Cartography — Baghdad highlighted through smooth camera tracking and converging trade/knowledge vectors.
- **Scene 2 (0:09.5 - 0:19.0)**: Bayt al-Hikma Architectural Assembly — Geometric construction lines, layered horseshoe arches, colonnades, and ribbed dome assembled progressively.
- **Scene 3 (0:19.0 - 0:28.5)**: Al-Khwarizmi & Algebra — 3D illuminated folio manuscript opens; quadratic formulas and Hindu-Arabic numerals emerge dynamically with glow shaders.
- **Scene 4 (0:28.5 - 0:38.0)**: Ibn al-Haytham & Camera Obscura — Empirical optics ray tracing showing light travelling in straight lines through a pinhole aperture, forming an inverted real image.
- **Scene 5 (0:38.0 - 0:46.2)**: Astrolabe & Global Legacy — Rotating medieval brass astrolabe mechanism with zodiac ring and star pointers, projecting knowledge transfer across Mediterranean civilization.

### Quality Assurance Verification
- `readcheck.mjs`: **100% PASSED** across all 10 on-screen text events.
- `video.mjs`: **1,109 frames** rendered at 24.0 fps in 25 seconds across 3 parallel workers.
- Audio Loudness: `-14.0 LUFS` with `-1.5 dBTP` true peak.
