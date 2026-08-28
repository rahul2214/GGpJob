const fs = require('fs');
const path = require('path');
const portalPath = 'c:/Users/Rahul naik Gugulothu/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/JobPortal';
const { createClient } = require(path.join(portalPath, 'node_modules/@supabase/supabase-js'));

let envFile = '.env';
if (fs.existsSync(path.join(portalPath, '.env.local'))) envFile = '.env.local';

const envText = fs.readFileSync(path.join(portalPath, envFile), 'utf8');
const env = {};
envText.split(/\r?\n/).forEach(line => {
  if (line.startsWith('#') || !line.includes('=')) return;
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectValues() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, posted_at, experience_min, experience_max, job_type_pk, workplace_type_pk, employment_type, remote_type, visa_sponsorship');
  
  console.log('Total jobs:', jobs.length);
  const empTypes = Array.from(new Set(jobs.map(j => j.employment_type)));
  const jobTypePks = Array.from(new Set(jobs.map(j => j.job_type_pk)));
  const remoteTypes = Array.from(new Set(jobs.map(j => j.remote_type)));
  const wpTypePks = Array.from(new Set(jobs.map(j => j.workplace_type_pk)));

  console.log('Distinct employment_type:', empTypes);
  console.log('Distinct job_type_pk:', jobTypePks);
  console.log('Distinct remote_type:', remoteTypes);
  console.log('Distinct workplace_type_pk:', wpTypePks);

  const { data: jobLocs } = await supabase
    .from('job_locations')
    .select('job_id, country_id, state_province_id, city_id, countries(name), states_provinces(name), cities(name)')
    .limit(10);
  console.log('job_locations sample:', jobLocs);
}

inspectValues().catch(console.error);
