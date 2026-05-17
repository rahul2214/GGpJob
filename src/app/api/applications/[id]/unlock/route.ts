import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardXP } from '@/lib/gamification-logic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // 1. Fetch application and user/job details
    // We use numeric PKs (id) if possible, but params[id] might be a UUID.
    // The codebase uses numeric 'id' in some tables and 'uuid' in others.
    // Based on jobs API, many tables have both.
    
    const isNumericId = /^\d+$/.test(id);
    const idField = isNumericId ? 'id' : 'uuid';

    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(title, employee_pk), jobseekers(id, subscription_credits, purchased_credits, email, name)')
      .eq(idField, isNumericId ? parseInt(id) : id)
      .single();

    if (appError || !app) {
      console.error('[API_APP_UNLOCK] Fetch error:', appError);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (app.is_unlocked) {
      return NextResponse.json({ error: 'Application is already unlocked' }, { status: 400 });
    }

    // 1.5 Enforce 'First 3' Limit
    const { count: unlockCount } = await supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_pk', app.job_pk)
      .eq('is_unlocked', true);

    if ((unlockCount || 0) >= 3) {
      return NextResponse.json({ 
        error: 'Slot Full! Only the first 3 candidates who accept can be referred. This job has already reached its limit.' 
      }, { status: 403 });
    }

    // Must be in 'Accepted' state (status_id = 3) to unlock
    if (app.status_id !== 3) {
      return NextResponse.json({ error: 'Unlock is only available after employee acceptance (Status: Accepted)' }, { status: 400 });
    }

    const creditsRequired = 2;
    const subCredits = app.jobseekers?.subscription_credits || 0;
    const purCredits = app.jobseekers?.purchased_credits || 0;
    const totalCredits = subCredits + purCredits;

    if (totalCredits < creditsRequired) {
      return NextResponse.json({ 
        error: `Insufficient credits. This referral requires ${creditsRequired} credits, but you only have ${totalCredits}.`,
        required: creditsRequired,
        available: totalCredits
      }, { status: 403 });
    }

    if (!app.jobseekers?.id) {
      return NextResponse.json({ error: 'Associated jobseeker profile not found' }, { status: 404 });
    }

    // 2. Update Jobseeker's wallet: deduct credits using the Dual Credit System priority
    const { data: consumeResult, error: deductError } = await supabaseAdmin.rpc('consume_credits', {
        p_user_id: app.jobseekers.id,
        p_amount: creditsRequired
    });

    if (deductError || !consumeResult?.success) {
        console.error('[API_APP_UNLOCK] Credit deduction error:', deductError || consumeResult?.error);
        return NextResponse.json({ error: consumeResult?.error || 'Failed to process credit deduction' }, { status: 500 });
    }

    // Insert a notification about credit usage
    await supabaseAdmin.from('notifications').insert({
        user_pk: app.jobseekers.id,
        message: `Spent ${creditsRequired} credit to unlock your application for "${app.jobs?.title || 'Job'}".`,
        type: 'credit_deduction',
        job_pk: app.job_pk,
        created_at: new Date().toISOString()
    });

    // 3. Update application state
    const { data: updatedApp, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        is_unlocked: true,
        status_id: 4, // 4: Referral Unlocked
        unlock_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', app.id)
      .select()
      .single();

    if (updateError) {
        console.error('[API_APP_UNLOCK] Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update application state' }, { status: 500 });
    }

    // 4. Reward the employee (10 XP points)
    console.log(`[API_APP_UNLOCK] Attempting to award XP. jobs relation:`, JSON.stringify(app.jobs));
    const employeeId = app.jobs?.employee_pk;

    if (employeeId) {
        try {
            console.log(`[API_APP_UNLOCK] Awarding 10 XP to employee ${employeeId} for application ${app.id}`);
            const result = await awardXP(employeeId, 'CANDIDATE_ACCEPTED', app.job_pk);
            if (result.error) {
                console.error(`[API_APP_UNLOCK] awardXP returned error:`, result.error);
            } else {
                console.log(`[API_APP_UNLOCK] Successfully awarded 10 XP to employee ${employeeId}`);
            }
        } catch (gamifyErr: any) {
            console.error('[API_APP_UNLOCK] Exception awarding XP to employee:', gamifyErr.message);
        }
    } else {
        console.warn(`[API_APP_UNLOCK] No employee_pk found for job ${app.job_pk}. Skipping XP reward.`);
    }

    return NextResponse.json({
        success: true,
        message: 'Referral unlocked successfully',
        application: updatedApp
    });
  } catch (e: any) {
    console.error('[API_APP_UNLOCK] Unexpected Error:', e);
    return NextResponse.json({ error: 'Failed to unlock referral', details: e.message }, { status: 500 });
  }
}
