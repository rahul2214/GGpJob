const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testNewSchema() {
  console.log("Testing queries on new tables...");

  // 1. job_locations
  const { data: jobLocs, error: errLocs } = await supabase.from('job_locations').select('*').limit(5);
  console.log("job_locations query:", errLocs ? errLocs.message : "SUCCESS", "rows:", jobLocs?.length);

  // 2. job_benefits
  const { data: jobBens, error: errBens } = await supabase.from('job_benefits').select('*').limit(5);
  console.log("job_benefits query:", errBens ? errBens.message : "SUCCESS", "rows:", jobBens?.length);

  // 3. job_skills
  const { data: jobSks, error: errSks } = await supabase.from('job_skills').select('*').limit(5);
  console.log("job_skills query:", errSks ? errSks.message : "SUCCESS", "rows:", jobSks?.length);

  // 4. cities
  const { data: cities, error: errCities } = await supabase.from('cities').select('id, name, state_province_id').limit(5);
  console.log("cities query:", errCities ? errCities.message : "SUCCESS", "rows:", cities?.length);

  // 5. countries
  const { data: countries, error: errCountries } = await supabase.from('countries').select('id, name, code').limit(5);
  console.log("countries query:", errCountries ? errCountries.message : "SUCCESS", "rows:", countries?.length);
}

testNewSchema().catch(console.error);
