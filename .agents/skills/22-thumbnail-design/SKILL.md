---
name: thumbnail-design
description: Generates high-CTR thumbnail concepts, layout compositions, and extracted hero frames with brand typography.
---

# Thumbnail Design

Generates high-CTR thumbnail concepts, layout compositions, and extracted hero frames with brand typography.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Extract top 3 candidate expressive freeze-frames from rendered video.
2. Enhance contrast, saturation, and subject separation.
3. Add 3-5 word bold headline text using channel brand font and colors.
4. Verify mobile thumbnail readability at 150px preview scale.
5. Export final 1280x720 JPEG thumbnail (<2MB).

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
