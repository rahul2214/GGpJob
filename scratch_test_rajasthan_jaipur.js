const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testRajasthanJaipur() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const incomingData = {
    country: "India",
    state: "Rajasthan",
    currentCity: "Jaipur",
    // Stale user object IDs that were incorrectly being passed:
    countryId: 1,
    stateId: 2, // 2 was Telangana's ID!
    cityId: 5   // 5 was Hyderabad's ID!
  };

  console.log("Testing resolution for incoming Rajasthan/Jaipur payload:", incomingData);

  let cId = null;
  let sId = null;
  let ciId = null;

  const cleanCountryName = incomingData.country ? incomingData.country.split('(')[0].trim() : '';
  const cleanStateName = incomingData.state ? incomingData.state.trim() : '';
  const cleanCityName = incomingData.currentCity ? incomingData.currentCity.split('★')[0].trim() : '';

  // 1. Resolve Country
  if (cleanCountryName) {
    const { data: cObj } = await supabase
      .from('countries')
      .select('id')
      .or(`name.ilike.${cleanCountryName},code.ilike.${cleanCountryName}`)
      .maybeSingle();
    if (cObj) cId = cObj.id;
  }

  // 2. Resolve State within Country
  if (cleanStateName && cId) {
    const { data: sObj } = await supabase
      .from('states_provinces')
      .select('id, name')
      .eq('country_id', cId)
      .ilike('name', cleanStateName)
      .maybeSingle();
    if (sObj) {
      sId = sObj.id;
      console.log(`Matched State '${sObj.name}' ID:`, sId);
    }
  }

  // 3. Resolve City within State
  if (cleanCityName && sId) {
    const { data: ciObj } = await supabase
      .from('cities')
      .select('id, name')
      .eq('state_province_id', sId)
      .ilike('name', cleanCityName)
      .maybeSingle();
    if (ciObj) {
      ciId = ciObj.id;
      console.log(`Matched City '${ciObj.name}' ID:`, ciId);
    }
  }

  console.log("\nCorrectly Resolved Location IDs:", { cId, sId, ciId });

  // Perform database update
  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      current_country_id: cId,
      current_state_province_id: sId,
      current_city_id: ciId,
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select(`
      id, uuid, name,
      current_country_id, current_state_province_id, current_city_id,
      countries:current_country_id(id, name, code),
      states_provinces:current_state_province_id(id, name, code),
      cities:current_city_id(id, name)
    `)
    .single();

  if (error) {
    console.error("❌ Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Updated Candidate Profile in Supabase:");
    console.log("  • Country:", updated.countries?.name, `(ID: ${updated.current_country_id})`);
    console.log("  • State:", updated.states_provinces?.name, `(ID: ${updated.current_state_province_id})`);
    console.log("  • City:", updated.cities?.name, `(ID: ${updated.current_city_id})`);
  }
}

testRajasthanJaipur();
