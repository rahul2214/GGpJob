import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdmin } from '@/lib/check-admin';

export async function GET() {
  try {
    const { data: skills, error } = await supabaseAdmin
        .from('skills')
        .select('*')
        .order('name');
    
    if (error) throw error;
    
    return NextResponse.json(skills);
  } catch (e: any) {
    console.error('[API_SKILLS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch skills', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !(await checkAdmin(userId))) {
        return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }
    
    const { data: skill, error } = await supabaseAdmin
        .from('skills')
        .insert([{ name }])
        .select()
        .single();
    
    if (error) throw error;
    
    return NextResponse.json(skill, { status: 201 });
  } catch (e: any) {
    console.error('[API_SKILLS_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to create skill', details: e.message }, { status: 500 });
  }
}
