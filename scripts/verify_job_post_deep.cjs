const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyJobPost() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('--- AUDITING JOBS TABLE IN DATABASE ---');

  // 1. Query the Store Keeper job
  const jobRes = await client.query(`
    SELECT
      j.id,
      j.title,
      c.name as company_name,
      j.district,
      j.city,
      j.address,
      j.salary_min,
      j.salary_max,
      j.salary_type,
      j.job_type,
      j.work_mode,
      j.education_requirement,
      j.experience_min_years,
      j.experience_max_years,
      j.required_skills,
      j.status,
      j.created_at
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.title ILIKE '%Store Keeper%';
  `);

  console.log('\n1. STORE KEEPER JOB FOUND IN DATABASE TABLE:');
  console.dir(jobRes.rows[0], { depth: null });

  // 2. Query the Company
  const compRes = await client.query(`
    SELECT id, name, industry, district, city, verification_status, created_at
    FROM companies
    WHERE name = 'Maharashtra Enterprise';
  `);

  console.log('\n2. MAHARASHTRA ENTERPRISE FOUND IN COMPANIES TABLE:');
  console.dir(compRes.rows[0], { depth: null });

  // 3. Database aggregates
  const totalJobs = await client.query("SELECT count(*) as count FROM jobs;");
  const totalCompanies = await client.query("SELECT count(*) as count FROM companies;");

  console.log('\n3. CURRENT DATABASE TOTALS:');
  console.log('Total Jobs in database:', totalJobs.rows[0].count);
  console.log('Total Companies in database:', totalCompanies.rows[0].count);

  await client.end();
}

verifyJobPost().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});

