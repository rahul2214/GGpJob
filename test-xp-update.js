const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testGamification() {
    // try to read env vars
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
    
    // Pick a random employee
    const { data: emp, error } = await supabase.from('employees').select('*').limit(1).single();
    if (error || !emp) {
        console.log('No employee found', error);
        return;
    }
    
    console.log('Testing update on employee:', emp.id, emp.name, 'current xp:', emp.xp);
    
    // Try to update XP directly
    const { error: updateErr } = await supabase.from('employees').update({ xp: (emp.xp || 0) + 10 }).eq('id', emp.id);
    if (updateErr) {
        console.error('Update Failed:', updateErr);
    } else {
        console.log('Update Successful via Supabase Admin!');
    }
}

testGamification();
