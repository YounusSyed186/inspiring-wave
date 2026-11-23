# Gemini API Setup & Configuration

## Overview
The Autonomous Multi-Channel AI Video Studio uses the Google Gemini API for:
- Trend and topic research synthesis
- Scriptwriting and pacing calculation
- Storyboard visual scene prompting
- Long-form video transcript highlight discovery & viral scoring
- SEO title, description, and chapter generation

The studio utilizes a free-first approach, defaulting to `gemini-1.5-flash` with aggressive token caching, fallback retry logic, and strict per-channel daily budget caps.

---

## 1. Acquiring an API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google Account.
3. Click **"Get API key"** -> **"Create API key in new project"**.
4. Copy your API Key securely.

---

## 2. Environment Configuration
Add your API key to `.env` or `.env.local`:
```bash
GEMINI_API_KEY=AIzaSyD-YourActualKeyHere
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS_PER_DAY=1000000
GEMINI_RATE_LIMIT_RPM=15
```

---

## 3. Quota & Cost Safeguards
- **Daily Budget Limits**: Configured in database table `cost_budgets`. If a channel exceeds its `max_daily_spend_usd` or token threshold, jobs are suspended until the next calendar day.
- **Circuit Breaker**: When HTTP 429 (Rate Limit) is detected:
  1. Exponential backoff with jitter (initial delay: 2s, factor: 2x, max retries: 4).
  2. If persistent, jobs pause and notify via `notification_events` rather than failing outright.
- **Local Fallback Mode**: When running offline or if `GEMINI_API_KEY` is omitted, the studio operates using local deterministic rule engines (e.g. TF-IDF + sentiment + acoustic volume heuristics for clipping highlights).

---

## 4. Verification
Run the Gemini integration test:
```bash
node -e "import('./integrations/gemini/src/client.js').then(m => console.log('Gemini client module loaded successfully'))"
```
