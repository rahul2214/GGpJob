const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectFullJobsSchema() {
  console.log("Inspecting full jobs table structure...");
  const { data: cols, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .limit(1);

  if (cols && cols.length > 0) {
    console.log("All columns on jobs table:");
    console.log(Object.keys(cols[0]));
  }
}

inspectFullJobsSchema().catch(console.error);
