# Cost Control & Budget Safeguards

## Overview
The Studio is designed with a **free-first, local-first** philosophy to prevent accidental cloud spending while providing maximum production quality.

---

## 1. Budget Architecture
Every AI invocation and media pipeline passes through budget check layers defined in `cost_budgets` and tracked in `usage_events`.

### Rules Enforced:
1. **Never Call Paid Video APIs**: The system uses procedural rendering (Lemo Opuscar / three.js), local video composition (FFmpeg), and open-source models. Paid generation APIs (Runway, Kling, Sora, Pika) are disabled by default.
2. **Local TTS First**: Voice synthesis utilizes local neural TTS (Kokoro-onnx via Python venv) with zero cloud inference cost.
3. **Local Whisper Speech Recognition**: Audio transcription uses `whisper.cpp` locally on CPU/GPU (`ggml-large-v3.bin`), eliminating transcription API fees.
4. **Strict Gemini Free-Tier Limits**:
   - Model defaulted to `gemini-1.5-flash`.
   - Max 15 Requests Per Minute (RPM).
   - Daily token limits tracked and capped at 1,000,000 tokens/day.

---

## 2. Cost Tracking Database Schema
```sql
CREATE TABLE cost_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id),
    monthly_budget_usd NUMERIC(10, 2) DEFAULT 0.00,
    current_spend_usd NUMERIC(10, 2) DEFAULT 0.00,
    hard_stop_enabled BOOLEAN DEFAULT true,
    alert_threshold_percent INTEGER DEFAULT 80
);
```

---

## 3. Circuit Breaker Behavior
- If `current_spend_usd >= monthly_budget_usd`:
  - Outgoing cloud API calls are immediately blocked.
  - Pipelines gracefully degrade to local-only generation routines.
  - Alert created in `notification_events` with priority `HIGH`.
