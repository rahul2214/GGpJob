import { NextResponse } from 'next/server';
import { firebaseAdminAuth } from '@/lib/firebase-admin';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Check if this user exists in Firebase.
    // If not, silently succeed — never leak whether an email is registered.
    try {
      await firebaseAdminAuth.getUserByEmail(email);
    } catch {
      console.log(`[password-reset] No Firebase user for ${email}, returning success silently.`);
      return NextResponse.json({ success: true });
    }

    // PASSWORD_RESET sendOobCode takes email directly — no idToken needed.
    // (idToken is only required for VERIFY_EMAIL)
    const resetRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email,
        }),
      }
    );

    if (!resetRes.ok) {
      const err = await resetRes.json();
      throw new Error(err?.error?.message || 'Firebase failed to send password reset email.');
    }

    console.log(`[password-reset] Firebase sent password reset email to ${email}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[password-reset] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send password reset email.' }, { status: 500 });
  }
}
