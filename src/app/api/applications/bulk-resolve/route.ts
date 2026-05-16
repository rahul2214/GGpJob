import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardXP } from '@/lib/gamification-logic';

export async function POST(request: Request) {
  try {
    const { ids, action } = await request.json(); // ids: string[], action: 'approve' | 'reject'

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const results = [];
    
    // Process in a loop for now to reuse individual logic, but wrapped in a Promise.all
    // For large volumes, a postgres function would be better.
    for (const id of ids) {
        try {
            // Fetch application details
            const { data: app, error: fetchError } = await supabaseAdmin
                .from('applications')
                .select('*, jobs(employee_pk, title), jobseekers(id)')
                .eq('id', id)
                .single();

            if (fetchError || !app) continue;

            if (action === 'approve') {
                await supabaseAdmin
                    .from('applications')
                    .update({ 
                        verification_status: 'verified',
                        status_id: 10,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (app.jobs?.employee_pk) {
                    await awardXP(app.jobs.employee_pk, 'REFERRAL_VERIFIED', app.job_pk);
                    
                    // Trust score boost
                    const { data: emp } = await supabaseAdmin.from('employees').select('trust_score').eq('id', app.jobs.employee_pk).single();
                    if (emp) {
                        await supabaseAdmin.from('employees')
                            .update({ trust_score: Math.min(100, (emp.trust_score ?? 100) + 10) })
                            .eq('id', app.jobs.employee_pk);
                    }

                    await supabaseAdmin.from('notifications').insert({
                        user_pk: app.jobs.employee_pk,
                        message: `Bulk Verification SUCCESS! Your referral for ${app.jobs.title || 'a role'} has been verified.`,
                        type: 'verification_success',
                        job_pk: app.job_pk,
                        created_at: new Date().toISOString(),
                    });
                }
            } else {
                await supabaseAdmin
                    .from('applications')
                    .update({ 
                        verification_status: 'none', 
                        status_id: 11,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (app.jobs?.employee_pk) {
                    const { data: emp } = await supabaseAdmin.from('employees').select('trust_score').eq('id', app.jobs.employee_pk).single();
                    if (emp) {
                        await supabaseAdmin.from('employees')
                            .update({ trust_score: Math.max(0, (emp.trust_score ?? 100) - 30) })
                            .eq('id', app.jobs.employee_pk);
                    }

                    await supabaseAdmin.from('notifications').insert({
                        user_pk: app.jobs.employee_pk,
                        message: `Bulk Verification REJECTED. Your referral for ${app.jobs.title || 'a role'} was disputed and declined.`,
                        type: 'penalty',
                        job_pk: app.job_pk,
                        created_at: new Date().toISOString(),
                    });
                }
            }
            results.push({ id, status: 'success' });
        } catch (err) {
            console.error(`Error resolving ${id}:`, err);
            results.push({ id, status: 'error' });
        }
    }

    return NextResponse.json({ results });

  } catch (e: any) {
    console.error('[API_BULK_RESOLVE] Error:', e);
    return NextResponse.json({ error: 'Failed to process bulk resolve', details: e.message }, { status: 500 });
  }
}
