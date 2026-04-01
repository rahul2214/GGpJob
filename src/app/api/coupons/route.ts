import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await auth.getUser(userId);
    if (!['Admin', 'Super Admin'].includes(userRecord.customClaims?.role)) {
       return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const snapshot = await db.collection('coupons').orderBy('createdAt', 'desc').get();
    const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error('[GET_COUPONS]', error);
    return NextResponse.json({ error: 'Failed to fetch coupons.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, code, discountPercent, expiresAt, maxUses, applicablePlan } = data;

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await auth.getUser(userId);
    if (!['Admin', 'Super Admin'].includes(userRecord.customClaims?.role)) {
       return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    if (!code || discountPercent === undefined || !expiresAt || maxUses === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code already exists
    const existing = await db.collection('coupons').where('code', '==', code.toUpperCase().trim()).get();
    if (!existing.empty) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const newCoupon = {
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      expiresAt: new Date(expiresAt).toISOString(),
      maxUses: Number(maxUses),
      currentUses: 0,
      applicablePlan: applicablePlan || 'all',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('coupons').add(newCoupon);

    return NextResponse.json({ success: true, id: docRef.id, ...newCoupon });
  } catch (error: any) {
    console.error('[POST_COUPON]', error);
    return NextResponse.json({ error: 'Failed to create coupon', details: error.message }, { status: 500 });
  }
}
