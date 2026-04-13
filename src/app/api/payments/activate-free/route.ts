import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let profile: { id: string | number, role: string, uuid?: string } | null = null;
    let userIdValue = userId;

    // 1. Check jobseekers
    let { data: jobseeker, error: profileError } = await supabaseAdmin
        .from('jobseekers')
        .select('id, uuid, roles(name)')
        .or(`id.eq."${userId}",uuid.eq."${userId}"`)
        .maybeSingle();
    
    if (jobseeker) {
        profile = { 
            id: jobseeker.id, 
            uuid: jobseeker.uuid,
            role: (jobseeker as any).roles?.name || 'Job Seeker' 
        };
    }

    // 2. Check recruiters if not found
    if (!profile) {
        const { data: recruiter } = await supabaseAdmin
            .from('recruiters')
            .select('id, uuid, roles(name)')
            .or(`id.eq."${userId}",uuid.eq."${userId}"`)
            .maybeSingle();
        
        if (recruiter) {
            profile = { 
                id: recruiter.id, 
                uuid: recruiter.uuid,
                role: (recruiter as any).roles?.name || 'Recruiter' 
            };
        }
    }

    // 3. Check employees if still not found
    if (!profile) {
        const { data: employee } = await supabaseAdmin
            .from('employees')
            .select('id, uuid, roles(name)')
            .or(`id.eq."${userId}",uuid.eq."${userId}"`)
            .maybeSingle();
        
        if (employee) {
            profile = { 
                id: employee.id, 
                uuid: employee.uuid,
                role: (employee as any).roles?.name || 'Employee' 
            };
        }
    }

    if (!profile) {
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
        .eq('id', profile.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: `Free plan activated successfully.` }, { status: 200 });
    
  } catch (error: any) {
    console.error('[ACTIVATE_FREE_PLAN] Error:', error);
    return NextResponse.json({ error: 'Failed to activate plan', details: error.message }, { status: 500 });
  }
}
