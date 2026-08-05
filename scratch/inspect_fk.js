
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkFK() {
    // Try to get info about the constraint using a query to information_schema
    const { data, error } = await supabaseAdmin.from('information_schema.key_column_usage').select('*').eq('table_name', 'notifications').eq('column_name', 'user_pk');
    // Note: This might fail due to RLS or permissions on information_schema, but worth a try.
    if (error) console.error('Error:', error);
    console.log('FK Info:', data);
}

checkFK();
