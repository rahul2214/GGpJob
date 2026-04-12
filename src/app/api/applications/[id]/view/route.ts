import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }
    
    // Update status to 'Profile Viewed' (statusId: 2)
    const { data: app, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ 
        status_id: 2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, jobs(title)')
      .single();

    if (updateError || !app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
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
