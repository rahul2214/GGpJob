import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
      const { data: member } = await supabaseAdmin
        .from('community_members')
        .select('role')
        .eq('community_id', id)
        .eq('user_uuid', userId)
        .maybeSingle();

      if (member) {
        isJoined = true;
        userRole = member.role;
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
    const { id } = params;
    const body = await request.json();
    const { name, description, category, icon, creatorUuid } = body;

    // Verify creator is admin
    if (creatorUuid) {
      const { data: seeker } = await supabaseAdmin
        .from('jobseekers')
        .select('role')
        .eq('uuid', creatorUuid)
        .maybeSingle();

      const userRole = seeker?.role;
      if (userRole !== 'Admin' && userRole !== 'Super Admin') {
        return NextResponse.json({ error: 'Restricted to administrators.' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Authorized identity required.' }, { status: 401 });
    }

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
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const adminUuid = searchParams.get('adminUuid');

    // Verify creator is admin
    if (adminUuid) {
      const { data: seeker } = await supabaseAdmin
        .from('jobseekers')
        .select('role')
        .eq('uuid', adminUuid)
        .maybeSingle();

      const userRole = seeker?.role;
      if (userRole !== 'Admin' && userRole !== 'Super Admin') {
        return NextResponse.json({ error: 'Restricted to administrators.' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Authorized identity required.' }, { status: 401 });
    }

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
