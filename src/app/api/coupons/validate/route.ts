import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { code, planId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const { data: coupon, error: fetchError } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

    if (fetchError || !coupon) {
        return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    // Validate Expiration
    if (new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 });
    }

    // Validate Usage Limits
    if (coupon.current_uses >= coupon.max_uses) {
        return NextResponse.json({ error: 'Coupon code usage limit reached' }, { status: 400 });
    }

    // Validate Applicable Plan
    if (coupon.applicable_plan && coupon.applicable_plan !== 'all' && coupon.applicable_plan !== planId) {
         const planNames: Record<string, string> = {
             'basic': 'Basic Plan',
             'premium': 'Premium Plan',
             'pro': 'Pro Recruitment',
             'talent': 'Talent Search',
             'jobseeker_premium': 'Job Seeker Premium'
         };
         return NextResponse.json({ 
             error: `This coupon is only valid for the ${planNames[coupon.applicable_plan] || 'specified'} plan.` 
         }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true, 
        discountPercent: coupon.discount_percent,
        code: coupon.code
    }, { status: 200 });

  } catch (error: any) {
    console.error('[VALIDATE_COUPON]', error);
    return NextResponse.json({ error: 'Failed to validate coupon', details: error.message }, { status: 500 });
  }
}
