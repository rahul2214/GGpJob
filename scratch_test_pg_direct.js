const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testSupabaseTables() {
  console.log("Checking available tables or functions...");
  
  // Try querying visa_requirements table
  const { data, error } = await supabase.from('visa_requirements').select('*');
  if (error) {
    console.log("visa_requirements select error:", error.message);
  } else {
    console.log("visa_requirements table rows:", data);
  }
}

testSupabaseTables();
