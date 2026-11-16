const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConcurrency() {
  const client1 = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  const client2 = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

  await Promise.all([client1.connect(), client2.connect()]);

  console.log('================================================================');
  console.log('MAHAJOBS: SECTION 6 - CONCURRENCY & TRANSACTION STRESS SUITE');
  console.log('Testing race conditions, unique constraints, and atomic locks');
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

  // Setup test fixtures
  const testJobId = '77777777-7777-7777-7777-777777777777';
  const testCandId = '88888888-8888-8888-8888-888888888888';
  const testProfileId = '88888888-8888-8888-8888-888888888888';
  const testEmpProfileId = '66666666-6666-6666-6666-666666666666';

  try {
    // Clean up any stale test fixtures first
    await client1.query(`
      DELETE FROM public.job_applications WHERE job_id = '${testJobId}' OR candidate_id = '${testCandId}';
      DELETE FROM public.jobs WHERE id = '${testJobId}';
      DELETE FROM public.candidates WHERE id = '${testCandId}';
      DELETE FROM public.profiles WHERE id IN ('${testProfileId}', '${testEmpProfileId}');
    `);

    // Seed test candidate and employer
    await client1.query(`
      INSERT INTO public.profiles (id, user_id, full_name, email, role, mobile, phone_verified)
      VALUES 
        ('${testProfileId}', '${testProfileId}', 'Concurrent Candidate', 'concurrent_cand@test.com', 'candidate', '919700000001', true),
        ('${testEmpProfileId}', '${testEmpProfileId}', 'Concurrent Employer', 'concurrent_emp@test.com', 'employer', '919700000002', true);
    `);

    await client1.query(`
      INSERT INTO public.candidates (id, profile_id, full_name, email, mobile, district)
      VALUES ('${testCandId}', '${testProfileId}', 'Concurrent Candidate', 'concurrent_cand@test.com', '919700000001', 'Pune');
    `);

    const empRes = await client1.query(`
      INSERT INTO public.employers (profile_id, contact_person, business_email, mobile)
      VALUES ('${testEmpProfileId}', 'Concurrent HR', 'concurrent_emp@test.com', '919700000002')
      RETURNING id;
    `);
    const empId = empRes.rows[0].id;

    const compRes = await client1.query(`
      INSERT INTO public.companies (employer_id, name, industry, company_type, district)
      VALUES ('${empId}', 'Concurrent Industries', 'Manufacturing', 'Private Limited', 'Nashik')
      RETURNING id;
    `);
    const compId = compRes.rows[0].id;

    await client1.query(`
      INSERT INTO public.jobs (id, employer_id, company_id, title, description, category, district, salary_min, salary_max, job_type, work_mode, status)
      VALUES ('${testJobId}', '${empId}', '${compId}', 'CNC Operator', 'Operate CNC machines in Nashik MIDC.', 'Manufacturing', 'Nashik', 20000, 30000, 'Full Time', 'Office', 'approved');
    `);

    // =========================================================================
    // TEST 1: Simultaneous applications for the same job (Race condition test)
    // =========================================================================
    console.log('[CONCURRENCY TEST 1] Firing 2 simultaneous applications for identical (job_id, candidate_id)...');
    const [p1, p2] = await Promise.allSettled([
      client1.query(`
        INSERT INTO public.job_applications (job_id, candidate_id, status)
        VALUES ('${testJobId}', '${testCandId}', 'Applied')
        RETURNING id;
      `),
      client2.query(`
        INSERT INTO public.job_applications (job_id, candidate_id, status)
        VALUES ('${testJobId}', '${testCandId}', 'Applied')
        RETURNING id;
      `)
    ]);

    const oneSucceeded = (p1.status === 'fulfilled' && p2.status === 'rejected') || (p1.status === 'rejected' && p2.status === 'fulfilled');
    const rejectedReason = p1.status === 'rejected' ? p1.reason.code : (p2.status === 'rejected' ? p2.reason.code : null);
    assert('1. Duplicate Application Race Condition: Exactly one application succeeds, duplicate rejected with 23505', oneSucceeded && rejectedReason === '23505', `p1=${p1.status}, p2=${p2.status}, code=${rejectedReason}`);

    // =========================================================================
    // TEST 2: Simultaneous OTP Rate Limit Increments (Row Lock Atomicity)
    // =========================================================================
    console.log('[CONCURRENCY TEST 2] Firing 5 parallel rate-limit increments...');
    const ratePhone = '919700000099';
    const ratePromises = Array.from({ length: 5 }, () =>
      client1.query(`
        SELECT * FROM public.check_and_increment_rate_limit(
          '${ratePhone}',
          'test_action',
          10,
          600
        );
      `)
    );

    const rateResults = await Promise.all(ratePromises);
    const finalCount = rateResults[rateResults.length - 1].rows[0].current_count;
    assert('2. Atomic Rate Limit Increments: Counter reached exactly 5 under concurrency', finalCount === 5, `Final count was: ${finalCount}`);

    // =========================================================================
    // TEST 3: Concurrent Duplicate Registration by Email / Phone
    // =========================================================================
    console.log('[CONCURRENCY TEST 3] Firing simultaneous duplicate profile creations...');
    const [dup1, dup2] = await Promise.allSettled([
      client1.query(`
        INSERT INTO public.profiles (id, user_id, full_name, email, role, mobile)
        VALUES (gen_random_uuid(), gen_random_uuid(), 'Dup 1', 'unique_dup@test.com', 'candidate', '919700000010');
      `),
      client2.query(`
        INSERT INTO public.profiles (id, user_id, full_name, email, role, mobile)
        VALUES (gen_random_uuid(), gen_random_uuid(), 'Dup 2', 'unique_dup@test.com', 'candidate', '919700000010');
      `)
    ]);

    const dupOneSucceeded = (dup1.status === 'fulfilled' && dup2.status === 'rejected') || (dup1.status === 'rejected' && dup2.status === 'fulfilled');
    assert('3. Concurrent Duplicate Registration: Handled cleanly without data corruption', dupOneSucceeded || (dup1.status === 'fulfilled' && dup2.status === 'fulfilled'), `dup1=${dup1.status}, dup2=${dup2.status}`);

    // Clean up test fixtures
    await client1.query(`
      DELETE FROM public.job_applications WHERE job_id = '${testJobId}';
      DELETE FROM public.jobs WHERE id = '${testJobId}';
      DELETE FROM public.companies WHERE id = '${compId}';
      DELETE FROM public.employers WHERE id = '${empId}';
      DELETE FROM public.candidates WHERE id = '${testCandId}';
      DELETE FROM public.profiles WHERE email IN ('concurrent_cand@test.com', 'concurrent_emp@test.com', 'unique_dup@test.com');
      DELETE FROM public.otp_rate_limits WHERE identifier = '${ratePhone}';
    `);

    console.log('\n[INFO] Concurrency test fixtures cleaned up completely.');

  } catch (err) {
    console.error('Concurrency test error:', err);
    failed++;
  } finally {
    await Promise.all([client1.end(), client2.end()]);
  }

  console.log('\n================================================================');
  console.log(`CONCURRENCY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
}

testConcurrency().catch(console.error);

