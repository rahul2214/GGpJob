
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function testInsert() {
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert({
            user_pk: 23,
            job_pk: 59,
            message: 'Manual test notification [APP_ID:31]',
            type: 'chat_message',
            created_at: new Date().toISOString(),
            is_read: false
        })
        .select();
        
    if (error) console.error('Insert Error:', error);
    else console.log('Insert Success:', data);
}

testInsert();
