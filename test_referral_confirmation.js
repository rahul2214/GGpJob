const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testConfirmFlow() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Referrer ID (Rahul Naik, id: 30)
    const referrerId = 30;
    
    // Check initial referrer count
    const { data: beforeReferrer } = await supabase
        .from('jobseekers')
        .select('referral_count, purchased_credits')
        .eq('id', referrerId)
        .single();
    
    console.log("Referrer BEFORE confirmation:", beforeReferrer);
    
    // 1. Create a dummy user in auth.users
    const testEmail = `test_referred_${Math.floor(Math.random() * 10000)}@example.com`;
    console.log(`Creating test user with email: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: false
    });
    
    if (authError) {
        console.error("Auth creation failed:", authError);
        return;
    }
    
    const userUuid = authData.user.id;
    console.log(`Test Auth User UUID: ${userUuid}`);
    
    // Wait for trigger to complete
    await new Promise(r => setTimeout(r, 1000));
    
    // 2. Update the profile (which is auto-created by the trigger) to set referred_by = 30
    console.log("Updating jobseeker profile to set referred_by...");
    const { data: updateData, error: profileError } = await supabase
        .from('jobseekers')
        .update({
            referred_by: referrerId
        })
        .eq('uuid', userUuid)
        .select();
        
    if (profileError) {
        console.error("Profile update failed:", profileError);
        return;
    }
    console.log("Jobseeker profile updated successfully. Data:", updateData);
    
    // 3. Simulate calling confirm-email logic by using the endpoint's code logic
    const targetUser = authData.user;
    
    console.log(`Simulating confirm-email logic for targetUser: ${targetUser.id}`);
    
    // confirm-email code starts here:
    await supabase.auth.admin.updateUserById(targetUser.id, {
        email_confirm: true,
    });
    console.log(`[confirm-email simulation] Supabase email confirmed for ${testEmail}`);

    // Reward referrer if this user was referred and not yet rewarded
    try {
        const { data: jobseeker, error: jsError } = await supabase
            .from('jobseekers')
            .select('id, name, referred_by, metadata')
            .eq('uuid', targetUser.id)
            .maybeSingle();

        if (jsError) {
            console.error("Error fetching jobseeker:", jsError);
        }

        console.log("Simulation found jobseeker:", jobseeker);

        if (jobseeker && jobseeker.referred_by && !jobseeker.metadata?.referral_rewarded) {
            const { data: referrer, error: refError } = await supabase
                .from('jobseekers')
                .select('id, referral_count')
                .eq('id', jobseeker.referred_by)
                .maybeSingle();

            if (refError) {
                console.error("Error fetching referrer:", refError);
            }
            
            console.log("Simulation found referrer:", referrer);

            if (referrer) {
                // 1. Award 2 credits to referrer
                const { error: rpcError } = await supabase.rpc('add_purchased_credits', {
                    p_user_id: referrer.id,
                    p_amount: 2,
                });

                if (rpcError) {
                    console.error('[confirm-email] RPC add_purchased_credits failed, performing manual fallback:', rpcError);
                    const { data: currentReferrer } = await supabase
                        .from('jobseekers')
                        .select('purchased_credits')
                        .eq('id', referrer.id)
                        .single();
                    await supabase
                        .from('jobseekers')
                        .update({
                            purchased_credits: (currentReferrer?.purchased_credits || 0) + 2,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', referrer.id);
                }

                // 2. Send notification to referrer
                await supabase.from('notifications').insert({
                    user_pk: referrer.id,
                    message: `You earned 2 credits for referring ${jobseeker.name || 'a new user'} (now verified)!`,
                    type: 'referral_bonus',
                    created_at: new Date().toISOString(),
                });

                // 3. Increment referral_count
                const newCount = (referrer.referral_count || 0) + 1;
                await supabase
                    .from('jobseekers')
                    .update({ referral_count: newCount })
                    .eq('id', referrer.id);

                // 4. Mark referral as rewarded on the referred user
                const updatedMetadata = {
                    ...(jobseeker.metadata || {}),
                    referral_rewarded: true,
                };
                await supabase
                    .from('jobseekers')
                    .update({ metadata: updatedMetadata })
                    .eq('id', jobseeker.id);
                
                console.log(`[confirm-email simulation] Referral rewarded successfully!`);
            }
        } else {
            console.log("Conditions not met for reward:", {
                hasJobseeker: !!jobseeker,
                referredBy: jobseeker?.referred_by,
                notRewardedYet: !jobseeker?.metadata?.referral_rewarded
            });
        }
    } catch (rewardErr) {
        console.error('[confirm-email simulation] Error processing referrer rewards:', rewardErr);
    }
    
    // Check final referrer count
    const { data: afterReferrer } = await supabase
        .from('jobseekers')
        .select('referral_count, purchased_credits')
        .eq('id', referrerId)
        .single();
    
    console.log("Referrer AFTER confirmation:", afterReferrer);
    
    // Cleanup test user
    console.log("Cleaning up test user...");
    await supabase.auth.admin.deleteUser(userUuid);
}

testConfirmFlow().catch(console.error);
