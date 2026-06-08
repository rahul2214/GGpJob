const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

async function inspect() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.error("No NEXT_PUBLIC_SUPABASE_URL found");
    return;
  }
  
  const restUrl = `${url}/rest/v1/`;
  console.log("Fetching OpenAPI spec from:", restUrl);
  
  try {
    const res = await fetch(restUrl, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
    if (!res.ok) {
      console.error("HTTP error:", res.status);
      return;
    }
    
    const spec = await res.json();
    console.log("Title:", spec.info?.title);
    
    // Find all paths starting with /rpc/
    const rpcPaths = Object.keys(spec.paths || {}).filter(p => p.startsWith('/rpc/'));
    console.log("Available RPC functions:\n", rpcPaths.join('\n'));
  } catch (err) {
    console.error("Inspect failed:", err);
  }
}

inspect();
