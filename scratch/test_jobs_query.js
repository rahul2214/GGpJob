const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testQuery() {
  console.log("Testing query with is_referral filter...");
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('is_referral', false)
    .limit(5);

  if (error) {
    console.error("Query ERROR:", error);
  } else {
    console.log("Query SUCCESS! Rows:", data.length);
  }
}

testQuery().catch(console.error);
