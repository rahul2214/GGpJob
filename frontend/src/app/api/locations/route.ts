

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return NextResponse.json(locations);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, country } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .insert([{ name, country: country || 'India' }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(location, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create location', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { id, uuid } = await request.json();
        const identifier = uuid || id; // Handle both for transition
        
        if (!identifier) {
            return NextResponse.json({ error: 'Identifier (uuid or id) is required' }, { status: 400 });
        }
        
        const { error } = await supabaseAdmin
            .from('locations')
            .delete()
            .eq('uuid', identifier);

        if (error) throw error;

        return NextResponse.json({ message: 'Location deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete location', details: e.message }, { status: 500 });
    }
}
