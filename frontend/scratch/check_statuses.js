const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('applications').select('verification_status');
    if (error) console.error(error);
    else {
        const statuses = [...new Set(data.map(a => a.verification_status))];
        console.log('Statuses:', statuses);
    }
}
check();
