import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hasUserUsedCoupon } from '@/lib/coupon-service';
import { extractAuthToken } from '@/lib/auth-server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { code, planId, packId, userId } = await request.json();
    const targetId = planId || packId;

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

    // Validate Single-Use Per User: Jobseekers / Recruiters can only use a coupon code once
    let checkUserId = userId;
    if (!checkUserId) {
      const token = extractAuthToken(request);
      if (token && process.env.SUPABASE_JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, { algorithms: ['HS256'] }) as any;
          if (decoded && decoded.sub) checkUserId = decoded.sub;
        } catch {}
      }
    }

    if (checkUserId) {
      const alreadyUsed = await hasUserUsedCoupon(checkUserId, coupon.code);
      if (alreadyUsed) {
        return NextResponse.json({ error: 'You have already used this coupon code.' }, { status: 400 });
      }
    }

    // Validate Applicable Plan
    const isPlanMatch = !coupon.applicable_plan || 
      coupon.applicable_plan === 'all' || 
      coupon.applicable_plan === targetId ||
      (coupon.applicable_plan === 'basic' && targetId === 'basic_plan') ||
      (coupon.applicable_plan === 'basic_plan' && targetId === 'basic');

    if (!isPlanMatch) {
          const planNames: Record<string, string> = {
              'basic': 'Recruiter Basic',
              'basic_plan': 'Recruiter Basic',
              'premium': 'Recruiter Premium',
              'pro': 'Recruiter Pro',


              'mini': 'Mini Credit Pack',
              'basic_pack': 'Basic Credit Pack',
              'popular_pack': 'Popular Credit Pack',
              'pro_pack': 'Pro Credit Pack'
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
