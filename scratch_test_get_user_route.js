const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testGetUsersRoute() {
  const uid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing full relational SELECT query in /api/users endpoint for UID ${uid}...`);

  const selectQuery = `
    *, 
    roles(name), 
    education(*), 
    experience(*), 
    projects(*), 
    languages(*), 
    jobseeker_personal_details(*), 
    jobseeker_skills(proficiency_level, years_experience, skills(id, uuid, name)),
    countries:current_country_id(id, name, code),
    states_provinces:current_state_province_id(id, name, code),
    cities:current_city_id(id, name, is_featured),
    jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
    jobseeker_certifications:jobseeker_certifications!jobseeker_id(*)
  `;

  const { data: jobseeker, error } = await supabase
    .from('jobseekers')
    .select(selectQuery)
    .eq('uuid', uid)
    .maybeSingle();

  if (error) {
    console.error("❌ SELECT ERROR:", error);
    return;
  }

  const mappedUser = {
    id: jobseeker.id,
    uuid: jobseeker.uuid,
    name: jobseeker.name,
    country: jobseeker.countries?.name || jobseeker.country || null,
    state: jobseeker.states_provinces?.name || jobseeker.state || null,
    currentCity: jobseeker.cities?.name || jobseeker.current_city || null,
    countryId: jobseeker.current_country_id || null,
    stateId: jobseeker.current_state_province_id || null,
    cityId: jobseeker.current_city_id || null,
    openToRelocate: jobseeker.open_to_relocate ?? false,
    openWorldwide: jobseeker.open_worldwide ?? false,
    achievements: (jobseeker.jobseeker_achievements && jobseeker.jobseeker_achievements.length > 0)
        ? jobseeker.jobseeker_achievements.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            issuer: a.issuer,
            dateAchieved: a.date_achieved
          }))
        : jobseeker.metadata?.achievements || [],
    certifications: (jobseeker.jobseeker_certifications && jobseeker.jobseeker_certifications.length > 0)
        ? jobseeker.jobseeker_certifications.map((c) => ({
            id: c.id,
            name: c.name,
            issuingOrganization: c.issuing_organization,
            issueDate: c.issue_date,
            expirationDate: c.expiration_date,
            credentialId: c.credential_id,
            credentialUrl: c.credential_url
          }))
        : jobseeker.metadata?.certifications || [],
  };

  console.log("\n🎉 SUCCESS! Mapped Candidate Object for /api/users?uid=...");
  console.log(JSON.stringify(mappedUser, null, 2));
}

testGetUsersRoute();
