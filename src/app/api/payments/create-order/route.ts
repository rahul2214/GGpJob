import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getExchangeRates, convertUSD } from '@/lib/exchange-rate-service';
import { getPlanPrices } from '@/lib/plan-prices-service';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId, planId, amount, couponCode, currency = 'USD' } = await request.json();

    if (!userId || !planId || amount === undefined) {
      return NextResponse.json({ error: 'User ID, Plan ID, and Amount are required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const lookupId = isUUID ? userId : parseInt(userId, 10);
    const lookupField = isUUID ? 'uuid' : 'id';

    let profile: { id: string | number, role: string } | null = null;

    // Search role tables to verify profile
    const [
      { data: seeker },
      { data: recruiter }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('id, uuid, role_id').eq(lookupField, lookupId).maybeSingle(),
      supabaseAdmin.from('recruiters').select('id, uuid, role_id').eq(lookupField, lookupId).maybeSingle()
    ]);

    if (seeker) {
      profile = { id: seeker.id, role: 'Job Seeker' };
    } else if (recruiter) {
      profile = { id: recruiter.id, role: 'Recruiter' };
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found. Please log in again.' }, { status: 404 });
    }

    // Server-side Plan Price validation in USD (Base Currency)
    const validPlans = await getPlanPrices();

    const baseAmountUSD = validPlans[planId];
    if (baseAmountUSD === undefined) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    let expectedAmountUSD = baseAmountUSD;

    // Apply Coupon discount (if present)
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
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
          expectedAmountUSD = Math.max(0, expectedAmountUSD * (1 - coupon.discount_percent / 100));
        }
      }
    }

    // Fetch daily exchange rates
    const rates = await getExchangeRates();
    const targetCurrency = currency.toUpperCase();
    const exchangeRate = rates[targetCurrency] || 1.0;
    
    // Convert USD base price to target currency
    const convertedAmount = convertUSD(expectedAmountUSD, targetCurrency, rates);
    const expectedAmountRounded = Math.ceil(convertedAmount);

    // Check amount tolerance (within 1 unit of currency due to float rounding)
    if (Math.abs(expectedAmountRounded - amount) > 1.5) {
      return NextResponse.json({ error: `Invalid plan amount. Expected ${targetCurrency} ${expectedAmountRounded}.` }, { status: 400 });
    }

    // Determine Gateway
    const gateway = targetCurrency === 'INR' ? 'razorpay' : 'paypal';

    // Handle Free Activation (100% discount)
    if (expectedAmountUSD === 0) {
      return NextResponse.json({
        id: `free_order_${userId}_${Date.now()}`,
        amount: 0,
        currency: targetCurrency,
        isFree: true,
        planId,
        userId,
        gateway
      });
    }

    if (gateway === 'razorpay') {
      const options = {
        amount: Math.round(expectedAmountRounded * 100), // Convert to paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: String(userId),
          planId
        }
      };

      const order = await razorpay.orders.create(options);
      return NextResponse.json({
        ...order,
        gateway: 'razorpay',
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        baseAmountUSD,
        paidAmount: expectedAmountRounded,
        paidCurrency: 'INR',
        exchangeRate
      });
    } else {
      // PayPal Gateway Initialization
      return NextResponse.json({
        gateway: 'paypal',
        id: `paypal_order_${Date.now()}_${Math.random().toString(36).substring(4, 9)}`,
        amount: expectedAmountRounded,
        currency: targetCurrency,
        baseAmountUSD,
        paidAmount: expectedAmountRounded,
        paidCurrency: targetCurrency,
        exchangeRate
      });
    }
  } catch (error: any) {
    console.error('[PAYMENT_ORDER_CREATE] Error:', error);
    return NextResponse.json({ error: 'Failed to create payment order', details: error.message }, { status: 500 });
  }
}
