import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54621';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client for standard browser & API operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend workflows & worker mutations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const DEFAULT_USER_ID = 'a0000000-0000-0000-0000-000000000001';

/**
 * Ensures initial default channels exist in the database for the user.
 */
export async function ensureDefaultChannels() {
  try {
    const { data: existing, error } = await supabaseAdmin.from('channels').select('id, name, slug');
    if (error) {
      console.error('Failed to query channels:', error.message);
      return [];
    }

    if (existing && existing.length > 0) {
      return existing;
    }

    // Ensure default user exists
    await supabaseAdmin.from('users').upsert({
      id: DEFAULT_USER_ID,
      email: 'studio.admin@local.ai',
      full_name: 'Studio Admin',
      role: 'admin'
    });

    const initialChannels = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        owner_id: DEFAULT_USER_ID,
        name: 'Tech Chronicles & AI Insights',
        slug: 'tech-chronicles',
        description: 'Autonomous investigations into frontier artificial intelligence, autonomous systems, and future computing.',
        category: 'Science & Technology',
        language: 'en',
        timezone: 'UTC',
        status: 'active',
        default_visibility: 'private',
        approval_required: true
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        owner_id: DEFAULT_USER_ID,
        name: 'Ancient Turning Points',
        slug: 'ancient-turning-points',
        description: 'Cinematic documentary storytelling covering ancient civilizations, pivotal battles, and lost empires.',
        category: 'History & Education',
        language: 'en',
        timezone: 'UTC',
        status: 'active',
        default_visibility: 'private',
        approval_required: true
      }
    ];

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('channels')
      .insert(initialChannels)
      .select();

    if (insertError) {
      console.error('Error inserting initial channels:', insertError.message);
      return [];
    }

    return inserted;
  } catch (err) {
    console.error('Error in ensureDefaultChannels:', err);
    return [];
  }
}
