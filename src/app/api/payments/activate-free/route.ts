import { NextResponse } from 'next/server';
import { db, auth } from '@/firebase/admin-config';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user role
    const userRecord = await auth.getUser(userId);
    const role = userRecord.customClaims?.role;

    if (role !== 'Job Seeker') {
        return NextResponse.json({ error: 'Only Job Seekers can activate the free plan' }, { status: 403 });
    }

    const now = new Date();
    
    // We don't set an expiration for the Free tier to keep it simple, or we can just set it far in the future
    const updateData = {
        isPaid: true,
        planType: 'free',
        lastPaymentAt: now.toISOString(),
    };

    await db.collection('users').doc(userId).update(updateData);

    return NextResponse.json({ success: true, message: `Free plan activated successfully.` }, { status: 200 });
    
  } catch (error: any) {
    console.error('[ACTIVATE_FREE_PLAN] Error:', error);
    return NextResponse.json({ error: 'Failed to activate plan', details: error.message }, { status: 500 });
  }
}
