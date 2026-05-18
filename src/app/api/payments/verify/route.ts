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
              const jsPremExp = new Date();
              jsPremExp.setMonth(jsPremExp.getMonth() + 4); // 4 Months
              updateData.plan_expires_at = jsPremExp.toISOString();
              updateData.subscription_allowance = 20;
              updateData.subscription_credits = 20;
              const nextResetPrem = new Date();
              nextResetPrem.setMonth(nextResetPrem.getMonth() + 1);
              updateData.next_credit_reset_at = nextResetPrem.toISOString();
              break;
              
          case 'free':
              const freeExp = new Date();
              freeExp.setFullYear(freeExp.getFullYear() + 5); // 5 years validity for free tier
              updateData.plan_expires_at = freeExp.toISOString();
              updateData.subscription_allowance = 2;
              updateData.subscription_credits = 2;
              const nextResetFree = new Date();
              nextResetFree.setMonth(nextResetFree.getMonth() + 1);
              updateData.next_credit_reset_at = nextResetFree.toISOString();
              break;
              
          case 'jobseeker_pro':
              const jsProExp = new Date();
              jsProExp.setFullYear(jsProExp.getFullYear() + 1); // 1 Year
              updateData.plan_expires_at = jsProExp.toISOString();
              updateData.subscription_allowance = 60;
              updateData.subscription_credits = 60;
              const nextResetPro = new Date();
              nextResetPro.setMonth(nextResetPro.getMonth() + 1);
              updateData.next_credit_reset_at = nextResetPro.toISOString();
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
          'jobseeker_premium': 499,
          'jobseeker_pro': 999,
          'mini': 149,
          'basic_pack': 299,
          'popular_pack': 549,
          'pro_pack': 1299
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
                 
                  // Increment coupon usage directly for better visibility and reliability
                  const { error: usageError } = await supabaseAdmin
                    .from('coupons')
                    .update({ current_uses: (coupon.current_uses || 0) + 1 })
                    .eq('id', coupon.id);
                  
                  if (usageError) {
                    console.error('[PAYMENT_VERIFY] Failed to increment coupon usage:', usageError);
                  }
              }
         }
      }

      // 1. Identify the user table dynamically using standardized ID resolution
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      
      // We first try to find the user in any of the potential roles
      let targetTable = 'jobseekers';
      let profileId: string | number | null = null;
      
      // Try Jobseekers first
      const { data: jobseeker } = await supabaseAdmin
          .from('jobseekers')
          .select('id')
          .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
          .maybeSingle();
      
      if (jobseeker) {
          profileId = jobseeker.id;
          targetTable = 'jobseekers';
      } else {
          // Try Recruiters
          const { data: recruiter } = await supabaseAdmin
              .from('recruiters')
              .select('id')
              .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
              .maybeSingle();
          if (recruiter) {
              targetTable = 'recruiters';
              profileId = recruiter.id;
          } else {
              // Try Employees
              const { data: employee } = await supabaseAdmin
                  .from('employees')
                  .select('id')
                  .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
                  .maybeSingle();
              if (employee) {
                  targetTable = 'employees';
                  profileId = employee.id;
              }
          }
      }

      if (!profileId) {
          throw new Error(`Profile not found for user ${userId}`);
      }

      console.log(`[PAYMENT_VERIFY] Updating plan for user ${userId} (ID: ${profileId}) in table ${targetTable}`);

      // Perform updates on the identified table
      let profileError: any;
      
      if (updateData.credits_to_add) {
          const creditsToAdd = updateData.credits_to_add;
          delete updateData.credits_to_add;
          
          // Use the new dual-credit atomic function
          const { error } = await supabaseAdmin.rpc('add_purchased_credits', { 
              p_user_id: profileId, 
              p_amount: creditsToAdd 
          });
          
          if (error) {
              console.error('[PAYMENT_VERIFY] RPC add_purchased_credits failed, falling back to manual update:', error);
              // Fallback: Get current credits and add
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
          const { error } = await supabaseAdmin
              .from(targetTable)
              .update(updateData)
              .eq('id', profileId);
          profileError = error;
      }

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
