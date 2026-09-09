import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

let cachedCountries: any[] | null = null;
let countriesCacheTime = 0;
const statesCache = new Map<string, { data: any[]; cachedAt: number }>();
const citiesCache = new Map<string, { data: any[]; cachedAt: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const DEFAULT_COUNTRIES = [
    { id: 1, name: "India", code: "IN" },
    { id: 2, name: "United States", code: "US" },
    { id: 3, name: "United Kingdom", code: "GB" },
    { id: 4, name: "Canada", code: "CA" },
    { id: 5, name: "Australia", code: "AU" },
    { id: 6, name: "Germany", code: "DE" },
    { id: 7, name: "Singapore", code: "SG" },
    { id: 8, name: "United Arab Emirates", code: "AE" }
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'countries';
        const countryId = searchParams.get('countryId');
        const stateId = searchParams.get('stateId');

        if (type === 'countries') {
            if (cachedCountries && Date.now() - countriesCacheTime < CACHE_TTL) {
                return NextResponse.json(cachedCountries);
            }
            try {
                const { data, error } = await supabaseAdmin
                    .from('countries')
                    .select('id, name, code')
                    .eq('is_active', true)
                    .order('name', { ascending: true });
                if (error) throw error;
                if (data && data.length > 0) {
                    cachedCountries = data;
                    countriesCacheTime = Date.now();
                    return NextResponse.json(data);
                }
            } catch (e: any) {
                console.warn('[GEO_COUNTRIES_WARN] Error loading countries, using cached/fallback:', e?.message || e);
            }
            return NextResponse.json(cachedCountries || DEFAULT_COUNTRIES);
        }

        if (type === 'states') {
            const cacheKey = countryId || 'all';
            const cached = statesCache.get(cacheKey);
            if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
                return NextResponse.json(cached.data);
            }
            try {
                let query = supabaseAdmin
                    .from('states_provinces')
                    .select('id, name, code, country_id')
                    .eq('is_active', true);
                if (countryId) {
                    query = query.eq('country_id', parseInt(countryId, 10));
                }
                const { data, error } = await query.order('name', { ascending: true });
                if (error) throw error;
                const result = data || [];
                statesCache.set(cacheKey, { data: result, cachedAt: Date.now() });
                return NextResponse.json(result);
            } catch (e: any) {
                console.warn('[GEO_STATES_WARN] Error loading states:', e?.message || e);
                if (cached) return NextResponse.json(cached.data);
                return NextResponse.json([]);
            }
        }

        if (type === 'cities') {
            const cacheKey = stateId || 'all';
            const cached = citiesCache.get(cacheKey);
            if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
                return NextResponse.json(cached.data);
            }
            try {
                let query = supabaseAdmin
                    .from('cities')
                    .select('id, name, state_province_id')
                    .eq('is_active', true);
                if (stateId) {
                    query = query.eq('state_province_id', parseInt(stateId, 10));
                }
                const { data, error } = await query.order('name', { ascending: true });
                if (error) throw error;
                const result = data || [];
                citiesCache.set(cacheKey, { data: result, cachedAt: Date.now() });
                return NextResponse.json(result);
            } catch (e: any) {
                console.warn('[GEO_CITIES_WARN] Error loading cities:', e?.message || e);
                if (cached) return NextResponse.json(cached.data);
                return NextResponse.json([]);
            }
        }

        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
