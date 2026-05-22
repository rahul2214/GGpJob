const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
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
    url = url.replace(/['";]/g, '').trim();
    key = key.replace(/['";]/g, '').trim();
    
    const supabase = createClient(url, key);

    const query = `
        SELECT conname, pg_get_constraintdef(oid) as def
        FROM pg_constraint
        WHERE conname = 'jobs_status_check';
    `;

    console.log('Running query via exec_sql RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: query });
    if (error) {
        console.error('Error running SQL:', error);
    } else {
        console.log('Query result:', data);
    }
}

main().catch(console.error);
