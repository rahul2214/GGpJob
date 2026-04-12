const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  const checkColumns = [
    'title', 'description', 'company_name', 'company_logo', 
    'salary_min', 'salary_max', 'experience_min', 'experience_max', 
    'vacancies', 'sections', 'benefit_ids', 'company_size_id', 'role'
  ];

  console.log('Checking jobs table columns...');
  
  for (const col of checkColumns) {
    const { error } = await supabase
      .from('jobs')
      .select(col)
      .limit(1);
    
    if (error) {
      console.log(`Column ${col}: MISSING (${error.message})`);
    } else {
      console.log(`Column ${col}: EXISTS`);
    }
  }
}

checkSchema();
