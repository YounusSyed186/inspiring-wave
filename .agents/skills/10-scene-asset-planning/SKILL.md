---
name: scene-asset-planning
description: Plans, catalogs, and stages all visual and audio assets required for complete multi-scene video production.
---

# Scene Asset Planning

Plans, catalogs, and stages all visual and audio assets required for complete multi-scene video production.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Ingest approved storyboard scene requirements.
2. Catalog necessary textures, 3D models, vector icons, and background footage.
3. Check rights and licensing for every external media item.
4. Preload and stage assets into local cache or object storage.
5. Produce asset manifest for the rendering worker.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
