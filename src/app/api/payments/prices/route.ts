import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('plan_prices')
      .select('plan_id, name, base_price, credits, base_currency');

    if (error || !data) {
      throw error || new Error('No prices found');
    }

    const prices: Record<string, number> = {};
    const credits: Record<string, number> = {};
    data.forEach((item: any) => {
      prices[item.plan_id] = Number(item.base_price);
      if (item.credits !== null && item.credits !== undefined) {
        credits[item.plan_id] = Number(item.credits);
      }
    });

    // Credit packs strictly from database where credits is configured and > 0
    const creditPacks = data
      .filter((item: any) => item.credits !== null && item.credits !== undefined && Number(item.credits) > 0)
      .map((item: any) => ({
        id: item.plan_id,
        name: item.name || item.plan_id,
        price: Number(item.base_price),
        credits: Number(item.credits),
        currency: item.base_currency || 'USD',
      }))
      .sort((a: any, b: any) => a.credits - b.credits);

    return NextResponse.json({ prices, credits, creditPacks, plans: data });
  } catch (err: any) {
    console.error('[API_PAYMENTS_PRICES] Lookup failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch prices from database', prices: {}, credits: {}, creditPacks: [], plans: [] }, { status: 500 });
  }
}
