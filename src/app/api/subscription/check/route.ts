import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSubscriptionInfo } from '@/lib/subscription';

// GET /api/subscription/check?recruiterId=<uuid>
// Returns subscription status for a recruiter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const recruiterId = searchParams.get('recruiterId');

    if (!recruiterId) {
      return NextResponse.json({ error: 'recruiterId is required' }, { status: 400 });
    }

    const { data: recruiter, error } = await supabaseAdmin
      .from('recruiters')
      .select('plan_type, plan_expires_at, subscription_status, grace_period_end')
      .eq('uuid', recruiterId)
      .maybeSingle();

    if (error || !recruiter) {
      // Fallback: try by id
      const { data: r2 } = await supabaseAdmin
        .from('recruiters')
        .select('plan_type, plan_expires_at, subscription_status, grace_period_end')
        .eq('id', recruiterId)
        .maybeSingle();
      
      if (!r2) {
        return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
      }
      return NextResponse.json(getSubscriptionInfo(r2));
    }

    return NextResponse.json(getSubscriptionInfo(recruiter));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
