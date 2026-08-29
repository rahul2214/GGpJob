import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { referralCode, userUuid } = body;

    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json(
        { error: 'Referral code is required.' },
        { status: 400 }
      );
    }

    if (!userUuid || !userUuid.trim()) {
      return NextResponse.json(
        { error: 'User identifier is required.' },
        { status: 400 }
      );
    }

    const code = referralCode.trim().toUpperCase();

    // 1. Find the referrer
    const { data: referrer, error: referrerErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, name, referral_code, referral_count, purchased_credits')
      .eq('referral_code', code)
      .maybeSingle();

    if (referrerErr || !referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code.' },
        { status: 400 }
      );
    }

    // 2. Find the referee (the current user claiming the code)
    const { data: referee, error: refereeErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, name, email, referred_by, metadata')
      .eq('uuid', userUuid.trim())
      .maybeSingle();

    if (refereeErr || !referee) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    // 3. Self-referral prevention
    if (referrer.id === referee.id || referrer.uuid === referee.uuid) {
      return NextResponse.json(
        { error: 'You cannot use your own referral code.' },
        { status: 400 }
      );
    }

    // 4. Check if user was already referred by someone
    if (referee.referred_by && referee.referred_by !== referrer.id) {
      return NextResponse.json(
        { error: 'A referral code has already been applied to this account.' },
        { status: 400 }
      );
    }

    // 5. Update referee with referred_by
    const { error: updateRefereeErr } = await supabaseAdmin
      .from('jobseekers')
      .update({
        referred_by: referrer.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', referee.id);

    if (updateRefereeErr) {
      console.error('[API_REFERRAL_CLAIM_UPDATE_REFEREE_ERROR]:', updateRefereeErr);
      return NextResponse.json(
        { error: 'Failed to apply referral to profile.' },
        { status: 500 }
      );
    }

    // 6. Check if email is verified in auth.users to award credits now
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(referee.uuid);
    const isEmailConfirmed = Boolean(authUser?.user?.email_confirmed_at);

    if (isEmailConfirmed && !referee.metadata?.referral_rewarded) {
      // 1. Award 2 credits to Referrer
      const { error: rpcError } = await supabaseAdmin.rpc('add_purchased_credits', {
        p_user_id: referrer.id,
        p_amount: 2,
      });

      if (rpcError) {
        // Manual fallback update
        await supabaseAdmin
          .from('jobseekers')
          .update({
            purchased_credits: (referrer.purchased_credits || 0) + 2,
            referral_count: (referrer.referral_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', referrer.id);
      } else {
        await supabaseAdmin
          .from('jobseekers')
          .update({
            referral_count: (referrer.referral_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', referrer.id);
      }

      // 2. Award 2 credits to Referee (the referred user)
      const { error: refereeRpcError } = await supabaseAdmin.rpc('add_purchased_credits', {
        p_user_id: referee.id,
        p_amount: 2,
      });

      if (refereeRpcError) {
        const { data: currentReferee } = await supabaseAdmin
          .from('jobseekers')
          .select('purchased_credits')
          .eq('id', referee.id)
          .single();
        await supabaseAdmin
          .from('jobseekers')
          .update({
            purchased_credits: (currentReferee?.purchased_credits || 0) + 2,
            updated_at: new Date().toISOString(),
          })
          .eq('id', referee.id);
      }

      // 3. Send notifications to both
      await supabaseAdmin.from('notifications').insert([
        {
          user_pk: referrer.id,
          message: `You earned 2 credits for referring ${referee.name || 'a new member'}!`,
          type: 'referral_bonus',
          created_at: new Date().toISOString(),
        },
        {
          user_pk: referee.id,
          message: `You received 2 bonus credits for joining through a referral!`,
          type: 'referral_bonus',
          created_at: new Date().toISOString(),
        }
      ]);

      // 4. Mark metadata as rewarded
      await supabaseAdmin
        .from('jobseekers')
        .update({
          metadata: {
            ...(referee.metadata || {}),
            referral_rewarded: true,
            referral_rewarded_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', referee.id);
    }

    return NextResponse.json({
      success: true,
      message: `Referral code successfully applied! Referred by ${referrer.name || 'member'}.`,
      referrer: {
        id: referrer.id,
        name: referrer.name,
      },
    });
  } catch (err: any) {
    console.error('[API_REFERRAL_CLAIM_EXCEPTION]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while claiming referral.' },
      { status: 500 }
    );
  }
}
