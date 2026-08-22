const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testMaxAppliesConstraint() {
  console.log("Testing max_applies value of -1 vs 999999...");

  const now = new Date();
  const jobExpiry = new Date();
  jobExpiry.setDate(now.getDate() + 30);
  const appExpiry = new Date();
  appExpiry.setDate(now.getDate() + 30);

  // 1. Try with -1
  const jobNegative = {
    title: "Test Negative max_applies",
    description: "SJyiwuefiuwefiuef u uy uy fugfuegfiuf ihvyv i ifugwiufwfiu fuw gg uggvig vugvigivuggi ugig u i ugugiugiugiiug iug  u ug  guygu vgjj  vubvsvbsdvuy h u dv dvuysvuyv.",
    company_name: "Dhruv Compusoft",
    job_type_pk: 1,
    workplace_type_pk: 1,
    job_role: "Software Engineer",
    experience_min: 1,
    experience_max: 5,
    posted_at: now.toISOString(),
    expires_at: jobExpiry.toISOString(),
    app_expires_at: appExpiry.toISOString(),
    max_applies: -1,
    plan_type_at_posting: "basic",
    vacancies: 1,
    sections: [],
    status: 'active'
  };

  const { data: d1, error: e1 } = await supabaseAdmin.from('jobs').insert([jobNegative]).select().single();
  console.log("Insert with max_applies = -1 error:", e1 ? e1.message : "NO ERROR");

  // 2. Try with 999999
  const jobPositive = {
    ...jobNegative,
    title: "Test Positive max_applies",
    max_applies: 999999
  };

  const { data: d2, error: e2 } = await supabaseAdmin.from('jobs').insert([jobPositive]).select().single();
  if (e2) {
    console.error("Insert with max_applies = 999999 error:", e2);
  } else {
    console.log("Insert with max_applies = 999999 SUCCESSFUL! Job ID:", d2.id);
    await supabaseAdmin.from('jobs').delete().eq('id', d2.id);
    console.log("Cleaned up test job.");
  }
}

testMaxAppliesConstraint().catch(console.error);
