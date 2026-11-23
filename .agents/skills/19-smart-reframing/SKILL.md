---
name: smart-reframing
description: Dynamically crops 16:9 landscape videos into 9:16 vertical video with speaker tracking and safe zone preservation.
---

# Smart Reframing

Dynamically crops 16:9 landscape videos into 9:16 vertical video with speaker tracking and safe zone preservation.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Detect speaker face and torso positions across the clip duration.
2. Calculate smooth camera tracking window (avoiding jittery rapid movements).
3. Switch crop mode to split-screen or blurred-background if multi-speaker/slides present.
4. Keep focal subject within vertical mobile safe margins.
5. Generate FFmpeg crop filter parameters.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
