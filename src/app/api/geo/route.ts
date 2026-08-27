import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'countries';
        const countryId = searchParams.get('countryId');
        const stateId = searchParams.get('stateId');

        if (type === 'countries') {
            const { data, error } = await supabaseAdmin
                .from('countries')
                .select('id, name, code')
                .eq('is_active', true)
                .order('name', { ascending: true });
            if (error) throw error;
            return NextResponse.json(data || []);
        }

        if (type === 'states') {
            let query = supabaseAdmin
                .from('states_provinces')
                .select('id, name, code, country_id')
                .eq('is_active', true);
            if (countryId) {
                query = query.eq('country_id', parseInt(countryId, 10));
            }
            const { data, error } = await query.order('name', { ascending: true });
            if (error) throw error;
            return NextResponse.json(data || []);
        }

        if (type === 'cities') {
            let query = supabaseAdmin
                .from('cities')
                .select('id, name, state_province_id')
                .eq('is_active', true);
            if (stateId) {
                query = query.eq('state_province_id', parseInt(stateId, 10));
            }
            const { data, error } = await query.order('name', { ascending: true });
            if (error) throw error;
            return NextResponse.json(data || []);
        }

        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
