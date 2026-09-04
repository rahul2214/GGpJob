import { supabaseAdmin } from './supabase-admin';

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

    return prices;
  } catch (err) {
    console.error('[PLAN_PRICES_SERVICE] Database lookup failed:', err);
    return {};
  }
}
