
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function testSessionLogic() {
    const appId = 31;
    
    // Simulating getOrCreateSession logic
    const { data: appData, error: appError } = await supabaseAdmin
        .from('applications')
        .select(`
            id, 
            uuid,
            user_pk,
            status_id,
            jobseekers!user_pk(id, uuid, plan_type),
            job:jobs(
                id, 
                title,
                is_referral,
                employees!employee_pk(id, uuid),
                recruiters!recruiter_pk(id, uuid)
            )
        `)
        .eq('id', appId)
        .single();

    if (appError) {
        console.error('App Fetch Error:', appError);
        return;
    }

    console.log('App Data structure:', JSON.stringify(appData, null, 2));
    
    const posterPk = appData.job?.employees?.id || appData.job?.recruiters?.id;
    console.log('Resolved Poster PK:', posterPk);
}

testSessionLogic();
