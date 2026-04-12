import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase-admin';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

export async function POST(request: Request) {
  try {
    const { userId, planId, amount, couponCode } = await request.json();

    if (!userId || !planId || amount === undefined) {
      return NextResponse.json({ error: 'User ID, Plan ID, and Amount are required' }, { status: 400 });
    }

    console.log(`[PAYMENT_ORDER_CREATE] Checking profile for userId: ${userId}`);
    
    // 1. Check jobseekers
    let { data: profile, error: profileError } = await supabaseAdmin
        .from('jobseekers')
        .select('id, role')
        .eq('uuid', userId)
        .maybeSingle();
    
    if (profile) console.log(`[PAYMENT_ORDER_CREATE] Found in jobseekers: ${profile.role}`);

    // 2. Check recruiters if not found
    if (!profile) {
        const { data: recruiter, error: recError } = await supabaseAdmin
            .from('recruiters')
            .select('id')
            .eq('uuid', userId)
            .maybeSingle();
        
        if (recError) console.error(`[PAYMENT_ORDER_CREATE] Recruiter lookup error:`, recError);
        if (recruiter) {
            console.log(`[PAYMENT_ORDER_CREATE] Found in recruiters table`);
            profile = { role: 'Recruiter' } as any;
        }
    }

    // 3. Check employees if still not found
    if (!profile) {
        const { data: employee, error: empError } = await supabaseAdmin
            .from('employees')
            .select('id')
            .eq('uuid', userId)
            .maybeSingle();
        
        if (empError) console.error(`[PAYMENT_ORDER_CREATE] Employee lookup error:`, empError);
        if (employee) {
            console.log(`[PAYMENT_ORDER_CREATE] Found in employees table`);
            profile = { role: 'Employee' } as any;
        }
    }

    if (!profile) {
        console.error(`[PAYMENT_ORDER_CREATE] No profile found in any table for userId: ${userId}`);
        return NextResponse.json({ error: 'User profile not found. Please log in again.' }, { status: 404 });
    }

    const { role } = profile;

    // Validate amount based on planId (Backend Security)
    const validPlans: Record<string, number> = {
        'basic': 199,
        'premium': 1499,
        'talent': 499,
        'pro': 4999,
        'jobseeker_premium': 199
    };

    let baseAmount = validPlans[planId];
    if (baseAmount === undefined) {
         return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    let expectedAmount = baseAmount;
    
    // Apply server-side coupon validation
    if (couponCode) {
         const { data: coupon, error: couponError } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase().trim())
            .maybeSingle();

         if (coupon) {
             const isValid = new Date(coupon.expires_at) >= new Date() && 
                             coupon.current_uses < coupon.max_uses && 
                             coupon.is_active &&
                             (coupon.applicable_plan === 'all' || coupon.applicable_plan === planId || !coupon.applicable_plan);
             
             if (isValid) {
                 expectedAmount = Math.max(0, Math.round(baseAmount * (1 - coupon.discount_percent / 100)));
             }
         }
    }

    if (expectedAmount !== amount) {
        return NextResponse.json({ error: `Invalid plan amount. Expected ₹${expectedAmount}.` }, { status: 400 });
    }

    if (expectedAmount === 0) {
        return NextResponse.json({
            id: `free_order_${userId}_${Date.now()}`,
            amount: 0,
            currency: "INR",
            isFree: true,
            planId,
            userId,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId,
        planId
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[PAYMENT_ORDER_CREATE] Error:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order', details: error.message }, { status: 500 });
  }
}
