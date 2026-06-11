const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTriggers() {
  const sql = `
    SELECT 
      trigger_name, 
      event_manipulation, 
      event_object_table, 
      action_statement, 
      action_timing
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    console.error('Error running SQL:', error);
  } else {
    console.log('SQL success! Triggers:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkTriggers();
