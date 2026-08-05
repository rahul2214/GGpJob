const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdate() {
  const { data: js } = await supabase.from('jobseekers').select('id, metadata').limit(1).single();
  if (!js) return;

  const metadata = {
    ...(js.metadata || {}),
    preferredJobTitles: ["Full Stack Developer", "Software Engineer"],
    preferredSalaryMin: 50000,
    preferredSalaryMax: 120000,
    remotePreference: "hybrid",
    employmentTypes: ["Full-time", "Contract"],
    preferredIndustries: ["Information Technology"],
    openToRelocate: true,
    openWorldwide: false,
    workAuthorization: ["India", "United States"],
    visaRequirement: "No sponsorship required",
    preferredLanguages: ["English", "Hindi"],
    state: "Karnataka"
  };

  const { data, error } = await supabase.from('jobseekers').update({ metadata }).eq('id', js.id).select();
  if (error) {
    console.error("Update error:", error);
  } else {
    console.log("Update success! Metadata saved:", data[0].metadata);
  }
}

testUpdate();
