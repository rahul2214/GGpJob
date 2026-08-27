import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    let userId: string | null = null;

    // Check request body or query parameter
    try {
      const body = await request.json();
      userId = body.userId || body.uuid || body.id;
    } catch {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId') || searchParams.get('uuid');
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing required userId parameter' }, { status: 400 });
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: 'Forbidden: You cannot delete another user account.' }, { status: 403 });
    }

    const now = new Date();
    const graceDays = Number(process.env.DELETE_ACCOUNT_GRACE_DAYS) || 30;
    const scheduledDeleteAt = new Date(now.getTime() + graceDays * 24 * 60 * 60 * 1000);

    const isNumeric = /^\d+$/.test(String(userId));
    let roleFound: string | null = null;
    let targetTable: string | null = null;
    let userUuid: string | null = null;
    let userPk: number | null = null;

    // 1. Search role tables to find user
    const [
      { data: seeker },
      { data: recruiter },
      { data: admin }
    ] = await Promise.all([
      isNumeric
        ? supabaseAdmin.from('jobseekers').select('id, uuid, email, role').eq('id', userId).maybeSingle()
        : supabaseAdmin.from('jobseekers').select('id, uuid, email, role').eq('uuid', userId).maybeSingle(),
      isNumeric
        ? supabaseAdmin.from('recruiters').select('id, uuid, email, role').eq('id', userId).maybeSingle()
        : supabaseAdmin.from('recruiters').select('id, uuid, email, role').eq('uuid', userId).maybeSingle(),
      isNumeric
        ? supabaseAdmin.from('admins').select('id, uuid, email, role').eq('id', userId).maybeSingle()
        : supabaseAdmin.from('admins').select('id, uuid, email, role').eq('uuid', userId).maybeSingle()
    ]);

    if (seeker) {
      targetTable = 'jobseekers';
      roleFound = 'Job Seeker';
      userUuid = seeker.uuid;
      userPk = seeker.id;
    } else if (recruiter) {
      targetTable = 'recruiters';
      roleFound = 'Recruiter';
      userUuid = recruiter.uuid;
      userPk = recruiter.id;
    } else if (admin) {
      targetTable = 'admins';
      roleFound = 'Admin';
      userUuid = admin.uuid;
      userPk = admin.id;
    }

    if (!targetTable || !userUuid) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 2. Perform Soft Delete update in user role table
    const updatePayload = {
      is_deleted: true,
      status: 'deleted',
      delete_requested_at: now.toISOString(),
      deleted_at: now.toISOString(),
      scheduled_delete_at: scheduledDeleteAt.toISOString(),
    };

    const { error: updateErr } = await supabaseAdmin
      .from(targetTable)
      .update(updatePayload)
      .eq('uuid', userUuid);

    if (updateErr) {
      console.error(`[ACCOUNT_DELETE] Error updating ${targetTable}:`, updateErr);
      return NextResponse.json({ error: 'Failed to soft delete user account', details: updateErr.message }, { status: 500 });
    }

    // 3. Recruiter specific actions: Close all active job postings
    if (roleFound === 'Recruiter') {
      try {
        await supabaseAdmin
          .from('jobs')
          .update({ status: 'closed', is_active: false })
          .or(`recruiter_id.eq.${userUuid},recruiter_id.eq.${userPk}`);
      } catch (err) {
        console.error('[ACCOUNT_DELETE] Failed to close recruiter jobs:', err);
      }
    }

    // 4. Communities handling: Transfer ownership or archive
    try {
      const { data: ownedCommunities } = await supabaseAdmin
        .from('communities')
        .select('id, uuid')
        .or(`owner_id.eq.${userUuid},created_by.eq.${userUuid}`);

      if (ownedCommunities && ownedCommunities.length > 0) {
        // Find an active admin
        const { data: activeAdmin } = await supabaseAdmin
          .from('admins')
          .select('uuid')
          .eq('is_deleted', false)
          .limit(1)
          .maybeSingle();

        if (activeAdmin) {
          await supabaseAdmin
            .from('communities')
            .update({ owner_id: activeAdmin.uuid, created_by: activeAdmin.uuid })
            .or(`owner_id.eq.${userUuid},created_by.eq.${userUuid}`);
        } else {
          await supabaseAdmin
            .from('communities')
            .update({ status: 'archived', is_archived: true })
            .or(`owner_id.eq.${userUuid},created_by.eq.${userUuid}`);
        }
      }

      // Remove from community memberships
      const { data: jsForDel } = await supabaseAdmin
        .from('jobseekers')
        .select('id')
        .eq('uuid', userUuid)
        .maybeSingle();

      if (jsForDel?.id) {
        await supabaseAdmin
          .from('community_members')
          .delete()
          .eq('jobseeker_id', jsForDel.id);
      }
    } catch (err) {
      console.error('[ACCOUNT_DELETE] Community handling error:', err);
    }

    // 5. Invalidate Supabase Auth User metadata and Sign out
    try {
      await supabaseAdmin.auth.admin.updateUserById(userUuid, {
        user_metadata: { is_deleted: true, scheduled_delete_at: scheduledDeleteAt.toISOString() }
      });
      await supabaseAdmin.auth.admin.signOut(userUuid);
    } catch (err) {
      console.error('[ACCOUNT_DELETE] Auth session signout error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully. Your account is scheduled for permanent deletion in 30 days.',
      scheduledDeleteAt: scheduledDeleteAt.toISOString(),
    });
  } catch (error: any) {
    console.error('[ACCOUNT_DELETE] Exception:', error);
    return NextResponse.json({ error: 'Failed to process account deletion', details: error.message }, { status: 500 });
  }
}
