const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking if is_referral column exists in jobs table...");
  const { data, error } = await supabase.from('jobs').select('is_referral').limit(1);
  if (!error) {
    console.log("Column is_referral ALREADY EXISTS in jobs table!");
    return;
  }
  
  console.log("Error querying is_referral:", error.message);
  console.log("Attempting to add column is_referral to jobs table via exec_sql RPC...");

  const sql = `ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_referral BOOLEAN DEFAULT false;
NOTIFY pgrst, 'reload schema';`;

  const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (rpcError) {
    console.error("RPC exec_sql failed:", rpcError);
    if (process.env.DATABASE_URL) {
      console.log("Trying via pg package and DATABASE_URL...");
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log("Column is_referral added successfully via pg!");
    } else {
      console.error("DATABASE_URL is not set.");
    }
  } else {
    console.log("Column is_referral added successfully via RPC exec_sql! Data:", rpcData);
  }

  // Verify
  const { data: checkData, error: checkError } = await supabase.from('jobs').select('is_referral').limit(1);
  if (checkError) {
    console.error("Verification failed:", checkError.message);
  } else {
    console.log("Verification success! is_referral column exists now.");
  }
}

run().catch(console.error);
