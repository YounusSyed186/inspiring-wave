# Multi-Channel Scheduling & Automation Guide

## Overview
The Studio supports fully automated, schedule-driven production across dozens of YouTube channels simultaneously. Each channel maintains isolated schedule configurations, content pillars, publishing limits, and human review policies.

---

## 1. Schedule Configuration (`channel_schedules`)
Each channel configures:
- `morning_generation_time`: Time (e.g. `08:00`) when the AI Generation pipeline evaluates daily ideas and initiates video production.
- `evening_clipping_time`: Time (e.g. `18:00`) when the AI Clipping pipeline ingests new source material and cuts Shorts.
- `publishing_time`: Target window for releasing approved content to YouTube.
- `allowed_weekdays`: Active publishing days (e.g., `["MONDAY", "WEDNESDAY", "FRIDAY"]`).
- `daily_publish_limit`: Maximum number of uploads permitted per 24-hour cycle.
- `require_human_approval`: If `true`, rendered videos remain in `PENDING_REVIEW` status on the dashboard until manually approved.

---

## 2. Production Cadence Matrix

| Channel Profile | Target Audience | Generation Cadence | Clipping Cadence | Target Output |
|---|---|---|---|---|
| **Tech Chronicles** | Developers & Engineers | Mon & Thu @ 08:00 | Daily @ 18:00 | 2 Long Videos, 7 Shorts/wk |
| **History Unveiled** | History Enthusiasts | Tue & Sat @ 09:00 | Wed & Sun @ 19:00 | 2 Long Videos, 4 Shorts/wk |
| **Daily Insights** | General / Curious | Mon-Fri @ 07:00 | Daily @ 12:00 & 20:00 | 5 Long Videos, 14 Shorts/wk |

---

## 3. Human Review Workflow
When `require_human_approval: true`:
1. Video is rendered and passes automated QA (loudness, resolution, audio-video sync).
2. Placed on the **Content Calendar** (`/calendar`) with status `PENDING_REVIEW`.
3. Notification dispatched to dashboard and notification webhook.
4. User can:
   - Preview full video and thumbnail in browser.
   - Edit metadata (Title, Description, Tags, Category).
   - Click **Approve & Schedule** or **Request Re-render** with feedback notes.
5. If approved, the publishing worker uploads the video at the designated `publishing_time`.
