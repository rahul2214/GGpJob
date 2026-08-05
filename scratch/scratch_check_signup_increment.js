const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignupIncrement() {
  const referrerId = 30;

  // 1. Get count before upsert
  const { data: before } = await supabase
    .from('jobseekers')
    .select('referral_count')
    .eq('id', referrerId)
    .single();
  console.log("Count BEFORE signup upsert:", before.referral_count);

  // 2. Perform the signup upsert (simulate signup endpoint)
  const testEmail = `test_unsaved_${Math.floor(Math.random() * 10000)}@example.com`;
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Password123!',
    email_confirm: false
  });
  if (authErr) {
    console.error("Auth create failed:", authErr);
    return;
  }
  const userUuid = authData.user.id;

  // Wait for trigger
  await new Promise(r => setTimeout(r, 1000));

  const profileInsertData = {
    uuid: userUuid,
    name: 'Unverified Seeker',
    email: testEmail,
    role_id: 1,
    plan_type: 'free', 
    is_paid: false,
    subscription_credits: 2,
    subscription_allowance: 2,
    referral_code: 'TST' + Math.floor(Math.random()*1000),
    referral_count: 0,
    referred_by: referrerId
  };

  const { error: profileError } = await supabase
    .from('jobseekers')
    .upsert(profileInsertData, { onConflict: 'uuid' });

  if (profileError) {
    console.error("Upsert profile failed:", profileError);
  }

  // 3. Get count after upsert
  const { data: after } = await supabase
    .from('jobseekers')
    .select('referral_count')
    .eq('id', referrerId)
    .single();
  console.log("Count AFTER signup upsert:", after.referral_count);

  // Cleanup
  await supabase.auth.admin.deleteUser(userUuid);
}

testSignupIncrement().catch(console.error);
