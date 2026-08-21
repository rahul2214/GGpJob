const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTest() {
  console.log("Simulating GET /api/jobs?recruiterId=3c27dc06-b359-4d15-b38d-2affd32ef4b3&isReferral=false&fresh=true...");
  
  const recruiterId = '3c27dc06-b359-4d15-b38d-2affd32ef4b3';
  const isReferralParam = 'false';

  let query = supabaseAdmin
      .from('jobs')
      .select(`
          *,
          job_types!job_type_pk(uuid, name),
          workplace_types!workplace_type_pk(uuid, name),
          company_sizes!company_size_id(uuid, name),
          applications_count:applications(count)
      `);

  if (isReferralParam !== null) {
    query = query.eq('is_referral', isReferralParam === 'true');
  }

  let recruiterPk = null;
  const { data: r } = await supabaseAdmin.from('recruiters').select('id').eq('uuid', recruiterId).single();
  if (r) recruiterPk = r.id;
  if (recruiterPk !== null) query = query.eq('recruiter_pk', recruiterPk);

  let { data: jobs, error } = await query;
  console.log("First query error:", error ? error.message : "None", "code:", error?.code);

  if (error && error.code === '42703') {
    console.log("Error 42703 detected! Executing fallback query...");
    let fallbackQuery = supabaseAdmin
        .from('jobs')
        .select(`
            *,
            job_types!job_type_pk(uuid, name),
            workplace_types!workplace_type_pk(uuid, name),
            company_sizes!company_size_id(uuid, name),
            applications_count:applications(count)
        `);

    if (recruiterPk !== null) {
        fallbackQuery = fallbackQuery.eq('recruiter_pk', recruiterPk);
    }

    const fallbackRes = await fallbackQuery;
    jobs = fallbackRes.data;
    error = fallbackRes.error;
    console.log("Fallback query error:", error ? error.message : "None", "jobs returned:", jobs?.length);
  }
}

runTest().catch(console.error);
