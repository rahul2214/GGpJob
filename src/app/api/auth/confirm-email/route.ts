import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function POST(request: Request) {
  try {
    const { oobCode } = await request.json();

    if (!oobCode) {
      return NextResponse.json({ error: 'oobCode is required.' }, { status: 400 });
    }

    // 1. Confirm email verification in Firebase via REST API
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode }),
      }
    );

    if (!firebaseRes.ok) {
      const err = await firebaseRes.json();
      const msg = err?.error?.message || 'Firebase email verification failed.';
      if (msg === 'EXPIRED_OOB_CODE') {
        return NextResponse.json({ error: 'This verification link has expired. Please request a new one.' }, { status: 400 });
      }
      if (msg === 'INVALID_OOB_CODE') {
        return NextResponse.json({ error: 'This verification link is invalid or has already been used.' }, { status: 400 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email } = await firebaseRes.json();

    if (!email) {
      return NextResponse.json({ error: 'Could not identify user from verification code.' }, { status: 400 });
    }

    // 2. Also mark the email as confirmed in Supabase so the user can log in
    const { data: supaUser } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = supaUser?.users?.find((u) => u.email === email);

    if (targetUser) {
      await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email_confirm: true,
      });
      console.log(`[confirm-email] Supabase email confirmed for ${email}`);
    } else {
      console.warn(`[confirm-email] No Supabase user found for ${email}.`);
    }

    return NextResponse.json({ success: true, email });

  } catch (error: any) {
    console.error('[confirm-email] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to confirm email.' }, { status: 500 });
  }
}
