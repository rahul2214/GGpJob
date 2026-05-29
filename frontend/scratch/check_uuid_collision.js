
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkCollision() {
    const uuid = '0f5f65a9-ab0a-45ec-b1f3-1476b4a9d928';
    
    const { data: jobseeker } = await supabaseAdmin.from('jobseekers').select('id, name').eq('uuid', uuid).maybeSingle();
    const { data: employee } = await supabaseAdmin.from('employees').select('id, name').eq('uuid', uuid).maybeSingle();
    const { data: recruiter } = await supabaseAdmin.from('recruiters').select('id, name').eq('uuid', uuid).maybeSingle();
    
    console.log('Results for UUID:', uuid);
    console.log('Jobseeker:', jobseeker);
    console.log('Employee:', employee);
    console.log('Recruiter:', recruiter);
}

checkCollision();
