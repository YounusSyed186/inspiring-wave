---
name: channel-brand-consistency
description: Enforces visual and editorial brand guidelines across all generated content and multi-channel pipelines.
---

# Channel Brand Consistency

Enforces visual and editorial brand guidelines across all generated content and multi-channel pipelines.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Inspect channel brand profile (colors, fonts, tone, default intro/outro, logo).
2. Validate script matches channel persona and audience reading level.
3. Verify visual elements adhere strictly to designated color hex codes.
4. Ensure no cross-contamination of branding from other managed channels.
5. Pass or reject production job based on brand alignment.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
