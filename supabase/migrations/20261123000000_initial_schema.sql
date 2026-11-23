-- ============================================================================
-- AUTONOMOUS MULTI-CHANNEL AI VIDEO STUDIO — COMPREHENSIVE DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Compatible with PostgreSQL 15+ / Supabase PostgreSQL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS & SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'creator', -- 'admin', 'creator', 'viewer'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    free_only_mode BOOLEAN NOT NULL DEFAULT TRUE,
    daily_spend_limit NUMERIC(10, 4) NOT NULL DEFAULT 5.0000,
    monthly_spend_limit NUMERIC(10, 4) NOT NULL DEFAULT 50.0000,
    gemini_api_key_encrypted TEXT,
    preferred_theme TEXT NOT NULL DEFAULT 'dark',
    notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "browser": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CHANNELS & PROFILES (STRICT TENANCY & ISOLATION)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Educational',
    language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    target_audience TEXT,
    default_visibility TEXT NOT NULL DEFAULT 'private', -- 'public', 'unlisted', 'private'
    approval_required BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'archived'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL UNIQUE REFERENCES channels(id) ON DELETE CASCADE,
    google_account_email TEXT NOT NULL,
    youtube_channel_id TEXT NOT NULL,
    youtube_channel_title TEXT NOT NULL,
    youtube_channel_thumbnail TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    scope TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    connection_health TEXT NOT NULL DEFAULT 'healthy', -- 'healthy', 'expired', 'revoked'
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL UNIQUE REFERENCES channels(id) ON DELETE CASCADE,
    brand_personality TEXT NOT NULL DEFAULT 'Thoughtful, educational, and engaging',
    writing_tone TEXT NOT NULL DEFAULT 'Informative and accessible',
    narrative_style TEXT NOT NULL DEFAULT 'chronological', -- 'chronological', 'problem-solution', 'story-driven', 'analytical'
    primary_color TEXT NOT NULL DEFAULT '#1E40AF',
    secondary_color TEXT NOT NULL DEFAULT '#F59E0B',
    accent_color TEXT NOT NULL DEFAULT '#10B981',
    background_color TEXT NOT NULL DEFAULT '#0F172A',
    font_family_heading TEXT NOT NULL DEFAULT 'Inter',
    font_family_body TEXT NOT NULL DEFAULT 'Inter',
    logo_storage_path TEXT,
    watermark_storage_path TEXT,
    watermark_position TEXT NOT NULL DEFAULT 'top-right',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    primary_theme TEXT NOT NULL,
    supporting_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_pillars JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    excluded_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL UNIQUE REFERENCES channels(id) ON DELETE CASCADE,
    morning_generation_time TIME NOT NULL DEFAULT '09:00:00',
    evening_clipping_time TIME NOT NULL DEFAULT '18:00:00',
    publishing_time TIME NOT NULL DEFAULT '12:00:00',
    allowed_weekdays JSONB NOT NULL DEFAULT '[1, 2, 3, 4, 5]'::jsonb,
    daily_publish_limit INT NOT NULL DEFAULT 2,
    auto_publish_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_content_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL UNIQUE REFERENCES channels(id) ON DELETE CASCADE,
    min_video_duration_seconds INT NOT NULL DEFAULT 45,
    max_video_duration_seconds INT NOT NULL DEFAULT 600,
    target_aspect_ratio TEXT NOT NULL DEFAULT '16:9', -- '16:9', '9:16'
    target_resolution TEXT NOT NULL DEFAULT '1080p',
    target_fps INT NOT NULL DEFAULT 30,
    disclose_synthetic_content BOOLEAN NOT NULL DEFAULT TRUE,
    deduplication_threshold_days INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_voice_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'local-kokoro', -- 'local-kokoro', 'local-piper', 'gemini-tts'
    voice_id TEXT NOT NULL DEFAULT 'af_sarah',
    speaking_rate NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    pitch NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
    pronunciation_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_video_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    default_render_strategy TEXT NOT NULL DEFAULT 'LEMO_OPUSCAR', -- 'LEMO_OPUSCAR', 'REMOTION', 'IMAGE_ANIMATION'
    default_lemo_style TEXT NOT NULL DEFAULT 'impasto',
    audio_ducking_level_db NUMERIC(4, 1) NOT NULL DEFAULT -16.0,
    audio_loudness_target_lufs NUMERIC(4, 1) NOT NULL DEFAULT -14.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. CONTENT IDEAS, SCRIPTS & STORYBOARDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    audience TEXT,
    content_angle TEXT,
    hook_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    factual_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
    uniqueness_score NUMERIC(4, 3) NOT NULL DEFAULT 0.850,
    channel_relevance_score NUMERIC(4, 3) NOT NULL DEFAULT 0.900,
    production_complexity TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    status TEXT NOT NULL DEFAULT 'proposed', -- 'proposed', 'approved', 'rejected', 'in_production', 'published'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES content_ideas(id) ON DELETE CASCADE,
    url TEXT,
    title TEXT NOT NULL,
    author TEXT,
    publication_date DATE,
    excerpt TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    title_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    hook TEXT NOT NULL,
    introduction TEXT NOT NULL,
    narrative_outline JSONB NOT NULL DEFAULT '[]'::jsonb,
    full_narration_script TEXT NOT NULL,
    conclusion TEXT NOT NULL,
    call_to_action TEXT,
    target_duration_seconds INT NOT NULL DEFAULT 60,
    current_version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    version INT NOT NULL,
    full_narration_script TEXT NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storyboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL UNIQUE REFERENCES scripts(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    total_scenes INT NOT NULL DEFAULT 0,
    total_duration_seconds NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'ready', -- 'draft', 'ready', 'approved'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyboard_id UUID NOT NULL REFERENCES storyboards(id) ON DELETE CASCADE,
    sequence_index INT NOT NULL,
    duration_seconds NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    narration_segment TEXT NOT NULL,
    visual_concept TEXT NOT NULL,
    animation_instructions TEXT,
    camera_movement TEXT,
    transition_in TEXT DEFAULT 'fade',
    transition_out TEXT DEFAULT 'fade',
    on_screen_text TEXT,
    music_cue TEXT,
    sound_effect_cue TEXT,
    render_strategy TEXT NOT NULL DEFAULT 'LEMO_OPUSCAR', -- 'LEMO_OPUSCAR', 'REMOTION', 'IMAGE_ANIMATION'
    style_slug TEXT DEFAULT 'impasto',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scene_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'image', 'video', 'canvas_script', '3d_mesh'
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voiceover_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    duration_seconds NUMERIC(6, 2) NOT NULL,
    word_timestamps JSONB NOT NULL DEFAULT '[]'::jsonb,
    format TEXT NOT NULL DEFAULT 'wav',
    sample_rate INT NOT NULL DEFAULT 24000,
    loudness_lufs NUMERIC(4, 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS music_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    genre TEXT,
    mood TEXT,
    duration_seconds NUMERIC(6, 2) NOT NULL,
    storage_path TEXT NOT NULL,
    license_type TEXT NOT NULL DEFAULT 'Royalty-Free / Public Domain',
    attribution_required BOOLEAN NOT NULL DEFAULT FALSE,
    attribution_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. SOURCE VIDEOS & CLIPPING PIPELINE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS source_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    duration_seconds NUMERIC(8, 2) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    fps NUMERIC(5, 2) NOT NULL,
    codec TEXT NOT NULL,
    audio_codec TEXT,
    file_size_bytes BIGINT NOT NULL,
    proxy_storage_path TEXT,
    thumbnail_storage_path TEXT,
    processing_status TEXT NOT NULL DEFAULT 'uploaded', -- 'uploaded', 'transcribing', 'analyzing', 'ready', 'failed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_video_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_video_id UUID NOT NULL UNIQUE REFERENCES source_videos(id) ON DELETE CASCADE,
    ownership_type TEXT NOT NULL DEFAULT 'creator-owned', -- 'creator-owned', 'licensed', 'fair-use-educational'
    license_reference TEXT,
    permitted_commercial_use BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_video_id UUID NOT NULL UNIQUE REFERENCES source_videos(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'en',
    total_segments INT NOT NULL DEFAULT 0,
    full_text TEXT NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcript_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES source_transcripts(id) ON DELETE CASCADE,
    sequence_index INT NOT NULL,
    start_time_seconds NUMERIC(8, 3) NOT NULL,
    end_time_seconds NUMERIC(8, 3) NOT NULL,
    text TEXT NOT NULL,
    words JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{word, start, end, probability}]
    speaker_id TEXT DEFAULT 'SPEAKER_00',
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS clip_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_video_id UUID NOT NULL REFERENCES source_videos(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    start_time_seconds NUMERIC(8, 3) NOT NULL,
    end_time_seconds NUMERIC(8, 3) NOT NULL,
    duration_seconds NUMERIC(6, 2) NOT NULL,
    topic TEXT NOT NULL,
    opening_hook TEXT NOT NULL,
    summary TEXT NOT NULL,
    suggested_title TEXT NOT NULL,
    suitability_assessment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clip_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES clip_candidates(id) ON DELETE CASCADE,
    hook_strength NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    content_value NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    narrative_completeness NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    audience_relevance NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    clarity NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    visual_suitability NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    novelty NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    composite_score NUMERIC(4, 3) NOT NULL DEFAULT 0.0,
    scoring_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES clip_candidates(id) ON DELETE SET NULL,
    source_video_id UUID NOT NULL REFERENCES source_videos(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time_seconds NUMERIC(8, 3) NOT NULL,
    end_time_seconds NUMERIC(8, 3) NOT NULL,
    crop_mode TEXT NOT NULL DEFAULT 'FACE_TRACKING', -- 'FACE_TRACKING', 'CENTER_CROP', 'BLURRED_BACKGROUND', 'MANUAL'
    crop_coordinates JSONB DEFAULT '{"x": 0.5, "y": 0.5, "width": 1080, "height": 1920}'::jsonb,
    caption_preset TEXT NOT NULL DEFAULT 'Bold Creator',
    rendered_storage_path TEXT,
    thumbnail_storage_path TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. DURABLE JOBS, ORCHESTRATION & QUEUES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'GENERATE_VIDEO', 'PROCESS_SOURCE', 'CLIP_VIDEO', 'RENDER_VIDEO', 'PUBLISH_YOUTUBE'
    workflow_config_snapshot JSONB NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'leased', 'running', 'completed', 'failed', 'cancelled'
    stage TEXT NOT NULL DEFAULT 'INITIALIZED',
    progress_percentage INT NOT NULL DEFAULT 0,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    error_details JSONB,
    estimated_cost_usd NUMERIC(8, 4) DEFAULT 0.0,
    actual_cost_usd NUMERIC(8, 4) DEFAULT 0.0,
    leased_by TEXT,
    leased_until TIMESTAMPTZ,
    cancellation_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS job_queue (
    msg_id BIGSERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    queue_name TEXT NOT NULL DEFAULT 'production_jobs',
    vt TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- visibility timeout
    read_ct INT NOT NULL DEFAULT 0,
    enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    depends_on_job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    is_satisfied BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(job_id, depends_on_job_id)
);

CREATE TABLE IF NOT EXISTS job_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    progress_percentage INT NOT NULL,
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL, -- 'script', 'audio', 'still', 'video_mp4', 'captions_srt', 'thumbnail'
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    checksum_sha256 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    recoverable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    outcome TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'success', 'failure'
    error_message TEXT
);

-- ----------------------------------------------------------------------------
-- 6. RENDERING, OUTPUTS & QA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS render_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    renderer TEXT NOT NULL DEFAULT 'LEMO_OPUSCAR', -- 'LEMO_OPUSCAR', 'REMOTION', 'FFMPEG'
    template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS render_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    codec TEXT NOT NULL DEFAULT 'libx264',
    preset TEXT NOT NULL DEFAULT 'medium',
    crf INT NOT NULL DEFAULT 19,
    audio_codec TEXT NOT NULL DEFAULT 'aac',
    audio_bitrate TEXT NOT NULL DEFAULT '192k',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS render_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    video_type TEXT NOT NULL, -- 'ORIGINAL_GENERATION', 'SHORT_CLIP'
    storage_path TEXT NOT NULL,
    duration_seconds NUMERIC(8, 2) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    fps NUMERIC(5, 2) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    codec TEXT NOT NULL,
    qa_passed BOOLEAN NOT NULL DEFAULT FALSE,
    qa_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. CALENDAR, PUBLISHING & YOUTUBE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    render_output_id UUID REFERENCES render_outputs(id) ON DELETE SET NULL,
    clip_id UUID REFERENCES clips(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    visibility TEXT NOT NULL DEFAULT 'private',
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'draft', 'scheduled', 'publishing', 'published', 'failed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publish_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    calendar_entry_id UUID NOT NULL REFERENCES content_calendar(id) ON DELETE CASCADE,
    render_output_id UUID NOT NULL REFERENCES render_outputs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'uploading', 'published', 'failed'
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS published_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    render_output_id UUID REFERENCES render_outputs(id) ON DELETE SET NULL,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    visibility TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publish_job_id UUID NOT NULL REFERENCES publish_jobs(id) ON DELETE CASCADE,
    upload_url TEXT NOT NULL,
    bytes_uploaded BIGINT NOT NULL DEFAULT 0,
    total_bytes BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'aborted'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. ANALYTICS & METRICS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_views BIGINT NOT NULL DEFAULT 0,
    total_subscribers BIGINT NOT NULL DEFAULT 0,
    total_watch_time_minutes BIGINT NOT NULL DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    ctr_percentage NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(channel_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    published_video_id UUID NOT NULL REFERENCES published_videos(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    views BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    comments BIGINT NOT NULL DEFAULT 0,
    average_view_duration_seconds NUMERIC(6, 2) DEFAULT 0.0,
    retention_percentage NUMERIC(5, 2) DEFAULT 0.0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. AI PROVIDERS, COST & BUDGETING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'gemini', 'local-piper', 'local-kokoro'
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    model_identifier TEXT NOT NULL, -- 'gemini-2.5-flash', 'gemini-2.5-pro'
    cost_per_input_token NUMERIC(10, 8) NOT NULL DEFAULT 0.0,
    cost_per_output_token NUMERIC(10, 8) NOT NULL DEFAULT 0.0,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
    job_id UUID REFERENCES production_jobs(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    model_identifier TEXT NOT NULL,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cost_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL UNIQUE REFERENCES channels(id) ON DELETE CASCADE,
    monthly_budget_usd NUMERIC(8, 2) NOT NULL DEFAULT 20.00,
    current_spend_usd NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    reset_day_of_month INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS & AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    level TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. INDEXES FOR HIGH-THROUGHPUT QUEUE & SEARCH
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jobs_status_channel ON production_jobs(status, channel_id);
CREATE INDEX IF NOT EXISTS idx_jobs_leased_until ON production_jobs(leased_until) WHERE status = 'leased';
CREATE INDEX IF NOT EXISTS idx_job_queue_vt ON job_queue(queue_name, vt);
CREATE INDEX IF NOT EXISTS idx_source_videos_channel ON source_videos(channel_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_clips_channel_status ON clips(channel_id, review_status);
CREATE INDEX IF NOT EXISTS idx_calendar_scheduled ON content_calendar(channel_id, scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_usage_events_channel ON usage_events(channel_id, created_at);
