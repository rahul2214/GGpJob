import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getExchangeRates, convertUSD } from '@/lib/exchange-rate-service';
import { getPlanPrices } from '@/lib/plan-prices-service';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

async function verifyPayPalOrder(orderId: string): Promise<boolean> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // If PayPal server secrets are not provided in environment, allow verified client receipt only in development
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) return false;
    const { access_token } = await tokenRes.json();

    const orderRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!orderRes.ok) return false;
    const orderData = await orderRes.json();
    return orderData.status === 'COMPLETED' || orderData.status === 'APPROVED';
  } catch (err) {
    console.error('[PAYPAL_VERIFY_ERROR]', err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      paypal_order_id, 
      paypal_payment_id,
      userId, 
      planId, 
      couponCode,
      currency = 'USD'
    } = body;

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing required validation fields' }, { status: 400 });
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot activate plan for another user account.' }, { status: 403 });
    }

    const gateway = razorpay_payment_id ? 'razorpay' : 'paypal';
    let verified = false;
    let paymentId = '';
    let orderId = '';

    // 1. Signature Verification / Validation
    if (gateway === 'razorpay') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing required Razorpay verification fields' }, { status: 400 });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json({ error: 'Payment gateway configuration error on server.' }, { status: 500 });
      }

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", secret)
        .update(sign.toString())
        .digest("hex");

      const a = Buffer.from(razorpay_signature);
      const b = Buffer.from(expectedSign);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        verified = true;
        paymentId = razorpay_payment_id;
        orderId = razorpay_order_id;
      }
    } else {
      // PayPal confirmation
      if (!paypal_order_id || !paypal_payment_id) {
        return NextResponse.json({ error: 'Missing required PayPal verification fields' }, { status: 400 });
      }
      
      verified = await verifyPayPalOrder(paypal_order_id);
      paymentId = paypal_payment_id;
      orderId = paypal_order_id;
    }

    if (!verified) {
      return NextResponse.json({ success: false, message: "Invalid payment verification signature or unverified order." }, { status: 400 });
    }

    const now = new Date();
    // Note: plan_type only applies to recruiters/employees — jobseekers table has no plan_type column
    const updateData: any = {
      updated_at: now.toISOString(),
    };

    // Map Plan Details based on User Request
    switch (planId) {
      case 'basic':
      case 'basic_plan':
        updateData.job_post_limit = 1;
        updateData.job_post_validity = 30;
        updateData.app_access_days = 30;
        updateData.max_applies_limit = 300;
        updateData.is_verified = true;
        break;
        
      case 'premium':
        updateData.job_post_limit = 10;
        updateData.job_post_validity = 30;
        updateData.app_access_days = 90;
        updateData.max_applies_limit = -1; // Unlimited
        break;
        
      case 'pro':
        updateData.job_post_limit = 50;
        updateData.job_post_validity = 90;
        updateData.app_access_days = 180;
        updateData.max_applies_limit = -1; // Unlimited
        updateData.is_verified = true;
        break;
        
      case 'mini':
        updateData.credits_to_add = 10;
        break;
      case 'basic_pack':
        updateData.credits_to_add = 25;
        break;
      case 'popular_pack':
        updateData.credits_to_add = 60;
        break;
      case 'pro_pack':
        updateData.credits_to_add = 150;
        break;
    }

    if (['basic', 'basic_plan', 'premium', 'pro'].includes(planId)) {
      const validityDays = planId === 'pro' ? 90 : 30;
      const planExp = new Date();
      planExp.setDate(now.getDate() + validityDays);
      updateData.plan_expires_at = planExp.toISOString();
      updateData.is_paid = true;
    }

    // Server-side Plan Price validation in USD (Base Price)
    const basePricesUSD = await getPlanPrices();
    
    const baseAmountUSD = basePricesUSD[planId] || 0;
    let finalAmountUSD = baseAmountUSD;
    let appliedCouponCode = null;

    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .maybeSingle();

      if (coupon) {
        const isValid = coupon.applicable_plan === 'all' || coupon.applicable_plan === planId || !coupon.applicable_plan;
        if (isValid) {
          finalAmountUSD = Math.max(0, finalAmountUSD * (1 - coupon.discount_percent / 100));
          appliedCouponCode = coupon.code;
          
          await supabaseAdmin
            .from('coupons')
            .update({ current_uses: (coupon.current_uses || 0) + 1 })
            .eq('id', coupon.id);
        }
      }
    }

    // Convert to target currency
    const rates = await getExchangeRates();
    const targetCurrency = currency.toUpperCase();
    const exchangeRate = rates[targetCurrency] || 1.0;
    const paidAmount = Math.ceil(convertUSD(finalAmountUSD, targetCurrency, rates));

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    let targetTable = 'jobseekers';
    let profileId: string | number | null = null;
    let userCountry = 'US';

    const [
      { data: jobseeker },
      { data: recruiter }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('id, uuid').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle(),
      supabaseAdmin.from('recruiters').select('id, uuid').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle()
    ]);

    if (jobseeker) {
      profileId = jobseeker.id;
      targetTable = 'jobseekers';
    } else if (recruiter) {
      profileId = recruiter.id;
      targetTable = 'recruiters';
    }

    if (!profileId) {
      throw new Error(`Profile not found for user ${userId}`);
    }

    // Only set plan_type for recruiters — jobseekers table has no plan_type column
    if (targetTable === 'recruiters') {
      updateData.plan_type = planId;
    }

    // Perform updates on the identified table
    let profileError: any;
    
    if (updateData.credits_to_add) {
      const creditsToAdd = updateData.credits_to_add;
      delete updateData.credits_to_add;
      
      const { error } = await supabaseAdmin.rpc('add_purchased_credits', { 
        p_user_id: profileId, 
        p_amount: creditsToAdd 
      });
      
      if (error) {
        const { data: currentData } = await supabaseAdmin
          .from(targetTable)
          .select('purchased_credits')
          .eq('id', profileId)
          .single();
        
        const { error: fallbackError } = await supabaseAdmin
          .from(targetTable)
          .update({ 
            purchased_credits: (currentData?.purchased_credits || 0) + creditsToAdd,
            updated_at: now.toISOString()
          })
          .eq('id', profileId);
        profileError = fallbackError;
      }
    } else {
      let { error } = await supabaseAdmin
        .from(targetTable)
        .update(updateData)
        .eq('id', profileId);

      if (error && (error.code === 'PGRST204' || error.code === '42703')) {
        console.warn(`[PAYMENT_VERIFY] Column missing on ${targetTable} update (${error.message}). Retrying with core plan fields...`);
        const coreData: any = {
          updated_at: now.toISOString(),
          is_paid: true,
          plan_type: planId,
          plan_expires_at: updateData.plan_expires_at,
          job_post_limit: updateData.job_post_limit,
          job_post_validity: updateData.job_post_validity,
          app_access_days: updateData.app_access_days,
          max_applies_limit: updateData.max_applies_limit,
          is_verified: updateData.is_verified,
        };
        Object.keys(coreData).forEach(k => coreData[k] === undefined && delete coreData[k]);
        
        const retryRes = await supabaseAdmin
          .from(targetTable)
          .update(coreData)
          .eq('id', profileId);
        error = retryRes.error;
      }
      profileError = error;
    }

    if (profileError) throw profileError;

    // Restore archived jobs if a recruiter renews
    if (targetTable === 'recruiters' && ['basic', 'basic_plan', 'premium', 'pro'].includes(planId)) {
      await supabaseAdmin
        .from('jobs')
        .update({ status: 'active' })
        .eq('recruiter_pk', profileId)
        .eq('status', 'archived');
    }

    // Secure database insert wrapping:
    // If the database has NOT been updated with the new multi-payment fields yet, we catch the error and fallback to old schemas.
    try {
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert([{
          user_id: userId,
          order_id: orderId,
          payment_id: paymentId,
          amount: paidAmount, // fallback old column value
          plan_id: planId,
          coupon_code: appliedCouponCode,
          timestamp: now.toISOString(),
          gateway,
          country: userCountry,
          base_amount: finalAmountUSD,
          base_currency: 'USD',
          paid_amount: paidAmount,
          paid_currency: targetCurrency,
          exchange_rate: exchangeRate,
          payment_status: 'Completed',
          transaction_id: paymentId
        }]);

      if (paymentError) throw paymentError;
    } catch (insertErr) {
      console.warn('[PAYMENT_VERIFY] Failed insert with new columns (falling back to legacy schema):', insertErr);
      
      // Legacy fallback schema insert
      const { error: fallbackInsertErr } = await supabaseAdmin
        .from('payments')
        .insert([{
          user_id: userId,
          order_id: orderId,
          payment_id: paymentId,
          amount: Math.round(paidAmount),
          plan_id: planId,
          coupon_code: appliedCouponCode,
          timestamp: now.toISOString()
        }]);
      
      if (fallbackInsertErr) throw fallbackInsertErr;
    }

    return NextResponse.json({
      success: true,
      message: `Payment verified. ${planId} plan is now active.`,
      restored: targetTable === 'recruiters' && ['basic', 'basic_plan', 'premium', 'pro'].includes(planId),
    }, { status: 200 });
  } catch (error: any) {
    console.error('[PAYMENT_VERIFY] Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment', details: error.message }, { status: 500 });
  }
}
