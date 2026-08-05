const axios = require('axios');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchSchema() {
  try {
    const res = await axios.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    const paths = Object.keys(res.data.paths);
    const rpcs = paths.filter(p => p.startsWith('/rpc/'));
    console.log("Found RPC functions in schema:");
    rpcs.forEach(p => console.log(`- ${p}`));
  } catch (err) {
    console.error("Error fetching schema:", err.message);
  }
}

fetchSchema();
