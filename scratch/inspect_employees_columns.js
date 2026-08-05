require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env keys");
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  if (error) {
    console.error("Error fetching employees:", error);
  } else if (data && data.length > 0) {
    console.log("Employee columns:", Object.keys(data[0]));
  } else {
    console.log("No employees found in table.");
    // Try to describe schema via query
    const { data: cols, error: colErr } = await supabase.rpc('exec_sql', {
      sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'employees';"
    });
    if (colErr) {
      console.log("Cannot list columns via RPC either");
    } else {
      console.log("Employee columns from schema:", cols.map(c => c.column_name));
    }
  }
}

inspect();
