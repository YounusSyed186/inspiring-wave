---
name: content-research
description: Autonomous research agent that surveys channel themes, uncovers compelling factual insights, validates sources, and proposes novel YouTube video concepts.
---

# Content Research

Autonomous research agent that surveys channel themes, uncovers compelling factual insights, validates sources, and proposes novel YouTube video concepts.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Load channel primary and supporting themes, content pillars, and exclusions.
2. Query verified knowledge bases, archival registries, or historical records for novel angles.
3. Identify 5-10 distinct topic candidates with high audience curiosity and educational value.
4. Filter out any concepts matching previous 30-day channel publications.
5. Score each topic on uniqueness, channel relevance, and production feasibility.
6. Return structured research candidates with verified claims.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
