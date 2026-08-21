

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: cities, error } = await supabaseAdmin
      .from('cities')
      .select(`
        id,
        name,
        states_provinces!state_province_id (
          id,
          name,
          countries!country_id (
            id,
            name
          )
        )
      `)
      .eq('is_active', true)
      .limit(200);

    if (error || !cities || cities.length === 0) {
      const { data: countries } = await supabaseAdmin
        .from('countries')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      const formattedCountries = (countries || []).map((c: any) => ({
        id: c.id,
        uuid: String(c.id),
        name: c.name,
        country: c.name
      }));
      return NextResponse.json(formattedCountries);
    }

    const formatted = cities.map((c: any) => ({
      id: c.id,
      uuid: String(c.id),
      name: `${c.name}${c.states_provinces?.name ? ', ' + c.states_provinces.name : ''}`,
      country: c.states_provinces?.countries?.name || 'India'
    }));

    return NextResponse.json(formatted);
  } catch (e) {
    console.error('[API_LOCATIONS_GET] Error:', e);
    return NextResponse.json([]);
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
