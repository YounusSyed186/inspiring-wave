---
name: copyright-license-checking
description: Audits media assets, source footage, and background music for verified commercial usage rights and attribution compliance.
---

# Copyright License Checking

Audits media assets, source footage, and background music for verified commercial usage rights and attribution compliance.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Inspect license metadata for every audio track, image, and video clip used.
2. Verify asset is licensed for commercial YouTube monetization.
3. Record required attribution statements and append to video description.
4. Block any unregistered third-party copyrighted tracks.
5. Store immutable license records with the production job.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
