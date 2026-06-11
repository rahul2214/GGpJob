import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required.' }, { status: 400 });
    }

    const { data: referrer, error: referrerErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, name')
      .eq('referral_code', referralCode.trim())
      .maybeSingle();

    if (referrerErr || !referrer) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code.' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        uuid: referrer.uuid,
        name: referrer.name || 'A JobsDart User',
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API_REFERRAL_VALIDATE] Exception:', error);
    return NextResponse.json({ error: 'Failed to validate referral code.', details: error.message }, { status: 500 });
  }
}
