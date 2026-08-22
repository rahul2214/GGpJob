import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: currencies, error } = await supabaseAdmin
      .from('currencies')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      throw error;
    }

    const response = NextResponse.json(currencies || []);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error: any) {
    console.error('[API_CURRENCIES_GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch currencies', details: error.message }, { status: 500 });
  }
}
