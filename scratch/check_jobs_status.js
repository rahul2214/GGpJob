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

    console.log('Querying distinct statuses from jobs table...');
    const { data, error } = await supabase
        .from('jobs')
        .select('status')
        .limit(100);
    
    if (error) {
        console.error('Error fetching jobs:', error);
        return;
    }

    const statuses = [...new Set(data.map(j => j.status))];
    console.log('Distinct job statuses in DB:', statuses);
}

main().catch(console.error);
