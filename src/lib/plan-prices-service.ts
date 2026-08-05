import { supabaseAdmin } from './supabase-admin';

export const DEFAULT_USD_PRICES: Record<string, number> = {
  'basic': 19,
  'premium': 49,
  'pro': 99,
  'talent': 29,
  'free': 0,
  'jobseeker_basic': 9,
  'jobseeker_premium': 9,
  'jobseeker_pro': 19,
  'mini': 3,
  'popular_pack': 9,
  'pro_pack': 19,
  'employee_starter': 5,
  'employee_double': 9,
  'employee_pro': 19,
  'employee_enterprise': 39
};

export async function getPlanPrices(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('plan_prices')
      .select('plan_id, base_price');

    if (error || !data) {
      throw error || new Error('No prices returned');
    }

    const prices: Record<string, number> = {};
    data.forEach((item: any) => {
      prices[item.plan_id] = Number(item.base_price);
    });

    // Make sure we have fallbacks for any missing plans
    return { ...DEFAULT_USD_PRICES, ...prices };
  } catch (err) {
    console.warn('[PLAN_PRICES_SERVICE] Database lookup failed, using static values:', err);
    return DEFAULT_USD_PRICES;
  }
}
