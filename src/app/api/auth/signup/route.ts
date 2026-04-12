import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DISALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'mail.com', 'aol.com', 'zoho.com', 'yandex.com',
  'protonmail.com', 'gmx.com', 'lycos.com',
];

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Validate corporate email for Recruiters
    if (role === 'Recruiter') {
      const domain = email.split('@')[1]?.toLowerCase();
      if (DISALLOWED_DOMAINS.includes(domain)) {
        return NextResponse.json({
          error: 'Recruiters must use a corporate email address (Gmail/Yahoo etc. are not allowed).',
        }, { status: 400 });
      }
    }

    // ✅ Use Admin API to create user — this does NOT trigger Supabase's own verification email
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Do not auto-confirm; Firebase will send the verification
      user_metadata: {
        name,
        role,
        phone: phone ? `+91${phone}` : undefined,
      },
    });

    if (createError) {
      // Handle duplicate email gracefully
      if (createError.message?.toLowerCase().includes('already registered') ||
          createError.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      throw createError;
    }

    // Trigger Firebase email verification (non-blocking — don't fail signup if this fails)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const redirectUrl = role === 'Job Seeker'
        ? `${process.env.NEXT_PUBLIC_APP_URL || baseUrl}/login`
        : `${process.env.NEXT_PUBLIC_APP_URL || baseUrl}/company/login`;

      await fetch(`${baseUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, redirectUrl }),
      });
    } catch (emailErr) {
      console.error('[signup] Firebase verification email failed (non-fatal):', emailErr);
    }

    return NextResponse.json(
      { success: true, message: 'Account created. Verification email sent via Firebase.' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[API_SIGNUP] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create account.' }, { status: 500 });
  }
}
