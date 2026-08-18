const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testRelationalJoin() {
  console.log("Testing relational location join on jobseeker table...");

  const { data, error } = await supabase
    .from('jobseekers')
    .select(`
      id,
      uuid,
      name,
      current_country_id,
      current_state_province_id,
      current_city_id,
      countries:current_country_id(id, name, code),
      states_provinces:current_state_province_id(id, name, code),
      cities:current_city_id(id, name, is_featured)
    `)
    .eq('id', 30)
    .single();

  if (error) {
    console.error("❌ Join Error:", error);
  } else {
    console.log("\n🎉 SUCCESS! Joined Relational Location Data:");
    console.log("  • Country Name:", data.countries?.name);
    console.log("  • State Name:", data.states_provinces?.name);
    console.log("  • City Name:", data.cities?.name);
    console.log("  • Raw Joined Data:", JSON.stringify(data, null, 2));
  }
}

testRelationalJoin();
