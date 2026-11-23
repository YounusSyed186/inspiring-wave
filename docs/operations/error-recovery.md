# Production Error Recovery & Incident Playbook

## Overview
This runbook provides diagnostic commands and self-healing procedures for common production incidents.

---

## Common Failure Modes & Remedies

### 1. Job Stuck in `PROCESSING` Status
- **Cause**: Worker crash, OOM kill, or machine reboot during active rendering.
- **Remedy**:
  - The worker lease expires after 5 minutes.
  - To manually reset stuck jobs:
    ```sql
    UPDATE production_jobs 
    SET status = 'QUEUED', retry_count = retry_count + 1 
    WHERE status = 'PROCESSING' AND updated_at < NOW() - INTERVAL '10 minutes';
    ```

### 2. Whisper Transcription Failure
- **Symptom**: `whisper-cli.exe` exits with code 1 or fails to locate model.
- **Diagnostic**:
  ```bash
  & "C:\Users\DELL\whisper.cpp\Release\whisper-cli.exe" -m "C:\Users\DELL\whisper.cpp\models\ggml-large-v3.bin" --help
  ```
- **Remedy**:
  - Verify model file integrity (`ggml-large-v3.bin` should be ~3.09 GB).
  - Check that the input audio is 16kHz WAV format.

### 3. Audio Loudness Out of Spec
- **Symptom**: Video rejected by QA with LUFS $> -13$ or $< -15$.
- **Remedy**:
  - Re-run loudness normalization filtergraph:
    ```bash
    ffmpeg -i input.wav -af "loudnorm=I=-14.0:LRA=7.0:TP=-1.0" output_normalized.wav
    ```

### 4. YouTube OAuth Token Expiry / Revocation
- **Symptom**: Publishing worker reports `401 Unauthorized` or `invalid_grant`.
- **Remedy**:
  - Navigate to `/channels` on the web dashboard.
  - Click **"Reconnect Account"** for the affected channel.
  - Authorize the app to obtain a fresh refresh token.

### 5. Disk Space Saturation
- **Symptom**: FFmpeg fails with `No space left on device` or write errors in temporary directories.
- **Remedy**:
  - Clean intermediate render artifacts:
    ```bash
    # Removes raw WAV extracts and intermediate scene frames older than 7 days
    node -e "import('./workers/scheduler/src/cleanup.js').then(m => m.cleanupOrphanedArtifacts())"
    ```
