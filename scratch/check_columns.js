const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function check() {
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
    
    // Clean potential quotes or comments
    url = url.replace(/['";]/g, '').trim();
    key = key.replace(/['";]/g, '').trim();
    
    const supabase = createClient(url, key);
    
    // Check application_statuses
    const { data: statuses, error: sError } = await supabase.from('application_statuses').select('*').order('id');
    console.log('Statuses in DB:', statuses);

    // Try selecting columns from applications
    const { data: apps, error: aError } = await supabase
        .from('applications')
        .select('id, response_time_seconds, jobseeker_feedback, feedback_submitted_at')
        .limit(1);
    
    if (aError) {
        console.log('Columns do not exist or query error:', aError.message);
    } else {
        console.log('Columns exist! Sample application data:', apps);
    }
}

check();
