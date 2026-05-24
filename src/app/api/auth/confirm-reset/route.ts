import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function POST(request: Request) {
  try {
    const { oobCode, newPassword } = await request.json();

    if (!oobCode || !newPassword) {
      return NextResponse.json({ error: 'oobCode and newPassword are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // 1. Confirm the password reset in Firebase via REST API — this also returns the email
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode, newPassword }),
      }
    );

    if (!firebaseRes.ok) {
      const err = await firebaseRes.json();
      const msg = err?.error?.message || 'Firebase password reset failed.';
      // Translate Firebase error codes to human-readable
      if (msg === 'EXPIRED_OOB_CODE') {
        return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
      }
      if (msg === 'INVALID_OOB_CODE') {
        return NextResponse.json({ error: 'This reset link is invalid or has already been used.' }, { status: 400 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email } = await firebaseRes.json();

    if (!email) {
      return NextResponse.json({ error: 'Could not identify user from reset code.' }, { status: 400 });
    }

    // 2. Also update the Supabase password so the user can log in normally
    const { data: supaUser, error: lookupErr } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = supaUser?.users?.find((u: any) => u.email === email);

    if (targetUser) {
      await supabaseAdmin.auth.admin.updateUserById(targetUser.id, { password: newPassword });
      console.log(`[confirm-reset] Supabase password updated for ${email}`);
    } else {
      console.warn(`[confirm-reset] No Supabase user found for ${email} — only Firebase was updated.`);
    }

    return NextResponse.json({ success: true, email });

  } catch (error: any) {
    console.error('[confirm-reset] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset password.' }, { status: 500 });
  }
}
