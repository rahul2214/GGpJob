const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJobPutUpdate() {
  console.log("Testing PUT update on jobs table without non-existent columns...");

  // 1. Create a test job
  const testJob = {
    title: "Test Job Before Update",
    company_name: "Test Company",
    description: "Testing PUT update handling in Jobs API.",
    job_type_pk: 1,
    workplace_type_pk: 1,
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    app_expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_applies: 100,
    status: 'active'
  };

  const { data: created } = await supabaseAdmin.from('jobs').insert([testJob]).select().single();
  console.log("Created job for PUT test, ID:", created.id);

  // 2. Perform PUT update payload simulation
  const dataToUpdate = {
    title: "Test Job Updated Title",
    description: "Updated description for PUT test.",
    salary_min_usd_cents: 60000,
    salary_max_usd_cents: 95000,
    salary_currency: "INR",
    vacancies: 5,
    updated_at: new Date().toISOString()
  };

  const { data: updated, error } = await supabaseAdmin
    .from('jobs')
    .update(dataToUpdate)
    .eq('id', created.id)
    .select()
    .single();

  if (error) {
    console.error("PUT update error:", error);
  } else {
    console.log("PUT UPDATE SUCCESSFUL!", {
      id: updated.id,
      title: updated.title,
      salary_min_usd_cents: updated.salary_min_usd_cents,
      salary_max_usd_cents: updated.salary_max_usd_cents,
      salary_currency: updated.salary_currency
    });
    await supabaseAdmin.from('jobs').delete().eq('id', created.id);
    console.log("Cleaned up test job.");
  }
}

testJobPutUpdate().catch(console.error);
