const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkCompCols() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const res = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'companies' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);
  console.log('companies columns:', res.rows);

  await client.end();
}

checkCompCols().catch(console.error);

