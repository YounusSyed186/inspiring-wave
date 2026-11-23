---
name: storyboard-director
description: Directs the visual storyboard, mapping each sentence of narration to scene concepts, camera movements, and transition timings.
---

# Storyboard Director

Directs the visual storyboard, mapping each sentence of narration to scene concepts, camera movements, and transition timings.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Split narration script into logical 4-8 second visual segments.
2. Assign each scene an explicit visual concept, lighting mood, and composition.
3. Define camera trajectories (push-in, slow pan, orbital, tilt, top-down).
4. Specify on-screen kinetic text keywords and visual accents.
5. Allocate rendering strategy (Lemo Opuscar, Remotion, Canvas, or Motion Graphics).

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
