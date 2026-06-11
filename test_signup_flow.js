const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testSignupProfile() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const testEmail = `test_signup_${Math.floor(Math.random() * 10000)}@example.com`;
    console.log(`Creating test user in auth: ${testEmail}`);
    
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
    console.log(`Auth User Created. UUID: ${userUuid}`);
    
    // Wait for trigger to complete
    await new Promise(r => setTimeout(r, 1000));
    
    // Exact data structures from signup API route
    const newReferralCode = 'TSTE' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const referredById = 30; // Rahul Naik
    
    const profileInsertData = {
        uuid: userUuid,
        name: 'Test Signup Flow User',
        email: testEmail,
        phone: '+919999999999',
        role_id: 1,
        plan_type: 'free', 
        is_paid: false,
        subscription_credits: 2,
        subscription_allowance: 2,
        referral_code: newReferralCode,
        referral_count: 0,
        referred_by: referredById
    };

    console.log("Upserting profile...");
    const { data: upsertResult, error: profileError } = await supabase
        .from('jobseekers')
        .upsert(profileInsertData, { onConflict: 'uuid' })
        .select();

    if (profileError) {
        console.error("UPSERT FAILED! Error:", profileError);
    } else {
        console.log("UPSERT SUCCEEDED! Result:", upsertResult);
    }
    
    // Cleanup
    console.log("Cleaning up auth user...");
    await supabase.auth.admin.deleteUser(userUuid);
}

testSignupProfile().catch(console.error);
