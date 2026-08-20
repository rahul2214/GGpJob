const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function cleanTestRows() {
  await supabase.from('jobseeker_achievements').delete().eq('title', 'Test Achievement');
  await supabase.from('jobseeker_certifications').delete().eq('name', 'Test Certification');
  console.log("Cleaned test rows.");
}

cleanTestRows();
