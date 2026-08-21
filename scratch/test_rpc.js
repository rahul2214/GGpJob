const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listRpc() {
  // Let's try calling common rpc names or querying pg_proc if allowed, or checking REST API
  const rpcNames = ['exec_sql', 'execute_sql', 'run_sql', 'exec', 'query'];
  for (const name of rpcNames) {
    const { data, error } = await supabase.rpc(name, { query: 'SELECT 1' });
    console.log(`RPC '${name}':`, error ? error.message : 'SUCCESS!', data);
  }
}

listRpc().catch(console.error);
