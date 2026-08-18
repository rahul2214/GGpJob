const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function inspectLocationColumns() {
  const tables = ['jobseekers', 'recruiters', 'employees', 'jobs'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (data && data.length > 0) {
      console.log(`\n--- COLUMNS FOR ${t} ---`);
      console.log(Object.keys(data[0]).filter(k => k.includes('country') || k.includes('state') || k.includes('city') || k.includes('location')));
    } else {
      console.log(`Table ${t} empty or error:`, error);
    }
  }
}

inspectLocationColumns();
