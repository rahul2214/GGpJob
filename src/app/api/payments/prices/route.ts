import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Default USD plan prices from code as fallbacks in case database lookup fails
const DEFAULT_USD_PRICES: Record<string, number> = {
  'basic': 19,
  'premium': 49,
  'pro': 99,

  'free': 0,

  'mini': 3,
  'popular_pack': 9,
  'pro_pack': 19,
  'employee_starter': 5,
  'employee_double': 9,
  'employee_pro': 19,
  'employee_enterprise': 39
};

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
    console.warn('[API_PAYMENTS_PRICES] Lookup failed (using hardcoded defaults):', err.message);
    return NextResponse.json({ prices: DEFAULT_USD_PRICES });
  }
}
