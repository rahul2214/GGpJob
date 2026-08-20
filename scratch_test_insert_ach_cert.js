const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testInsert() {
  console.log("Testing insert into jobseeker_achievements...");
  const { data: achData, error: achErr } = await supabase
    .from('jobseeker_achievements')
    .insert({ jobseeker_id: 30, title: "Test Achievement" })
    .select();
  
  if (achErr) {
    console.log("achievements insert error:", achErr);
    // try name
    const { data: achData2, error: achErr2 } = await supabase
      .from('jobseeker_achievements')
      .insert({ jobseeker_id: 30, name: "Test Achievement" })
      .select();
    if (achErr2) console.log("achievements insert error (name):", achErr2);
    else console.log("achievements inserted with name:", achData2);
  } else {
    console.log("achievements inserted with title:", achData);
  }

  console.log("Testing insert into jobseeker_certifications...");
  const { data: certData, error: certErr } = await supabase
    .from('jobseeker_certifications')
    .insert({ jobseeker_id: 30, name: "Test Certification" })
    .select();
  
  if (certErr) {
    console.log("certifications insert error:", certErr);
    // try title
    const { data: certData2, error: certErr2 } = await supabase
      .from('jobseeker_certifications')
      .insert({ jobseeker_id: 30, title: "Test Certification" })
      .select();
    if (certErr2) console.log("certifications insert error (title):", certErr2);
    else console.log("certifications inserted with title:", certData2);
  } else {
    console.log("certifications inserted with name:", certData);
  }
}

testInsert();
