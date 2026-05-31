import { NextResponse } from 'next/server';
import { sendFirebaseVerificationEmail } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, name, redirectUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await sendFirebaseVerificationEmail(email, name, redirectUrl);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent.' 
    });

  } catch (error: any) {
    console.error('[send-verification] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to send verification email.', 
      details: error.message 
    }, { status: 500 });
  }
}
