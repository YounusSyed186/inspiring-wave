---
name: highlight-detection
description: Analyzes long-form transcripts and scene cuts to identify high-value, self-contained moments for short-form clips.
---

# Highlight Detection

Analyzes long-form transcripts and scene cuts to identify high-value, self-contained moments for short-form clips.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Scan transcript segments for strong topic shifts and conversational peaks.
2. Identify standalone insights, surprising facts, heated debates, or punchlines.
3. Establish clean in/out points that do not cut off sentences or essential context.
4. Verify candidate duration conforms to YouTube Shorts limits (15-60 seconds).
5. Produce candidate list with topic summary and editorial rationale.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
