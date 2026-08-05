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

    // 2. Locate user's Supabase UUID by checking the user profile tables by email (case-insensitive)
    let targetUuid: string | null = null;

    // Check jobseekers table first, since they are the ones who can be referred
    const { data: jsData } = await supabaseAdmin
      .from('jobseekers')
      .select('uuid')
      .ilike('email', email)
      .maybeSingle();

    if (jsData?.uuid) {
      targetUuid = jsData.uuid;
    } else {
      // Check recruiters
      const { data: recData } = await supabaseAdmin
        .from('recruiters')
        .select('uuid')
        .ilike('email', email)
        .maybeSingle();

      if (recData?.uuid) {
        targetUuid = recData.uuid;
      } else {
        // Check employees
        const { data: empData } = await supabaseAdmin
          .from('employees')
          .select('uuid')
          .ilike('email', email)
          .maybeSingle();

        if (empData?.uuid) {
          targetUuid = empData.uuid;
        } else {
          // Check admins
          const { data: admData } = await supabaseAdmin
            .from('admins')
            .select('uuid')
            .ilike('email', email)
            .maybeSingle();

          if (admData?.uuid) {
            targetUuid = admData.uuid;
          }
        }
      }
    }

    // Fallback: If not found in the profile tables, page through auth.users
    if (!targetUuid) {
      console.log(`[confirm-email] User not found in DB tables. Falling back to listUsers paging for email: ${email}`);
      let page = 1;
      const perPage = 100;
      let hasMore = true;
      while (hasMore) {
        const { data: supaUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });
        if (listError || !supaUsers?.users || supaUsers.users.length === 0) {
          break;
        }
        const found = supaUsers.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (found) {
          targetUuid = found.id;
          break;
        }
        if (supaUsers.users.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    if (targetUuid) {
      await supabaseAdmin.auth.admin.updateUserById(targetUuid, {
        email_confirm: true,
      });
      console.log(`[confirm-email] Supabase email confirmed for ${email} using uuid ${targetUuid}`);

      // Reward referrer if this user was referred and not yet rewarded
      try {
        const { data: jobseeker } = await supabaseAdmin
          .from('jobseekers')
          .select('id, name, referred_by, metadata')
          .eq('uuid', targetUuid)
          .maybeSingle();

        if (jobseeker && jobseeker.referred_by && !jobseeker.metadata?.referral_rewarded) {
          const { data: referrer } = await supabaseAdmin
            .from('jobseekers')
            .select('id, referral_count')
            .eq('id', jobseeker.referred_by)
            .maybeSingle();

          if (referrer) {
            // 1. Award 2 credits to referrer
            const { error: rpcError } = await supabaseAdmin.rpc('add_purchased_credits', {
              p_user_id: referrer.id,
              p_amount: 2,
            });

            if (rpcError) {
              console.error('[confirm-email] RPC add_purchased_credits failed, performing manual fallback:', rpcError);
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

            // 2. Send notification to referrer
            await supabaseAdmin.from('notifications').insert({
              user_pk: referrer.id,
              message: `You earned 2 credits for referring ${jobseeker.name || 'a new user'} (now verified)!`,
              type: 'referral_bonus',
              created_at: new Date().toISOString(),
            });

            // 3. Increment referral_count
            const newCount = (referrer.referral_count || 0) + 1;
            await supabaseAdmin
              .from('jobseekers')
              .update({ referral_count: newCount })
              .eq('id', referrer.id);

            // 4. Mark referral as rewarded on the referred user
            const updatedMetadata = {
              ...(jobseeker.metadata || {}),
              referral_rewarded: true,
            };
            await supabaseAdmin
              .from('jobseekers')
              .update({ metadata: updatedMetadata })
              .eq('id', jobseeker.id);
            
            console.log(`[confirm-email] Referral rewarded successfully for user ${jobseeker.name} (referrer ID: ${referrer.id})`);
          }
        }
      } catch (rewardErr) {
        console.error('[confirm-email] Error processing referrer rewards:', rewardErr);
      }
    } else {
      console.warn(`[confirm-email] No Supabase user found for ${email}.`);
    }

    return NextResponse.json({ success: true, email });

  } catch (error: any) {
    console.error('[confirm-email] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to confirm email.' }, { status: 500 });
  }
}
