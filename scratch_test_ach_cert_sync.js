const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testAchCertSync() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const userPk = 30;

  console.log("Simulating full PUT sync for achievements & certifications...");

  // 1. Achievements sync
  const achievementsInput = ["Won Hackathon 2026", "Best Developer Award"];
  await supabase.from('jobseeker_achievements').delete().or(`jobseeker_id.eq.${userPk},jobseeker_uuid.eq.${uuid}`);
  
  const achRows = achievementsInput.map(a => ({
    jobseeker_id: userPk,
    jobseeker_uuid: uuid,
    title: a.trim()
  }));
  const { data: insertedAch, error: achErr } = await supabase.from('jobseeker_achievements').insert(achRows).select();
  if (achErr) console.error("Ach Insert Error:", achErr);
  else console.log("🎉 Inserted into jobseeker_achievements table:", insertedAch);

  // 2. Certifications sync
  const certificationsInput = ["AWS Certified Solutions Architect", "Google Cloud Professional"];
  await supabase.from('jobseeker_certifications').delete().or(`jobseeker_id.eq.${userPk},jobseeker_uuid.eq.${uuid}`);
  
  const certRows = certificationsInput.map(c => ({
    jobseeker_id: userPk,
    jobseeker_uuid: uuid,
    name: c.trim()
  }));
  const { data: insertedCert, error: certErr } = await supabase.from('jobseeker_certifications').insert(certRows).select();
  if (certErr) console.error("Cert Insert Error:", certErr);
  else console.log("🎉 Inserted into jobseeker_certifications table:", insertedCert);

  // 3. Fetch candidate profile and verify joined arrays
  const { data: jobseeker, error: getErr } = await supabase
    .from('jobseekers')
    .select(`
      id, uuid, name,
      jobseeker_achievements:jobseeker_achievements!jobseeker_id(*),
      jobseeker_certifications:jobseeker_certifications!jobseeker_id(*)
    `)
    .eq('uuid', uuid)
    .single();

  if (getErr) {
    console.error("GET Error:", getErr);
  } else {
    console.log("🎉 VERIFIED Relational Tables Joined in Candidate Profile:");
    console.log("  • jobseeker_achievements:", jobseeker.jobseeker_achievements);
    console.log("  • jobseeker_certifications:", jobseeker.jobseeker_certifications);
  }
}

testAchCertSync();
