const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
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
    
    // Query pg_attribute or information_schema via RPC or query if we can, 
    // or simply try updating preferred_locations to an array and a string.
    
    console.log('Testing update with string array...');
    const { error: arrayError } = await supabase
        .from('jobseekers')
        .update({ preferred_locations: ['Pune', 'Mumbai'] })
        .eq('id', 31);
        
    if (arrayError) {
        console.log('Array update failed:', arrayError.message);
        
        console.log('Testing update with string...');
        const { error: stringError } = await supabase
            .from('jobseekers')
            .update({ preferred_locations: 'Pune, Mumbai' })
            .eq('id', 31);
            
        if (stringError) {
            console.log('String update failed:', stringError.message);
        } else {
            console.log('String update succeeded!');
        }
    } else {
        console.log('Array update succeeded!');
        
        // Let's reset it back to null
        await supabase
            .from('jobseekers')
            .update({ preferred_locations: null })
            .eq('id', 31);
    }
}

main().catch(console.error);
