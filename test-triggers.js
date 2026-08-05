const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testTriggers() {
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
    
    // query pg_trigger for employees
    const { data: triggers, error } = await supabase.rpc('get_triggers', {}); // we don't have an rpc.
    
    // just use standard SQL
    const { data, error: err2 } = await supabase.from('employees').select('*').limit(1);
    
    console.log(data);
}

testTriggers();
