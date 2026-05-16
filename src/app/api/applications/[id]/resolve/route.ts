import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { adjustTrustScore } from '@/lib/trust-score';
import { awardXP } from '@/lib/gamification-logic';

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
        
        // Manual trust score boost for honest verification
        const { data: emp } = await supabaseAdmin.from('employees').select('trust_score').eq('id', app.jobs.employee_pk).single();
        if (emp) {
            await supabaseAdmin.from('employees')
                .update({ trust_score: Math.min(100, (emp.trust_score ?? 100) + 10) })
                .eq('id', app.jobs.employee_pk);
        }

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

      // Trust Penalty: Employee -30 (Fake/Invalid claim)
      if (app.jobs?.employee_pk) {
        const { data: emp } = await supabaseAdmin.from('employees').select('trust_score').eq('id', app.jobs.employee_pk).single();
        if (emp) {
            await supabaseAdmin.from('employees')
                .update({ trust_score: Math.max(0, (emp.trust_score ?? 100) - 30) })
                .eq('id', app.jobs.employee_pk);
        }

        // Notification for employee
        await supabaseAdmin.from('notifications').insert({
            user_pk: app.jobs.employee_pk,
            message: `Verification REJECTED. Your referral submission was disputed by Admin. Trust score reduced.`,
            type: 'penalty',
            job_pk: app.job_pk,
            created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ message: 'Verification rejected and penalty applied.' });
    }

  } catch (e: any) {
    console.error('[API_RESOLVE] Error:', e);
    return NextResponse.json({ error: 'Failed to resolve dispute', details: e.message }, { status: 500 });
  }
}
