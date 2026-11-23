---
name: video-rendering
description: Coordinates final video encoding, multi-pass compression, container muxing, and resolution optimization.
---

# Video Rendering

Coordinates final video encoding, multi-pass compression, container muxing, and resolution optimization.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Assemble all rendered video segments, overlays, and mixed audio stream.
2. Select target export preset (1080p landscape 16:9 or vertical 9:16).
3. Encode via FFmpeg using H.264/AAC with CRF 18-20 for high perceptual quality.
4. Ensure faststart moov atom is moved to beginning of file for instant web playback.
5. Save final video artifact to object storage.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
