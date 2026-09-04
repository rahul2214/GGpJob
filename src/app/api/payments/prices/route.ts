import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('plan_prices')
      .select('plan_id, base_price');

    if (error || !data) {
      throw error || new Error('No prices found');
    }

    const prices: Record<string, number> = {};
    data.forEach((item: any) => {
      prices[item.plan_id] = Number(item.base_price);
    });

    return NextResponse.json({ prices });
  } catch (err: any) {
    console.error('[API_PAYMENTS_PRICES] Lookup failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch prices from database', prices: {} }, { status: 500 });
  }
}
