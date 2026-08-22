const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLookup() {
  const userId = '3c27dc06-b359-4d15-b38d-2affd32ef4b3';
  console.log("Looking up user:", userId);

  // 1. Check recruiters
  const { data: rec, error: recErr } = await supabase.from('recruiters').select('id, uuid, email, country').eq('uuid', userId).maybeSingle();
  console.log("Recruiter by uuid:", rec, "Error:", recErr);

  // 1b. Check recruiters by id
  const { data: recById, error: recIdErr } = await supabase.from('recruiters').select('id, uuid, email, country').eq('id', 1).maybeSingle();
  console.log("Recruiter ID 1:", recById, "Error:", recIdErr);

  // 2. Check employees
  const { data: emp, error: empErr } = await supabase.from('employees').select('id, uuid, email, country').eq('uuid', userId).maybeSingle();
  console.log("Employee by uuid:", emp, "Error:", empErr);

  // 3. Check jobseekers
  const { data: js, error: jsErr } = await supabase.from('jobseekers').select('id, uuid, email, country').eq('uuid', userId).maybeSingle();
  console.log("Jobseeker by uuid:", js, "Error:", jsErr);

  // 4. Check admins
  const { data: adm, error: admErr } = await supabase.from('admins').select('id, uuid, email').eq('uuid', userId).maybeSingle();
  console.log("Admin by uuid:", adm, "Error:", admErr);
}

testLookup().catch(console.error);
