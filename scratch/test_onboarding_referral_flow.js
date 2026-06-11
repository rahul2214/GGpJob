const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOnboardingReferralFlow() {
  const referrerId = 30; // Rahul Naik (Referral Code: JD9W6RZX)
  const testEmail = `test_onboard_${Date.now()}@example.com`;
  
  console.log('--- 1. Signing up new user with referral ---');
  const signupRes = await fetch('http://localhost:9002/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Referral Onboarding User',
      email: testEmail,
      password: 'Password123!',
      role: 'Job Seeker',
      phone: '9988776655',
      referralCode: 'JD9W6RZX'
    })
  });
  
  const signupData = await signupRes.json();
  console.log('Signup Response:', signupData);
  if (!signupRes.ok) {
    throw new Error('Signup failed');
  }

  // Retrieve the created user
  const { data: userBefore, error: fetchErr } = await supabase
    .from('jobseekers')
    .select('id, uuid, referred_by')
    .eq('email', testEmail)
    .single();

  if (fetchErr || !userBefore) {
    throw new Error(`Failed to fetch user before onboarding: ${fetchErr?.message}`);
  }

  console.log('User profile in DB AFTER signup:', userBefore);
  if (userBefore.referred_by !== referrerId) {
    console.error(`ERROR: referred_by is ${userBefore.referred_by}, expected ${referrerId}`);
  } else {
    console.log('SUCCESS: referred_by is correct.');
  }

  // Get a valid domain uuid to use in onboarding
  const { data: domains } = await supabase.from('domains').select('uuid').limit(1);
  const domainUuid = domains?.[0]?.uuid || '00000000-0000-0000-0000-000000000000';

  console.log('\n--- 2. Simulating Onboarding PUT call (without referredBy in payload) ---');
  const onboardRes = await fetch(`http://localhost:9002/api/users/${userBefore.uuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Referral Onboarding User',
      email: testEmail,
      phone: '9988776655',
      domainId: domainUuid,
      linkedinUrl: 'https://linkedin.com/in/testonboard',
      githubUrl: 'https://github.com/testonboard',
      portfolioUrl: 'https://testonboard.com',
      education: [],
      experience: [],
      projects: [],
      metadata: {},
      role: 'Job Seeker'
    })
  });

  const onboardData = await onboardRes.json();
  console.log('Onboarding PUT Response Status:', onboardRes.status);

  // Retrieve the user profile again after onboarding PUT
  const { data: userAfter, error: fetchAfterErr } = await supabase
    .from('jobseekers')
    .select('id, uuid, referred_by')
    .eq('uuid', userBefore.uuid)
    .single();

  if (fetchAfterErr || !userAfter) {
    throw new Error(`Failed to fetch user after onboarding: ${fetchAfterErr?.message}`);
  }

  console.log('User profile in DB AFTER onboarding PUT:', userAfter);
  if (userAfter.referred_by !== referrerId) {
    console.error(`FAIL: referred_by was overwritten to ${userAfter.referred_by}!`);
  } else {
    console.log('SUCCESS: referred_by was successfully preserved!');
  }

  // Cleanup
  console.log('\n--- Cleaning up test user ---');
  await supabase.auth.admin.deleteUser(userBefore.uuid);
  console.log('Test user deleted.');
}

testOnboardingReferralFlow().catch(console.error);
