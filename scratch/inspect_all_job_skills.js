const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectAllJobSkills() {
  console.log("Inspecting job_skills table contents...");
  const { data: js, error } = await supabaseAdmin.from('job_skills').select('*').limit(20);
  console.log("job_skills count:", js ? js.length : 0, "sample:", js);

  const { data: b, error: bErr } = await supabaseAdmin.from('job_benefits').select('*').limit(20);
  console.log("job_benefits count:", b ? b.length : 0, "sample:", b);

  const { data: l, error: lErr } = await supabaseAdmin.from('job_locations').select('*').limit(20);
  console.log("job_locations count:", l ? l.length : 0, "sample:", l);
}

inspectAllJobSkills().catch(console.error);
