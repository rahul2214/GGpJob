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

    console.log('Querying table constraints for jobs table...');
    // We can run an RPC if it exists, or try custom RPC functions
    // Let's check what RPCs we have or run query
    // Wait, let's try calling pg_constraint via custom sql executor if we have it, or standard tables
    // Sometimes there is an rpc function called `exec_sql` or similar, or we can look up get_table_columns_info
    
    // Let's try to query info from public.jobs table.
    // If we try to insert a job with invalid status, the error message itself usually contains the check constraint name and description or expression!
    // Let's trigger a failure on purpose with status 'invalid_status_test' and print the entire error object.
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            title: 'Test',
            company_name: 'Test Company',
            description: 'Test Description',
            status: 'invalid_status_test'
        });
    
    console.log('Insert Error:', JSON.stringify(error, null, 2));
}

main().catch(console.error);
