import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET all reports (Admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUuid = searchParams.get('adminUuid');

    if (!adminUuid) {
      return NextResponse.json({ error: 'Identity required' }, { status: 401 });
    }

    // Verify admin identity
    const { data: seeker } = await supabaseAdmin
      .from('jobseekers')
      .select('role')
      .eq('uuid', adminUuid)
      .maybeSingle();

    if (seeker?.role !== 'Admin' && seeker?.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
    }

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
    const { reporterUuid, postId, commentId, reason, details } = await request.json();

    if (!reporterUuid || !reason) {
      return NextResponse.json({ error: 'Reporter UUID and Reason are required' }, { status: 400 });
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
    const { reportId, status, adminUuid } = await request.json(); // status: resolved, dismissed

    if (!reportId || !status || !adminUuid) {
      return NextResponse.json({ error: 'Report ID, Status, and Admin UUID are required' }, { status: 400 });
    }

    // Verify admin identity
    const { data: seeker } = await supabaseAdmin
      .from('jobseekers')
      .select('role')
      .eq('uuid', adminUuid)
      .maybeSingle();

    if (seeker?.role !== 'Admin' && seeker?.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
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
