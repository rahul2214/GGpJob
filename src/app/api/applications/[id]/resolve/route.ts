import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { updateTrustScore } from '@/lib/trust-logic';
import { awardXP, deductXP } from '@/lib/gamification-logic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { action } = await request.json(); // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 1. Fetch application details
    const { data: app, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(employee_pk, title), jobseekers(id)')
      .eq('id', id)
      .single();

    if (fetchError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // 1. Update verification_status to verified
      const { error: updateError } = await supabaseAdmin
        .from('applications')
        .update({ 
            verification_status: 'verified',
            status_id: 10, // Completed / Verified
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // ── Award Rewards ──────────────────
      if (app.jobs?.employee_pk) {
        await awardXP(app.jobs.employee_pk, 'REFERRAL_VERIFIED', app.job_pk);
        
        // Refund 25 trust score deducted during dispute
        await updateTrustScore(app.jobs.employee_pk, 'DISPUTE_REFUND', 'Admin resolved dispute in favor of employee');

        // Notification for employee
        await supabaseAdmin.from('notifications').insert({
            user_pk: app.jobs.employee_pk,
            message: `Verification SUCCESS! Your referral for ${app.jobs?.title || 'a role'} has been verified. Rewards released.`,
            type: 'verification_success',
            job_pk: app.job_pk,
            created_at: new Date().toISOString(),
        });
      }
      
      // Credits are now only deducted at the Unlock stage.

      return NextResponse.json({ message: 'Referral verified successfully and rewards released.' });

    } else {
      // 2. Reject claim (Employee was lying or proof was insufficient)
      const { error: updateError } = await supabaseAdmin
        .from('applications')
        .update({ 
            verification_status: 'none', 
            status_id: 11, // Disputed
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      if (app.jobs?.employee_pk) {
        // 25 trust score was already deducted when dispute was raised, so no further trust score deduction needed.
        // Deduct 100 XP from employee and recalculate level
        await deductXP(app.jobs.employee_pk, 100, app.job_pk);

        // Notification for employee
        await supabaseAdmin.from('notifications').insert({
            user_pk: app.jobs.employee_pk,
            message: `Verification REJECTED. Your referral submission was rejected by Admin. 100 XP deducted.`,
            type: 'penalty',
            job_pk: app.job_pk,
            created_at: new Date().toISOString(),
        });
      }

      // Credit 2 credits back to the jobseeker
      if (app.user_pk) {
        const { data: js } = await supabaseAdmin
            .from('jobseekers')
            .select('credits')
            .eq('id', app.user_pk)
            .single();

        if (js) {
            await supabaseAdmin
                .from('jobseekers')
                .update({ credits: Math.max(0, (js.credits || 0) + 2) })
                .eq('id', app.user_pk);

            await supabaseAdmin.from('notifications').insert({
                user_pk: app.user_pk,
                message: `Admin rejected the employee's claim for "${app.jobs?.title || 'the job'}". 2 credits have been refunded to your wallet.`,
                type: 'credits_refund',
                job_pk: app.job_pk,
                created_at: new Date().toISOString(),
            });
        }
      }

      return NextResponse.json({ message: 'Verification rejected. Jobseeker credited with 2 credits and employee deducted 100 XP.' });
    }

  } catch (e: any) {
    console.error('[API_RESOLVE] Error:', e);
    return NextResponse.json({ error: 'Failed to resolve dispute', details: e.message }, { status: 500 });
  }
}
