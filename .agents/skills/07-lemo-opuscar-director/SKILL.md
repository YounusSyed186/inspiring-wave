---
name: lemo-opuscar-director
description: Interfaces with the Lemo-Opuscar procedural filmmaking engine to direct 80+ code-driven visual styles for cinematic scene generation.
---

# Lemo Opuscar Director

Interfaces with the Lemo-Opuscar procedural filmmaking engine to direct 80+ code-driven visual styles for cinematic scene generation.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Query available Lemo Opuscar styles (impasto, ukiyoe, watercolor, satellite-briefing, teardown, etc.).
2. Select style matching the channel brand profile and scene narrative mood.
3. Configure scene parameters (Three.js shaders, lighting, colors, camera speed).
4. Execute procedural render via the Lemo CLI adapter.
5. Validate generated frame sequence and video stream output.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
