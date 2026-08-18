const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testFullPutSimulation() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  
  // Simulate payload sent by frontend form with name strings:
  const payload = {
    country: "India (IN)",
    state: "Telangana",
    currentCity: "Hyderabad ★ Major Metro"
  };

  console.log(`Testing PUT resolution for UUID ${uuid} with payload:`, payload);

  let cId = payload.countryId ? Number(payload.countryId) : null;
  let sId = payload.stateId ? Number(payload.stateId) : null;
  let ciId = payload.cityId ? Number(payload.cityId) : null;

  const cleanCountryName = payload.country ? payload.country.split('(')[0].trim() : '';
  const cleanStateName = payload.state ? payload.state.trim() : '';
  const cleanCityName = payload.currentCity ? payload.currentCity.split('★')[0].trim() : '';

  if (!cId && cleanCountryName) {
    const { data: cObj } = await supabase
      .from('countries')
      .select('id')
      .or(`name.ilike.${cleanCountryName},code.ilike.${cleanCountryName}`)
      .maybeSingle();
    if (cObj) cId = cObj.id;
  }

  if (!sId && cleanStateName && cId) {
    const { data: sObj } = await supabase
      .from('states_provinces')
      .select('id')
      .eq('country_id', cId)
      .ilike('name', cleanStateName)
      .maybeSingle();
    if (sObj) sId = sObj.id;
  }

  if (!ciId && cleanCityName && sId) {
    const { data: ciObj } = await supabase
      .from('cities')
      .select('id')
      .eq('state_province_id', sId)
      .ilike('name', cleanCityName)
      .maybeSingle();
    if (ciObj) ciId = ciObj.id;
  }

  console.log("Resolved IDs:", { cId, sId, ciId });

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
    console.error("❌ PUT SELECT ERROR:", error);
  } else {
    console.log("🎉 SUCCESS 200 OK!");
    console.log("  • Country:", updated.countries?.name, `(ID: ${updated.current_country_id})`);
    console.log("  • State:", updated.states_provinces?.name, `(ID: ${updated.current_state_province_id})`);
    console.log("  • City:", updated.cities?.name, `(ID: ${updated.current_city_id})`);
  }
}

testFullPutSimulation();
