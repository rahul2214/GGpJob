import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    const { planId, price, name } = await request.json();

    if (!planId || price === undefined || price < 0) {
      return NextResponse.json({ error: 'Valid Plan ID and Price are required' }, { status: 400 });
    }

    const PLAN_NAMES: Record<string, string> = {
      'free': 'Free Plan',
      'basic': 'Basic Plan',
      'premium': 'Premium Plan',
      'pro': 'Pro Recruitment',


      'mini': 'Mini Credit Pack',
      'popular_pack': 'Popular Credit Pack',
      'pro_pack': 'Pro Credit Pack',
      'employee_starter': 'Starter Boost Pack',
      'employee_double': 'Double Boost Pack',
      'employee_pro': 'Pro Boost Pack',
      'employee_enterprise': 'Enterprise Boost Pack'
    };

    const finalName = name || PLAN_NAMES[planId] || 'Plan';

    const { error } = await supabaseAdmin
      .from('plan_prices')
      .upsert({
        plan_id: planId,
        name: finalName,
        base_price: Number(price),
        updated_at: new Date().toISOString()
      }, { onConflict: 'plan_id' });

    if (error) throw error;

    return NextResponse.json({ success: true, planId, price });
  } catch (err: any) {
    console.error('[API_ADMIN_PLANS_POST] Failed to update plan price:', err);
    return NextResponse.json({ error: err.message || 'Failed to update plan price' }, { status: 500 });
  }
}
