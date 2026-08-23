const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetchCandidateFullData() {
  const userId = 30;
  console.log("Fetching full profile data for user PK 30...");

  const [seeker, achievements, certs] = await Promise.all([
    supabaseAdmin.from('jobseekers').select('*').eq('id', userId).single(),
    supabaseAdmin.from('jobseeker_achievements').select('*').eq('jobseeker_id', userId),
    supabaseAdmin.from('jobseeker_certifications').select('*').eq('jobseeker_id', userId)
  ]);

  console.log("Jobseeker:", seeker.data ? seeker.data.name : null);
  console.log("Achievements:", achievements.data);
  console.log("Certifications:", certs.data);
}

testFetchCandidateFullData().catch(console.error);
