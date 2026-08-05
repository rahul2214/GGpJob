const { Client } = require('pg');
require('dotenv').config();

async function testDb() {
  console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      console.log("Connected successfully!");
      const res = await client.query("SELECT current_user, current_database();");
      console.log("Query result:", res.rows);
      await client.end();
    } catch(err) {
      console.error("Connection failed:", err.message);
    }
  }
}
testDb();
