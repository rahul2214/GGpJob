import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

/**
 * POST /api/users/[id]/skills
 * Bulk-saves an array of skills to the user's `skills` subcollection.
 * Body: { skills: [{ id: string; name: string }] }
 * Also marks profileStats.hasSkills = true on the parent user document.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const skills: { id: string; name: string }[] = body.skills || [];

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Skills array is required.' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(id);
    const skillsColRef = userRef.collection('skills');

    // Write each skill as its own document (id = skill master id)
    const batch = db.batch();
    for (const skill of skills) {
      if (!skill.id) continue;
      const skillDocRef = skillsColRef.doc(skill.id);
      batch.set(skillDocRef, { name: skill.name, addedAt: new Date().toISOString() }, { merge: true });
    }

    // Update profileStats.hasSkills = true on user document
    batch.update(userRef, { 'profileStats.hasSkills': true });

    await batch.commit();

    return NextResponse.json({ success: true, savedCount: skills.length });
  } catch (e: any) {
    console.error('[API_USERS_SKILLS_POST]', e);
    return NextResponse.json({ error: 'Failed to save skills', details: e.message }, { status: 500 });
  }
}
