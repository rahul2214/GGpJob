const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testApp() {
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
    
    const { data, error } = await supabase.from('applications').select('*').limit(1);
    if (error) {
        console.error('Error fetching applications:', error);
    } else {
        console.log('Application columns:', Object.keys(data[0] || {}));
        console.log('Sample application:', data[0]);
    }
}
testApp();
