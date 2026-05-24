const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addColumns() {
  const sql = `
    ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS has_used_ats_checker boolean DEFAULT false;
    ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS has_used_resume_builder boolean DEFAULT false;
  `;

  console.log("Attempting to run migration via exec_sql...");
  
  // Try exec_sql
  const { data: data1, error: error1 } = await supabase.rpc('exec_sql', { sql });
  if (!error1) {
    console.log("Migration executed successfully via exec_sql RPC. Data:", data1);
    return;
  }
  
  console.log("exec_sql RPC failed, trying exec_sql with sql_string param...");
  const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (!error2) {
    console.log("Migration executed successfully via exec_sql RPC (sql_string). Data:", data2);
    return;
  }

  console.log("RPC failed. Let's try raw pg connection...");
  const { Client } = require('pg');
  if (process.env.DATABASE_URL) {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log("Executed successfully via pg.");
  } else {
    console.error("No DATABASE_URL found. Cannot execute raw SQL without it.");
    console.error("exec_sql Error 1:", error1);
    console.error("exec_sql Error 2:", error2);
  }
}

addColumns();
