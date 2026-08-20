const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkJobseekersColumns() {
  const { data, error } = await supabase.from('jobseekers').select('*').limit(1);
  if (error) {
    console.error("Error fetching jobseekers:", error);
    return;
  }
  if (data && data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log("All columns of jobseekers table:", keys.sort());
  }
}

checkJobseekersColumns();
