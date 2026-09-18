/**
 * Verifies the "open to all countries" storage end to end against the real DB.
 *
 * Run after applying migration_jobs_worldwide_country.sql:
 *   node scripts/verify_worldwide_jobs.js
 *
 * It creates a throwaway job, stores it with country_id = -1, reads it back the
 * way the API does, checks the country filter surfaces it, then deletes it.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const WORLDWIDE_COUNTRY_ID = -1;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let failures = 0;
const check = (label, ok, detail) => {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

async function main() {
  console.log('\n1. Sentinel country row');
  const { data: sentinel, error: sErr } = await supabase
    .from('countries')
    .select('id, name, code, is_active')
    .eq('id', WORLDWIDE_COUNTRY_ID)
    .maybeSingle();

  if (sErr) {
    console.error('  Could not read countries:', sErr.message);
    process.exit(1);
  }
  if (!sentinel) {
    console.error('  FAIL  countries row id = -1 is missing.');
    console.error('        Run migration_jobs_worldwide_country.sql in the Supabase SQL editor first.');
    process.exit(1);
  }
  check('id = -1 exists', true, `name="${sentinel.name}", code=${sentinel.code}`);
  check('is_active = false so it stays out of the country pickers', sentinel.is_active === false);

  console.log('\n2. Sentinel is hidden from the country picker query');
  const { data: activeCountries } = await supabase
    .from('countries')
    .select('id')
    .eq('is_active', true);
  check(
    '/api/geo?type=countries would not list it',
    !(activeCountries || []).some(c => c.id === WORLDWIDE_COUNTRY_ID)
  );

  console.log('\n3. Round trip: store a worldwide job');
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .insert([{
      title: 'ZZ Worldwide verification job (safe to delete)',
      description: 'Temporary row created by scripts/verify_worldwide_jobs.js',
      status: 'draft',
      remote_type: 'remote',
      posted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    }])
    .select('id')
    .single();

  if (jobErr) {
    console.error('  Could not create the test job:', jobErr.message);
    process.exit(1);
  }

  try {
    const { error: locErr } = await supabase.from('job_locations').insert([{
      job_id: job.id,
      country_id: WORLDWIDE_COUNTRY_ID,
      state_province_id: null,
      city_id: null,
      is_primary: true,
    }]);
    check('job_locations accepts country_id = -1 (foreign key holds)', !locErr, locErr?.message);

    console.log('\n4. The check constraint rejects a subdivision under the sentinel');
    const { error: badErr } = await supabase.from('job_locations').insert([{
      job_id: job.id,
      country_id: WORLDWIDE_COUNTRY_ID,
      state_province_id: 11,
      city_id: null,
      is_primary: false,
    }]);
    check('worldwide + state is refused', !!badErr, badErr ? `rejected: ${badErr.code}` : 'it was accepted');
    if (!badErr) {
      await supabase.from('job_locations').delete().eq('job_id', job.id).not('state_province_id', 'is', null);
    }

    console.log('\n5. Read back the way the API resolves names');
    const { data: readBack } = await supabase
      .from('job_locations')
      .select('job_id, country_id, countries:country_id(name), states_provinces:state_province_id(name), cities:city_id(name)')
      .eq('job_id', job.id);

    const row = (readBack || [])[0];
    check('the embed resolves without a special case', !!row?.countries?.name, `country="${row?.countries?.name}"`);
    const label = [row?.cities?.name, row?.states_provinces?.name, row?.countries?.name].filter(Boolean).join(', ');
    check('the job card label reads "Worldwide"', label === 'Worldwide', `label="${label}"`);

    console.log('\n6. The country filter surfaces it for an unrelated country');
    // Mirrors the jobs API: selected countries unioned with the sentinel.
    const { data: india } = await supabase.from('countries').select('id').eq('name', 'India').maybeSingle();
    if (india) {
      const { data: matched } = await supabase
        .from('job_locations')
        .select('job_id')
        .in('country_id', [india.id, WORLDWIDE_COUNTRY_ID]);
      check(
        'filtering by India includes the worldwide job',
        (matched || []).some(m => m.job_id === job.id)
      );

      const { data: withoutSentinel } = await supabase
        .from('job_locations')
        .select('job_id')
        .in('country_id', [india.id]);
      check(
        'and would have missed it without the union (the bug this fixes)',
        !(withoutSentinel || []).some(m => m.job_id === job.id)
      );
    } else {
      console.log('  SKIP  no "India" row to filter against');
    }
  } finally {
    await supabase.from('job_locations').delete().eq('job_id', job.id);
    await supabase.from('jobs').delete().eq('id', job.id);
    console.log('\n   Test job cleaned up.');
  }

  console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
