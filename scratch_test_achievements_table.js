const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testAchievementsTable() {
  console.log("Checking if jobseeker_achievements and jobseeker_certifications exist...");

  const { data: achData, error: achErr } = await supabase.from('jobseeker_achievements').select('*').limit(1);
  const { data: certData, error: certErr } = await supabase.from('jobseeker_certifications').select('*').limit(1);

  console.log("jobseeker_achievements result:", { count: achData?.length, error: achErr?.message });
  console.log("jobseeker_certifications result:", { count: certData?.length, error: certErr?.message });
}

testAchievementsTable();
