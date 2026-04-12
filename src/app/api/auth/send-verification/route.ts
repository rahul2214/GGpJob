import { NextResponse } from 'next/server';
import { firebaseAdminAuth } from '@/lib/firebase-admin';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobsdart.in';

export async function POST(request: Request) {
  try {
    const { email, name, redirectUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // 1. Find or create the Firebase Auth user
    let firebaseUid: string;
    try {
      const existingUser = await firebaseAdminAuth.getUserByEmail(email);
      firebaseUid = existingUser.uid;
    } catch {
      // User doesn't exist in Firebase — create a stub entry so we can send the verification
      const newUser = await firebaseAdminAuth.createUser({
        email,
        displayName: name || undefined,
        emailVerified: false,
      });
      firebaseUid = newUser.uid;
    }

    // 2. Create a custom token and exchange for an ID token via Firebase REST API
    const customToken = await firebaseAdminAuth.createCustomToken(firebaseUid);

    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );

    if (!signInRes.ok) {
      const err = await signInRes.json();
      console.error('[send-verification] signInWithCustomToken failed:', err);
      return NextResponse.json({ error: 'Failed to authenticate with Firebase.', details: err }, { status: 500 });
    }

    const { idToken } = await signInRes.json();

    // 3. Ask Firebase to send the verification email natively via REST API
    const sendRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'VERIFY_EMAIL',
          idToken,
          // Firebase will use the continue URL you set in your Firebase console 
          // under Authentication > Email Templates > Action URL
        }),
      }
    );

    if (!sendRes.ok) {
      const err = await sendRes.json();
      console.error('[send-verification] sendOobCode failed:', err);
      return NextResponse.json({ error: 'Firebase failed to send verification email.', details: err }, { status: 500 });
    }

    const result = await sendRes.json();
    console.log(`[send-verification] Firebase sent verification email to ${result.email}`);

    return NextResponse.json({ success: true, message: 'Verification email sent via Firebase.' });

  } catch (error: any) {
    console.error('[send-verification] Error:', error);
    return NextResponse.json({ error: 'Internal server error.', details: error.message }, { status: 500 });
  }
}
