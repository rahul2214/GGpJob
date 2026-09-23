import { supabaseAdmin } from './supabase-admin';

export const DEFAULT_PLAN_CREDITS: Record<string, number> = {
  mini: 10,
  basic_pack: 25,
  popular_pack: 60,
  pro_pack: 150,
  employee_starter: 50,
  employee_double: 100,
  employee_pro: 250,
  employee_enterprise: 600,
};

export async function getPlanPricingDetails(): Promise<{
  prices: Record<string, number>;
  credits: Record<string, number>;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('plan_prices')
      .select('plan_id, base_price, credits');

    if (error || !data) {
      throw error || new Error('No prices returned');
    }

    const prices: Record<string, number> = {};
    const credits: Record<string, number> = { ...DEFAULT_PLAN_CREDITS };

    data.forEach((item: any) => {
      prices[item.plan_id] = Number(item.base_price);
      if (item.credits !== null && item.credits !== undefined) {
        credits[item.plan_id] = Number(item.credits);
      }
    });

    return { prices, credits };
  } catch (err) {
    console.error('[PLAN_PRICES_SERVICE] Database lookup failed:', err);
    return { prices: {}, credits: { ...DEFAULT_PLAN_CREDITS } };
  }
}

export async function getPlanPrices(): Promise<Record<string, number>> {
  const { prices } = await getPlanPricingDetails();
  return prices;
}

export async function getPlanCredits(): Promise<Record<string, number>> {
  const { credits } = await getPlanPricingDetails();
  return credits;
}

