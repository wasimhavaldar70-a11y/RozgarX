const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkJob() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('Connected to database. Searching for jobs...');

  const res1 = await client.query("SELECT id, title, category, district, city, salary_min, salary_max, status, created_at FROM jobs WHERE title ILIKE '%Store Keeper%' OR title ILIKE '%retailer%';");
  console.log('Jobs matching "Store Keeper" or "retailer":', res1.rows);

  const res2 = await client.query("SELECT id, name, district, city, verification_status FROM companies WHERE name ILIKE '%Maharashtra Enterprise%';");
  console.log('Companies matching "Maharashtra Enterprise":', res2.rows);

  const totalJobs = await client.query("SELECT count(*) as count FROM jobs;");
  console.log('Total jobs in database:', totalJobs.rows[0].count);

  await client.end();
}

checkJob().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

