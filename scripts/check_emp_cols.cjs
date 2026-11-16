const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkEmpCols() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const res1 = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'employers' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);
  console.log('employers columns:', res1.rows);

  const res2 = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'employer_documents' AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);
  console.log('employer_documents columns:', res2.rows);

  await client.end();
}

checkEmpCols().catch(console.error);

