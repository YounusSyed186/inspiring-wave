---
name: content-deduplication
description: Prevents repeated topics, identical footage reuse, or cross-channel duplicate uploads.
---

# Content Deduplication

Prevents repeated topics, identical footage reuse, or cross-channel duplicate uploads.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Ingest candidate topic or video fingerprint.
2. Compare semantic similarity against past 60-day publication history.
3. Flag any candidate with >80% conceptual overlap with existing videos.
4. Prevent publishing duplicate clips across sister channels unless explicit user consent.
5. Provide actionable pivot suggestions for flagged topics.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
