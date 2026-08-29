import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const referralCode = body.referralCode || body.code;

    if (!referralCode || typeof referralCode !== 'string' || !referralCode.trim()) {
      return NextResponse.json(
        { error: 'Referral code is required.' },
        { status: 400 }
      );
    }

    const code = referralCode.trim().toUpperCase();

    // Query jobseekers table for the referral code
    const { data: referrer, error } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, name, referral_code, referral_count')
      .eq('referral_code', code)
      .maybeSingle();

    if (error) {
      console.error('[API_REFERRAL_VALIDATE_ERROR]:', error);
      return NextResponse.json(
        { error: 'Failed to validate referral code.' },
        { status: 500 }
      );
    }

    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code. Please check and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        uuid: referrer.uuid,
        name: referrer.name || 'JobsDart Member',
        referralCode: referrer.referral_code,
      },
    });
  } catch (err: any) {
    console.error('[API_REFERRAL_VALIDATE_EXCEPTION]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const referralCode = searchParams.get('code') || searchParams.get('referralCode');

  if (!referralCode || !referralCode.trim()) {
    return NextResponse.json(
      { error: 'Referral code query parameter is required.' },
      { status: 400 }
    );
  }

  const code = referralCode.trim().toUpperCase();

  const { data: referrer, error } = await supabaseAdmin
    .from('jobseekers')
    .select('id, uuid, name, referral_code, referral_count')
    .eq('referral_code', code)
    .maybeSingle();

  if (error || !referrer) {
    return NextResponse.json(
      { error: 'Invalid referral code.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    referrer: {
      id: referrer.id,
      uuid: referrer.uuid,
      name: referrer.name || 'JobsDart Member',
      referralCode: referrer.referral_code,
    },
  });
}
