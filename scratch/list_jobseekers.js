const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vmghmqemuznipykgocxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    const { data, error } = await supabaseAdmin.from('jobseekers').select('uuid, name, email, phone, plan_type, resume_url, domain_id').limit(10);
    if (error) {
        console.error(error);
    } else {
        console.log('Job Seekers:', data);
    }
}
listUsers();
