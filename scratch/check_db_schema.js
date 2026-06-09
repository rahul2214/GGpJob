const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function check() {
    const projectDir = 'c:/Users/Rahul Naik G/OneDrive - Dhruv Compusoft Consultancy Pvt Ltd/Desktop/sample/design/job portal';
    let envFile = '';
    try {
        envFile = fs.readFileSync(path.join(projectDir, '.env.local'), 'utf8');
    } catch(e) {
        envFile = fs.readFileSync(path.join(projectDir, '.env'), 'utf8');
    }
    
    const lines = envFile.split('\n');
    let url = '', key = '';
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
    }
    
    const supabase = createClient(url, key);
    
    // Check all tables in schema
    console.log("Fetching table details...");
    
    // We can query information_schema or just fetch a single row from some tables
    const tables = ['jobseekers', 'education', 'experience', 'projects', 'languages', 'certifications', 'achievements'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table ${table} error:`, error.message);
        } else {
            console.log(`Table ${table} exists! Row:`, data);
        }
    }
    
    // Let's also check jobseekers columns by selecting a dummy query
    const { data: jsColumns, error: jsColError } = await supabase.from('jobseekers').select('*').limit(1);
    if (!jsColError && jsColumns && jsColumns.length > 0) {
        console.log("Jobseeker columns:", Object.keys(jsColumns[0]));
    }
}

check().catch(console.error);
