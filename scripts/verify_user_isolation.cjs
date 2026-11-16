const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyUserIsolation() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('================================================================');
  console.log('MAHAJOBS: SECTION 2 - USER ACCOUNT ISOLATION TEST SUITE');
  console.log('Testing Candidate A/B, Employer A/B, and Super Admin boundaries');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    await client.query('BEGIN;');

    // 1. Setup Test Identities
    const candA_user = '10000000-0000-0000-0000-000000000001';
    const candB_user = '10000000-0000-0000-0000-000000000002';
    const empA_user  = '20000000-0000-0000-0000-000000000001';
    const empB_user  = '20000000-0000-0000-0000-000000000002';
    const admin_user = '90000000-0000-0000-0000-000000000001';

    // Seed profiles
    await client.query(`
      INSERT INTO public.profiles (id, user_id, full_name, email, role, mobile, phone_verified)
      VALUES 
        ('${candA_user}', '${candA_user}', 'Candidate A', 'canda@test.com', 'candidate', '919800000001', true),
        ('${candB_user}', '${candB_user}', 'Candidate B', 'candb@test.com', 'candidate', '919800000002', true),
        ('${empA_user}',  '${empA_user}',  'Employer A',  'empa@test.com',  'employer',  '919800000003', true),
        ('${empB_user}',  '${empB_user}',  'Employer B',  'empb@test.com',  'employer',  '919800000004', true),
        ('${admin_user}', '${admin_user}', 'Admin User',  'admin@test.com', 'super_admin','919800000005', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed Candidates
    const candA_row = await client.query(`
      INSERT INTO public.candidates (profile_id, full_name, email, mobile, district)
      VALUES ('${candA_user}', 'Candidate A', 'canda@test.com', '919800000001', 'Pune')
      RETURNING id;
    `);
    const candA_id = candA_row.rows[0].id;

    const candB_row = await client.query(`
      INSERT INTO public.candidates (profile_id, full_name, email, mobile, district)
      VALUES ('${candB_user}', 'Candidate B', 'candb@test.com', '919800000002', 'Nagpur')
      RETURNING id;
    `);
    const candB_id = candB_row.rows[0].id;

    // Seed Candidate B Resume
    await client.query(`
      INSERT INTO public.candidate_resumes (candidate_id, file_name, file_url, file_size_bytes, is_primary)
      VALUES ('${candB_id}', 'candB_resume.pdf', 'candidate-resumes/${candB_user}/candB_resume.pdf', 2048, true);
    `);

    // Seed Employers
    const empA_row = await client.query(`
      INSERT INTO public.employers (profile_id, contact_person, business_email, mobile)
      VALUES ('${empA_user}', 'Recruiter A', 'empa@test.com', '919800000003')
      RETURNING id;
    `);
    const empA_id = empA_row.rows[0].id;

    const empB_row = await client.query(`
      INSERT INTO public.employers (profile_id, contact_person, business_email, mobile)
      VALUES ('${empB_user}', 'Recruiter B', 'empb@test.com', '919800000004')
      RETURNING id;
    `);
    const empB_id = empB_row.rows[0].id;

    // Seed Companies
    const compA_row = await client.query(`
      INSERT INTO public.companies (employer_id, name, industry, company_type, district)
      VALUES ('${empA_id}', 'Tech Corp A', 'IT', 'Private Limited', 'Pune')
      RETURNING id;
    `);
    const compA_id = compA_row.rows[0].id;

    const compB_row = await client.query(`
      INSERT INTO public.companies (employer_id, name, industry, company_type, district)
      VALUES ('${empB_id}', 'Logistics Corp B', 'Logistics', 'Private Limited', 'Thane')
      RETURNING id;
    `);
    const compB_id = compB_row.rows[0].id;

    // Seed Employer B Private Document
    await client.query(`
      INSERT INTO public.employer_documents (company_id, document_type, document_url, verification_status)
      VALUES ('${compB_id}', 'PAN Card', 'employer-documents/${empB_user}/pan.pdf', 'Pending');
    `);

    // Seed Job for Employer A
    const jobA_row = await client.query(`
      INSERT INTO public.jobs (employer_id, company_id, title, description, category, district, salary_min, salary_max, job_type, work_mode, status)
      VALUES ('${empA_id}', '${compA_id}', 'React Developer', 'Full stack react developer vacancy in Pune MIDC.', 'IT & Software', 'Pune', 25000, 50000, 'Full Time', 'Office', 'approved')
      RETURNING id;
    `);
    const jobA_id = jobA_row.rows[0].id;

    // Candidate A applies to Job A
    const appA_row = await client.query(`
      INSERT INTO public.job_applications (job_id, candidate_id, status)
      VALUES ('${jobA_id}', '${candA_id}', 'Applied')
      RETURNING id;
    `);
    const appA_id = appA_row.rows[0].id;

    // =========================================================================
    // TEST 1: Candidate A cannot read Candidate B's private profile
    // =========================================================================
    await client.query(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claims" = '{"sub": "${candA_user}", "role": "authenticated"}';
    `);
    const readB_profile = await client.query(`
      SELECT * FROM public.profiles WHERE id = '${candB_user}';
    `);
    assert('1. Candidate A cannot read Candidate B profile', readB_profile.rows.length === 0, `Candidate A saw ${readB_profile.rows.length} rows`);

    // =========================================================================
    // TEST 2: Candidate A cannot modify Candidate B's profile
    // =========================================================================
    const updateB_profile = await client.query(`
      UPDATE public.profiles 
      SET full_name = 'Hacked Name' 
      WHERE id = '${candB_user}'
      RETURNING *;
    `);
    assert('2. Candidate A cannot modify Candidate B profile', updateB_profile.rows.length === 0, 'Candidate A modified Candidate B profile');

    // =========================================================================
    // TEST 3: Employer A cannot access Employer B's private documents
    // =========================================================================
    await client.query(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claims" = '{"sub": "${empA_user}", "role": "authenticated"}';
    `);
    const readB_docs = await client.query(`
      SELECT * FROM public.employer_documents WHERE company_id = '${compB_id}';
    `);
    assert('3. Employer A cannot access Employer B private KYC documents', readB_docs.rows.length === 0, `Employer A saw ${readB_docs.rows.length} documents`);

    // =========================================================================
    // TEST 4: Employers cannot access unauthorized candidate documents
    // (Candidate B has NEVER applied to Employer A's job)
    // =========================================================================
    const readB_resume = await client.query(`
      SELECT * FROM public.candidate_resumes WHERE candidate_id = '${candB_id}';
    `);
    assert('4. Employer A cannot access non-applicant Candidate B resume', readB_resume.rows.length === 0, `Employer A saw non-applicant resume`);

    // =========================================================================
    // TEST 5: Candidates cannot modify their application decisions
    // (Candidate A tries to change status from Applied to Selected)
    // =========================================================================
    await client.query(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claims" = '{"sub": "${candA_user}", "role": "authenticated"}';
    `);
    const candTamperApp = await client.query(`
      UPDATE public.job_applications 
      SET status = 'Selected' 
      WHERE id = '${appA_id}'
      RETURNING *;
    `);
    assert('5. Candidate cannot modify job application status/decision', candTamperApp.rows.length === 0, 'Candidate modified application status');

    // =========================================================================
    // TEST 6: Normal users cannot change their roles
    // =========================================================================
    await client.query(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claims" = '{"sub": "${candA_user}", "role": "authenticated"}';
    `);

    let roleEscalationBlocked = false;
    await client.query(`SAVEPOINT test_role_escalate;`);
    try {
      await client.query(`
        UPDATE public.profiles 
        SET role = 'super_admin' 
        WHERE id = '${candA_user}';
      `);
    } catch (e) {
      roleEscalationBlocked = true;
      await client.query(`ROLLBACK TO SAVEPOINT test_role_escalate;`);
    }

    await client.query(`RESET ROLE;`);
    const verifyRole = await client.query(`SELECT role FROM public.profiles WHERE id = '${candA_user}';`);
    assert('6. Normal users cannot self-escalate role (RLS WITH CHECK blocks escalation)', roleEscalationBlocked || verifyRole.rows[0].role === 'candidate', `Role was: ${verifyRole.rows[0].role}`);

    // =========================================================================
    // TEST 7: Anonymous users cannot access private records
    // =========================================================================
    await client.query(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claims" = '{"role": "anon"}';
    `);
    const anonProfiles = await client.query(`SELECT * FROM public.profiles;`);
    const anonCandidates = await client.query(`SELECT * FROM public.candidates;`);
    const anonResumes = await client.query(`SELECT * FROM public.candidate_resumes;`);
    const anonDocs = await client.query(`SELECT * FROM public.employer_documents;`);
    const anonApps = await client.query(`SELECT * FROM public.job_applications;`);

    const anonPassed = 
      anonProfiles.rows.length === 0 &&
      anonCandidates.rows.length === 0 &&
      anonResumes.rows.length === 0 &&
      anonDocs.rows.length === 0 &&
      anonApps.rows.length === 0;

    assert('7. Anonymous users cannot access private records (0 rows across all private tables)', anonPassed, 
      `Leak detected: Profiles=${anonProfiles.rows.length}, Candidates=${anonCandidates.rows.length}, Resumes=${anonResumes.rows.length}, Docs=${anonDocs.rows.length}, Apps=${anonApps.rows.length}`);

    // Rollback test transaction
    await client.query('ROLLBACK;');
    console.log('\n[INFO] User isolation test transaction safely rolled back. Clean database preserved.');

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await client.end();
  }

  console.log('\n================================================================');
  console.log(`USER ISOLATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
}

verifyUserIsolation().catch(console.error);
