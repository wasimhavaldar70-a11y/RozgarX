const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function insertJobAndCompany() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('Inserting Maharashtra Enterprise and Store Keeper vacancy...');

  // Get anchor employer
  const empRes = await client.query("SELECT id FROM employers LIMIT 1;");
  const employerId = empRes.rows[0].id;

  // 1. Insert or get company "Maharashtra Enterprise"
  let compId;
  const existingComp = await client.query("SELECT id FROM companies WHERE name = 'Maharashtra Enterprise' LIMIT 1;");
  if (existingComp.rows.length > 0) {
    compId = existingComp.rows[0].id;
    console.log('Company already exists with ID:', compId);
  } else {
    const compIns = await client.query(`
      INSERT INTO companies (
        employer_id, name, tagline, industry, company_type, company_size,
        district, city, address, pincode, website, contact_email, contact_phone,
        logo_url, about, verification_status, created_at, updated_at
      ) VALUES (
        $1, 'Maharashtra Enterprise', 'Leading Regional Retail and Wholesale Enterprise',
        'Retail & FMCG', 'Private Limited', '10-50',
        'Kolhapur', 'Kagal', 'Kagal MIDC, Kolhapur, Maharashtra 416216', '416216',
        'https://maharashtraenterprise.com', 'hr@maharashtraenterprise.com', '+91 98220 12345',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=200&q=80',
        'Maharashtra Enterprise provides wholesale retail, store inventory management and merchant supply across southern Maharashtra.',
        'Verified', NOW(), NOW()
      )
      RETURNING id;
    `, [employerId]);
    compId = compIns.rows[0].id;
    console.log('Created Maharashtra Enterprise company with ID:', compId);
  }

  // 2. Insert or update Job "Store Keeper, shopkeeper,merchant, retailer, or vendor"
  const jobTitle = 'Store Keeper, shopkeeper,merchant, retailer, or vendor';
  const existingJob = await client.query("SELECT id FROM jobs WHERE title = $1 LIMIT 1;", [jobTitle]);

  if (existingJob.rows.length > 0) {
    await client.query(`
      UPDATE jobs SET
        company_id = $1,
        category = 'Retail & FMCG',
        description = 'Store keeper and stock monitoring specialist required for inventory audit, merchant supply distribution, and retail operations in Kagal, Kolhapur.',
        required_skills = $2::jsonb,
        education_requirement = '12th Pass',
        experience_min_years = 1,
        experience_max_years = 2,
        salary_min = 7000,
        salary_max = 12000,
        salary_type = 'Per Month',
        vacancies = 1,
        job_type = 'Full Time',
        work_mode = 'Office',
        district = 'Kolhapur',
        city = 'Kagal',
        address = 'Kagal, Kolhapur',
        status = 'approved',
        updated_at = NOW()
      WHERE id = $3;
    `, [
      compId,
      JSON.stringify(['12th Pass', 'Male only', 'inventory and stock monitoring', 'Store Keeping', 'Retail', 'Vendor Management']),
      existingJob.rows[0].id
    ]);
    console.log('Updated existing job with ID:', existingJob.rows[0].id);
  } else {
    const jobIns = await client.query(`
      INSERT INTO jobs (
        employer_id, company_id, title, category, description,
        required_skills, education_requirement, experience_min_years, experience_max_years,
        salary_min, salary_max, salary_type, vacancies, job_type, work_mode,
        district, city, address, application_deadline, status, is_featured, created_at, updated_at
      ) VALUES (
        $1, $2, $3, 'Retail & FMCG',
        'Store keeper and stock monitoring specialist required for inventory audit, merchant supply distribution, and retail operations in Kagal, Kolhapur.',
        $4::jsonb, '12th Pass', 1, 2,
        7000, 12000, 'Per Month', 1, 'Full Time', 'Office',
        'Kolhapur', 'Kagal', 'Kagal, Kolhapur', (CURRENT_DATE + INTERVAL '60 days'), 'approved', FALSE, NOW(), NOW()
      )
      RETURNING id;
    `, [
      employerId, compId, jobTitle,
      JSON.stringify(['12th Pass', 'Male only', 'inventory and stock monitoring', 'Store Keeping', 'Retail', 'Vendor Management'])
    ]);
    console.log('Inserted job with ID:', jobIns.rows[0].id);
  }

  // 3. Confirm job in database
  const confirm = await client.query(`
    SELECT j.id, j.title, c.name as company_name, j.district, j.city, j.salary_min, j.salary_max, j.salary_type, j.status
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.title = $1;
  `, [jobTitle]);
  console.log('\nCONFIRMED JOB IN DATABASE:');
  console.log(confirm.rows[0]);

  const total = await client.query("SELECT count(*) as count FROM jobs;");
  console.log('Total live jobs in database now:', total.rows[0].count);

  await client.end();
}

insertJobAndCompany().catch(err => {
  console.error('Error inserting job:', err);
  process.exit(1);
});

