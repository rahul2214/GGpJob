const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testResumeBuilderMapping() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Fetching candidate profile for Resume Builder mapping test (UUID ${uuid})...`);

  // Fetch full candidate profile via joined tables
  const { data: jobseeker, error } = await supabase
    .from('jobseekers')
    .select(`
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
    `)
    .eq('uuid', uuid)
    .single();

  if (error) {
    console.error("❌ Fetch Error:", error);
    return;
  }

  // Construct location string
  const locParts = [
    jobseeker.cities?.name || jobseeker.current_city,
    jobseeker.states_provinces?.name || jobseeker.state,
    jobseeker.countries?.name || jobseeker.country
  ].filter(Boolean);
  const formattedLocation = locParts.join(', ');

  // Map Experience
  const mappedJobs = (jobseeker.experience || []).map((exp) => ({
    company: exp.company || "",
    role: exp.title || exp.role || "",
    startDate: exp.start_date || "",
    endDate: exp.is_current ? "" : (exp.end_date || ""),
    location: exp.location || "",
    points: exp.description ? exp.description.split('\n').filter(Boolean) : [""],
    currentlyWorkHere: Boolean(exp.is_current)
  }));

  // Map Projects
  const mappedProjects = (jobseeker.projects || []).map((proj) => ({
    name: proj.name || "",
    techStack: proj.tech_stack || proj.techStack || "",
    projectLink: proj.url || proj.project_link || "",
    points: proj.description ? proj.description.split('\n').filter(Boolean) : [""]
  }));

  // Map Education
  const mappedEducation = (jobseeker.education || []).map((edu) => ({
    institution: edu.institution || edu.school || "",
    degree: edu.degree || "",
    fieldOfStudy: edu.field_of_study || edu.fieldOfStudy || "",
    year: edu.start_date ? `${edu.start_date.substring(0,4)} - ${edu.is_current ? 'Present' : (edu.end_date || '').substring(0,4)}` : (edu.end_date || '').substring(0,4),
    grade: edu.grade || ""
  }));

  // Map Languages
  const mappedLanguages = (jobseeker.languages || []).map((l) => typeof l === 'string' ? l : l.language || l.name).filter(Boolean);

  // Map Achievements
  const mappedAchievements = (jobseeker.jobseeker_achievements || []).map((a) => typeof a === 'string' ? a : a.title || a.description).filter(Boolean);

  console.log("\n🎉 SUCCESS! Resume Builder Mapped Data:");
  console.log("  • Name:", jobseeker.name);
  console.log("  • Email:", jobseeker.email);
  console.log("  • Location:", formattedLocation);
  console.log("  • Experience Items:", mappedJobs.length);
  console.log("  • Experience Sample:", mappedJobs[0]);
  console.log("  • Projects Items:", mappedProjects.length);
  console.log("  • Projects Sample:", mappedProjects[0]);
  console.log("  • Education Items:", mappedEducation.length);
  console.log("  • Languages:", mappedLanguages);
  console.log("  • Achievements:", mappedAchievements);
}

testResumeBuilderMapping();
