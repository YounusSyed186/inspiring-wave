---
name: fact-checking
description: Audits video scripts for factual accuracy, unverifiable claims, historical discrepancies, and copyright/trademark compliance.
---

# Fact Checking

Audits video scripts for factual accuracy, unverifiable claims, historical discrepancies, and copyright/trademark compliance.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Extract all factual statements, historical dates, statistics, and proper names from the script.
2. Verify each statement against authoritative primary and secondary references.
3. Flag any speculative claims or hallucinated details.
4. Provide verified replacement phrasing for any disputed claims.
5. Issue a verification certificate with confidence score.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
