const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectColumns() {
    console.log('--- Inspecting Columns ---');
    
    const tables = ['employees', 'jobseekers', 'jobs', 'applications', 'chat_sessions'];
    
    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
        if (error) {
            console.error(`Error querying ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`Columns:`, Object.keys(data[0]));
            console.log(`Sample row:`, data[0]);
        } else {
            console.log(`Table exists but has 0 rows.`);
            // Try to find columns by querying a non-existent column to force PostgREST to list columns
            const { error: colError } = await supabase.from(table).select('non_existent_column_for_testing');
            if (colError) {
                console.log(`Error message (might list columns):`, colError.message);
            }
        }
    }
}

inspectColumns();
