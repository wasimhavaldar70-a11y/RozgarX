const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testApiDirect() {
  const testJob = {
    title: 'Assistant Inventory Audit Executive (Test Vacancy)',
    category: 'Retail & FMCG',
    description: 'Responsible for daily inventory audit and physical stock counts in Kolhapur.',
    companyName: 'Maharashtra Enterprise',
    district: 'Kolhapur',
    city: 'Kagal',
    salaryMin: 8000,
    salaryMax: 14000,
    salaryType: 'Per Month',
    educationRequirement: '12th Pass',
    experienceMinYears: 1,
    experienceMaxYears: 2,
    vacancies: 1,
    jobType: 'Full Time',
    workMode: 'Office',
    requiredSkills: ['Stock Audit', 'Inventory Management', 'Billing'],
    status: 'approved'
  };

  const response = await fetch('http://localhost:3000/api/jobs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testJob)
  });

  const data = await response.json();
  console.log('API Response:', data);

  if (data?.success && data?.job?.id) {
    console.log('Successfully saved job via /api/jobs/create with DB ID:', data.job.id);

    // Clean up test vacancy
    const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
    await client.connect();
    await client.query("DELETE FROM jobs WHERE id = $1;", [data.job.id]);
    console.log('Cleaned up test vacancy from database.');
    await client.end();
  }
}

testApiDirect().catch(console.error);

