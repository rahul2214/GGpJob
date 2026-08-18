const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testLocationLookup() {
  const testCountry = "India (IN)";
  const testState = "Telangana";
  const testCity = "Hyderabad ★ Major Metro";

  console.log("Testing location name lookup with sample input:", { testCountry, testState, testCity });

  // Clean country name (remove (IN) code if present)
  const cleanCountryName = testCountry.split('(')[0].trim();
  const cleanCityName = testCity.split('★')[0].trim();

  console.log("Cleaned names for lookup:", { cleanCountryName, cleanCityName });

  // 1. Lookup Country
  const { data: cObj, error: cErr } = await supabase
    .from('countries')
    .select('id, name, code')
    .or(`name.ilike.${cleanCountryName},code.ilike.${cleanCountryName}`)
    .maybeSingle();

  console.log("Country Lookup Result:", cObj, cErr);

  // 2. Lookup State
  let sObj = null;
  if (cObj) {
    const { data: sData } = await supabase
      .from('states_provinces')
      .select('id, name')
      .eq('country_id', cObj.id)
      .ilike('name', testState.trim())
      .maybeSingle();
    sObj = sData;
  }
  console.log("State Lookup Result:", sObj);

  // 3. Lookup City
  let ciObj = null;
  if (sObj) {
    const { data: ciData } = await supabase
      .from('cities')
      .select('id, name')
      .eq('state_province_id', sObj.id)
      .ilike('name', cleanCityName)
      .maybeSingle();
    ciObj = ciData;
  }
  console.log("City Lookup Result:", ciObj);
}

testLocationLookup();
