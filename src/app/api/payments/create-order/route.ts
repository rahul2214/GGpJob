import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth, db } from '@/firebase/admin-config';

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

    // Get user from auth to check role
    const userRecord = await auth.getUser(userId);
    const role = userRecord.customClaims?.role;

    if (role !== 'Recruiter' && role !== 'Employee' && role !== 'Job Seeker') {
      return NextResponse.json({ error: 'Only authorized users can purchase plans.' }, { status: 403 });
    }

    // Validate amount based on planId (Backend Security)
    const validPlans: Record<string, number> = {
        'basic': 199,
        'premium': 1499,
        'talent': 499,
        'jobseeker_premium': 199
    };

    let baseAmount = validPlans[planId];
    if (baseAmount === undefined) {
         return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    let expectedAmount = baseAmount;
    
    // Apply server-side coupon validation directly before transaction creation
    if (couponCode) {
         const snapshot = await db.collection('coupons')
                                  .where('code', '==', couponCode.toUpperCase().trim())
                                  .get();
         if (!snapshot.empty) {
             const coupon = snapshot.docs[0].data();
             const isValid = new Date(coupon.expiresAt) >= new Date() && 
                             coupon.currentUses < coupon.maxUses && 
                             coupon.isActive &&
                             (coupon.applicablePlan === 'all' || coupon.applicablePlan === planId || !coupon.applicablePlan);
             
             if (isValid) {
                 expectedAmount = Math.max(0, Math.round(baseAmount * (1 - coupon.discountPercent / 100)));
             }
         }
    }

    if (expectedAmount !== amount) {
        return NextResponse.json({ error: `Invalid plan amount. Expected ₹${expectedAmount}.` }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${planId}_${userId}_${Date.now()}`,
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
