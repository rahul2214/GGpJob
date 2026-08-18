const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testPutPayload() {
  console.log("Testing update payload on jobseeker 83c6486f-2d90-49c0-9b8e-0179d2623067...");
  
  // 1. Get jobseeker by uuid or id
  const { data: seeker, error: fetchErr } = await supabase
    .from('jobseekers')
    .select('id, uuid, name, metadata')
    .limit(1)
    .single();

  if (fetchErr || !seeker) {
    console.error("Fetch error:", fetchErr);
    return;
  }

  console.log("Found Jobseeker:", seeker.uuid, seeker.name);

  // Test payload WITH country column (causes 500 error)
  const badPayload = {
    name: seeker.name,
    country: "India",
    updated_at: new Date().toISOString()
  };

  const { error: badErr } = await supabase.from('jobseekers').update(badPayload).eq('uuid', seeker.uuid);
  console.log("\n❌ BAD PAYLOAD (with 'country' column):", badErr?.message);

  // Test payload WITHOUT country column, using metadata + current_country_id (SUCCESS)
  const goodPayload = {
    name: seeker.name,
    updated_at: new Date().toISOString(),
    metadata: {
      ...(seeker.metadata || {}),
      country: "India",
      state: "Telangana",
      currentCity: "Hyderabad"
    }
  };

  const { data: okData, error: okErr } = await supabase.from('jobseekers').update(goodPayload).eq('uuid', seeker.uuid).select('*').single();
  if (okErr) {
    console.error("\n❌ GOOD PAYLOAD ERROR:", okErr.message);
  } else {
    console.log("\n✅ GOOD PAYLOAD SUCCESS! Saved metadata:", okData.metadata);
  }
}

testPutPayload();
