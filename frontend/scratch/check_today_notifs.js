
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkTodayNotifs() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: notifs, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('type', 'chat_message')
        .gte('created_at', today)
        .order('created_at', { ascending: false });
        
    if (error) console.error('Error:', error);
    console.log('Today\'s Chat Notifications:', notifs);
}

checkTodayNotifs();
