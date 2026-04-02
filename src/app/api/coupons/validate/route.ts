import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function POST(request: Request) {
  try {
    const { code, planId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const snapshot = await db.collection('coupons')
                             .where('code', '==', code.toUpperCase().trim())
                             .get();

    if (snapshot.empty) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    const coupon = snapshot.docs[0].data();
    
    // Validate Expiration
    if (new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 });
    }

    // Validate Usage Limits
    if (coupon.currentUses >= coupon.maxUses) {
        return NextResponse.json({ error: 'Coupon code usage limit reached' }, { status: 400 });
    }

    // Validate Active Status
    if (!coupon.isActive) {
         return NextResponse.json({ error: 'Coupon code is no longer active' }, { status: 400 });
    }

    // Validate Applicable Plan
    if (coupon.applicablePlan && coupon.applicablePlan !== 'all' && coupon.applicablePlan !== planId) {
         const planNames: Record<string, string> = {
             'basic': 'Basic Plan',
             'premium': 'Premium Plan',
             'pro': 'Pro Recruitment',
             'talent': 'Talent Search',
             'jobseeker_premium': 'Job Seeker Premium'
         };
         return NextResponse.json({ 
             error: `This coupon is only valid for the ${planNames[coupon.applicablePlan] || 'specified'} plan.` 
         }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true, 
        discountPercent: coupon.discountPercent,
        code: coupon.code
    }, { status: 200 });

  } catch (error: any) {
    console.error('[VALIDATE_COUPON]', error);
    return NextResponse.json({ error: 'Failed to validate coupon', details: error.message }, { status: 500 });
  }
}
