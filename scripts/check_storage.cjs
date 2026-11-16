const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkStorage() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  const rlsRes = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'storage';
  `);
  console.log('storage tables rowsecurity:', rlsRes.rows);

  const polRes = await client.query(`
    SELECT policyname, tablename, cmd, permissive, roles 
    FROM pg_policies 
    WHERE schemaname = 'storage';
  `);
  console.log('storage policies:', polRes.rows);

  await client.end();
}

checkStorage().catch(console.error);

