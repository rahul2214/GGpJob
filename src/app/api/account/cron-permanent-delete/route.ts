import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nowIso = new Date().toISOString();
    let processedCount = 0;

    // 1. Query all role tables for accounts past their scheduled permanent deletion date
    const [
      { data: expiredSeekers },
      { data: expiredRecruiters }
    ] = await Promise.all([
      supabaseAdmin
        .from('jobseekers')
        .select('id, uuid')
        .eq('is_deleted', true)
        .lte('scheduled_delete_at', nowIso),
      supabaseAdmin
        .from('recruiters')
        .select('id, uuid')
        .eq('is_deleted', true)
        .lte('scheduled_delete_at', nowIso)
    ]);

    const targets: { table: string; id: number; uuid: string }[] = [
      ...(expiredSeekers || []).map((u: any) => ({ table: 'jobseekers', id: u.id, uuid: u.uuid })),
      ...(expiredRecruiters || []).map((u: any) => ({ table: 'recruiters', id: u.id, uuid: u.uuid }))
    ];

    for (const target of targets) {
      try {
        // Anonymize personal profile data
        await supabaseAdmin
          .from(target.table)
          .update({
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
            status: 'deleted'
          })
          .eq('uuid', target.uuid);

        if (target.table === 'jobseekers') {
          await Promise.all([
            supabaseAdmin.from('jobseeker_personal_details').delete().eq('jobseeker_id', target.uuid),
            supabaseAdmin.from('education').delete().eq('jobseeker_id', target.uuid),
            supabaseAdmin.from('experience').delete().eq('jobseeker_id', target.uuid),
            supabaseAdmin.from('projects').delete().eq('jobseeker_id', target.uuid),
            supabaseAdmin.from('languages').delete().eq('jobseeker_id', target.uuid),
          ]).catch((e: any) => console.error(`[CRON_PERMANENT_DELETE] Sub-tables cleanup error for ${target.uuid}:`, e));
        }

        // Remove from Auth
        await supabaseAdmin.auth.admin.deleteUser(target.uuid).catch((e: any) => console.error(`[CRON_PERMANENT_DELETE] Auth delete error for ${target.uuid}:`, e));
        processedCount++;
      } catch (err) {
        console.error(`[CRON_PERMANENT_DELETE] Error processing ${target.uuid}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron job executed successfully. Anonymized and processed ${processedCount} expired account(s).`,
      processedCount,
    });
  } catch (error: any) {
    console.error('[CRON_PERMANENT_DELETE] Exception:', error);
    return NextResponse.json({ error: 'Failed to run permanent delete cron job', details: error.message }, { status: 500 });
  }
}
