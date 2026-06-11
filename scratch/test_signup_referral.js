const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignupReferral() {
  const referrerId = 30; // Rahul Naik (Referral Code: JD9W6RZX)
  
  // 1. Get initial referral count
  const { data: beforeReferrer } = await supabase
    .from('jobseekers')
    .select('referral_count, purchased_credits')
    .eq('id', referrerId)
    .single();
    
  console.log('Referrer count BEFORE signup:', beforeReferrer);

  // 2. Call the signup API
  const testEmail = `test_referral_${Date.now()}@example.com`;
  console.log(`Signing up new user: ${testEmail}`);
  
  const response = await fetch('http://localhost:9002/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Referral User',
      email: testEmail,
      password: 'Password123!',
      role: 'Job Seeker',
      phone: '9999999999',
      referralCode: 'JD9W6RZX'
    })
  });
  
  const signupResult = await response.json();
  console.log('Signup API Result:', signupResult);

  // 3. Get referrer count AFTER signup
  const { data: afterReferrer } = await supabase
    .from('jobseekers')
    .select('referral_count, purchased_credits')
    .eq('id', referrerId)
    .single();
    
  console.log('Referrer count AFTER signup:', afterReferrer);

  // 4. Check the created user profile
  const { data: newUser } = await supabase
    .from('jobseekers')
    .select('id, uuid, email, referred_by, metadata')
    .eq('email', testEmail)
    .maybeSingle();

  console.log('Created user profile:', newUser);

  // 5. Cleanup
  if (newUser?.uuid) {
    console.log('Cleaning up created user...');
    await supabase.auth.admin.deleteUser(newUser.uuid);
  }
}

testSignupReferral().catch(console.error);
