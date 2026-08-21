const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCols() {
  const cols = ['is_referral', 'employee_pk', 'recruiter_pk', 'admin_pk', 'job_link', 'vacancies'];
  for (const c of cols) {
    const { data, error } = await supabase.from('jobs').select('id').eq(c, 1).limit(1);
    if (error && error.code === '42703') {
      console.log(`Column '${c}': MISSING in DB!`);
    } else {
      console.log(`Column '${c}': EXISTS in DB.`);
    }
  }
}

testCols().catch(console.error);
