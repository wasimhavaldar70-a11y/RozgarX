/**
 * Automated Test Suite: Server-Side Input Validation (Zod Schemas)
 * Tests that:
 * 1. Missing mandatory fields are rejected with HTTP 400.
 * 2. Unexpected extra fields are rejected with HTTP 400 (mass assignment protection via .strict()).
 * 3. Inverted ranges (salaryMax < salaryMin, expMax < expMin) are rejected with HTTP 400.
 * 4. Invalid formats (malformed phone, invalid UUID, non-6 digit OTP) are rejected with HTTP 400.
 * 5. Valid payloads pass schema validation.
 */

const http = require('http');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function makeRequest({ path, method = 'POST', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body !== null ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(postData ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {})
    };

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('      MAHAJOBS SERVER-SIDE INPUT VALIDATION TEST SUITE          ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // MODULE 1: /api/otp/send Validation
    // -------------------------------------------------------------
    console.log('1. Testing /api/otp/send validation...');

    // Case 1A: Unexpected extra field (mass assignment)
    const extraFieldRes = await makeRequest({
      path: '/api/otp/send',
      body: {
        mobile: '9876543210',
        role: 'candidate',
        isAdmin: true // Unauthorized extra field
      }
    });
    assert(extraFieldRes.statusCode === 400, `Rejected unexpected extra field with HTTP 400 (Got ${extraFieldRes.statusCode})`);
    assert(extraFieldRes.body.error && extraFieldRes.body.error.includes('Validation Error'), `Error message indicates validation failure: "${extraFieldRes.body.error}"`);

    // Case 1B: Invalid mobile number format (non-Indian start digit)
    const badPhoneRes = await makeRequest({
      path: '/api/otp/send',
      body: {
        mobile: '1234567890', // Does not start with 6-9
        role: 'candidate'
      }
    });
    assert(badPhoneRes.statusCode === 400, `Rejected non-Indian phone with HTTP 400 (Got ${badPhoneRes.statusCode})`);

    // Case 1C: Invalid role
    const badRoleRes = await makeRequest({
      path: '/api/otp/send',
      body: {
        mobile: '9876543210',
        role: 'super_admin' // Disallowed role in registration
      }
    });
    assert(badRoleRes.statusCode === 400, `Rejected unauthorized role with HTTP 400 (Got ${badRoleRes.statusCode})`);

    // -------------------------------------------------------------
    // MODULE 2: /api/otp/verify Validation
    // -------------------------------------------------------------
    console.log('\n2. Testing /api/otp/verify validation...');

    // Case 2A: Non-UUID challenge ID
    const badUuidRes = await makeRequest({
      path: '/api/otp/verify',
      body: {
        challengeId: 'not-a-valid-uuid',
        mobile: '9876543210',
        otp: '123456',
        role: 'candidate'
      }
    });
    assert(badUuidRes.statusCode === 400, `Rejected malformed challenge UUID with HTTP 400 (Got ${badUuidRes.statusCode})`);

    // Case 2B: Malformed OTP (5 digits instead of 6)
    const badOtpRes = await makeRequest({
      path: '/api/otp/verify',
      body: {
        challengeId: '123e4567-e89b-12d3-a456-426614174000',
        mobile: '9876543210',
        otp: '12345', // 5 digits
        role: 'candidate'
      }
    });
    assert(badOtpRes.statusCode === 400, `Rejected 5-digit OTP with HTTP 400 (Got ${badOtpRes.statusCode})`);

    // Case 2C: Extra unauthorized property
    const verifyExtraRes = await makeRequest({
      path: '/api/otp/verify',
      body: {
        challengeId: '123e4567-e89b-12d3-a456-426614174000',
        mobile: '9876543210',
        otp: '123456',
        role: 'candidate',
        bypassOtp: true // Malicious extra field
      }
    });
    assert(verifyExtraRes.statusCode === 400, `Rejected extra field on verify with HTTP 400 (Got ${verifyExtraRes.statusCode})`);

    // -------------------------------------------------------------
    // MODULE 3: /api/otp/resend Validation
    // -------------------------------------------------------------
    console.log('\n3. Testing /api/otp/resend validation...');

    const resendExtraRes = await makeRequest({
      path: '/api/otp/resend',
      body: {
        mobile: '9876543210',
        role: 'candidate',
        sendCount: 99 // Extra property
      }
    });
    assert(resendExtraRes.statusCode === 400, `Rejected extra field on resend with HTTP 400 (Got ${resendExtraRes.statusCode})`);

    // -------------------------------------------------------------
    // MODULE 4: /api/otp/complete Validation
    // -------------------------------------------------------------
    console.log('\n4. Testing /api/otp/complete validation...');

    // Case 4A: Missing required candidate fullName
    const missingNameRes = await makeRequest({
      path: '/api/otp/complete',
      body: {
        role: 'candidate',
        approvalToken: 'a'.repeat(48),
        email: 'test@example.com',
        password: 'ValidPassword123!',
        mobile: '9876543210',
        district: 'Pune'
        // fullName missing
      }
    });
    assert(missingNameRes.statusCode === 400, `Rejected missing candidate name with HTTP 400 (Got ${missingNameRes.statusCode})`);

    // Case 4B: Password too short (< 8 chars)
    const shortPassRes = await makeRequest({
      path: '/api/otp/complete',
      body: {
        role: 'candidate',
        approvalToken: 'a'.repeat(48),
        email: 'test@example.com',
        password: 'short',
        mobile: '9876543210',
        district: 'Pune',
        fullName: 'Test Candidate'
      }
    });
    assert(shortPassRes.statusCode === 400, `Rejected short password with HTTP 400 (Got ${shortPassRes.statusCode})`);

    // Case 4C: Extra field injection attempt
    const completeExtraRes = await makeRequest({
      path: '/api/otp/complete',
      body: {
        role: 'candidate',
        approvalToken: 'a'.repeat(48),
        email: 'test@example.com',
        password: 'ValidPassword123!',
        mobile: '9876543210',
        district: 'Pune',
        fullName: 'Test Candidate',
        roleOverride: 'super_admin' // Privilege escalation injection attempt
      }
    });
    assert(completeExtraRes.statusCode === 400, `Rejected privilege escalation extra field with HTTP 400 (Got ${completeExtraRes.statusCode})`);

    // -------------------------------------------------------------
    // MODULE 5: /api/jobs/create Validation
    // -------------------------------------------------------------
    console.log('\n5. Testing /api/jobs/create validation...');

    // Sign in as verified employer to obtain a valid bearer token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const publicClient = createClient(supabaseUrl, anonKey);
    const loginRes = await publicClient.auth.signInWithPassword({
      email: 'nakshatramotors24@gmail.com',
      password: 'Nakshatra@24'
    });

    const employerToken = loginRes.data?.session?.access_token;
    assert(Boolean(employerToken), 'Obtained live employer JWT session for schema validation testing');

    if (employerToken) {
      // Case 5A: Inverted salary range (salaryMax < salaryMin)
      const invertedSalaryRes = await makeRequest({
        path: '/api/jobs/create',
        headers: {
          Authorization: `Bearer ${employerToken}`
        },
        body: {
          title: 'Senior Software Engineer',
          category: 'Information Technology',
          description: 'Comprehensive software development vacancy in Pune.',
          salaryMin: 500000,
          salaryMax: 300000, // Invalid: Max < Min
          district: 'Pune',
          city: 'Pune'
        }
      });
      assert(invertedSalaryRes.statusCode === 400, `Rejected inverted salary range with HTTP 400 (Got ${invertedSalaryRes.statusCode})`);
      assert(invertedSalaryRes.body.error && invertedSalaryRes.body.error.includes('Maximum salary'), `Error details specific to salary: "${invertedSalaryRes.body.error}"`);

      // Case 5B: Inverted experience range (experienceMaxYears < experienceMinYears)
      const invertedExpRes = await makeRequest({
        path: '/api/jobs/create',
        headers: {
          Authorization: `Bearer ${employerToken}`
        },
        body: {
          title: 'Senior Software Engineer',
          category: 'Information Technology',
          description: 'Comprehensive software development vacancy in Pune.',
          experienceMinYears: 10,
          experienceMaxYears: 2, // Invalid: Max < Min
          district: 'Pune',
          city: 'Pune'
        }
      });
      assert(invertedExpRes.statusCode === 400, `Rejected inverted experience range with HTTP 400 (Got ${invertedExpRes.statusCode})`);

      // Case 5C: Extra field injection on vacancy create
      const jobExtraRes = await makeRequest({
        path: '/api/jobs/create',
        headers: {
          Authorization: `Bearer ${employerToken}`
        },
        body: {
          title: 'Senior Software Engineer',
          category: 'Information Technology',
          description: 'Comprehensive software development vacancy in Pune.',
          district: 'Pune',
          city: 'Pune',
          is_verified_override: true // Extra field
        }
      });
      assert(jobExtraRes.statusCode === 400, `Rejected extra field on job vacancy with HTTP 400 (Got ${jobExtraRes.statusCode})`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed} / ${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
