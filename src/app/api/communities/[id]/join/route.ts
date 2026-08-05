import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST Join Community
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // community id
    const { userUuid } = await request.json();

    if (!userUuid) {
      return NextResponse.json({ error: 'User identity is required' }, { status: 400 });
    }

    // Insert to community_members
    const { error } = await supabaseAdmin
      .from('community_members')
      .upsert({
        community_id: id,
        user_uuid: userUuid,
        role: 'member'
      }, { onConflict: 'community_id,user_uuid' });

    if (error) throw error;

    return NextResponse.json({ success: true, joined: true });
  } catch (err: any) {
    console.error('[COMMUNITY_JOIN_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE Leave Community
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userUuid = searchParams.get('userUuid');

    if (!userUuid) {
      return NextResponse.json({ error: 'User identity is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('community_members')
      .delete()
      .eq('community_id', id)
      .eq('user_uuid', userUuid);

    if (error) throw error;

    return NextResponse.json({ success: true, joined: false });
  } catch (err: any) {
    console.error('[COMMUNITY_JOIN_DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
