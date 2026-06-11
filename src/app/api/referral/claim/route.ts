import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { referralCode, userUuid } = await request.json();

    if (!referralCode || !userUuid) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // 1. Fetch the referred user
    const { data: newUser, error: newUserErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, name, referred_by, created_at')
      .eq('uuid', userUuid)
      .maybeSingle();

    if (newUserErr || !newUser) {
      return NextResponse.json({ error: 'Referred user profile not found.' }, { status: 404 });
    }

    // Check if referral has already been claimed (using column referred_by)
    if (newUser.referred_by) {
      return NextResponse.json({ error: 'Referral already claimed.' }, { status: 400 });
    }

    // 2. Fetch the referrer user using the referral_code column
    const { data: referrer, error: referrerErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id, uuid, name, plan_type, is_paid, referral_count')
      .eq('referral_code', referralCode.trim())
      .maybeSingle();

    if (referrerErr || !referrer) {
      return NextResponse.json({ error: 'Invalid referral code.' }, { status: 404 });
    }

    // Prevent self-referral
    if (referrer.uuid === userUuid) {
      return NextResponse.json({ error: 'You cannot refer yourself.' }, { status: 400 });
    }

    // 3. Update the referred user's referred_by column
    const { error: updateNewUserErr } = await supabaseAdmin
      .from('jobseekers')
      .update({ referred_by: referrer.id })
      .eq('uuid', userUuid);

    if (updateNewUserErr) {
      console.error('[REFERRAL_CLAIM] Failed to update referred_by column:', updateNewUserErr);
      return NextResponse.json({ error: 'Failed to claim referral.' }, { status: 500 });
    }

    // 4. Award 2 credits to the referrer
    const { error: rpcError } = await supabaseAdmin.rpc('add_purchased_credits', {
      p_user_id: referrer.id,
      p_amount: 2,
    });

    if (rpcError) {
      console.error('[REFERRAL_CLAIM] RPC add_purchased_credits failed, performing manual fallback:', rpcError);
      
      // Fallback: manual update of purchased_credits
      const { data: currentReferrer } = await supabaseAdmin
        .from('jobseekers')
        .select('purchased_credits')
        .eq('id', referrer.id)
        .single();
      
      await supabaseAdmin
        .from('jobseekers')
        .update({
          purchased_credits: (currentReferrer?.purchased_credits || 0) + 2,
          updated_at: new Date().toISOString(),
        })
        .eq('id', referrer.id);
    }

    // Send a system notification to the referrer about the 2 credits bonus
    await supabaseAdmin.from('notifications').insert({
      user_pk: referrer.id,
      message: `You earned 2 credits for referring ${newUser.name || 'a new user'}!`,
      type: 'referral_bonus',
      created_at: new Date().toISOString(),
    });

    // 5. Increment the referrer's referral_count column
    const newCount = (referrer.referral_count || 0) + 1;
    const { error: updateReferrerErr } = await supabaseAdmin
      .from('jobseekers')
      .update({ referral_count: newCount })
      .eq('id', referrer.id);

    if (updateReferrerErr) {
      console.error('[REFERRAL_CLAIM] Failed to update referrer referral_count:', updateReferrerErr);
    }



    return NextResponse.json({
      success: true,
      message: 'Referral claimed successfully. Referrer rewarded.',
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API_REFERRAL_CLAIM] Exception:', error);
    return NextResponse.json({ error: 'Failed to process referral claim.', details: error.message }, { status: 500 });
  }
}
