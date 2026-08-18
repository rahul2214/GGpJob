const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testPutFinal() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing PUT simulation for jobseeker ${uuid} without preferred_locations error...`);

  const selectQuery = `
    *, 
    roles(name),
    education(*),
    experience(*),
    projects(*),
    languages(*),
    jobseeker_personal_details(*),
    jobseeker_skills(skills(id, uuid, name)),
    countries:current_country_id(id, name, code),
    states_provinces:current_state_province_id(id, name, code),
    cities:current_city_id(id, name, is_featured),
    jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
    jobseeker_certifications:jobseeker_certifications!jobseeker_id(*),
    jobseeker_preferred_locations(id, country_id, state_province_id, city_id, countries:country_id(id, name, code), states_provinces:state_province_id(id, name, code), cities:city_id(id, name))
  `;

  // Update without non-existent preferred_locations column
  const { data: profile, error } = await supabase
    .from('jobseekers')
    .update({ updated_at: new Date().toISOString() })
    .eq('uuid', uuid)
    .select(selectQuery)
    .single();

  if (error) {
    console.error("❌ PUT SELECT ERROR:", error);
  } else {
    console.log("🎉 SUCCESS 200 OK! Profile updated cleanly!");
    console.log("  • Candidate ID:", profile.id);
    console.log("  • Candidate UUID:", profile.uuid);
    console.log("  • Current Country:", profile.countries?.name);
    console.log("  • Preferred Locations Relational:", profile.jobseeker_preferred_locations);
  }
}

testPutFinal();
