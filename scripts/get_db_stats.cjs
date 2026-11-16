const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function getStats() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const jobsRes = await client.query("SELECT count(*) as count FROM jobs;");
  const approvedJobsRes = await client.query("SELECT count(*) as count FROM jobs WHERE status = 'approved';");
  const companiesRes = await client.query("SELECT count(*) as count FROM companies;");
  const verifiedCompaniesRes = await client.query("SELECT count(*) as count FROM companies WHERE verification_status = 'Verified';");
  const candidatesRes = await client.query("SELECT count(*) as count FROM candidates;");
  const discoverableCandsRes = await client.query("SELECT count(*) as count FROM candidates WHERE is_discoverable = true;");
  const applicationsRes = await client.query("SELECT count(*) as count FROM job_applications;");
  const districtsRes = await client.query("SELECT count(DISTINCT district) as count FROM jobs WHERE status = 'approved';");
  const totalDistrictsRes = await client.query("SELECT count(*) as count FROM districts;");
  
  // Placement/interview count: applications that are Shortlisted, Interview Scheduled, or Selected
  const successfulAppsRes = await client.query("SELECT count(*) as count FROM job_applications WHERE status IN ('Shortlisted', 'Interview Scheduled', 'Selected');");

  console.log(JSON.stringify({
    totalJobs: parseInt(jobsRes.rows[0].count, 10),
    approvedJobs: parseInt(approvedJobsRes.rows[0].count, 10),
    totalCompanies: parseInt(companiesRes.rows[0].count, 10),
    verifiedCompanies: parseInt(verifiedCompaniesRes.rows[0].count, 10),
    totalCandidates: parseInt(candidatesRes.rows[0].count, 10),
    discoverableCandidates: parseInt(discoverableCandsRes.rows[0].count, 10),
    totalApplications: parseInt(applicationsRes.rows[0].count, 10),
    successfulApplications: parseInt(successfulAppsRes.rows[0].count, 10),
    districtsWithJobs: parseInt(districtsRes.rows[0].count, 10),
    totalDistricts: parseInt(totalDistrictsRes.rows[0].count, 10)
  }, null, 2));

  await client.end();
}

getStats().catch(err => {
  console.error(err);
  process.exit(1);
});

