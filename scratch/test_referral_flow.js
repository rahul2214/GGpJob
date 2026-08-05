const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    let envFile = '';
    const rootPath = path.join(__dirname, '..');
    try {
        envFile = fs.readFileSync(path.join(rootPath, '.env.local'), 'utf8');
    } catch(e) {
        envFile = fs.readFileSync(path.join(rootPath, '.env'), 'utf8');
    }
    
    const lines = envFile.split('\n');
    let url = '', key = '';
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
    }
    url = url.replace(/['";]/g, '').trim();
    key = key.replace(/['";]/g, '').trim();
    
    const supabase = createClient(url, key);

    console.log('--- STARTING REFERRAL FLOW VERIFICATION ---');

    // 1. Fetch a test employee
    console.log('Fetching test employee...');
    const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .limit(1)
        .single();
    
    if (empErr || !emp) {
        console.error('Failed to fetch test employee. Make sure employees exist.', empErr);
        return;
    }
    console.log(`Using Employee: ${emp.name} (ID: ${emp.id}, XP: ${emp.xp}, Level: ${emp.level}, Trust: ${emp.trust_score})`);

    // 2. Fetch a test jobseeker
    console.log('Fetching test jobseeker...');
    const { data: js, error: jsErr } = await supabase
        .from('jobseekers')
        .select('*')
        .limit(1)
        .single();
    
    if (jsErr || !js) {
        console.error('Failed to fetch test jobseeker.', jsErr);
        return;
    }
    console.log(`Using Jobseeker: ${js.name} (ID: ${js.id}, Plan: ${js.plan_type}, Purchased Credits: ${js.purchased_credits})`);

    // 3. Fetch or Create a Job for the Employee
    console.log('Fetching a job for the employee...');
    let { data: job, error: jobErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('employee_pk', emp.id)
        .limit(1)
        .maybeSingle();
    
    if (jobErr || !job) {
        console.log('No job found for employee, creating one...');
        const { data: newJob, error: createJobErr } = await supabase
            .from('jobs')
            .insert({
                title: 'Software Developer Referral Test',
                company_name: emp.company_name || 'Test Company',
                is_referral: true,
                employee_pk: emp.id,
                status: 'open',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        if (createJobErr) {
            console.error('Failed to create job', createJobErr);
            return;
        }
        job = newJob;
    }
    console.log(`Using Job: ${job.title} (ID: ${job.id})`);

    // 4. Create a clean test application in status 4 (Referral Unlocked)
    console.log('Creating a test application in status 4 (Referral Unlocked)...');
    
    // We set unlocked_at to 10 seconds ago to simulate response time
    const tenSecondsAgo = new Date();
    tenSecondsAgo.setSeconds(tenSecondsAgo.getSeconds() - 10);

    const { data: app, error: appErr } = await supabase
        .from('applications')
        .insert({
            job_pk: job.id,
            user_pk: js.id,
            status_id: 4, // Referral Unlocked
            is_unlocked: true,
            unlocked_at: tenSecondsAgo.toISOString(),
            applied_at: new Date().toISOString()
        })
        .select()
        .single();

    if (appErr) {
        console.error('Failed to create application', appErr);
        return;
    }
    console.log(`Created Application: ID ${app.id}, status_id: ${app.status_id}`);

    try {
        // 5. Test status transition to status 5 (Referred) and calculate response time
        console.log('\n--- TEST CASE 1: Transition to Status 5 (Referred) & Response Time ---');
        // Let's call our local route (mock it or update DB directly but mimicking the status route API logic)
        // Wait, the status route API does:
        // 1. Calculate response_time_seconds
        // 2. Set status_id: 5
        // 3. Set proof_url and proof_uploaded_at
        const nowTime = new Date().getTime();
        const unlockedTime = new Date(app.unlocked_at).getTime();
        const calculatedSeconds = Math.max(0, Math.floor((nowTime - unlockedTime) / 1000));
        console.log(`Simulated unlocked_at: ${app.unlocked_at}`);
        console.log(`Calculated response time seconds: ${calculatedSeconds}`);

        const { data: app5, error: app5Err } = await supabase
            .from('applications')
            .update({
                status_id: 5,
                proof_url: 'https://test-bucket.s3.amazonaws.com/proof.png',
                proof_uploaded_at: new Date().toISOString(),
                response_time_seconds: calculatedSeconds,
                updated_at: new Date().toISOString()
            })
            .eq('id', app.id)
            .select()
            .single();

        if (app5Err) throw app5Err;
        console.log(`Updated to Status 5 successfully. response_time_seconds: ${app5.response_time_seconds}`);

        // 6. Test Admin Approval: Transition from 5 to 13 (Verified Referral)
        console.log('\n--- TEST CASE 2: Transition to Status 13 (Verified Referral) by Admin ---');
        // Admin Approval logic:
        // 1. Set status_id: 13
        // 2. Award +20 XP (action 'REFERRAL_VERIFIED') and +2 trust score (action 'VERIFIED_REFERRAL')
        // We will call the awardXP logic by import or we can simulate it by updating the DB and running our code
        // Wait! We can import awardXP and updateTrustScore directly in this script to verify they work.
        // Let's first read the current XP and Trust of the Employee
        const { data: empBefore } = await supabase.from('employees').select('xp, level, trust_score, verified_referrals_count').eq('id', emp.id).single();
        console.log(`Employee stats BEFORE verification: XP: ${empBefore.xp}, Level: ${empBefore.level}, Trust: ${empBefore.trust_score}, Referrals Count: ${empBefore.verified_referrals_count}`);

        // Now update application status to 13
        const { error: app13Err } = await supabase
            .from('applications')
            .update({
                status_id: 13,
                updated_at: new Date().toISOString()
            })
            .eq('id', app.id);
        
        if (app13Err) throw app13Err;
        console.log('Application status set to 13 (Verified Referral).');

        // Let's run awardXP for REFERRAL_VERIFIED
        // We can run it by invoking the exported function from gamification-logic.ts. Since we are in Node, let's require it!
        // Wait, gamification-logic.ts is in typescript. We can run it if we use ts-node or compile it.
        // But wait! We can just require the compiled js if it is built, or write a small JS implementation wrapper.
        // Wait, let's see if we can use the API status route directly!
        // We can simulate an API request by calling a local API or by calling the helper functions directly.
        // But since this is typescript, let's execute the status route logic manually or run a local next dev server and hit it.
        // Wait! Let's check if the dev server is running. No, but we can start it or just invoke the functions in js.
        // Let's write the js equivalent of the awardXP and trust updates in this script to see if they perform the exact DB updates, or we can compile the TS file dynamically using ts-node or swc.
        // Wait, does the project have ts-node or tsx?
        // Let's check package.json: yes, `"genkit:dev": "genkit start -- tsx src/ai/dev.ts"`. It has `tsx`!
        // So we can run our test script using `npx tsx scratch/test_referral_flow.ts`!
        // Let's create `scratch/test_referral_flow.ts` as a TypeScript file. That way we can import `awardXP`, `updateTrustScore` directly from the source code!
        
    } finally {
        // Cleanup application
        console.log('\nCleaning up test application...');
        await supabase.from('applications').delete().eq('id', app.id);
        console.log('Cleanup complete.');
    }
}

main().catch(console.error);
