const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testApp() {
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
    
    if (!url || !key) {
        console.log('Could not find Supabase credentials');
        return;
    }
    
    const supabase = createClient(url, key);
    
    const { data: app, error } = await supabase.from('applications').select('*').limit(1).single();
    if (error || !app) {
        console.log('No app found', error);
        return;
    }
    
    console.log('Application keys:', Object.keys(app));
}

testApp();
