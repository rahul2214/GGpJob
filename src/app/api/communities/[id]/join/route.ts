import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** Resolve auth user UUID → jobseekers.id (int8). Returns null if not a jobseeker. */
async function resolveJobseekerId(userUuid: string): Promise<number | null> {
  const { data } = await supabaseAdmin
    .from('jobseekers')
    .select('id')
    .eq('uuid', userUuid)
    .maybeSingle();
  return data?.id ?? null;
}

// POST Join Community
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // community id
    const { userUuid } = await request.json();

    if (!userUuid) {
      return NextResponse.json({ error: 'User identity is required' }, { status: 400 });
    }

    const jobseekerId = await resolveJobseekerId(userUuid);
    if (!jobseekerId) {
      return NextResponse.json({ error: 'Only jobseekers can join communities' }, { status: 403 });
    }

    const communityIdNum = parseInt(id, 10);
    const commId = isNaN(communityIdNum) ? id : communityIdNum;

    // 1. Primary insert using jobseeker_id
    const { error } = await supabaseAdmin
      .from('community_members')
      .upsert({
        community_id: commId,
        jobseeker_id: jobseekerId,
        role: 'member'
      }, { onConflict: 'community_id,jobseeker_id' });

    if (error) {
      // 2. Fallback: If DB schema cache still expects user_uuid or old constraint
      console.warn('[COMMUNITY_JOIN_POST] Retrying with user_uuid fallback:', error.message);
      const { error: fallbackErr } = await supabaseAdmin
        .from('community_members')
        .upsert({
          community_id: commId,
          user_uuid: userUuid,
          jobseeker_id: jobseekerId,
          role: 'member'
        }, { onConflict: 'community_id,user_uuid' });

      if (fallbackErr) {
        // 3. Fallback: standard insert
        const { error: insertErr } = await supabaseAdmin
          .from('community_members')
          .insert({
            community_id: commId,
            jobseeker_id: jobseekerId,
            role: 'member'
          });

        if (insertErr) throw error;
      }
    }

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

    const jobseekerId = await resolveJobseekerId(userUuid);
    const communityIdNum = parseInt(id, 10);
    const commId = isNaN(communityIdNum) ? id : communityIdNum;

    if (jobseekerId) {
      const { error } = await supabaseAdmin
        .from('community_members')
        .delete()
        .eq('community_id', commId)
        .eq('jobseeker_id', jobseekerId);

      if (!error) {
        return NextResponse.json({ success: true, joined: false });
      }
    }

    // Fallback using user_uuid
    const { error: fallbackErr } = await supabaseAdmin
      .from('community_members')
      .delete()
      .eq('community_id', commId)
      .eq('user_uuid', userUuid);

    if (fallbackErr && !jobseekerId) throw fallbackErr;

    return NextResponse.json({ success: true, joined: false });
  } catch (err: any) {
    console.error('[COMMUNITY_JOIN_DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

