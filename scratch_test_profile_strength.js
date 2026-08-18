const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testProfileStrengthCalculation() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Fetching candidate data for UUID ${uuid}...`);

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

  const { data: user, error } = await supabase
    .from('jobseekers')
    .select(selectQuery)
    .eq('uuid', uuid)
    .single();

  if (error) {
    console.error("❌ Fetch Error:", error);
    return;
  }

  // Calculate new Profile Strength Score
  let score = 0;
  const missing = [];
  const completed = [];

  // 1. Location Hierarchy (15%)
  const hasLocation = Boolean(
    (user.countries?.name || user.country || user.current_country_id) &&
    (user.states_provinces?.name || user.state || user.current_state_province_id) &&
    (user.cities?.name || user.current_city || user.current_city_id)
  );
  if (hasLocation) { score += 15; completed.push('location hierarchy (+15%)'); }
  else { missing.push({ label: 'Location Hierarchy (Country, State, City)', boost: 15 }); }

  // 2. Resume Upload (15%)
  if (user.resume_url) { score += 15; completed.push('resume upload (+15%)'); }
  else { missing.push({ label: 'Upload Resume / CV', boost: 15 }); }

  // 3. Key Skills (15%)
  const hasSkills = Array.isArray(user.jobseeker_skills) && user.jobseeker_skills.length > 0;
  if (hasSkills) { score += 15; completed.push('key skills (+15%)'); }
  else { missing.push({ label: 'Key Skills & Proficiencies', boost: 15 }); }

  // 4. Work Experience (15%)
  const hasExperience = Array.isArray(user.experience) && user.experience.length > 0;
  if (hasExperience) { score += 15; completed.push('work experience (+15%)'); }
  else { missing.push({ label: 'Work Experience History', boost: 15 }); }

  // 5. Education Details (10%)
  const hasEducation = Array.isArray(user.education) && user.education.length > 0;
  if (hasEducation) { score += 10; completed.push('education (+10%)'); }
  else { missing.push({ label: 'Education Details & Degrees', boost: 10 }); }

  // 6. Projects Portfolio (10%)
  const hasProjects = Array.isArray(user.projects) && user.projects.length > 0;
  if (hasProjects) { score += 10; completed.push('projects portfolio (+10%)'); }
  else { missing.push({ label: 'Projects & Portfolio', boost: 10 }); }

  // 7. Headline & Summary (5%)
  if (user.headline || user.summary) { score += 5; completed.push('headline & summary (+5%)'); }
  else { missing.push({ label: 'Headline & About Summary', boost: 5 }); }

  // 8. Job & Location Preferences (5%)
  const hasPreferences = (Array.isArray(user.jobseeker_preferred_locations) && user.jobseeker_preferred_locations.length > 0) ||
                         (Array.isArray(user.preferred_job_titles) && user.preferred_job_titles.length > 0);
  if (hasPreferences) { score += 5; completed.push('preferences (+5%)'); }
  else { missing.push({ label: 'Preferred Locations & Job Titles', boost: 5 }); }

  // 9. Certifications (5%)
  const hasCertifications = Array.isArray(user.jobseeker_certifications) && user.jobseeker_certifications.length > 0;
  if (hasCertifications) { score += 5; completed.push('certifications (+5%)'); }
  else { missing.push({ label: 'Certifications & Licenses', boost: 5 }); }

  // 10. Achievements (5%)
  const hasAchievements = Array.isArray(user.jobseeker_achievements) && user.jobseeker_achievements.length > 0;
  if (hasAchievements) { score += 5; completed.push('achievements (+5%)'); }
  else { missing.push({ label: 'Achievements & Honors', boost: 5 }); }

  console.log("\n🎉 PROFILE STRENGTH SCORE FOR RAHUL NAIK:", `${score}% / 100%`);
  console.log("\nCompleted Sections:", completed);
  console.log("\nActive Profile Boosters (Missing Sections):", missing);
}

testProfileStrengthCalculation();
