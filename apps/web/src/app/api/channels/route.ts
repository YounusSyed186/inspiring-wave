import { NextResponse } from 'next/server';
import { supabaseAdmin, ensureDefaultChannels, DEFAULT_USER_ID } from '@/lib/supabase';

export async function GET() {
  try {
    await ensureDefaultChannels();
    const { data: channels, error } = await supabaseAdmin
      .from('channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ channels: channels || [] });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newChannel = {
      owner_id: DEFAULT_USER_ID,
      name: body.name || 'Untitled Channel',
      slug: (body.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: body.category || 'General',
      language: body.language || 'en',
      timezone: body.timezone || 'UTC',
      status: 'active',
      default_visibility: body.default_visibility || 'private',
      approval_required: body.require_human_approval ?? true,
      description: body.description || ''
    };

    const { data, error } = await supabaseAdmin
      .from('channels')
      .insert([newChannel])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, channel: data });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 400 });
  }
}
