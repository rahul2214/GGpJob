const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log('Sample Job Row:', JSON.stringify(data[0], null, 2));
  }
}
inspect();
