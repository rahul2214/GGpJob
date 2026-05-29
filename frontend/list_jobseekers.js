const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listJobseekers() {
  const { data: jobseekers, error: err } = await supabase
    .from('jobseekers')
    .select('id, uuid, name, email');
    
  if (err) {
    console.log('Error fetching jobseekers:', err.message);
  } else {
    console.log('Jobseekers Table:', jobseekers);
  }
}

listJobseekers();
