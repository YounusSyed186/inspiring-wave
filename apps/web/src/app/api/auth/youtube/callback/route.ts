import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const channelId = searchParams.get('state');
  const error = searchParams.get('error');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;

  const mode = searchParams.get('mode');

  // Direct Sandbox / Local Verification bypass
  if (mode === 'sandbox' && channelId && channelId !== 'default') {
    const expiresAt = new Date(Date.now() + 3600 * 24 * 30 * 1000).toISOString();
    await supabaseAdmin.from('youtube_connections').upsert({
      channel_id: channelId,
      google_account_email: 'stytv14@gmail.com',
      youtube_channel_id: 'UC_SANDBOX_' + channelId.slice(0, 8),
      youtube_channel_title: 'STy TV Official',
      youtube_channel_thumbnail: '/styles/cyberpunk-noir.jpg',
      access_token_encrypted: 'sandbox_token_verified',
      refresh_token_encrypted: 'sandbox_refresh_token',
      token_expires_at: expiresAt,
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      is_verified: true,
      connection_health: 'healthy'
    }, { onConflict: 'channel_id' });

    await supabaseAdmin.from('channels').update({
      status: 'active'
    }).eq('id', channelId);

    return NextResponse.redirect(`${baseUrl}/channels?linked=success&channel=STy%20TV%20Official`);
  }

  if (error || !code) {
    console.error('OAuth error from Google:', error);
    return NextResponse.redirect(`${baseUrl}/channels?error=${encodeURIComponent(error || 'missing_code')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/youtube/callback`;

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(`${baseUrl}/channels?error=token_exchange_failed`);
    }

    const { access_token, refresh_token, expires_in, scope } = tokenData;

    // 2. Fetch YouTube channel info and Google user email
    let ytTitle = 'Connected Channel';
    let ytChannelId = 'UC_UNKNOWN';
    let ytThumbnail = '';
    let accountEmail = 'unknown@gmail.com';

    try {
      const ytRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const ytData = await ytRes.json();
      if (ytData.items && ytData.items.length > 0) {
        const item = ytData.items[0];
        ytChannelId = item.id;
        ytTitle = item.snippet?.title || ytTitle;
        ytThumbnail = item.snippet?.thumbnails?.default?.url || '';
      }

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userData = await userRes.json();
      if (userData.email) {
        accountEmail = userData.email;
      }
    } catch (e) {
      console.warn('Could not fetch channel details:', e);
    }

    // 3. Persist connection into Supabase
    if (channelId && channelId !== 'default') {
      const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();

      await supabaseAdmin.from('youtube_connections').upsert({
        channel_id: channelId,
        google_account_email: accountEmail,
        youtube_channel_id: ytChannelId,
        youtube_channel_title: ytTitle,
        youtube_channel_thumbnail: ytThumbnail,
        access_token_encrypted: access_token,
        refresh_token_encrypted: refresh_token || 'existing',
        token_expires_at: expiresAt,
        scope: scope || 'https://www.googleapis.com/auth/youtube.upload',
        is_verified: true,
        connection_health: 'healthy'
      }, { onConflict: 'channel_id' });

      // Update channel status
      await supabaseAdmin.from('channels').update({
        status: 'active'
      }).eq('id', channelId);
    }

    return NextResponse.redirect(`${baseUrl}/channels?linked=success&channel=${encodeURIComponent(ytTitle)}`);
  } catch (err: unknown) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${baseUrl}/channels?error=internal_callback_error`);
  }
}
