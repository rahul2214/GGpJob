const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFullUserPayloadWithRetry() {
  const userId = "3c27dc06-b359-4d15-b38d-2affd32ef4b3";
  const { data: user } = await supabaseAdmin.from('recruiters').select('*').eq('uuid', userId).single();

  const data = {
    address: "old alwal",
    companyLinkedinUrl: "https://veltria.in",
    companyName: "Veltria",
    companyOverview: "testing.",
    companyRating: 5,
    companyVerification: false,
    companyWebsite: "https://veltria.in",
    description: "SJyiwuefiuwefiuef u uy uy fugfuegfiuf ihvyv i ifugwiufwfiu fuw gg uggvig vugvigivuggi ugig u i ugugiugiugiiug iug  u ug  guygu vgjj  vubvsvbsdvuy h u dv dvuysvuyv.",
    isReferral: false,
    jobDescription: "SJyiwuefiuwefiuef u uy uy fugfuegfiuf ihvyv i ifugwiufwfiu fuw gg uggvig vugvigivuggi ugig u i ugugiugiugiiug iug  u ug  guygu vgjj  vubvsvbsdvuy h u dv dvuysvuyv.",
    jobId: "testing",
    jobTitle: "testing",
    job_role: "testing",
    maxExperience: 5,
    minExperience: 2,
    salaryCurrency: "INR",
    salaryMax: 4000,
    salaryMin: 3000,
    sections: [{title: "testing", items: ["testing", "testing"]}],
    title: "testing",
    vacancies: 11
  };

  const now = new Date();
  const jobExpiry = new Date();
  jobExpiry.setDate(now.getDate() + 30);
  const appExpiry = new Date();
  appExpiry.setDate(now.getDate() + 30);

  const jobToCreate = {
    title: data.title,
    job_id: data.jobId || null,
    description: data.description,
    company_name: data.companyName || user.company_name || null,
    company_logo: data.companyLogo || user.company_logo || null,
    job_type_pk: 1,
    workplace_type_pk: 1,
    job_role: data.job_role || data.role || data.title,
    experience_min: typeof data.minExperience === 'number' ? data.minExperience : 0,
    experience_max: typeof data.maxExperience === 'number' ? data.maxExperience : 0,
    is_referral: !!data.isReferral,
    recruiter_pk: user.id,
    employee_pk: null,
    admin_pk: null,
    posted_at: now.toISOString(),
    expires_at: jobExpiry.toISOString(),
    app_expires_at: appExpiry.toISOString(),
    max_applies: (user.max_applies_limit && user.max_applies_limit > 0) ? user.max_applies_limit : 999999,
    plan_type_at_posting: user.plan_type || 'basic',
    vacancies: data.vacancies || 1,
    sections: data.sections || [],
    status: 'active',
    company_linkedin_url: user.company_linkedin_url || data.companyLinkedinUrl || null,
    company_overview: user.company_overview || data.companyOverview || null,
    company_website: user.company_website || data.companyWebsite || null,
    address: user.company_address || data.address || null,
    job_link: data.jobLink || null
  };

  let { data: newJob, error: insertError } = await supabaseAdmin
    .from('jobs')
    .insert([jobToCreate])
    .select()
    .single();

  if (insertError && (insertError.code === '42703' || insertError.code === 'PGRST204')) {
    console.warn('[API_JOBS_POST] Column missing on insert. Retrying insert without optional columns...', insertError.message);
    delete jobToCreate.location_pks;
    delete jobToCreate.skill_pks;
    delete jobToCreate.benefit_ids;
    delete jobToCreate.is_referral;
    delete jobToCreate.employee_pk;
    delete jobToCreate.admin_pk;
    
    const retryRes = await supabaseAdmin
      .from('jobs')
      .insert([jobToCreate])
      .select()
      .single();
    newJob = retryRes.data;
    insertError = retryRes.error;
  }

  if (insertError) {
    console.error("Final insert error:", insertError);
  } else {
    console.log("RETRY INSERT SUCCESSFUL! Created job ID:", newJob.id, "UUID:", newJob.uuid);
    await supabaseAdmin.from('jobs').delete().eq('id', newJob.id);
    console.log("Cleaned up test job.");
  }
}

testFullUserPayloadWithRetry().catch(console.error);
