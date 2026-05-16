const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  const userId = 'a3390435-ac6f-4c87-ba78-30d1d97f2260';
  
  const { data: js } = await supabaseAdmin.from('jobseekers').select('*').eq('uuid', userId).maybeSingle();
  console.log('Jobseeker:', js);
  
  const { data: emp } = await supabaseAdmin.from('employees').select('*').eq('uuid', userId).maybeSingle();
  console.log('Employee:', emp);
  
  const { data: rec } = await supabaseAdmin.from('recruiters').select('*').eq('uuid', userId).maybeSingle();
  console.log('Recruiter:', rec);
}

checkUser();
