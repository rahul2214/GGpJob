const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJobDeleteCleanup() {
  const jobId = 160;
  console.log("Cleaning up junction tables for Job PK:", jobId);

  // Delete job_skills
  const { error: errSkills } = await supabaseAdmin.from('job_skills').delete().eq('job_pk', jobId);
  console.log("job_skills cleanup:", errSkills ? errSkills.message : "Success");

  // Delete job_benefits
  const { error: errBenefits } = await supabaseAdmin.from('job_benefits').delete().eq('job_pk', jobId);
  console.log("job_benefits cleanup:", errBenefits ? errBenefits.message : "Success");

  // Delete job_locations
  const { error: errLocs } = await supabaseAdmin.from('job_locations').delete().or(`job_id.eq.${jobId}`);
  console.log("job_locations cleanup:", errLocs ? errLocs.message : "Success");

  // Delete notifications
  const { error: errNotifs } = await supabaseAdmin.from('notifications').delete().eq('job_pk', jobId);
  console.log("notifications cleanup:", errNotifs ? errNotifs.message : "Success");
}

testJobDeleteCleanup().catch(console.error);
