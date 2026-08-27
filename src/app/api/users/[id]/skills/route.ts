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
      const uuids: string[] = [];
      const names: string[] = [];
      const integerIds: number[] = [];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      for (const s of skills) {
        const idVal = String(s.id || (s as any).uuid || '').trim();
        const nameVal = String(s.name || '').trim();

        if (idVal) {
          if (uuidRegex.test(idVal)) {
            uuids.push(idVal);
          } else if (/^\d+$/.test(idVal)) {
            integerIds.push(parseInt(idVal, 10));
          }
        }
        if (nameVal) {
          names.push(nameVal);
        }
      }

      const resolvedSkillPks = new Set<number>();

      if (uuids.length > 0) {
        const { data: byUuid } = await supabaseAdmin
          .from('skills')
          .select('id')
          .in('uuid', uuids);
        if (byUuid) byUuid.forEach((s: any) => resolvedSkillPks.add(s.id));
      }

      if (integerIds.length > 0) {
        const { data: byId } = await supabaseAdmin
          .from('skills')
          .select('id')
          .in('id', integerIds);
        if (byId) byId.forEach((s: any) => resolvedSkillPks.add(s.id));
      }

      if (names.length > 0) {
        const { data: byName } = await supabaseAdmin
          .from('skills')
          .select('id, name')
          .in('name', names);
        
        const foundNames = new Set((byName || []).map((s: any) => s.name.toLowerCase()));
        if (byName) byName.forEach((s: any) => resolvedSkillPks.add(s.id));

        const missingNames = Array.from(new Set(names.filter(n => !foundNames.has(n.toLowerCase()))));
        if (missingNames.length > 0) {
          const inserts = missingNames.map(name => ({ name }));
          const { data: insertedSkills } = await supabaseAdmin
            .from('skills')
            .insert(inserts)
            .select('id');
          if (insertedSkills) insertedSkills.forEach((s: any) => resolvedSkillPks.add(s.id));
        }
      }

      if (resolvedSkillPks.size > 0) {
        skillInserts = Array.from(resolvedSkillPks).map((skillId: number) => ({
          user_pk: userPk,
          skill_pk: skillId,
          proficiency_level: 'beginner',
          years_experience: 0
        }));

        const { error: insertError } = await supabaseAdmin
          .from('jobseeker_skills')
          .upsert(skillInserts, { onConflict: 'user_pk,skill_pk' });
        
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
