const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vmghmqemuznipykgocxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const userId = 'a3390435-ac6f-4c87-ba78-30d1d97f2260';
  
  const { data: js } = await supabaseAdmin.from('jobseekers').select('*').eq('uuid', userId).maybeSingle();
  console.log('Jobseeker:', js ? 'FOUND' : 'NOT FOUND');
  
  const { data: emp } = await supabaseAdmin.from('employees').select('*').eq('uuid', userId).maybeSingle();
  console.log('Employee:', emp ? 'FOUND' : 'NOT FOUND');
  
  const { data: rec } = await supabaseAdmin.from('recruiters').select('*').eq('uuid', userId).maybeSingle();
  console.log('Recruiter:', rec ? 'FOUND' : 'NOT FOUND');
}

checkUser();
