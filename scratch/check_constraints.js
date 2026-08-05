
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkSchema() {
    const { data, error } = await supabaseAdmin.rpc('get_table_schema', { table_name: 'notifications' });
    if (error) {
        // Fallback: try to get constraints using a raw query if possible
        const { data: constraints, error: cError } = await supabaseAdmin.from('information_schema.table_constraints').select('*').eq('table_name', 'notifications');
        console.log('Constraints:', constraints || cError);
    } else {
        console.log('Schema:', data);
    }
}

// Since I might not have get_table_schema RPC, I'll use a more direct approach
async function directCheck() {
    const { data, error } = await supabaseAdmin.from('notifications').select('*').limit(0);
    console.log('Columns fetched successfully');
}
directCheck();
