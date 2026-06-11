const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testClaimUnverified() {
  const referrerId = 30; // Rahul Naik (Referral Code: JD9W6RZX)
  const referralCode = 'JD9W6RZX';

  // 1. Get count before
  const { data: before } = await supabase
    .from('jobseekers')
    .select('referral_count')
    .eq('id', referrerId)
    .single();
  console.log("Count BEFORE claim attempt:", before.referral_count);

  // 2. Create an unverified user in auth.users
  const testEmail = `claim_test_${Math.floor(Math.random() * 10000)}@example.com`;
  console.log(`Creating test user: ${testEmail}`);
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Password123!',
    email_confirm: false
  });
  if (authErr) {
    console.error("Auth creation failed:", authErr);
    return;
  }
  const userUuid = authData.user.id;

  // Wait for trigger to complete and insert jobseeker row
  await new Promise(r => setTimeout(r, 1500));

  // 3. Try to call claim API
  console.log(`Calling claim API for user: ${userUuid} with referral code: ${referralCode}`);
  try {
    const response = await axios.post('http://localhost:9002/api/referral/claim', {
      referralCode: referralCode,
      userUuid: userUuid
    });
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);
  } catch (err) {
    console.log("Response Status (Expected 400):", err.response ? err.response.status : err.message);
    console.log("Response Error Data:", err.response ? err.response.data : 'No response data');
  }

  // 4. Get count after
  const { data: after } = await supabase
    .from('jobseekers')
    .select('referral_count')
    .eq('id', referrerId)
    .single();
  console.log("Count AFTER claim attempt:", after.referral_count);

  // Cleanup
  console.log("Cleaning up test user...");
  await supabase.auth.admin.deleteUser(userUuid);
  console.log("Cleanup complete.");
}

testClaimUnverified().catch(console.error);
