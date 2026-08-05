import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET all resources for a community
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { data: resources, error } = await supabaseAdmin
      .from('community_resources')
      .select('*')
      .eq('community_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(resources || []);
  } catch (err: any) {
    console.error('[RESOURCES_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create learning resource (restricted to joined community members)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, resourceType, url, creatorUuid } = body;

    if (!title || !resourceType || !creatorUuid) {
      return NextResponse.json({ error: 'Title, Resource Type, and Creator UUID are required' }, { status: 400 });
    }

    // Verify creator is member
    const { data: member } = await supabaseAdmin
      .from('community_members')
      .select('id')
      .eq('community_id', id)
      .eq('user_uuid', creatorUuid)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: 'Only community members can contribute resources.' }, { status: 403 });
    }

    const { data: resource, error } = await supabaseAdmin
      .from('community_resources')
      .insert({
        community_id: id,
        creator_uuid: creatorUuid,
        title,
        description: description || '',
        resource_type: resourceType,
        url: url || ''
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(resource);
  } catch (err: any) {
    console.error('[RESOURCES_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
