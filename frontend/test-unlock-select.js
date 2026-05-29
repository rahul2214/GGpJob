const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testUnlockApp() {
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
    
    // We'll use any application ID
    const { data: apps } = await supabase.from('applications').select('id').limit(1);
    if (apps && apps.length > 0) {
        const id = apps[0].id;
        const { data: app, error } = await supabase
          .from('applications')
          .select('*, jobs(credits_required), jobseekers(id, credits, email, name)')
          .eq('id', id)
          .single();
        
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Fetched Application in Unlock Route:');
            console.log('app.user_pk:', app.user_pk);
            console.log('app.jobseekers:', app.jobseekers);
        }
    } else {
        console.log('No applications found');
    }
}
testUnlockApp();
