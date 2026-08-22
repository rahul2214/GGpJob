const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVisaSponsorship() {
  console.log("Testing visa_sponsorship field update on jobs table...");

  const testJob = {
    title: "Visa Sponsorship Test Job",
    company_name: "Test Company",
    description: "Testing visa_sponsorship column in jobs table.",
    visa_sponsorship: true,
    job_type_pk: 1,
    workplace_type_pk: 1,
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    app_expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_applies: 100,
    status: 'active'
  };

  const { data: created, error: insErr } = await supabaseAdmin.from('jobs').insert([testJob]).select().single();
  if (insErr) {
    console.error("Insert error:", insErr);
    return;
  }
  console.log("Created job visa_sponsorship:", created.visa_sponsorship);

  // Test updating to false
  const { data: updated, error: updErr } = await supabaseAdmin
    .from('jobs')
    .update({ visa_sponsorship: false })
    .eq('id', created.id)
    .select()
    .single();

  if (updErr) {
    console.error("Update error:", updErr);
  } else {
    console.log("Updated job visa_sponsorship:", updated.visa_sponsorship);
  }

  // Cleanup
  await supabaseAdmin.from('jobs').delete().eq('id', created.id);
  console.log("Cleaned up test job.");
}

testVisaSponsorship().catch(console.error);
