const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkCols() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'profiles' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);
  console.log('profiles columns:', res.rows);

  await client.end();
}

checkCols().catch(console.error);

