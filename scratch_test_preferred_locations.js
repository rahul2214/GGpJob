const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testPreferredLocationsTable() {
  const userPk = 30;
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing jobseeker_preferred_locations table query for userPk ${userPk}...`);

  // 1. Query joined table
  const { data: prefLocs, error: fetchErr } = await supabase
    .from('jobseeker_preferred_locations')
    .select(`
      id,
      country_id,
      state_province_id,
      city_id,
      countries:country_id(id, name, code),
      states_provinces:state_province_id(id, name, code),
      cities:city_id(id, name)
    `)
    .eq('jobseeker_id', userPk);

  if (fetchErr) {
    console.error("❌ Fetch Error:", fetchErr.message);
  } else {
    console.log("🎉 SUCCESS! Fetched preferred locations:", prefLocs);
  }

  // 2. Test updating jobseeker WITHOUT preferred_locations column
  const { data: updated, error: updateErr } = await supabase
    .from('jobseekers')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', userPk)
    .select('id, uuid, name')
    .single();

  if (updateErr) {
    console.error("❌ Jobseeker Update Error:", updateErr.message);
  } else {
    console.log("🎉 SUCCESS! Jobseeker updated cleanly without preferred_locations error:", updated);
  }
}

testPreferredLocationsTable();
