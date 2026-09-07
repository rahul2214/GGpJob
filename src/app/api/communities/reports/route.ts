import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, requireAdmin, isOwnerOrAdmin } from '@/lib/auth-server';

// GET all reports (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Reading all reports is administrator-only, proven from the caller's token
    // rather than a caller-supplied adminUuid (which could name any admin).
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { data: reports, error } = await supabaseAdmin
      .from('community_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(reports || []);
  } catch (err: any) {
    console.error('[REPORTS_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create an abuse report
export async function POST(request: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { reporterUuid, postId, commentId, reason, details } = await request.json();

    if (!reporterUuid || !reason) {
      return NextResponse.json({ error: 'Reporter UUID and Reason are required' }, { status: 400 });
    }

    // A report is filed by the caller; the reporter cannot be another user.
    if (!isOwnerOrAdmin(authUser!, reporterUuid)) {
      return NextResponse.json({ error: 'Forbidden: You can only report as yourself.' }, { status: 403 });
    }

    const insertData: any = {
      reporter_uuid: reporterUuid,
      reason,
      details: details || '',
      status: 'pending'
    };

    if (commentId) insertData.comment_id = commentId;
    else if (postId) insertData.post_id = postId;
    else {
      return NextResponse.json({ error: 'Post ID or Comment ID must be targeted' }, { status: 400 });
    }

    const { data: report, error } = await supabaseAdmin
      .from('community_reports')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('[REPORTS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT resolve or dismiss report (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Resolving/dismissing a report is administrator-only, proven from the
    // caller's verified token rather than a caller-supplied adminUuid.
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { reportId, status } = await request.json(); // status: resolved, dismissed

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Report ID and Status are required' }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('community_reports')
      .update({ status })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[REPORTS_PUT] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
