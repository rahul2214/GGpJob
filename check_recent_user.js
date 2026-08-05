const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function check() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log("Fetching jobseeker referral codes...");
    const { data: jobseekers, error } = await supabase
        .from('jobseekers')
        .select('id, name, email, referral_code, referral_count');
        
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Jobseeker Referral Codes:", jobseekers);
    }
}

check().catch(console.error);
