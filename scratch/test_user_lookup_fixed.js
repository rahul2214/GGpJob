const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLookupFixed() {
  const userId = '3c27dc06-b359-4d15-b38d-2affd32ef4b3';
  console.log("Looking up user with select('id, uuid'):", userId);

  const [
    { data: seeker, error: seekerErr },
    { data: recruiter, error: recErr }
  ] = await Promise.all([
    supabase.from('jobseekers').select('id, uuid').eq('uuid', userId).maybeSingle(),
    supabase.from('recruiters').select('id, uuid').eq('uuid', userId).maybeSingle()
  ]);

  console.log("Jobseeker:", seeker, "Err:", seekerErr);
  console.log("Recruiter:", recruiter, "Err:", recErr);
}

testLookupFixed().catch(console.error);
