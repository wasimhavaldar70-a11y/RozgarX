const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspectEmployers() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const employers = await client.query(`SELECT * FROM employers;`);
  console.log('Employers in database:', employers.rows);

  const companies = await client.query(`SELECT id, employer_id, name, district, city, verification_status FROM companies;`);
  console.log('\nCompanies in database (count: ' + companies.rows.length + '):');
  companies.rows.forEach(c => console.log('  ', c));

  await client.end();
}

inspectEmployers().catch(console.error);
