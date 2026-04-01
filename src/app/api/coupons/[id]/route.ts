import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';

export async function PUT(request: Request, context: any) {
  try {
    const { params } = context;
    const data = await request.json();
    const { userId, discountPercent, expiresAt, maxUses, applicablePlan, isActive } = data;
    const { id } = await params;

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await auth.getUser(userId);
    if (!['Admin', 'Super Admin'].includes(userRecord.customClaims?.role)) {
       return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    if (!id) {
       return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (discountPercent !== undefined) updateData.discountPercent = Number(discountPercent);
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt).toISOString();
    if (maxUses !== undefined) updateData.maxUses = Number(maxUses);
    if (applicablePlan !== undefined) updateData.applicablePlan = applicablePlan;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    updateData.updatedAt = new Date().toISOString();

    await db.collection('coupons').doc(id).update(updateData);

    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error: any) {
    console.error('[PUT_COUPON]', error);
    return NextResponse.json({ error: 'Failed to update coupon', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { params } = context;
    const { id } = await params;

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await auth.getUser(userId);
    if (!['Admin', 'Super Admin'].includes(userRecord.customClaims?.role)) {
       return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    if (!id) {
       return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    await db.collection('coupons').doc(id).delete();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[DELETE_COUPON]', error);
    return NextResponse.json({ error: 'Failed to delete coupon', details: error.message }, { status: 500 });
  }
}
