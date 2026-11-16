const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkAllRls() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  const enabled = res.rows.filter(r => r.rowsecurity);
  const disabled = res.rows.filter(r => !r.rowsecurity);

  console.log(`Total public tables: ${res.rows.length}`);
  console.log(`RLS Enabled: ${enabled.length}`);
  console.log(`RLS Disabled: ${disabled.length}`);
  if (disabled.length > 0) {
    console.log('Disabled tables:', disabled.map(d => d.tablename));
  }

  await client.end();
}

checkAllRls().catch(console.error);

