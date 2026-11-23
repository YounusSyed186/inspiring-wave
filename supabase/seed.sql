-- Studio Default Seed Script

INSERT INTO users (id, email, full_name, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'studio.admin@local.ai', 'Studio Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO channels (id, owner_id, name, slug, description, category, language, timezone, default_visibility, approval_required, status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Tech Chronicles & AI Insights',
  'tech-chronicles',
  'Autonomous investigations into frontier artificial intelligence, autonomous systems, and future computing.',
  'Science & Technology',
  'en',
  'UTC',
  'private',
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO channels (id, owner_id, name, slug, description, category, language, timezone, default_visibility, approval_required, status)
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Ancient Turning Points',
  'ancient-turning-points',
  'Cinematic documentary storytelling covering ancient civilizations, pivotal battles, and lost empires.',
  'History & Education',
  'en',
  'UTC',
  'private',
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;
