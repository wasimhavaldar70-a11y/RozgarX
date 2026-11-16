const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyQueryPlan() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('=== DATABASE QUERY PLAN VERIFICATION (EXPLAIN ANALYZE) ===');

  const explainRes = await client.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT id, title, category, district, salary_min, salary_max, created_at
    FROM public.jobs
    WHERE status = 'approved' AND district = 'Pune'
    ORDER BY created_at DESC
    LIMIT 20;
  `);

  explainRes.rows.forEach(r => console.log(r['QUERY PLAN']));

  await client.end();
}

verifyQueryPlan().catch(console.error);

