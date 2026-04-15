import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId, couponCode } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planId) {
        return NextResponse.json({ error: 'Missing required verification fields' }, { status: 400 });
    }

    const isFreeOrder = razorpay_order_id.startsWith('free_order_');
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = isFreeOrder ? razorpay_signature : crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Signature verified

      const now = new Date();
      const updateData: any = {
          is_paid: true,
          plan_type: planId,
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
              // Premium includes 1 month Talent Search
              const premTalentExp = new Date();
              premTalentExp.setDate(now.getDate() + 30);
              updateData.talent_search_expires_at = premTalentExp.toISOString();
              break;
              
          case 'pro':
              updateData.job_post_limit = 50;
              updateData.job_post_validity = 90;
              updateData.app_access_days = 180;
              updateData.max_applies_limit = -1; // Unlimited
              updateData.is_verified = true;
              // Pro includes full Talent Search (e.g., 90 days)
              const proTalentExp = new Date();
              proTalentExp.setDate(now.getDate() + 90);
              updateData.talent_search_expires_at = proTalentExp.toISOString();
              break;
              
          case 'talent':
              // Talent Search plan only extends database access
              const talentExp = new Date();
              talentExp.setDate(now.getDate() + 30);
              updateData.talent_search_expires_at = talentExp.toISOString();
              break;
              
          case 'jobseeker_premium':
              const jsExpiration = new Date();
              jsExpiration.setMonth(jsExpiration.getMonth() + 4);
              updateData.plan_expires_at = jsExpiration.toISOString();
              break;
      }

      // Add plan expiry date for all recruiter plans
      if (['basic', 'premium', 'pro'].includes(planId)) {
        const validityDays = planId === 'pro' ? 90 : 30;
        const planExp = new Date();
        planExp.setDate(now.getDate() + validityDays);
        updateData.plan_expires_at = planExp.toISOString();
      }

      let finalAmount = 0;
      const basePrices: Record<string, number> = {
          'basic': 199,
          'premium': 1499,
          'pro': 4999,
          'talent': 499,
          'jobseeker_premium': 199
      };
      
      finalAmount = basePrices[planId] || 0;
      let appliedCouponCode = null;

      if (couponCode) {
         const { data: coupon, error: couponError } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase().trim())
            .maybeSingle();

         if (coupon) {
             const isValid = coupon.applicable_plan === 'all' || coupon.applicable_plan === planId || !coupon.applicable_plan;
             if (isValid) {
                 finalAmount = Math.max(0, Math.round(finalAmount * (1 - coupon.discount_percent / 100)));
                 appliedCouponCode = coupon.code;
                 
                 // Increment coupon usage
                 await supabaseAdmin.rpc('increment_coupon_usage', { coupon_code: coupon.code });
                 // NOTE: If RPC is not preferred, we could do 
                 // await supabaseAdmin.from('coupons').update({ current_uses: coupon.current_uses + 1 }).eq('id', coupon.id);
             }
         }
      }

      // 1. Identify the user table dynamically using standardized ID resolution
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      const lookupField = isUUID ? 'uuid' : 'id';
      const lookupId = isUUID ? userId : parseInt(userId, 10);

      let targetTable = 'jobseekers';
      let profileId = userId; // Default fallback to input userId
      
      const { data: jobseeker } = await supabaseAdmin
          .from('jobseekers')
          .select('id')
          .eq(lookupField, lookupId)
          .maybeSingle();
      
      if (jobseeker) {
          profileId = jobseeker.id;
      } else {
          const { data: recruiter } = await supabaseAdmin
              .from('recruiters')
              .select('id')
              .eq(lookupField, lookupId)
              .maybeSingle();
          if (recruiter) {
              targetTable = 'recruiters';
              profileId = recruiter.id;
          } else {
              const { data: employee } = await supabaseAdmin
                  .from('employees')
                  .select('id')
                  .eq(lookupField, lookupId)
                  .maybeSingle();
              if (employee) {
                  targetTable = 'employees';
                  profileId = employee.id;
              }
          }
      }

      console.log(`[PAYMENT_VERIFY] Updating plan for user ${userId} in table ${targetTable}`);

      // Perform transaction updates on the identified table
      const { error: profileError } = await supabaseAdmin
          .from(targetTable)
          .update(updateData)
          .eq('id', profileId); // Using the ID we found earlier

      if (profileError) throw profileError;

      // Record the transaction
      const { error: paymentError } = await supabaseAdmin
          .from('payments')
          .insert([{
              user_id: userId,
              order_id: razorpay_order_id,
              payment_id: razorpay_payment_id,
              amount: finalAmount,
              plan_id: planId,
              coupon_code: appliedCouponCode,
              timestamp: now.toISOString()
          }]);

      if (paymentError) throw paymentError;

      return NextResponse.json({ success: true, message: `Payment verified. ${planId} plan is now active.` }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Invalid payment signature." }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[PAYMENT_VERIFY] Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment', details: error.message }, { status: 500 });
  }
}
