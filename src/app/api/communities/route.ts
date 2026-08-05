import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET all communities with member counts and user joined status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // user UUID
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('communities')
      .select(`
        *,
        members_count:community_members(count)
      `);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: communities, error } = await query.order('name');
    if (error) throw error;

    // Fetch joined communities for the user if userId is provided
    let joinedCommunityIds = new Set<string>();
    if (userId) {
      // Resolve auth uuid → jobseeker_id
      const { data: js } = await supabaseAdmin
        .from('jobseekers')
        .select('id')
        .eq('uuid', userId)
        .maybeSingle();

      if (js?.id) {
        const { data: joined } = await supabaseAdmin
          .from('community_members')
          .select('community_id')
          .eq('jobseeker_id', js.id);

        if (joined) {
          joined.forEach((j: any) => joinedCommunityIds.add(String(j.community_id)));
        }
      }
    }

    const mapped = (communities || []).map((comm: any) => ({
      id: comm.id,
      uuid: comm.uuid,
      name: comm.name,
      description: comm.description,
      category: comm.category,
      coverImage: comm.cover_image,
      icon: comm.icon,
      createdAt: comm.created_at,
      memberCount: comm.members_count?.[0]?.count || 0,
      isJoined: joinedCommunityIds.has(String(comm.id))
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error('[COMMUNITIES_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create community (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, icon, creatorUuid } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
    }

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

    const { data: newCommunity, error } = await supabaseAdmin
      .from('communities')
      .insert({
        name,
        description,
        category,
        icon: icon || 'Atom'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newCommunity);
  } catch (err: any) {
    console.error('[COMMUNITIES_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
