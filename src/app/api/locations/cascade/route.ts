import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'countries';
    const countryId = searchParams.get('countryId');
    const stateId = searchParams.get('stateId');
    const query = searchParams.get('q') || searchParams.get('query');

    // 1. Return Active Countries
    if (type === 'countries') {
      const { data: countries, error } = await supabaseAdmin
        .from('countries')
        .select('id, name, code, phone_code')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ countries: countries || [] });
    }

    // 2. Return States/Provinces for a Country
    if (type === 'states') {
      if (!countryId) {
        return NextResponse.json({ error: 'countryId parameter is required for states' }, { status: 400 });
      }

      const isNumeric = /^\d+$/.test(countryId);
      let targetCountryId = countryId;

      if (!isNumeric) {
        const { data: countryObj } = await supabaseAdmin
          .from('countries')
          .select('id')
          .ilike('name', countryId)
          .maybeSingle();
        if (countryObj) targetCountryId = countryObj.id.toString();
      }

      const { data: states, error } = await supabaseAdmin
        .from('states_provinces')
        .select('id, country_id, name, code')
        .eq('country_id', targetCountryId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ states: states || [] });
    }

    // 3. Return Cities for a State/Province
    if (type === 'cities') {
      if (!stateId) {
        return NextResponse.json({ error: 'stateId parameter is required for cities' }, { status: 400 });
      }

      const isNumeric = /^\d+$/.test(stateId);
      let targetStateId = stateId;

      if (!isNumeric) {
        const { data: stateObj } = await supabaseAdmin
          .from('states_provinces')
          .select('id')
          .ilike('name', stateId)
          .maybeSingle();
        if (stateObj) targetStateId = stateObj.id.toString();
      }

      const { data: cities, error } = await supabaseAdmin
        .from('cities')
        .select('id, state_province_id, name, is_featured')
        .eq('state_province_id', targetStateId)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ cities: cities || [] });
    }

    // 4. Type-ahead Search / Global City Search
    if (type === 'search' || query) {
      if (!query || query.trim().length === 0) {
        return NextResponse.json({ results: [] });
      }

      const { data: cities, error } = await supabaseAdmin
        .from('cities')
        .select(`
          id,
          name,
          is_featured,
          states_provinces!state_province_id (
            id,
            name,
            code,
            countries!country_id (
              id,
              name,
              code
            )
          )
        `)
        .ilike('name', `%${query.trim()}%`)
        .eq('is_active', true)
        .limit(15);

      if (error) throw error;

      const formatted = (cities || []).map((item: any) => ({
        cityId: item.id,
        cityName: item.name,
        stateId: item.states_provinces?.id,
        stateName: item.states_provinces?.name,
        countryId: item.states_provinces?.countries?.id,
        countryName: item.states_provinces?.countries?.name,
        formattedLocation: `${item.name}, ${item.states_provinces?.name ? item.states_provinces.name + ', ' : ''}${item.states_provinces?.countries?.name || ''}`,
      }));

      return NextResponse.json({ results: formatted });
    }

    return NextResponse.json({ error: 'Invalid location query type' }, { status: 400 });
  } catch (err: any) {
    console.error('[API_LOCATIONS_CASCADE_GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to query location hierarchy' }, { status: 500 });
  }
}
