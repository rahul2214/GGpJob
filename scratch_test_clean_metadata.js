const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testCleanMetadataUpdate() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Cleaning metadata for UUID ${uuid} and saving ONLY relational foreign keys...`);

  // Fetch current metadata
  const { data: current } = await supabase.from('jobseekers').select('metadata').eq('uuid', uuid).single();
  const cleanedMeta = { ...(current?.metadata || {}) };
  delete cleanedMeta.country;
  delete cleanedMeta.state;
  delete cleanedMeta.currentCity;

  // Save update
  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      current_country_id: 1,
      current_state_province_id: 2,
      current_city_id: 5,
      metadata: cleanedMeta
    })
    .eq('uuid', uuid)
    .select(`
      id,
      uuid,
      name,
      current_country_id,
      current_state_province_id,
      current_city_id,
      metadata,
      countries:current_country_id(id, name, code),
      states_provinces:current_state_province_id(id, name, code),
      cities:current_city_id(id, name, is_featured)
    `)
    .single();

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("\n🎉 SUCCESS! Clean Relational Update Completed:");
    console.log("  • current_country_id:", updated.current_country_id, `(${updated.countries?.name})`);
    console.log("  • current_state_province_id:", updated.current_state_province_id, `(${updated.states_provinces?.name})`);
    console.log("  • current_city_id:", updated.current_city_id, `(${updated.cities?.name})`);
    console.log("  • metadata JSONB (Notice NO location keys):", JSON.stringify(updated.metadata));
  }
}

testCleanMetadataUpdate();
