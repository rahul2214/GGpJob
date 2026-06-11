const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUnverifiedReferrals() {
  const { data: jobseekers, error: jsError } = await supabase
    .from('jobseekers')
    .select('id, name, email, uuid, referred_by, metadata');

  if (jsError) {
    console.error("Error fetching jobseekers:", jsError);
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Error listing auth users:", authError);
    return;
  }

  const authUsers = authData.users;

  console.log("Checking referred users:");
  for (const js of jobseekers) {
    if (js.referred_by) {
      const authUser = authUsers.find(u => u.id === js.uuid);
      const isVerified = authUser ? !!authUser.email_confirmed_at : false;
      const referrer = jobseekers.find(r => r.id === js.referred_by);

      console.log(`- Referred User: ${js.name} (${js.email})`);
      console.log(`  Auth verified: ${isVerified} (email_confirmed_at: ${authUser ? authUser.email_confirmed_at : 'not found'})`);
      console.log(`  Referrer: ${referrer ? referrer.name : 'Unknown'} (ID: ${js.referred_by}, Current referral_count: ${referrer ? referrer.referral_count : 'N/A'})`);
      console.log(`  Metadata:`, js.metadata);
      console.log("");
    }
  }
}

checkUnverifiedReferrals().catch(console.error);
