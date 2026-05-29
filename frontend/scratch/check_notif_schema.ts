import { supabaseAdmin } from './src/lib/supabase-admin';

async function check() {
    const { data, error } = await supabaseAdmin.from('notifications').select('*').limit(1);
    console.log('Sample Notification:', data);
    if (error) console.error('Error:', error);
}
check();
