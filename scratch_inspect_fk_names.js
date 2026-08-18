const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testSelectWithFkHint() {
  console.log("Testing PostgREST explicit FK hint for jobseeker_achievements...");

  // 1. Test with jobseeker_achievements!jobseeker_id(*)
  const { data: d1, error: e1 } = await supabase
    .from('jobseekers')
    .select(`
      id, uuid, name,
      jobseeker_achievements!jobseeker_id(*),
      jobseeker_certifications!jobseeker_id(*)
    `)
    .eq('id', 30)
    .single();

  if (e1) {
    console.error("❌ FK hint !jobseeker_id error:", e1.message);
  } else {
    console.log("🎉 SUCCESS with !jobseeker_id hint:", d1);
    return;
  }

  // 2. Test with jobseeker_achievements!jobseeker_uuid(*)
  const { data: d2, error: e2 } = await supabase
    .from('jobseekers')
    .select(`
      id, uuid, name,
      jobseeker_achievements!jobseeker_uuid(*),
      jobseeker_certifications!jobseeker_uuid(*)
    `)
    .eq('id', 30)
    .single();

  if (e2) {
    console.error("❌ FK hint !jobseeker_uuid error:", e2.message);
  } else {
    console.log("🎉 SUCCESS with !jobseeker_uuid hint:", d2);
  }
}

testSelectWithFkHint();
