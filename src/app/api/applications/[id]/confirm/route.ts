import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardXP } from '@/lib/gamification-logic';
import { updateTrustScore } from '@/lib/trust-logic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { recruiterContact, movedForward, genuineReferral } = body;

    // 0. Resolve the numeric PK if a UUID is provided
    let targetPk = params.id;
    if (params.id.includes('-')) {
        const { data: resolvedApp } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('uuid', params.id)
            .maybeSingle();
        if (resolvedApp) targetPk = resolvedApp.id.toString();
    }

    // 1. Fetch application details
    const { data: appData, error: fetchErr } = await supabaseAdmin
        .from('applications')
        .select('*, jobs(title, employee_pk), jobseekers(id, name)')
        .eq('id', targetPk)
        .single();

    if (fetchErr || !appData) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const employeeId = appData.jobs?.employee_pk;
    const jobseekerId = appData.user_pk;
    const jobTitle = appData.jobs?.title || 'a job';
    const jobPk = appData.job_pk;

    const feedbackObj = {
        recruiterContact,
        movedForward,
        genuineReferral,
        submittedAt: new Date().toISOString()
    };

    let nextStatusId = appData.status_id;
    let isFakeSpam = false;
    let isInterview = false;

    if (recruiterContact === 'Fake/Spam referral' || genuineReferral === 'No' || genuineReferral === false) {
        isFakeSpam = true;
        nextStatusId = 11; // Disputed
    } else if (recruiterContact === 'Interview scheduled') {
        isInterview = true;
        nextStatusId = 6; // Interviewing
    }

    // 2. Update application with feedback and potential new status
    const updatePayload: any = {
        jobseeker_feedback: feedbackObj,
        feedback_submitted_at: new Date().toISOString(),
        status_id: nextStatusId,
        updated_at: new Date().toISOString()
    };

    const { data: updatedApp, error: updateErr } = await supabaseAdmin
        .from('applications')
        .update(updatePayload)
        .eq('id', targetPk)
        .select('*, jobs(title, employee_pk), jobseekers(id, name)')
        .single();

    if (updateErr || !updatedApp) {
        console.error('[CONFIRM_API] Update error:', updateErr);
        return NextResponse.json({ error: 'Failed to save confirmation feedback' }, { status: 500 });
    }

    // 3. Process business logic based on status changes
    if (isFakeSpam) {
        // Penalty for Employee
        if (employeeId) {
            await updateTrustScore(employeeId, 'FAKE_ACTIVITY', 'Candidate reported referral as Fake/Spam');
            
            await supabaseAdmin.from('notifications').insert({
                user_pk: employeeId,
                message: `Referral dispute opened. Candidate reported the referral for ${jobTitle} as fake/spam. Trust score reduced.`,
                type: 'penalty',
                job_pk: jobPk,
                created_at: new Date().toISOString()
            });
        }

        // Refund for Job Seeker
        if (jobseekerId) {
            console.log(`[CONFIRM_API] Refunding 2 credits to jobseeker ${jobseekerId} for fake/spam referral`);
            const { error: rpcError } = await supabaseAdmin.rpc('add_purchased_credits', {
                p_user_id: Number(jobseekerId),
                p_amount: 2
            });

            if (rpcError) {
                console.error('[CONFIRM_API] RPC add_purchased_credits failed during refund, falling back to manual update:', rpcError);
                const { data: currentData } = await supabaseAdmin
                    .from('jobseekers')
                    .select('purchased_credits')
                    .eq('id', jobseekerId)
                    .single();

                await supabaseAdmin
                    .from('jobseekers')
                    .update({
                        purchased_credits: (currentData?.purchased_credits || 0) + 2,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', jobseekerId);
            }

            await supabaseAdmin.from('notifications').insert({
                user_pk: jobseekerId,
                message: `You reported the referral for ${jobTitle} as fake/spam. 2 credits have been refunded to your account.`,
                type: 'credit_refund',
                job_pk: jobPk,
                created_at: new Date().toISOString()
            });
        }
    } else if (isInterview) {
        // Award XP and trust score to employee
        if (employeeId) {
            await awardXP(employeeId, 'CANDIDATE_INTERVIEW', jobPk);
            
            await supabaseAdmin.from('notifications').insert({
                user_pk: employeeId,
                message: `An interview has been scheduled for your referred candidate for ${jobTitle}! You earned +15 XP!`,
                type: 'milestone_reward',
                job_pk: jobPk,
                created_at: new Date().toISOString()
            });
        }
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error: any) {
    console.error('[CONFIRM_API] Error:', error);
    return NextResponse.json({ error: 'Failed to process confirmation feedback', details: error.message }, { status: 500 });
  }
}
