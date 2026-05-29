const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('id, uuid, name, company_name, designation, email');
    
  if (error) {
    console.error(error);
  } else {
    console.log('Total employees found:', data.length);
    console.log(data);
  }
}

listEmployees();
