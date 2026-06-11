const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testApiCall() {
  const referrerId = 30; // Rahul Naik (Referral Code: JD9W6RZX)
  const referralCode = 'JD9W6RZX';

  // 1. Get count before signup API call
  const { data: before } = await supabase
    .from('jobseekers')
    .select('referral_count')
    .eq('id', referrerId)
    .single();
  console.log("Count BEFORE API signup:", before.referral_count);

  // 2. Call the signup API
  const testEmail = `api_test_referred_${Math.floor(Math.random() * 10000)}@example.com`;
  console.log(`Calling signup API for email: ${testEmail}`);

  try {
    const response = await axios.post('http://localhost:9002/api/auth/signup', {
      name: 'API Test User',
      email: testEmail,
      password: 'Password123!',
      role: 'Job Seeker',
      phone: '9876543210',
      referralCode: referralCode
    });
    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);
  } catch (err) {
    console.error("API Call failed:", err.response ? err.response.data : err.message);
  }

  // Allow some time for any asynchronous processing
  await new Promise(r => setTimeout(r, 2000));

  // 3. Get count after signup API call
  const { data: after } = await supabase
    .from('jobseekers')
    .select('referral_count')
    .eq('id', referrerId)
    .single();
  console.log("Count AFTER API signup:", after.referral_count);

  // 4. Cleanup the created user from auth
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const createdUser = usersData?.users?.find(u => u.email === testEmail);
  if (createdUser) {
    console.log(`Cleaning up user UUID: ${createdUser.id}`);
    await supabase.auth.admin.deleteUser(createdUser.id);
  }
}

testApiCall().catch(console.error);
