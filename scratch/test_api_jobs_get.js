const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJobsApiGet() {
  console.log("Testing GET jobs skills resolution...");

  const { data: jobs } = await supabaseAdmin
    .from('jobs')
    .select('*, job_types!job_type_pk(uuid, name), workplace_types!workplace_type_pk(uuid, name), company_sizes!company_size_id(name)')
    .eq('status', 'active')
    .limit(5);

  const jobPks = jobs.map(j => j.id);

  const [
    { data: jobSkills },
    { data: jobBenefits }
  ] = await Promise.all([
    supabaseAdmin.from('job_skills').select('job_pk, skills:skill_pk(id, uuid, name)').in('job_pk', jobPks),
    supabaseAdmin.from('job_benefits').select('job_pk, benefits:benefit_pk(id, uuid, name)').in('job_pk', jobPks)
  ]);

  const skillMap = new Map();
  (jobSkills || []).forEach((js) => {
    if (js.skills) {
      const existing = skillMap.get(js.job_pk) || [];
      existing.push(js.skills);
      skillMap.set(js.job_pk, existing);
    }
  });

  const sample = jobs.map(j => ({
    id: j.id,
    title: j.title,
    skills: (skillMap.get(j.id) || []).map(s => s.name)
  }));

  console.log("SAMPLE JOBS WITH SKILLS:", sample);
}

testJobsApiGet().catch(console.error);
