import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-notifications';

export async function POST(request: Request) {
  try {
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
