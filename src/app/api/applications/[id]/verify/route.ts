import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardXP } from '@/lib/gamification-logic';
import { updateTrustScore } from '@/lib/trust-logic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { action, requesterRole } = await request.json(); // 'confirm' or 'dispute'

    if (!['confirm', 'dispute'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 1. Fetch current application
    // Use numeric PKs
    const isNumericId = /^\d+$/.test(id);
    const idField = isNumericId ? 'id' : 'uuid';

    const { data: app, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(title, employee_pk), jobseekers(name)')
      .eq(idField, isNumericId ? parseInt(id) : id)
      .single();

    if (fetchError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Must be in one of the pending verification states
    if (!['pending', 'pending_jobseeker', 'pending_employee'].includes(app.verification_status)) {
        // Log for debugging but maybe allow for some edge cases
        console.warn(`[API_APP_VERIFY] Application ${id} is in status ${app.verification_status}, not pending.`);
    }

    const isHiringVerification = app.status_id === 9;
    const isOfferVerification = app.status_id === 7;
    const isInterviewVerification = app.status_id === 6;
    
    let nextStatusId = 11; // Default to Disputed
    let verificationStatus = 'disputed';
    let message = '';

    if (action === 'confirm') {
        const isReferralVerification = app.status_id === 5;
        
        if (isReferralVerification) {
            nextStatusId = 10; // 10: Completed
            verificationStatus = 'verified';
            message = `Verification Successful! The referral for "${app.jobs?.title}" is now complete and verified. Rewards released.`;
        } else {
            nextStatusId = isHiringVerification ? 10 : (isOfferVerification ? 8 : 6);
            verificationStatus = 'verified';
            message = isHiringVerification 
                ? `Confirmation received! The hire for "${app.jobs?.title}" is now verified. Rewards released.`
                : (isOfferVerification 
                    ? `Confirmation received! The offer for "${app.jobs?.title}" is verified.`
                    : `Confirmation received! The stage for "${app.jobs?.title}" is verified.`);
        }
    } else {
        message = `Dispute submitted for "${app.jobs?.title}". Admin will review the provided proof.`;
    }

    // 2. Update Application
    const { data: updatedApp, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status_id: nextStatusId,
        verification_status: verificationStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', app.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Notify the OTHER party
    const employeePk = app.jobs?.employee_pk;
    const applicantPk = app.user_pk;
    const isJobseekerAction = requesterRole === 'Job Seeker' || requesterRole === 'jobseeker';

    if (isJobseekerAction && employeePk) {
        await supabaseAdmin.from('notifications').insert({
            user_pk: employeePk,
            message: `Candidate ${app.jobseekers?.name || 'User'} has ${action === 'confirm' ? 'CONFIRMED' : 'DISPUTED'} your submission for "${app.jobs?.title}".`,
            type: action === 'confirm' ? 'verification_confirmed' : 'verification_disputed',
            job_pk: app.job_pk,
            created_at: new Date().toISOString(),
        });
    } else if (!isJobseekerAction && applicantPk) {
        await supabaseAdmin.from('notifications').insert({
            user_pk: applicantPk,
            message: `Employee from ${app.jobs?.company_name || 'the company'} has ${action === 'confirm' ? 'CONFIRMED' : 'DISPUTED'} your submission for "${app.jobs?.title}".`,
            type: action === 'confirm' ? 'verification_confirmed' : 'verification_disputed',
            job_pk: app.job_pk,
            created_at: new Date().toISOString(),
        });
    }

    // 4. Trigger Rewards/Penalties for Employee
    if (app.jobs?.employee_pk) {
        let trustDelta = 0;
        let notifyMsg = '';

        if (action === 'confirm') {
            try {
                if (isHiringVerification) {
                    await awardXP(app.jobs.employee_pk, 'CANDIDATE_JOINED', app.job_pk);
                    trustDelta = 10;
                    notifyMsg = `Verification Successful! 🎊 You've earned rewards for the successful hire of ${app.jobseekers?.name}.`;
                } else if (isInterviewVerification) {
                    await awardXP(app.jobs.employee_pk, 'CANDIDATE_INTERVIEW', app.job_pk);
                    trustDelta = 7;
                    notifyMsg = `Interview Verified! Candidate ${app.jobseekers?.name} confirmed your submission. XP and potential milestones awarded.`;
                } else if (isOfferVerification) {
                    await awardXP(app.jobs.employee_pk, 'OFFER_RECEIVED', app.job_pk);
                    trustDelta = 8;
                    notifyMsg = `Offer Received Verified! Candidate ${app.jobseekers?.name} confirmed receiving the offer letter.`;
                } else {
                    // Standard Referral Verification
                    await awardXP(app.jobs.employee_pk, 'REFERRAL_VERIFIED', app.job_pk);
                    trustDelta = 5;
                    notifyMsg = `Referral Verified! Candidate ${app.jobseekers?.name} confirmed your submission. Rewards added.`;
                }
            } catch (xpErr: any) {
                console.error('[API_APP_VERIFY] awardXP Error:', xpErr.message);
            }
        } else {
            // Dispute Submitted
            await updateTrustScore(app.jobs.employee_pk, 'FAKE_ACTIVITY', `Candidate ${app.jobseekers?.name} marked submission as fake`);
            notifyMsg = `Dispute Alert! Candidate ${app.jobseekers?.name} marked your submission as fake. Trust score penalized. Admin is reviewing.`;
            
            await supabaseAdmin.from('notifications').insert({
                user_pk: app.jobs.employee_pk,
                message: notifyMsg,
                type: 'penalty_alert',
                job_pk: app.job_pk,
                created_at: new Date().toISOString(),
            });
        }
    }

    return NextResponse.json({
        success: true,
        message,
        application: updatedApp
      });

  } catch (e: any) {
    console.error('[API_APP_VERIFY] Error:', e);
    return NextResponse.json({ error: 'Failed to verify application', details: e.message }, { status: 500 });
  }
}
