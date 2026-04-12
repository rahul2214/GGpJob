import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/users/[id]/skills
 * Bulk-saves an array of skills to the user's `jobseeker_skills` table and syncs to JSONB.
 * Body: { skills: [{ id: string; name: string }] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const body = await request.json();
    const skills: { id: string; name: string }[] = body.skills || [];

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills array is required.' }, { status: 400 });
    }

    // 1. Get user_pk
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const { data: user, error: userError } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid')
      .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
      .single();

    if (userError || !user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userPk = user.id;

    // 2. Delete old skill associations
    await supabaseAdmin
      .from('jobseeker_skills')
      .delete()
      .eq('user_pk', userPk);

    // 3. Resolve skill_pks
    let skillInserts: any[] = [];
    if (skills.length > 0) {
      const skillUuids = skills.map(s => s.id || (s as any).uuid).filter(Boolean);
      const { data: dbSkills } = await supabaseAdmin
        .from('skills')
        .select('id, uuid, name')
        .in('uuid', skillUuids);

      if (dbSkills && dbSkills.length > 0) {
         skillInserts = dbSkills.map(dbSkill => ({

            user_pk: userPk,
            skill_pk: dbSkill.id
         }));

         const { error: insertError } = await supabaseAdmin
           .from('jobseeker_skills')
           .insert(skillInserts);
         
         if (insertError) throw insertError;
      }
    }

    // 4. Sync to jobseekers table (JSONB column as backup)
    await supabaseAdmin
      .from('jobseekers')
      .update({ 
        skills: skills,
        updated_at: new Date().toISOString() 
      })
      .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10));

    return NextResponse.json({ success: true, savedCount: skillInserts.length });
  } catch (e: any) {
    console.error('[API_USERS_SKILLS_POST]', e);
    return NextResponse.json({ error: 'Failed to save skills', details: e.message }, { status: 500 });
  }
}
