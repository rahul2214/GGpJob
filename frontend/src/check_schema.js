require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
  if (error) {
    console.error(error);
    return;
  }
  console.log('Tables:', data.map(t => t.table_name));
}

checkSchema();
