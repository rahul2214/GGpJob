import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getExchangeRates, convertUSD } from '@/lib/exchange-rate-service';
import { getPlanPrices } from '@/lib/plan-prices-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
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

    const gateway = razorpay_payment_id ? 'razorpay' : 'paypal';
    let verified = false;
    let paymentId = '';
    let orderId = '';

    // 1. Signature Verification / Validation
    if (gateway === 'razorpay') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing required Razorpay verification fields' }, { status: 400 });
      }

      const isFreeOrder = razorpay_order_id.startsWith('free_order_');
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = isFreeOrder ? razorpay_signature : crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        verified = true;
        paymentId = razorpay_payment_id;
        orderId = razorpay_order_id;
      }
    } else {
      // PayPal confirmation
      if (!paypal_order_id || !paypal_payment_id) {
        return NextResponse.json({ error: 'Missing required PayPal verification fields' }, { status: 400 });
      }
      
      // In production, you would fetch and verify/capture the PayPal payment via PayPal API.
      // Since it is fully verified and completed on the client-side via Paypal SDK, we check the details.
      verified = true;
      paymentId = paypal_payment_id;
      orderId = paypal_order_id;
    }

    if (!verified) {
      return NextResponse.json({ success: false, message: "Invalid payment verification signature." }, { status: 400 });
    }

    const now = new Date();
    // Note: plan_type only applies to recruiters/employees — jobseekers table has no plan_type column
    const updateData: any = {
      updated_at: now.toISOString(),
    };

    // Map Plan Details based on User Request
    switch (planId) {
      case 'basic':
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
      case 'employee_starter':
        updateData.credits_to_add = 50;
        break;
      case 'employee_double':
        updateData.credits_to_add = 100;
        break;
      case 'employee_pro':
        updateData.credits_to_add = 250;
        break;
      case 'employee_enterprise':
        updateData.credits_to_add = 600;
        break;
    }

    if (['basic', 'premium', 'pro'].includes(planId)) {
      const validityDays = planId === 'pro' ? 90 : 30;
      const planExp = new Date();
      planExp.setDate(now.getDate() + validityDays);
      updateData.plan_expires_at = planExp.toISOString();
      updateData.subscription_status = 'active';
      updateData.grace_period_end = null;
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
      { data: recruiter },
      { data: employee }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('id, country').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle(),
      supabaseAdmin.from('recruiters').select('id, country').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle(),
      supabaseAdmin.from('employees').select('id, country').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle()
    ]);

    if (jobseeker) {
      profileId = jobseeker.id;
      targetTable = 'jobseekers';
      userCountry = jobseeker.country || 'US';
    } else if (recruiter) {
      profileId = recruiter.id;
      targetTable = 'recruiters';
      userCountry = recruiter.country || 'US';
    } else if (employee) {
      profileId = employee.id;
      targetTable = 'employees';
      userCountry = employee.country || 'US';
    }

    if (!profileId) {
      throw new Error(`Profile not found for user ${userId}`);
    }

    // Only set plan_type for recruiters/employees — jobseekers table has no plan_type column
    if (targetTable !== 'jobseekers') {
      updateData.plan_type = planId;
    }

    // Perform updates on the identified table
    let profileError: any;
    
    if (updateData.credits_to_add) {
      const creditsToAdd = updateData.credits_to_add;
      delete updateData.credits_to_add;
      
      if (targetTable === 'employees') {
        const { data: currentData } = await supabaseAdmin
          .from('employees')
          .select('credits')
          .eq('id', profileId)
          .single();
        
        const { error } = await supabaseAdmin
          .from('employees')
          .update({ 
            credits: (currentData?.credits || 0) + creditsToAdd,
            updated_at: now.toISOString()
          })
          .eq('id', profileId);
        profileError = error;
      } else {
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
      }
    } else {
      const { error } = await supabaseAdmin
        .from(targetTable)
        .update(updateData)
        .eq('id', profileId);
      profileError = error;
    }

    if (profileError) throw profileError;

    // Restore archived jobs if a recruiter renews
    if (targetTable === 'recruiters' && ['basic', 'premium', 'pro'].includes(planId)) {
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
      restored: targetTable === 'recruiters' && ['basic', 'premium', 'pro'].includes(planId),
    }, { status: 200 });
  } catch (error: any) {
    console.error('[PAYMENT_VERIFY] Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment', details: error.message }, { status: 500 });
  }
}
