import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-notifications';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    const { userId, title, body } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields: userId, title, body' }, { status: 400 });
    }

    await sendPushNotification(userId, title, body);

    return NextResponse.json({ success: true, message: 'Push notification triggered' }, { status: 200 });

  } catch (error: any) {
    console.error('[API_NOTIFICATIONS_TEST] Error:', error.message);
    return NextResponse.json({ error: 'Failed to send notification', details: error.message }, { status: 500 });
  }
}
