const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testJobseeker() {
    let envFile = '';
    try {
        envFile = fs.readFileSync('.env.local', 'utf8');
    } catch(e) {
        envFile = fs.readFileSync('.env', 'utf8');
    }
    
    const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
    
    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();
    
    const supabase = createClient(url, key);
    
    const { data, error } = await supabase.from('jobseekers').select('*').limit(1);
    if (error) {
        console.error('Error fetching jobseekers:', error);
    } else {
        console.log('Jobseeker columns:', Object.keys(data[0] || {}));
        console.log('Sample jobseeker:', data[0]);
    }
}
testJobseeker();
