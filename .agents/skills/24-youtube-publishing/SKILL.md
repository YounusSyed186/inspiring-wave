---
name: youtube-publishing
description: Manages Google OAuth tokens and executes resumable chunked video uploads to authorized YouTube channels.
---

# Youtube Publishing

Manages Google OAuth tokens and executes resumable chunked video uploads to authorized YouTube channels.

## Inputs
- Production job context and configuration snapshot
- Channel identity profile and content parameters
- Input media, scripts, or operational state

## Workflow
1. Retrieve channel YouTube connection and refresh expired access tokens.
2. Validate video file and thumbnail readiness.
3. Initiate resumable upload session with YouTube Data API v3.
4. Stream video chunks with progress tracking and automatic resume on network drops.
5. Attach custom thumbnail and verify video processing status in YouTube Studio.

## Output
Returns validated artifacts or state updates conforming to the studio workflow contract.

## Failure Policy
Never silently swallow errors or fabricate outputs. Log explicit root-cause diagnostic information and update job status to recoverable failure.
