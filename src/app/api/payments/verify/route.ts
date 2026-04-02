import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, auth } from '@/firebase/admin-config';

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
      const userRecord = await auth.getUser(userId);
      const role = userRecord.customClaims?.role;

      let collectionName = 'recruiters';
      if (role === 'Employee') collectionName = 'employees';
      else if (role === 'Job Seeker') collectionName = 'users';
      else if (role !== 'Recruiter') {
          return NextResponse.json({ error: 'Invalid user role for payment' }, { status: 403 });
      }

      const now = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(now.getDate() + 30); // 1-month validity for all plans
      const isoExpiration = expirationDate.toISOString();

      const updateData: any = {
          isPaid: true,
          planType: planId,
          lastPaymentAt: now.toISOString(),
          paymentHistory: (await db.collection(collectionName).doc(userId).get()).data()?.paymentHistory || []
      };

      // Handle specific plan effects
      if (planId === 'basic' || planId === 'premium' || planId === 'pro') {
          const validityDays = planId === 'pro' ? 90 : 30;
          const proExpiration = new Date();
          proExpiration.setDate(now.getDate() + validityDays);
          updateData.planExpiresAt = proExpiration.toISOString();
      }
      
      if (planId === 'talent' || planId === 'premium' || planId === 'pro') {
          const talentDays = planId === 'pro' ? 90 : 30;
          const talentExp = new Date();
          talentExp.setDate(now.getDate() + talentDays);
          updateData.talentSearchExpiresAt = talentExp.toISOString();
      }

      if (planId === 'jobseeker_premium') {
          const jsExpiration = new Date();
          jsExpiration.setMonth(jsExpiration.getMonth() + 4);
          updateData.planExpiresAt = jsExpiration.toISOString();
      }

      let finalAmount = planId === 'jobseeker_premium' ? 199 : 
                        (planId === 'basic' ? 199 : 
                         planId === 'premium' ? 1499 : 
                         planId === 'pro' ? 4999 : 499);
      let appliedCouponString = undefined;

      if (couponCode) {
         const snapshot = await db.collection('coupons')
                                  .where('code', '==', couponCode.toUpperCase().trim())
                                  .get();
         if (!snapshot.empty) {
             const couponDoc = snapshot.docs[0];
             const coupon = couponDoc.data();
             const isValid = coupon.applicablePlan === 'all' || coupon.applicablePlan === planId || !coupon.applicablePlan;
             
             if (isValid) {
                 finalAmount = Math.max(0, Math.round(finalAmount * (1 - coupon.discountPercent / 100)));
                 appliedCouponString = coupon.code;
                 
                 // Increment coupon usage natively
                 await db.collection('coupons').doc(couponDoc.id).update({
                     currentUses: coupon.currentUses + 1
                 });
             }
         }
      }

      // Record the transaction
      updateData.paymentHistory.push({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: finalAmount,
          planId: planId,
          couponCode: appliedCouponString,
          timestamp: now.toISOString()
      });

      await db.collection(collectionName).doc(userId).update(updateData);

      return NextResponse.json({ success: true, message: `Payment verified. ${planId} plan is now active.` }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Invalid payment signature." }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[PAYMENT_VERIFY] Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment', details: error.message }, { status: 500 });
  }
}
