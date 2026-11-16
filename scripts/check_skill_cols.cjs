const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function getCols() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'candidate_skills';");
  console.log(res.rows.map(r => r.column_name));
  await client.end();
}
getCols();

