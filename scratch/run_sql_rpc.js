const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  let envFile = '';
  try {
      envFile = fs.readFileSync('.env.local', 'utf8');
  } catch(e) {
      envFile = fs.readFileSync('.env', 'utf8');
  }
  
  const lines = envFile.split('\n');
  let url = '', key = '';
  for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/(^"|"$)/g, '');
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/(^"|"$)/g, '');
  }

  const supabase = createClient(url, key);

  console.log("Checking columns via exec_sql...");
  const sqlInspect = `
    SELECT column_name, column_default, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobseekers' AND column_name IN ('plan_type', 'is_paid');
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sqlInspect });
  if (error) {
    console.error("RPC exec_sql failed:", error);
  } else {
    console.log("Result:", data);
  }
}

main();
