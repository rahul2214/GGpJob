const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectUser() {
  const uuid = '8c842d12-d35d-454d-8b41-6b6aef995b89';
  console.log('Inspecting user UUID:', uuid);

  const { data: jobseeker, error: jsErr } = await supabase.from('jobseekers').select('*').eq('uuid', uuid).maybeSingle();
  console.log('Jobseeker result:', jobseeker, jsErr ? jsErr.message : 'no error');

  const { data: employee, error: empErr } = await supabase.from('employees').select('*').eq('uuid', uuid).maybeSingle();
  console.log('Employee result:', employee, empErr ? empErr.message : 'no error');
}

inspectUser();
