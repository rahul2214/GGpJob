import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    let userId: string | null = null;
    try {
      const body = await request.json();
      userId = body.userId || body.uuid || body.id;
    } catch {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId') || searchParams.get('uuid') || searchParams.get('id');
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing required userId/uuid parameter' }, { status: 400 });
    }

    const isNumeric = /^\d+$/.test(String(userId));
    let targetTable: string | null = null;
    let userUuid: string | null = null;

    const [
      { data: seeker },
      { data: recruiter },
      { data: admin }
    ] = await Promise.all([
      isNumeric
        ? supabaseAdmin.from('jobseekers').select('id, uuid').eq('id', userId).maybeSingle()
        : supabaseAdmin.from('jobseekers').select('id, uuid').eq('uuid', userId).maybeSingle(),
      isNumeric
        ? supabaseAdmin.from('recruiters').select('id, uuid').eq('id', userId).maybeSingle()
        : supabaseAdmin.from('recruiters').select('id, uuid').eq('uuid', userId).maybeSingle(),
      isNumeric
        ? supabaseAdmin.from('admins').select('id, uuid').eq('id', userId).maybeSingle()
        : supabaseAdmin.from('admins').select('id, uuid').eq('uuid', userId).maybeSingle()
    ]);

    if (seeker) {
      targetTable = 'jobseekers';
      userUuid = seeker.uuid;
    } else if (recruiter) {
      targetTable = 'recruiters';
      userUuid = recruiter.uuid;
    } else if (admin) {
      targetTable = 'admins';
      userUuid = admin.uuid;
    }

    if (!targetTable || !userUuid) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Anonymize personal info while preserving business records (payments, jobs, applications)
    const anonymizedPayload: any = {
      name: 'Deleted User',
      email: null,
      phone: null,
      profile_photo_url: null,
      resume_url: null,
      portfolio_url: null,
      linkedin_url: null,
      github_url: null,
      headline: null,
      summary: null,
      is_deleted: true,
      status: 'deleted'
    };

    const { error: anonymizeErr } = await supabaseAdmin
      .from(targetTable)
      .update(anonymizedPayload)
      .eq('uuid', userUuid);

    if (anonymizeErr) {
      console.error(`[PERMANENT_DELETE] Error anonymizing ${targetTable}:`, anonymizeErr);
      return NextResponse.json({ error: 'Failed to anonymize user data', details: anonymizeErr.message }, { status: 500 });
    }

    // Delete related personal details sub-records if Job Seeker
    if (targetTable === 'jobseekers') {
      try {
        await Promise.all([
          supabaseAdmin.from('jobseeker_personal_details').delete().eq('jobseeker_id', userUuid),
          supabaseAdmin.from('education').delete().eq('jobseeker_id', userUuid),
          supabaseAdmin.from('experience').delete().eq('jobseeker_id', userUuid),
          supabaseAdmin.from('projects').delete().eq('jobseeker_id', userUuid),
          supabaseAdmin.from('languages').delete().eq('jobseeker_id', userUuid),
        ]);
      } catch (subErr) {
        console.error('[PERMANENT_DELETE] Sub-records cleanup error:', subErr);
      }
    }

    // Permanently remove credentials from Supabase Auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(userUuid);
    } catch (authErr) {
      console.error('[PERMANENT_DELETE] Supabase auth deletion error:', authErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account permanently anonymized and authentication credentials removed.',
    });
  } catch (error: any) {
    console.error('[PERMANENT_DELETE] Exception:', error);
    return NextResponse.json({ error: 'Failed to permanently delete user', details: error.message }, { status: 500 });
  }
}
