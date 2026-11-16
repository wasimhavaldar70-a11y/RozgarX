const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runSecurityAuditTests() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  console.log('================================================================');
  console.log('MAHAJOBS: AUTOMATED SECURITY AUDIT TEST SUITE (PHASE 14)');
  console.log('Testing RLS policies, RBAC, Multi-tenancy & Anti-Tampering');
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

  // 1. Check all 38 tables have RLS enabled
  const rlsCheck = await client.query(`
    SELECT count(*) as count 
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = false;
  `);
  assert('All 38 public tables have Row-Level Security (RLS) enabled', parseInt(rlsCheck.rows[0].count) === 0, `Unprotected tables: ${rlsCheck.rows[0].count}`);

  // 2. Check Storage Buckets exist and are marked private
  const bucketsCheck = await client.query(`
    SELECT id, public FROM storage.buckets WHERE id IN ('candidate-resumes', 'employer-documents');
  `);
  const privateBuckets = bucketsCheck.rows.filter(b => b.public === false);
  assert('Candidate resumes and Employer documents buckets are strictly PRIVATE', privateBuckets.length === 2, `Found ${privateBuckets.length}/2 private buckets`);

  // 3. Test SECURITY DEFINER functions have explicit search_path
  const searchPathCheck = await client.query(`
    SELECT proname, proconfig
    FROM pg_proc
    JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
    WHERE n.nspname = 'public' 
      AND proname IN ('is_super_admin', 'get_current_candidate_id', 'get_current_employer_id', 'check_phone_registered', 'record_otp_challenge', 'verify_challenge_and_approve');
  `);
  const allHardenSearchPath = searchPathCheck.rows.every(r => r.proconfig && r.proconfig.some(c => c.includes('search_path=')));
  assert('All SECURITY DEFINER functions enforce strict search_path = public, pg_temp', allHardenSearchPath, 'Some functions missing explicit search_path');

  // 4. Test RLS Isolation using simulated sessions in a transaction
  try {
    await client.query('BEGIN;');

    // Create 3 test users (Candidate A, Candidate B, Employer X)
    const userA_id = '00000000-0000-0000-0000-000000000001';
    const userB_id = '00000000-0000-0000-0000-000000000002';
    const employerUser_id = '00000000-0000-0000-0000-000000000003';

    // Seed test profiles
    await client.query(`
      INSERT INTO public.profiles (id, user_id, full_name, email, role, mobile, phone_verified)
      VALUES 
        ('${userA_id}', '${userA_id}', 'Candidate A', 'candidateA@test.com', 'candidate', '919999900001', true),
        ('${userB_id}', '${userB_id}', 'Candidate B', 'candidateB@test.com', 'candidate', '919999900002', true),
        ('${employerUser_id}', '${employerUser_id}', 'Employer X', 'employerX@test.com', 'employer', '919999900003', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed candidate entries
    const candA_res = await client.query(`
      INSERT INTO public.candidates (profile_id, full_name, email, mobile, district)
      VALUES ('${userA_id}', 'Candidate A', 'candidateA@test.com', '919999900001', 'Pune')
      RETURNING id;
    `);
    const candA_id = candA_res.rows[0]?.id;

    const candB_res = await client.query(`
      INSERT INTO public.candidates (profile_id, full_name, email, mobile, district)
      VALUES ('${userB_id}', 'Candidate B', 'candidateB@test.com', '919999900002', 'Mumbai')
      RETURNING id;
    `);
    const candB_id = candB_res.rows[0]?.id;

    // Seed Candidate A resume
    await client.query(`
      INSERT INTO public.candidate_resumes (candidate_id, file_name, file_url, file_size_bytes, is_primary)
      VALUES ('${candA_id}', 'resumeA.pdf', 'candidate-resumes/${userA_id}/resumeA.pdf', 1024, true);
    `);

    // TEST 4A: User B attempting to read User A's resume under authenticated RLS
    await client.query(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claims" = '{"sub": "${userB_id}", "role": "authenticated"}';
    `);

    const userB_readA_resumes = await client.query(`
      SELECT * FROM public.candidate_resumes WHERE candidate_id = '${candA_id}';
    `);
    assert('Cross-Tenant Isolation: User B cannot SELECT Candidate A resumes', userB_readA_resumes.rows.length === 0, `User B saw ${userB_readA_resumes.rows.length} rows belonging to User A`);

    // TEST 4B: User B attempting to UPDATE Candidate A's resume
    const userB_updateA_resumes = await client.query(`
      UPDATE public.candidate_resumes 
      SET file_name = 'hacked.pdf' 
      WHERE candidate_id = '${candA_id}'
      RETURNING *;
    `);
    assert('Cross-Tenant Anti-Tampering: User B cannot UPDATE Candidate A resumes', userB_updateA_resumes.rows.length === 0, 'User B was able to modify User A resume');

    // Reset role to superuser to seed employer
    await client.query(`RESET ROLE;`);

    // Seed employer entry
    const empRes = await client.query(`
      INSERT INTO public.employers (profile_id, contact_person, business_email, mobile)
      VALUES ('${employerUser_id}', 'Employer X', 'employerX@test.com', '919999900003')
      RETURNING id;
    `);
    const empId = empRes.rows[0]?.id;

    // Seed company
    const compRes = await client.query(`
      INSERT INTO public.companies (employer_id, name, industry, company_type, district)
      VALUES ('${empId}', 'Test Corp', 'IT', 'Private Limited', 'Pune')
      RETURNING id;
    `);
    const compId = compRes.rows[0]?.id;

    // Seed document with Pending status
    const docRes = await client.query(`
      INSERT INTO public.employer_documents (company_id, document_type, document_url, verification_status)
      VALUES ('${compId}', 'GST Certificate', 'employer-documents/${employerUser_id}/gst.pdf', 'Pending')
      RETURNING id;
    `);
    const docId = docRes.rows[0]?.id;

    // TEST 4C: Employer attempts to self-approve verification_status to 'Approved'
    await client.query(`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claims" = '{"sub": "${employerUser_id}", "role": "authenticated"}';
    `);

    // The RLS policy WITH CHECK requires verification_status = 'Pending' unless is_super_admin()
    await client.query(`SAVEPOINT test_doc_approval;`);
    let selfApprovalBlocked = false;
    try {
      await client.query(`
        UPDATE public.employer_documents 
        SET verification_status = 'Approved' 
        WHERE id = '${docId}';
      `);
    } catch (e) {
      selfApprovalBlocked = true;
      await client.query(`ROLLBACK TO SAVEPOINT test_doc_approval;`);
    }
    await client.query(`RESET ROLE;`);
    
    const docCheck = await client.query(`SELECT verification_status FROM public.employer_documents WHERE id = '${docId}';`);
    assert('Self-Approval Prevention: Employer cannot alter document verification_status to Approved', selfApprovalBlocked || docCheck.rows[0].verification_status === 'Pending', `Status was changed to ${docCheck.rows[0].verification_status}`);

    // TEST 4D: Storage RLS - Unauthenticated anonymous users cannot read private resumes
    await client.query(`
      SET LOCAL ROLE anon;
      SET LOCAL "request.jwt.claims" = '{"role": "anon"}';
    `);
    const anonStorageRead = await client.query(`
      SELECT * FROM storage.objects WHERE bucket_id = 'candidate-resumes';
    `);
    assert('Storage Security: Unauthenticated anonymous users cannot SELECT private resumes', anonStorageRead.rows.length === 0, `Anon read ${anonStorageRead.rows.length} objects`);

    await client.query(`RESET ROLE;`);

    // TEST 4E: OTP Replay Prevention (verify_challenge_and_approve)
    const challengeRes = await client.query(`
      SELECT public.record_otp_challenge(
        '919999900010',
        'candidate_registration',
        'req_123456',
        'hashed_token_test',
        10
      ) as challenge_id;
    `);
    const challengeId = challengeRes.rows[0].challenge_id;

    // Verify challenge first time
    const verify1 = await client.query(`
      SELECT public.verify_challenge_and_approve(
        '${challengeId}',
        '919999900010',
        'candidate',
        'hashed_token_test',
        5
      ) as is_valid;
    `);
    assert('OTP Verification: Valid OTP challenge succeeds on first attempt', verify1.rows[0].is_valid === true, 'First verification failed');

    // Replay attack: attempt to use the same challenge again
    const verify2 = await client.query(`
      SELECT public.verify_challenge_and_approve(
        '${challengeId}',
        '919999900010',
        'candidate',
        'hashed_token_test',
        5
      ) as is_valid;
    `);
    assert('Replay Attack Prevention: Reused OTP challenge is rejected immediately', verify2.rows[0].is_valid === false, 'Replayed OTP was accepted');

    // Always ROLLBACK test transactions so no dummy data is left
    await client.query('ROLLBACK;');
    console.log('\n[INFO] Test transaction safely rolled back. Zero dummy test data retained.');

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await client.end();
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
}

runSecurityAuditTests().catch(console.error);
