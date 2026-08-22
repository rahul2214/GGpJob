const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSubCheckFixed() {
  console.log("Testing updated subscription check query...");
  const { data, error } = await supabase
    .from('recruiters')
    .select('plan_type, plan_expires_at')
    .limit(1);

  if (error) {
    console.error("FAILED query:", error);
  } else {
    console.log("SUCCESS query:", data);
  }
}

testSubCheckFixed().catch(console.error);
