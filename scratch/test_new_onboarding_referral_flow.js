const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNewOnboardingFlow() {
  const referrerId = 30; // Rahul Naik (Referral Code: JD9W6RZX)
  const testEmail = `test_new_flow_${Date.now()}@example.com`;
  
  console.log('--- 1. Signing up new user WITHOUT referral code ---');
  const signupRes = await fetch('http://localhost:9002/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test New Flow User',
      email: testEmail,
      password: 'Password123!',
      role: 'Job Seeker',
      phone: '9977553311'
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
    throw new Error(`Failed to fetch user: ${fetchErr?.message}`);
  }

  console.log('User profile in DB AFTER signup:', userBefore);
  if (userBefore.referred_by !== null) {
    console.error(`ERROR: referred_by should be null, but is ${userBefore.referred_by}`);
  } else {
    console.log('SUCCESS: referred_by is null at signup.');
  }

  console.log('\n--- 2. Validating referral code JD9W6RZX via API ---');
  const validateRes = await fetch('http://localhost:9002/api/referral/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referralCode: 'JD9W6RZX' })
  });

  const validateData = await validateRes.json();
  console.log('Validation Response:', validateData);
  if (!validateRes.ok || !validateData.valid) {
    throw new Error('Validation failed');
  }

  const resolvedReferrerId = validateData.referrer.id;
  console.log(`SUCCESS: Resolved referral code to referrer ID: ${resolvedReferrerId}`);

  // Get a valid domain uuid to use in onboarding
  const { data: domains } = await supabase.from('domains').select('uuid').limit(1);
  const domainUuid = domains?.[0]?.uuid || '00000000-0000-0000-0000-000000000000';

  console.log('\n--- 3. Simulating Onboarding PUT call with referredBy resolved from validation ---');
  const onboardRes = await fetch(`http://localhost:9002/api/users/${userBefore.uuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test New Flow User',
      email: testEmail,
      phone: '9977553311',
      domainId: domainUuid,
      linkedinUrl: 'https://linkedin.com/in/testnew',
      githubUrl: 'https://github.com/testnew',
      portfolioUrl: 'https://testnew.com',
      education: [],
      experience: [],
      projects: [],
      metadata: {},
      role: 'Job Seeker',
      referredBy: resolvedReferrerId // Provided in payload
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
    console.error(`FAIL: referred_by should be ${referrerId}, but is ${userAfter.referred_by}!`);
  } else {
    console.log('SUCCESS: referred_by was successfully updated to the referrer ID!');
  }

  // Cleanup
  console.log('\n--- Cleaning up test user ---');
  await supabase.auth.admin.deleteUser(userBefore.uuid);
  console.log('Test user deleted.');
}

testNewOnboardingFlow().catch(console.error);
