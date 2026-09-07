import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, requireAdmin, isOwnerOrAdmin } from '@/lib/auth-server';

// GET single community details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Fetch community
    const { data: comm, error } = await supabaseAdmin
      .from('communities')
      .select(`
        *,
        members_count:community_members(count)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!comm) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if the user is a member
    let isJoined = false;
    let userRole = 'none';
    if (userId) {
      // Resolve auth uuid → jobseeker_id
      const { data: js } = await supabaseAdmin
        .from('jobseekers')
        .select('id')
        .eq('uuid', userId)
        .maybeSingle();

      if (js?.id) {
        const { data: member } = await supabaseAdmin
          .from('community_members')
          .select('role')
          .eq('community_id', id)
          .eq('jobseeker_id', js.id)
          .maybeSingle();

        if (member) {
          isJoined = true;
          userRole = member.role;
        }
      }
    }



    const result = {
      id: comm.id,
      uuid: comm.uuid,
      name: comm.name,
      description: comm.description,
      category: comm.category,
      coverImage: comm.cover_image,
      icon: comm.icon,
      createdAt: comm.created_at,
      memberCount: comm.members_count?.[0]?.count || 0,
      isJoined,
      userRole
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[COMMUNITY_DETAIL_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT edit community (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Editing a community is administrator-only. Authorisation comes from the
    // caller's verified token, not a caller-supplied creatorUuid.
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { id } = params;
    const body = await request.json();
    const { name, description, category, icon } = body;

    const { data: updated, error } = await supabaseAdmin
      .from('communities')
      .update({ name, description, category, icon, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[COMMUNITY_DETAIL_PUT] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE community (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Deleting a community is administrator-only, proven from the caller's
    // verified token rather than a caller-supplied adminUuid.
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { id } = params;

    const { error } = await supabaseAdmin
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Community deleted successfully' });
  } catch (err: any) {
    console.error('[COMMUNITY_DETAIL_DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
