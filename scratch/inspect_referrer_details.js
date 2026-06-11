const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectReferrer() {
  const referrerId = 30;

  // 1. Fetch referrer profile
  const { data: referrer, error: refErr } = await supabase
    .from('jobseekers')
    .select('id, name, email, referral_code, referral_count, purchased_credits')
    .eq('id', referrerId)
    .single();

  if (refErr) {
    console.error('Error fetching referrer:', refErr);
    return;
  }
  console.log('Referrer Info:', referrer);

  // 2. Fetch all seekers referred by this referrer
  const { data: referredSeekers, error: seekersErr } = await supabase
    .from('jobseekers')
    .select('id, uuid, name, email, referred_by, metadata')
    .eq('referred_by', referrerId);

  if (seekersErr) {
    console.error('Error fetching referred seekers:', seekersErr);
    return;
  }

  // 3. Fetch auth users to correlate verification status
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error('Error listing auth users:', authErr);
    return;
  }
  const authUsers = authData.users;

  console.log('\nSeekers referred by Rahul Naik:');
  for (const js of referredSeekers) {
    const authUser = authUsers.find(u => u.id === js.uuid);
    console.log(`- Name: ${js.name}`);
    console.log(`  Email: ${js.email}`);
    console.log(`  UUID: ${js.uuid}`);
    console.log(`  Supabase Auth Verified: ${authUser ? !!authUser.email_confirmed_at : 'User not found in Auth'}`);
    console.log(`  Supabase Auth confirmed_at: ${authUser ? authUser.email_confirmed_at : 'N/A'}`);
    console.log(`  Metadata:`, js.metadata);
  }
}

inspectReferrer().catch(console.error);
