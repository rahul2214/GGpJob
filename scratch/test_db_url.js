const { Client } = require('pg');
const fs = require('fs');

async function testConnection() {
  let envFile = '';
  try {
      envFile = fs.readFileSync('.env.local', 'utf8');
  } catch(e) {
      envFile = fs.readFileSync('.env', 'utf8');
  }
  
  const lines = envFile.split('\n');
  let dbUrl = '';
  for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/(^"|"$)/g, '');
  }

  if (!dbUrl) {
    console.error("DATABASE_URL not found in environment files.");
    return;
  }

  console.log("Found database URL. Connecting...");
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    // Check columns and their defaults of public.jobseekers
    const res = await client.query(`
      SELECT column_name, column_default, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'jobseekers' AND column_name IN ('plan_type', 'is_paid');
    `);
    console.log("Column definitions:", res.rows);
  } catch (err) {
    console.error("Connection or query failed:", err);
  } finally {
    await client.end();
  }
}

testConnection();
