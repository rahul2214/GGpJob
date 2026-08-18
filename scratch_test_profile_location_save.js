const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testLocationSave() {
  console.log("Fetching first jobseeker profile to test location saving...");
  const { data: seeker } = await supabase.from('jobseekers').select('id, uuid, name, country, state, current_city').limit(1).single();

  if (!seeker) {
    console.log("No jobseekers found.");
    return;
  }

  console.log("Current Jobseeker:", seeker);

  const testPayload = {
    country: "India",
    state: "Telangana",
    current_city: "Hyderabad"
  };

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update(testPayload)
    .eq('id', seeker.id)
    .select('id, uuid, name, country, state, current_city')
    .single();

  if (error) {
    console.error("Save Error:", error.message);
  } else {
    console.log("\n🎉 DB SAVE SUCCESS! Updated Jobseeker record in Supabase:");
    console.log("  • Country:", updated.country);
    console.log("  • State:", updated.state);
    console.log("  • City:", updated.current_city);
  }
}

testLocationSave();
