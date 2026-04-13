import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let profile: { id: string | number, role: string, uuid?: string } | null = null;
    const isNumericUser = typeof userId === 'string' ? /^\d+$/.test(userId) : typeof userId === 'number';
    const isValidUuid = typeof userId === 'string' && userId.includes('-');
    
    if (!isNumericUser && !isValidUuid) {
        return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }

    const column = isNumericUser ? 'id' : 'uuid';
    const queryValue = isNumericUser ? parseInt(userId as string) : userId;

    // 1. Check jobseekers
    let { data: jobseeker, error: profileError } = await supabaseAdmin
        .from('jobseekers')
        .select('id, uuid, roles(name)')
        .eq(column, queryValue)
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
            .eq(column, queryValue)
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
            .eq(column, queryValue)
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
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5); // 5 years validity for free tier
    
    const updateData = {
        is_paid: true,
        plan_type: 'free',
        plan_expires_at: expiryDate.toISOString(),
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
