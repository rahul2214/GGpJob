import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }
    
    // 0. Resolve the numeric PK if a UUID is provided
    let targetPk = id;
    if (id.includes('-')) {
        const { data: resolvedApp } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('uuid', id)
            .maybeSingle();
        if (resolvedApp) targetPk = resolvedApp.id.toString();
    }

    // 1. Check current status to avoid downgrading
    const { data: currentApp } = await supabaseAdmin
        .from('applications')
        .select('status_id')
        .eq('id', targetPk)
        .single();

    if (currentApp && currentApp.status_id > 1) {
        return NextResponse.json({ success: true, message: 'Status already advanced' });
    }

    // 2. Update status only if it was 'Applied' (1)
    const { data: app, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ 
        status_id: 2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetPk)
      .eq('status_id', 1) // Crucial: only if still applied
      .select('*, jobs(title)')
      .single();

    if (updateError || !app) {
        // If it's not found because of the eq('status_id', 1) filter, that's fine
        if (!app && currentApp) return NextResponse.json({ success: true });
        return NextResponse.json({ error: 'Application not found or already viewed' }, { status: 404 });
    }

    // Create a notification for the job seeker
    const jobTitle = app.jobs?.title || 'a job';

    await supabaseAdmin.from('notifications').insert({
      user_pk: app.user_pk,
      message: `Your profile was viewed for the ${jobTitle} position.`,
      type: 'application_status',
      job_pk: app.job_pk,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Application status updated to "Profile Viewed"' }, { status: 200 });

  } catch (e: any) {
    console.error('[API_APP_VIEW] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
