
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkJob() {
    const jobId = 59;
    
    const { data: job, error } = await supabaseAdmin
        .from('jobs')
        .select('id, employee_pk, recruiter_pk, title')
        .eq('id', jobId)
        .single();
        
    if (error) console.error('Error:', error);
    console.log('Job 59 Details:', job);
}

checkJob();
