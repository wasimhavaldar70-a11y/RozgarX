const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  const rlsRes = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'candidate_education';
  `);
  console.log('candidate_education rowsecurity:', rlsRes.rows);

  const fnRes = await client.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'is_super_admin';
  `);
  console.log('is_super_admin exists:', fnRes.rows);

  const bucketRes = await client.query(`
    SELECT id, name, public FROM storage.buckets;
  `);
  console.log('storage buckets:', bucketRes.rows);

  await client.end();
}

check().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});

