const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase.from('payments').select('*').limit(1);
  if (error) {
    console.error("Error querying payments:", error);
  } else {
    console.log("Payments row schema keys:", data && data.length > 0 ? Object.keys(data[0]) : "Empty table or no data");
  }
}

main();
