import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, uuid, id } = await request.json();
    const targetId = userId || uuid || id;

    if (!targetId) {
      return NextResponse.json({ error: 'Missing required userId/uuid parameter' }, { status: 400 });
    }

    const isNumeric = /^\d+$/.test(String(targetId));
    let targetTable: string | null = null;
    let userUuid: string | null = null;

    // Search role tables for the deleted user
    const [
      { data: seeker },
      { data: recruiter },
      { data: admin }
    ] = await Promise.all([
      isNumeric
        ? supabaseAdmin.from('jobseekers').select('id, uuid').eq('id', targetId).maybeSingle()
        : supabaseAdmin.from('jobseekers').select('id, uuid').eq('uuid', targetId).maybeSingle(),
      isNumeric
        ? supabaseAdmin.from('recruiters').select('id, uuid').eq('id', targetId).maybeSingle()
        : supabaseAdmin.from('recruiters').select('id, uuid').eq('uuid', targetId).maybeSingle(),
      isNumeric
        ? supabaseAdmin.from('admins').select('id, uuid').eq('id', targetId).maybeSingle()
        : supabaseAdmin.from('admins').select('id, uuid').eq('uuid', targetId).maybeSingle()
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

    // Reset soft delete status and timestamp columns
    const { error: restoreErr } = await supabaseAdmin
      .from(targetTable)
      .update({
        is_deleted: false,
        status: 'active',
        delete_requested_at: null,
        deleted_at: null,
        scheduled_delete_at: null
      })
      .eq('uuid', userUuid);

    if (restoreErr) {
      console.error(`[ACCOUNT_RESTORE] Failed to update ${targetTable}:`, restoreErr);
      return NextResponse.json({ error: 'Failed to restore user account', details: restoreErr.message }, { status: 500 });
    }

    // Clear user_metadata soft delete flag in Supabase Auth
    try {
      await supabaseAdmin.auth.admin.updateUserById(userUuid, {
        user_metadata: { is_deleted: false, scheduled_delete_at: null }
      });
    } catch (err) {
      console.error('[ACCOUNT_RESTORE] Auth metadata update error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Account restored successfully. All features and access have been reactivated.',
    });
  } catch (error: any) {
    console.error('[ACCOUNT_RESTORE] Exception:', error);
    return NextResponse.json({ error: 'Failed to restore account', details: error.message }, { status: 500 });
  }
}
