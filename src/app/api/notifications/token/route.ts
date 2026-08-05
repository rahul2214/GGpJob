import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { userId, token, platform } = await request.json();

    if (!userId || !token || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert object token (web) to string
    const tokenStr = typeof token === 'object' ? JSON.stringify(token) : token;

    // Upsert the token into the dedicated table
    const { error } = await supabaseAdmin
      .from('user_push_tokens')
      .upsert(
        { 
          user_id: userId, 
          token: tokenStr, 
          platform 
        },
        { onConflict: 'token' }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Token registered' }, { status: 200 });

  } catch (error: any) {
    console.error('[API_NOTIFICATIONS_TOKEN] Error:', error.message);
    return NextResponse.json({ error: 'Failed to register token', details: error.message }, { status: 500 });
  }
}
