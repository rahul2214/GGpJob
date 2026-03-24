import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { MasterSkill } from '@/lib/types';

export async function GET() {
  try {
    const skillsCol = db.collection('skills');
    const skillSnapshot = await skillsCol.get();
    const skills = skillSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterSkill));
    // Sort alphabetically by name
    skills.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(skills);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }
    
    const docRef = await db.collection("skills").add({ name });
    
    return NextResponse.json({ id: docRef.id, name }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
