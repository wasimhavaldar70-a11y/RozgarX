const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function run() {
  console.log('Connecting to Supabase Admin API...');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  console.log('Connected to PostgreSQL database directly.');

  // 1. Create/Update Employer: nakshatramotors24@gmail.com
  const empEmail = 'nakshatramotors24@gmail.com';
  const empPassword = 'Nakshatra@24';
  const empName = 'Nakshatra Motors';
  const empPhone = '+919822000024';

  console.log(`\n--- Processing Employer: ${empEmail} ---`);
  // Check if exists in auth.users
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
  }

  let empUser = usersData?.users?.find(u => u.email?.toLowerCase() === empEmail.toLowerCase());
  let empUserId;

  if (empUser) {
    console.log(`Employer user already exists in auth.users (ID: ${empUser.id}). Updating password...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(empUser.id, {
      password: empPassword,
      email_confirm: true,
      user_metadata: { role: 'employer', full_name: empName }
    });
    if (updateError) throw updateError;
    empUserId = empUser.id;
    console.log('Employer password updated successfully.');
  } else {
    console.log(`Creating employer user in auth.users...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: empEmail,
      password: empPassword,
      email_confirm: true,
      user_metadata: { role: 'employer', full_name: empName }
    });
    if (createError) throw createError;
    empUserId = created.user.id;
    console.log(`Employer created in auth.users with ID: ${empUserId}`);
  }

  // Upsert profile in PostgreSQL
  await pgClient.query(`
    INSERT INTO profiles (id, user_id, full_name, email, mobile, role)
    VALUES ($1, $1, $2, $3, $4, 'employer')
    ON CONFLICT (id) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        mobile = EXCLUDED.mobile,
        role = 'employer',
        updated_at = NOW();
  `, [empUserId, empName, empEmail, empPhone]);
  console.log('Employer profile upserted in public.profiles.');

  // Upsert employer record
  const empRes = await pgClient.query(`
    INSERT INTO employers (profile_id, contact_person, business_email, mobile, is_active)
    VALUES ($1, $2, $3, $4, TRUE)
    ON CONFLICT DO NOTHING
    RETURNING id;
  `, [empUserId, 'Operations Head', empEmail, empPhone]);

  let employerTableId;
  if (empRes.rows.length > 0) {
    employerTableId = empRes.rows[0].id;
  } else {
    const existingEmp = await pgClient.query('SELECT id FROM employers WHERE profile_id = $1 LIMIT 1', [empUserId]);
    employerTableId = existingEmp.rows[0].id;
  }

  // Upsert company record
  const compRes = await pgClient.query(`
    INSERT INTO companies (
      employer_id, name, tagline, about, industry, company_type, company_size,
      district, city, address, verification_status
    )
    VALUES (
      $1, $2, 'Leading Multi-Brand Automobile Hub & Authorized Service Center in Maharashtra',
      'Nakshatra Motors is a premier automobile showroom, authorized maintenance facility, and spare parts distribution center serving commercial and personal vehicle owners across Maharashtra.',
      'Automotive & Vehicles', 'Private Limited', '51-200',
      'Pune', 'Pune', 'Plot 42, MIDC Bhosari, Pune, Maharashtra 411026', 'Verified'
    )
    ON CONFLICT DO NOTHING
    RETURNING id;
  `, [employerTableId, empName]);

  let companyTableId;
  if (compRes.rows.length > 0) {
    companyTableId = compRes.rows[0].id;
  } else {
    const existingComp = await pgClient.query('SELECT id FROM companies WHERE employer_id = $1 LIMIT 1', [employerTableId]);
    companyTableId = existingComp.rows[0].id;
  }
  console.log('Company record upserted in public.companies (ID: ' + companyTableId + ').');

  // Insert jobs for Nakshatra Motors in PostgreSQL
  await pgClient.query(`
    INSERT INTO jobs (
      employer_id, company_id, title, category, description, responsibilities, required_skills,
      education_requirement, experience_min_years, experience_max_years, salary_min, salary_max,
      salary_type, vacancies, job_type, work_mode, district, city, address, application_deadline,
      contact_email, contact_phone, status, is_featured
    )
    VALUES (
      $1, $2, 'Frontend Web Developer (React / TypeScript)', 'IT & Software',
      'Nakshatra Motors is looking for a motivated Frontend Developer to build our internal customer portal, inventory tracking dashboard, and digital service booking platform.',
      '["Develop modern, responsive web interfaces using React, Next.js, and TypeScript", "Integrate RESTful and Supabase APIs for vehicle servicing schedules and customer records"]'::jsonb,
      '["React", "TypeScript", "Tailwind CSS", "Next.js", "PostgreSQL"]'::jsonb,
      'Graduate / B.E. / B.Tech / BCA', 0, 2, 350000, 550000, 'Per Annum', 2, 'Full Time', 'On-site',
      'Pune', 'Pune', 'Plot 42, MIDC Bhosari, Pune, Maharashtra 411026', '2026-12-31',
      $3, $4, 'approved', TRUE
    )
    ON CONFLICT DO NOTHING;
  `, [employerTableId, companyTableId, empEmail, empPhone]);
  console.log('Job posting created in public.jobs for Nakshatra Motors.');

  // 2. Create/Update Candidate: suhani06@gmail.com
  const candEmail = 'suhani06@gmail.com';
  const candPassword = 'Suhani@06';
  const candName = 'Suhani Patil';
  const candPhone = '+919822000006';

  console.log(`\n--- Processing Candidate: ${candEmail} ---`);
  let candUser = usersData?.users?.find(u => u.email?.toLowerCase() === candEmail.toLowerCase());
  let candUserId;

  if (candUser) {
    console.log(`Candidate user already exists in auth.users (ID: ${candUser.id}). Updating password...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(candUser.id, {
      password: candPassword,
      email_confirm: true,
      user_metadata: { role: 'candidate', full_name: candName }
    });
    if (updateError) throw updateError;
    candUserId = candUser.id;
    console.log('Candidate password updated successfully.');
  } else {
    console.log(`Creating candidate user in auth.users...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: candEmail,
      password: candPassword,
      email_confirm: true,
      user_metadata: { role: 'candidate', full_name: candName }
    });
    if (createError) throw createError;
    candUserId = created.user.id;
    console.log(`Candidate created in auth.users with ID: ${candUserId}`);
  }

  // Upsert profile in PostgreSQL
  await pgClient.query(`
    INSERT INTO profiles (id, user_id, full_name, email, mobile, role)
    VALUES ($1, $1, $2, $3, $4, 'candidate')
    ON CONFLICT (id) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        mobile = EXCLUDED.mobile,
        role = 'candidate',
        updated_at = NOW();
  `, [candUserId, candName, candEmail, candPhone]);
  console.log('Candidate profile upserted in public.profiles.');

  // Upsert candidate record
  const candRes = await pgClient.query(`
    INSERT INTO candidates (
      profile_id, full_name, email, mobile, district, city, address, is_discoverable
    )
    VALUES ($1, $2, $3, $4, 'Pune', 'Pune', 'Kothrud, Pune, Maharashtra 411038', TRUE)
    ON CONFLICT DO NOTHING
    RETURNING id;
  `, [candUserId, candName, candEmail, candPhone]);

  let candidateTableId;
  if (candRes.rows.length > 0) {
    candidateTableId = candRes.rows[0].id;
  } else {
    const existingCand = await pgClient.query('SELECT id FROM candidates WHERE profile_id = $1 LIMIT 1', [candUserId]);
    candidateTableId = existingCand.rows[0].id;
  }

  // Insert candidate education & skills if not already present
  await pgClient.query(`
    INSERT INTO candidate_education (candidate_id, highest_qualification, degree_name, institute, passing_year, percentage_cgpa)
    VALUES ($1, 'Graduate', 'B.Tech / B.E. Computer Engineering', 'Savitribai Phule Pune University', '2024', '8.4 CGPA')
    ON CONFLICT DO NOTHING;
  `, [candidateTableId]);

  await pgClient.query(`
    INSERT INTO candidate_experience (candidate_id, is_fresher, total_experience_years, expected_salary)
    VALUES ($1, TRUE, 0, 450000)
    ON CONFLICT DO NOTHING;
  `, [candidateTableId]);

  const skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Next.js'];
  for (const s of skills) {
    await pgClient.query(`
      INSERT INTO candidate_skills (candidate_id, skill_name)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `, [candidateTableId, s]);
  }
  console.log('Candidate skills and education inserted.');

  // Test sign in for both accounts via public client to verify credentials work 100%
  console.log('\n--- VERIFYING SIGN IN WITH CREDENTIALS ---');
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const empLogin = await publicSupabase.auth.signInWithPassword({
    email: empEmail,
    password: empPassword
  });
  if (empLogin.error) {
    console.error('Employer login test FAILED:', empLogin.error.message);
  } else {
    console.log('[PASS] Employer login SUCCESSFUL! User ID:', empLogin.data.user.id);
  }

  const candLogin = await publicSupabase.auth.signInWithPassword({
    email: candEmail,
    password: candPassword
  });
  if (candLogin.error) {
    console.error('Candidate login test FAILED:', candLogin.error.message);
  } else {
    console.log('[PASS] Candidate login SUCCESSFUL! User ID:', candLogin.data.user.id);
  }

  await pgClient.end();
  console.log('\nDatabase setup complete!');
}

run().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
