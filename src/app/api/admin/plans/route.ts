import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    const { planId, price, name, credits } = await request.json();

    const normalizedPrice = planId === 'referral_bonus' ? Number(price || 0) : Number(price);

    if (!planId || (planId !== 'referral_bonus' && (price === undefined || price < 0))) {
      return NextResponse.json({ error: 'Valid Plan ID and Price are required' }, { status: 400 });
    }

    if (planId === 'referral_bonus' && (credits === undefined || credits === null || isNaN(Number(credits)) || Number(credits) < 1)) {
      return NextResponse.json({ error: 'Referral reward credits must be an integer of at least 1' }, { status: 400 });
    }

    if (credits !== undefined && credits !== null && (isNaN(Number(credits)) || Number(credits) < 0)) {
      return NextResponse.json({ error: 'Valid non-negative credits value is required' }, { status: 400 });
    }

    const PLAN_NAMES: Record<string, string> = {
      'free': 'Free Plan',
      'basic': 'Basic Plan',
      'basic_plan': 'Basic Plan',
      'premium': 'Premium Plan',
      'pro': 'Pro Recruitment',

      'mini': 'Mini Credit Pack',
      'popular_pack': 'Popular Credit Pack',
      'pro_pack': 'Pro Credit Pack',
      'referral_bonus': 'Referral Bonus Credits'
    };

    const finalName = name || PLAN_NAMES[planId] || 'Plan';

    const updatePayload: Record<string, any> = {
      plan_id: planId,
      name: finalName,
      base_price: normalizedPrice,
      updated_at: new Date().toISOString()
    };

    if (credits !== undefined) {
      updatePayload.credits = credits !== null ? Math.round(Number(credits)) : null;
    }

    const { error } = await supabaseAdmin
      .from('plan_prices')
      .upsert(updatePayload, { onConflict: 'plan_id' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      planId,
      price: Number(price),
      credits: updatePayload.credits ?? null
    });
  } catch (err: any) {
    console.error('[API_ADMIN_PLANS_POST] Failed to update plan price:', err);
    return NextResponse.json({ error: err.message || 'Failed to update plan price' }, { status: 500 });
  }
}
