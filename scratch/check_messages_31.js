
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vmghmqemuznipykgocxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY');

async function checkMessages() {
    const appId = 31;
    
    // Resolve session ID first
    const { data: session } = await supabaseAdmin
        .from('chat_sessions')
        .select('id')
        .eq('application_id', appId)
        .single();
        
    if (!session) {
        console.log('No chat session for App 31');
        return;
    }

    const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false });
        
    if (error) console.error('Error:', error);
    console.log(`Messages for App 31 (Session ${session.id}):`, messages);
}

checkMessages();
