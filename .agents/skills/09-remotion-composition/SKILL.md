---
name: remotion-composition
description: Authors and compiles React-based video compositions using Remotion for programmatic video layouts and infographics.
---

# Remotion Composition

Authors and compiles React-based video compositions using Remotion for programmatic video layouts and infographics.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Define React video composition components with strict width/height/FPS properties.
2. Map scene timeline state to spring animations and interpolations.
3. Inject dynamic props (titles, captions, charts, user assets).
4. Preview composition frames at key timestamps.
5. Bundle and render composition to high-bitrate MP4/ProRes.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
