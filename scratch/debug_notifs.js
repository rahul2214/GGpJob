
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkNotifs() {
    const userId = '0f5f65a9-ab0a-45ec-b1f3-1476b4a9d928'; // Ram's UUID
    const appId = 31; // Application ID from user's JSON
    
    // 1. Resolve PKs for Ram
    const [
        { data: js },
        { data: emp },
        { data: rec }
    ] = await Promise.all([
        supabaseAdmin.from('jobseekers').select('id').eq('uuid', userId).maybeSingle(),
        supabaseAdmin.from('employees').select('id').eq('uuid', userId).maybeSingle(),
        supabaseAdmin.from('recruiters').select('id').eq('uuid', userId).maybeSingle()
    ]);
    
    const allPks = [js?.id, emp?.id, rec?.id].filter(Boolean);
    console.log('User PKs:', allPks);
    
    // 2. Fetch Notifications
    const { data: notifs, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .in('user_pk', allPks)
        .eq('type', 'chat_message')
        .eq('is_read', false);
        
    if (error) console.error('Error:', error);
    console.log('Unread Notifications:', notifs);
    
    if (notifs) {
        notifs.forEach(n => {
             console.log('Notification Message:', n.message);
             const match = n.message.match(/\[APP_ID:(\d+)\]/);
             console.log('Regex Match for appId 31:', match && match[1] === appId.toString());
        });
    }
}

checkNotifs();
