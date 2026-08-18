const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testPutRouteSimulation() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Simulating PUT request for UUID: ${uuid}...`);

  // Fetch jobseeker to see if it exists
  const { data: seeker, error: fErr } = await supabase
    .from('jobseekers')
    .select('id, uuid, name, email')
    .eq('uuid', uuid)
    .maybeSingle();

  if (fErr) {
    console.error("Fetch error:", fErr);
    return;
  }

  if (!seeker) {
    console.log(`Jobseeker with UUID ${uuid} not found in DB, testing on first available jobseeker...`);
    const { data: first } = await supabase.from('jobseekers').select('id, uuid, name, email').limit(1).single();
    if (!first) return;
    return runUpdateOnSeeker(first);
  }

  return runUpdateOnSeeker(seeker);
}

async function runUpdateOnSeeker(seeker) {
  console.log("Updating seeker:", seeker);

  // Incoming payload from frontend ProfileForm
  const incomingPayload = {
    name: seeker.name || "Test User",
    email: seeker.email,
    role: "Job Seeker",
    country: "India",
    state: "Telangana",
    currentCity: "Hyderabad",
    countryId: "1",
    stateId: "2",
    cityId: "5"
  };

  // Simulate server-side handler clean payload
  let cId = incomingPayload.countryId ? Number(incomingPayload.countryId) : null;
  let sId = incomingPayload.stateId ? Number(incomingPayload.stateId) : null;
  let ciId = incomingPayload.cityId ? Number(incomingPayload.cityId) : null;

  const updateData = {
    name: incomingPayload.name,
    email: incomingPayload.email,
    updated_at: new Date().toISOString(),
    metadata: {
      country: incomingPayload.country,
      state: incomingPayload.state,
      currentCity: incomingPayload.currentCity
    },
    ...(cId && { current_country_id: cId }),
    ...(sId && { current_state_province_id: sId }),
    ...(ciId && { current_city_id: ciId }),
  };

  const { data: updated, error: uErr } = await supabase
    .from('jobseekers')
    .update(updateData)
    .eq('uuid', seeker.uuid)
    .select('id, uuid, name, current_country_id, current_state_province_id, current_city_id, metadata')
    .single();

  if (uErr) {
    console.error("\n❌ UPDATE ERROR 500 REASON:", uErr);
  } else {
    console.log("\n🎉 SUCCESS 200 OK! Updated Jobseeker:");
    console.log("  • ID:", updated.id);
    console.log("  • UUID:", updated.uuid);
    console.log("  • current_country_id:", updated.current_country_id);
    console.log("  • current_state_province_id:", updated.current_state_province_id);
    console.log("  • current_city_id:", updated.current_city_id);
    console.log("  • metadata:", updated.metadata);
  }
}

testPutRouteSimulation();
