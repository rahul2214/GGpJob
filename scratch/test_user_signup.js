const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testInserts() {
    let envFile = '';
    try {
        envFile = fs.readFileSync('.env.local', 'utf8');
    } catch(e) {
        envFile = fs.readFileSync('.env', 'utf8');
    }
    
    const lines = envFile.split('\n');
    let url, key;
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    
    if (!url || !key) {
        console.log('Could not find Supabase credentials');
        return;
    }
    
    const supabase = createClient(url, key);

    // Let's check if a user with email skilitup@gmail.com already exists in auth.users
    const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
    if (usersErr) {
        console.error('Failed to list auth users:', usersErr);
        return;
    }

    const existingAuthUser = users.find(u => u.email === 'skilitup@gmail.com');
    if (!existingAuthUser) {
        console.log('Auth user skilitup@gmail.com not found. We will use a mock UUID.');
    }

    const targetUuid = existingAuthUser ? existingAuthUser.id : 'ca58e8c2-2515-4d08-9652-14fffd3daa6c';
    console.log(`Using UUID ${targetUuid} for database test.`);

    // 1. Let's delete existing recruiter/employee records for this UUID
    await supabase.from('employees').delete().eq('uuid', targetUuid);
    await supabase.from('recruiters').delete().eq('uuid', targetUuid);

    const companyWebsite = "veltria.in";
    let formattedWebsite = companyWebsite ? companyWebsite.trim() : null;
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = `https://${formattedWebsite}`;
    }

    const empData = {
        uuid: targetUuid,
        name: 'skilitup',
        email: 'skilitup@gmail.com',
        phone: '+916302806154',
        role_id: 3,
        company_name: 'veltria',
        company_website: formattedWebsite,
        designation: 'HR',
        company_logo: companyWebsite ? `https://logo.clearbit.com/${companyWebsite.replace(/^(https?:\/\/)?(www\.)?/, '')}` : null,
        is_paid: false,
        plan_type: 'none',
        job_post_limit: 5,
        trust_score: 100,
        xp: 0,
        level: 1
    };

    console.log('Inserting into employees table:', empData);
    const { data: empResult, error: empError } = await supabase
        .from('employees')
        .insert(empData)
        .select();

    if (empError) {
        console.error('❌ Insert failed:', empError);
    } else {
        console.log('✅ Insert succeeded:', empResult[0]);
    }
}

testInserts();
