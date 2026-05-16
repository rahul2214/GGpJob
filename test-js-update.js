const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testGamification() {
    let envFile = '';
    try {
        envFile = fs.readFileSync('.env.local', 'utf8');
    } catch(e) {
        envFile = fs.readFileSync('.env', 'utf8');
    }
    
    const lines = envFile.split('\n');
    let url, key;
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
    }
    
    const supabase = createClient(url, key);
    
    const { data: jobseeker, error } = await supabase.from('jobseekers').select('*').limit(1).single();
    if (error || !jobseeker) {
        console.log('No jobseeker found', error);
        return;
    }
    
    console.log('Jobseeker keys:', Object.keys(jobseeker));
    
    console.log('Current credits:', jobseeker.credits);
    
    const { error: updateErr } = await supabase.from('jobseekers').update({ credits: (jobseeker.credits || 0) - 1 }).eq('id', jobseeker.id);
    if (updateErr) {
        console.error('Update Failed:', updateErr);
    } else {
        console.log('Update Successful via Supabase Admin!');
    }
}

testGamification();
