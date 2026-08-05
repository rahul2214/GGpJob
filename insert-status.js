const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function insertStatus() {
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
    
    console.log("Inserting status 13...");
    const { data, error } = await supabase
        .from('application_statuses')
        .upsert({ id: 13, name: 'Verified Referral' });
        
    if (error) {
        console.error("Failed to insert status 13:", error);
    } else {
        console.log("Success! Fetching statuses...");
        const { data: list, error: err } = await supabase
            .from('application_statuses')
            .select('*')
            .order('id');
        console.log('List of statuses:', list);
    }
}

insertStatus();
