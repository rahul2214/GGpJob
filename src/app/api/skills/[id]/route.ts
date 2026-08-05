import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdmin } from '@/lib/check-admin';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !(await checkAdmin(userId))) {
        return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const { data: updatedSkill, error } = await supabaseAdmin
        .from('skills')
        .update({
            name: data.name,
            // updated_at is handled by DB trigger in schema.sql
        })
        .eq(isUUID ? 'uuid' : 'id', id)
        .select()
        .single();

    if (error) throw error;

    return NextResponse.json(updatedSkill);
  } catch (e: any) {
    console.error('[API_SKILLS_ID_PUT] Error:', e);
    return NextResponse.json({ error: 'Failed to update skill', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !(await checkAdmin(userId))) {
        return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id } = params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const { error } = await supabaseAdmin
        .from('skills')
        .delete()
        .eq(isUUID ? 'uuid' : 'id', id);

    if (error) throw error;
    
    return NextResponse.json({ message: 'Skill successfully deleted' });
  } catch (e: any) {
    console.error('[API_SKILLS_ID_DELETE] Error:', e);
    return NextResponse.json({ error: 'Failed to delete skill', details: e.message }, { status: 500 });
  }
}
