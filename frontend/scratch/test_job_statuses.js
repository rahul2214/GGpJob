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

    const statuses = ['active', 'inactive', 'draft', 'closed', 'pending', 'open', 'published'];
    console.log('Testing statuses...');

    for (const status of statuses) {
        const { data, error } = await supabase
            .from('jobs')
            .insert({
                title: 'Test Status ' + status,
                company_name: 'Test Company',
                description: 'Test job description for referral validation.',
                status: status
            })
            .select();
        
        if (error) {
            console.log(`Status '${status}' -> FAIL: ${error.message}`);
        } else {
            console.log(`Status '${status}' -> SUCCESS! Created Job ID: ${data[0].id}`);
            // Cleanup
            await supabase.from('jobs').delete().eq('id', data[0].id);
        }
    }
}

main().catch(console.error);
