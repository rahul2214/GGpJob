const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testLocationUpdateFix() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const incomingData = {
    country: "India (IN)",
    state: "Telangana",
    currentCity: "Hyderabad ★ Major Metro"
  };

  console.log(`Simulating PUT request location resolution for UUID ${uuid}...`);

  let cId = null;
  let sId = null;
  let ciId = null;

  const cleanCountryName = incomingData.country ? incomingData.country.split('(')[0].trim() : '';
  const cleanStateName = incomingData.state ? incomingData.state.trim() : '';
  const cleanCityName = incomingData.currentCity ? incomingData.currentCity.split('★')[0].trim() : '';

  if (cleanCountryName) {
    const { data: cObj } = await supabase
      .from('countries')
      .select('id')
      .or(`name.ilike.${cleanCountryName},code.ilike.${cleanCountryName}`)
      .maybeSingle();
    if (cObj) cId = cObj.id;
  }

  if (cleanStateName && cId) {
    const { data: sObj } = await supabase
      .from('states_provinces')
      .select('id')
      .eq('country_id', cId)
      .ilike('name', cleanStateName)
      .maybeSingle();
    if (sObj) sId = sObj.id;
  }

  if (cleanCityName && sId) {
    const { data: ciObj } = await supabase
      .from('cities')
      .select('id')
      .eq('state_province_id', sId)
      .ilike('name', cleanCityName)
      .maybeSingle();
    if (ciObj) ciId = ciObj.id;
  }

  console.log("Resolved Location IDs:", { cId, sId, ciId });

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
    console.log("🎉 SUCCESS 200 OK! Location updated in database:");
    console.log("  • Country:", updated.countries?.name, `(ID: ${updated.current_country_id})`);
    console.log("  • State:", updated.states_provinces?.name, `(ID: ${updated.current_state_province_id})`);
    console.log("  • City:", updated.cities?.name, `(ID: ${updated.current_city_id})`);
  }
}

testLocationUpdateFix();
