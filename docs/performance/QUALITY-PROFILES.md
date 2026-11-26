# Adaptive Quality Profiles

Defined in `src/lib/performance/DeviceCapabilities.ts`:

| Setting | Ultra | High | Balanced | Low |
|---|---:|---:|---:|---:|
| `maxDpr` | `2.0` | `1.5` | `1.25` | `1.0` |
| `maxPixels` | `4,500,000` | `2,800,000` | `1,800,000` | `1,100,000` |
| `antialias` | `true` | `true` | `false` | `false` |
| `shadowsEnabled` | `true` | `true` | `false` | `false` |
| `shadowMapSize` | `1024` | `512` | `512` | `256` |
| `particleScale` | `1.0` | `0.75` | `0.55` | `0.35` |
| `geometryScale` | `1.0` | `0.85` | `0.65` | `0.45` |
| `textureMaxSize` | `2048` | `1536` | `1024` | `512` |
| `precision` | `highp` | `highp` | `mediump` | `mediump` |
| Animation availability | `100%` | `100%` | `100%` | `100%` |

`computeEffectiveDpr(width, height, profile)` returns `Math.max(1, Math.min(window.devicePixelRatio || 1, profile.maxDpr, Math.sqrt(profile.maxPixels / (width * height))))`.
