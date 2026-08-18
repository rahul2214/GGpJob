const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testPutWithAchievements() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing PUT request simulation with disambiguated FK hints for UUID ${uuid}...`);

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
    jobseeker_certifications:jobseeker_certifications!jobseeker_id(*)
  `;

  const { data: profile, error } = await supabase
    .from('jobseekers')
    .update({ updated_at: new Date().toISOString() })
    .eq('uuid', uuid)
    .select(selectQuery)
    .single();

  if (error) {
    console.error("❌ PUT SELECT ERROR:", error);
  } else {
    console.log("🎉 SUCCESS 200 OK! Profile updated cleanly without PostgREST ambiguity!");
    console.log("  • ID:", profile.id);
    console.log("  • UUID:", profile.uuid);
    console.log("  • Achievements:", profile.jobseeker_achievements);
    console.log("  • Certifications:", profile.jobseeker_certifications);
  }
}

testPutWithAchievements();
