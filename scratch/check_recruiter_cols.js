
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkRecruiters() {
    const { data, error } = await supabaseAdmin
        .from('recruiters')
        .select('*')
        .limit(1);
        
    if (data && data.length > 0) {
        console.log('Recruiter Columns:', Object.keys(data[0]));
    } else {
        console.log('No recruiters found.');
    }
}

checkRecruiters();
