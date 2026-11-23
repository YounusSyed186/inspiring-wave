-- 20261123000001_multi_agent_orchestrator.sql
-- Durable Multi-Agent Task Orchestration Schema for Lemo-Opuscar Production

-- 1. PRODUCTION TASKS (DAG Task Units)
CREATE TABLE IF NOT EXISTS public.production_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    job_id UUID REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'leased', 'running', 'awaiting_review', 'completed', 'failed', 'cancelled')),
    dependencies TEXT[] DEFAULT '{}',
    input_artifacts JSONB DEFAULT '{}',
    output_artifacts JSONB DEFAULT '{}',
    lease_token TEXT,
    leased_by TEXT,
    leased_until TIMESTAMPTZ,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_production_tasks_job_id ON public.production_tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_production_tasks_status ON public.production_tasks(status);
CREATE INDEX IF NOT EXISTS idx_production_tasks_leased_until ON public.production_tasks(leased_until) WHERE status = 'leased';

-- 2. AGENT RUNS (Execution telemetry & logs per agent task execution)
CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.production_tasks(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    model TEXT,
    input_artifact_ids TEXT[] DEFAULT '{}',
    output_artifact_ids TEXT[] DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    logs JSONB DEFAULT '[]',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_task_id ON public.agent_runs(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON public.agent_runs(agent_id);

-- 3. PRODUCTION ARTIFACTS (Typed, versioned intermediate assets)
CREATE TABLE IF NOT EXISTS public.production_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    job_id UUID REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.production_tasks(id) ON DELETE SET NULL,
    artifact_type TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    schema_version TEXT NOT NULL DEFAULT '1.0.0',
    content JSONB,
    uri TEXT,
    checksum_sha256 TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_artifacts_job_id ON public.production_artifacts(job_id);
CREATE INDEX IF NOT EXISTS idx_production_artifacts_type ON public.production_artifacts(artifact_type);

-- 4. SCENE MANIFESTS (Per-scene procedural code, preview stills, and render state)
CREATE TABLE IF NOT EXISTS public.scene_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    sequence_index INTEGER NOT NULL,
    duration_seconds NUMERIC(6,2) NOT NULL,
    narration TEXT,
    visual_concept TEXT NOT NULL,
    style_slug TEXT NOT NULL,
    code TEXT,
    preview_urls TEXT[] DEFAULT '{}',
    video_storage_path TEXT,
    render_status TEXT NOT NULL DEFAULT 'pending' CHECK (render_status IN ('pending', 'rendering', 'completed', 'failed')),
    qa_status TEXT NOT NULL DEFAULT 'pending' CHECK (qa_status IN ('pending', 'passed', 'failed', 'needs_revision')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scene_manifests_job_id ON public.scene_manifests(job_id);

-- 5. QUALITY REPORTS (Automated Visual QA and Technical QA validation logs)
CREATE TABLE IF NOT EXISTS public.quality_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.production_tasks(id) ON DELETE SET NULL,
    scene_id UUID REFERENCES public.scene_manifests(id) ON DELETE SET NULL,
    qa_type TEXT NOT NULL CHECK (qa_type IN ('VISUAL_QA', 'TECHNICAL_QA', 'READABILITY_QA', 'AUDIO_QA')),
    score NUMERIC(5,2),
    passed BOOLEAN NOT NULL DEFAULT false,
    checks JSONB NOT NULL DEFAULT '{}',
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_reports_job_id ON public.quality_reports(job_id);

-- 6. WORKER HEARTBEATS (Worker registry, active leases & load tracking)
CREATE TABLE IF NOT EXISTS public.worker_heartbeats (
    worker_id TEXT PRIMARY KEY,
    worker_type TEXT NOT NULL,
    hostname TEXT NOT NULL,
    active_tasks TEXT[] DEFAULT '{}',
    cpu_percent NUMERIC(5,2) DEFAULT 0,
    memory_mb NUMERIC(8,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'healthy',
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_heartbeats_type ON public.worker_heartbeats(worker_type);
