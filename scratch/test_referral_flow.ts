import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { awardXP } from '../src/lib/gamification-logic';
import { updateTrustScore } from '../src/lib/trust-logic';

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
    url = url.replace(/['";\r]/g, '').trim();
    key = key.replace(/['";\r]/g, '').trim();
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    process.env.SUPABASE_SERVICE_ROLE_KEY = key;
    
    const supabase = createClient(url, key);

    console.log('--- STARTING TS REFERRAL FLOW VERIFICATION ---');

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
                title: 'Software Developer Referral Test TS',
                company_name: emp.company_name || 'Test Company',
                description: 'Test job description for referral validation.',
                is_referral: true,
                employee_pk: emp.id,
                status: 'active',
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
        console.log(`Updated to Status 5 successfully. response_time_seconds in DB: ${app5.response_time_seconds}`);

        // 6. Test Admin Approval: Transition from 5 to 13 (Verified Referral)
        console.log('\n--- TEST CASE 2: Transition to Status 13 (Verified Referral) & Reward Awarding ---');
        
        const { data: empBefore } = await supabase.from('employees').select('xp, level, trust_score, verified_referrals_count').eq('id', emp.id).single();
        console.log(`Employee stats BEFORE verification: XP: ${empBefore.xp}, Level: ${empBefore.level}, Trust: ${empBefore.trust_score}, Referrals Count: ${empBefore.verified_referrals_count}`);

        // Call awardXP for REFERRAL_VERIFIED (adds +20 XP and +2 trust score)
        console.log('Calling awardXP for REFERRAL_VERIFIED...');
        const rewardRes = await awardXP(emp.id, 'REFERRAL_VERIFIED', job.id);
        console.log('awardXP response:', rewardRes);

        const { data: empAfter } = await supabase.from('employees').select('xp, level, trust_score, verified_referrals_count').eq('id', emp.id).single();
        console.log(`Employee stats AFTER verification: XP: ${empAfter.xp}, Level: ${empAfter.level}, Trust: ${empAfter.trust_score}, Referrals Count: ${empAfter.verified_referrals_count}`);

        const xpDiff = empAfter.xp - empBefore.xp;
        const trustDiff = empAfter.trust_score - empBefore.trust_score;
        const countDiff = empAfter.verified_referrals_count - empBefore.verified_referrals_count;
        
        console.log(`Verification stats changes:`);
        console.log(`XP Change: +${xpDiff} (Expected: +20 or level change math)`);
        console.log(`Trust Score Change: +${trustDiff} (Expected: +2)`);
        console.log(`Verified Referrals Count Change: +${countDiff} (Expected: +1)`);

        // 7. Test Candidate Confirmation Stage: Dispute/Fake Report
        console.log('\n--- TEST CASE 3: Candidate reports referral as Fake/Spam ---');
        // If reported fake:
        // - Deducts 25 trust score (action 'FAKE_ACTIVITY')
        // - Refunds 2 credits to jobseeker (uses add_purchased_credits RPC)
        const { data: jsBefore } = await supabase.from('jobseekers').select('purchased_credits').eq('id', js.id).single();
        console.log(`Jobseeker purchased credits BEFORE: ${jsBefore.purchased_credits}`);
        
        console.log('Simulating Fake/Spam report trust deduction...');
        const trustDisputeRes = await updateTrustScore(emp.id, 'FAKE_ACTIVITY', 'Submission disputed by Admin (Test)');
        console.log('updateTrustScore response:', trustDisputeRes);

        console.log('Simulating credit refund...');
        const { error: refundErr } = await supabase.rpc('add_purchased_credits', {
            p_user_id: js.id,
            p_amount: 2
        });
        if (refundErr) {
            console.error('Refund RPC failed', refundErr);
        } else {
            console.log('Refund RPC succeeded.');
        }

        const { data: empDispute } = await supabase.from('employees').select('trust_score').eq('id', emp.id).single();
        const { data: jsAfter } = await supabase.from('jobseekers').select('purchased_credits').eq('id', js.id).single();

        console.log(`Employee trust score AFTER dispute: ${empDispute.trust_score} (Expected change: -25)`);
        console.log(`Jobseeker purchased credits AFTER refund: ${jsAfter.purchased_credits} (Expected change: +2)`);

        // 8. Test Candidate Confirmation Stage: Interview scheduled
        console.log('\n--- TEST CASE 4: Candidate reports Interview Scheduled ---');
        // If interview scheduled:
        // - Awards +15 XP (action 'CANDIDATE_INTERVIEW')
        // - Awards +5 trust score (action 'VERIFIED_INTERVIEW')
        const { data: empBeforeInt } = await supabase.from('employees').select('xp, trust_score').eq('id', emp.id).single();
        console.log(`Employee BEFORE Interview Scheduled: XP: ${empBeforeInt.xp}, Trust: ${empBeforeInt.trust_score}`);

        console.log('Calling awardXP for CANDIDATE_INTERVIEW...');
        const interviewRes = await awardXP(emp.id, 'CANDIDATE_INTERVIEW', job.id);
        console.log('awardXP response:', interviewRes);

        const { data: empAfterInt } = await supabase.from('employees').select('xp, trust_score').eq('id', emp.id).single();
        console.log(`Employee AFTER Interview Scheduled: XP: ${empAfterInt.xp}, Trust: ${empAfterInt.trust_score}`);

        const xpIntDiff = empAfterInt.xp - empBeforeInt.xp;
        const trustIntDiff = empAfterInt.trust_score - empBeforeInt.trust_score;
        console.log(`Interview scheduled stats changes:`);
        console.log(`XP Change: +${xpIntDiff} (Expected: +15)`);
        console.log(`Trust Score Change: +${trustIntDiff} (Expected: +5)`);

        // 9. Verify Leaderboard Response Speed endpoint
        console.log('\n--- TEST CASE 5: Leaderboard Speed Aggregation ---');
        // We will call the database queries that aggregate avg_response_time
        const { data: jobsList } = await supabase.from('jobs').select('id, employee_pk').eq('employee_pk', emp.id);
        const jobIds = jobsList.map(j => j.id);
        
        const { data: appsList } = await supabase.from('applications').select('job_pk, response_time_seconds').in('job_pk', jobIds);
        console.log(`Applications response times for employee:`, appsList);

    } finally {
        // Cleanup application
        console.log('\nCleaning up test application...');
        await supabase.from('applications').delete().eq('id', app.id);
        console.log('Cleanup complete.');
    }
}

main().catch(console.error);
