import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { employeeId } = body; // This is employee's uuid string from client

    if (!employeeId) {
      return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
    }

    // 1. Fetch the job (Lookup by uuid or id)
    const isNumericId = /^\d+$/.test(id);
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, employee_pk, title, plan_type_at_posting')
      .eq(isNumericId ? 'id' : 'uuid', id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 2. Fetch employee profile (Lookup by uuid)
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, credits')
      .eq('uuid', employeeId)
      .single();

    if (empError || !employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    // 3. Ensure the job belongs to this employee
    if (job.employee_pk !== employee.id) {
      return NextResponse.json({ error: 'Unauthorized: You do not own this job posting' }, { status: 403 });
    }

    // 4. Check if job is already boosted
    if (job.plan_type_at_posting === 'boosted' || (job.plan_type_at_posting && job.plan_type_at_posting.endsWith('_boosted'))) {
      return NextResponse.json({ error: 'This job posting is already boosted' }, { status: 400 });
    }

    // 5. Check if employee has enough credits
    const boostCost = 50;
    const currentBalance = employee.credits ?? 0;
    if (currentBalance < boostCost) {
      return NextResponse.json({ 
        error: `Insufficient credits. Boosting costs ${boostCost} credits, but you only have ${currentBalance} credits.` 
      }, { status: 403 });
    }

    // 6. Deduct credits and update job plan_type_at_posting to reflect boosted state
    const originalPlan = job.plan_type_at_posting || 'free';
    const newPlan = originalPlan.endsWith('_boosted') ? originalPlan : `${originalPlan}_boosted`;

    const [
      { error: updateJobError },
      { error: updateEmpError }
    ] = await Promise.all([
      supabaseAdmin
        .from('jobs')
        .update({ plan_type_at_posting: newPlan })
        .eq('id', job.id),
      supabaseAdmin
        .from('employees')
        .update({ credits: currentBalance - boostCost })
        .eq('id', employee.id)
    ]);

    if (updateJobError || updateEmpError) {
      console.error('[API_JOB_BOOST] Update error:', { updateJobError, updateEmpError });
      return NextResponse.json({ error: 'Failed to complete boosting transaction' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Job boosted successfully!',
      cost: boostCost,
      newBalance: currentBalance - boostCost
    });

  } catch (err: any) {
    console.error('[API_JOB_BOOST] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to boost job', details: err.message }, { status: 500 });
  }
}
