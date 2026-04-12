import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user profile and role
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('jobseekers')
        .select('role')
        .eq('uuid', userId)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User profile not found. Please log in again.' }, { status: 404 });
    }

    if (profile.role !== 'Job Seeker') {
        return NextResponse.json({ error: 'Only Job Seekers can activate the free plan' }, { status: 403 });
    }

    const now = new Date();
    
    // We don't set an expiration for the Free tier to keep it simple, or we can just set it far in the future
    const updateData = {
        is_paid: true,
        plan_type: 'free',
        updated_at: now.toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
        .from('jobseekers')
        .update(updateData)
        .eq('uuid', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: `Free plan activated successfully.` }, { status: 200 });
    
  } catch (error: any) {
    console.error('[ACTIVATE_FREE_PLAN] Error:', error);
    return NextResponse.json({ error: 'Failed to activate plan', details: error.message }, { status: 500 });
  }
}
