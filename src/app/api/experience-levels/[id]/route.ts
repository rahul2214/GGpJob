import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const { data: updatedLevel, error } = await supabaseAdmin
        .from('experience_levels')
        .update({ name })
        .eq(isUUID ? 'uuid' : 'id', id)
        .select()
        .single();

    if (error || !updatedLevel) {
      return NextResponse.json({ error: 'Experience level not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLevel, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update experience level', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        const { error } = await supabaseAdmin
            .from('experience_levels')
            .delete()
            .eq(isUUID ? 'uuid' : 'id', id);

        if (error) {
          return NextResponse.json({ error: 'Experience level not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Experience level deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete experience level', details: e.message }, { status: 500 });
    }
}
