const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFixedResolveJobNames() {
  console.log("Testing fixed resolveJobNames for Job 160...");

  const { data: jobs } = await supabaseAdmin.from('jobs').select('*').eq('id', 160);
  const jobPks = jobs.map(j => j.id);

  const [
    { data: jobSkills },
    { data: jobBenefits },
    { data: jobLocs }
  ] = await Promise.all([
    supabaseAdmin.from('job_skills').select('job_pk, skills:skill_pk(id, uuid, name)').in('job_pk', jobPks),
    supabaseAdmin.from('job_benefits').select('job_pk, benefits:benefit_pk(id, uuid, name)').in('job_pk', jobPks),
    supabaseAdmin.from('job_locations').select('job_id, countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)').in('job_id', jobPks)
  ]);

  const skillMap = new Map();
  (jobSkills || []).forEach((js) => {
    if (js.skills) {
      const existing = skillMap.get(js.job_pk) || [];
      existing.push(js.skills);
      skillMap.set(js.job_pk, existing);
    }
  });

  const benefitMap = new Map();
  (jobBenefits || []).forEach((jb) => {
    if (jb.benefits) {
      const existing = benefitMap.get(jb.job_pk) || [];
      existing.push(jb.benefits);
      benefitMap.set(jb.job_pk, existing);
    }
  });

  const locMap = new Map();
  (jobLocs || []).forEach((jl) => {
    const parts = [jl.cities?.name, jl.states_provinces?.name, jl.countries?.name].filter(Boolean);
    if (parts.length > 0) {
      const locName = parts.join(', ');
      const existing = locMap.get(jl.job_id) || [];
      existing.push(locName);
      locMap.set(jl.job_id, existing);
    }
  });

  const resolved = jobs.map(job => {
    const skillsList = skillMap.get(job.id) || [];
    const benefitsList = benefitMap.get(job.id) || [];
    const locationNames = locMap.get(job.id) || [];

    return {
      id: job.id,
      title: job.title,
      locations: locationNames,
      skills: skillsList.map(s => s.name),
      requiredSkills: skillsList.map(s => s.name),
      skillIds: skillsList.map(s => s.uuid),
      benefits: benefitsList.map(b => b.name),
      benefitIds: benefitsList.map(b => b.uuid)
    };
  });

  console.log("RESOLVED JOB 160:", JSON.stringify(resolved, null, 2));
}

testFixedResolveJobNames().catch(console.error);
