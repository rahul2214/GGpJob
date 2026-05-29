import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, country } = await request.json();
    if (!name || !country) {
      return NextResponse.json({ error: 'Name and country are required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .update({ name, country })
      .eq(isUUID ? 'uuid' : 'id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(location, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update location', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        const { error } = await supabaseAdmin
            .from('locations')
            .delete()
            .eq(isUUID ? 'uuid' : 'id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Location deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete location', details: e.message }, { status: 500 });
    }
}
