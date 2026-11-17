/**
 * Automated Test Suite: API Rate Limiting Verification
 * Tests that:
 * 1. Normal requests return 200 with X-RateLimit headers.
 * 2. Rate limit exhaustion returns HTTP 429 Too Many Requests.
 * 3. HTTP 429 response body contains success: false, error message, and retryAfter.
 * 4. Retry-After header is returned.
 * 5. Multi-instance shared storage in Supabase PostgreSQL works properly.
 */

const http = require('http');

function makeRequest({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
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
  console.log('      MAHAJOBS API RATE LIMITING VERIFICATION TEST SUITE        ');
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
    // TEST 1: Health check normal request
    console.log('1. Testing /api/health normal request & headers...');
    const healthRes = await makeRequest({ path: '/api/health' });
    assert(healthRes.statusCode === 200, `/api/health returned 200 OK (Got ${healthRes.statusCode})`);
    assert(healthRes.headers['x-ratelimit-limit'] === '120', `Rate limit header set to 120 (Got ${healthRes.headers['x-ratelimit-limit']})`);
    assert(Number(healthRes.headers['x-ratelimit-remaining']) >= 0, `Rate limit remaining header present (Got ${healthRes.headers['x-ratelimit-remaining']})`);

    // TEST 2: /api/stats normal request & headers
    console.log('\n2. Testing /api/stats normal request & headers...');
    const statsRes = await makeRequest({ path: '/api/stats' });
    assert(statsRes.statusCode === 200, `/api/stats returned 200 OK (Got ${statsRes.statusCode})`);
    assert(statsRes.headers['x-ratelimit-limit'] === '60', `Rate limit header set to 60 (Got ${statsRes.headers['x-ratelimit-limit']})`);

    // TEST 3: Direct testing of check_and_increment_rate_limit via Supabase Admin
    console.log('\n3. Testing PostgreSQL check_and_increment_rate_limit RPC directly...');
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing Supabase credentials in .env.local');
      return;
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const testIdentifier = `test_ip_rate_limit_${Date.now()}`;
    const action = 'test_unit_action';

    // First request should be allowed (limit: 2)
    const { data: r1, error: e1 } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
      p_identifier: testIdentifier,
      p_action: action,
      p_max_attempts: 2,
      p_window_seconds: 30
    });
    assert(!e1 && r1[0].allowed === true, 'First attempt allowed under limit');
    assert(r1[0].current_count === 1, 'First attempt count is 1');

    // Second request should be allowed
    const { data: r2 } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
      p_identifier: testIdentifier,
      p_action: action,
      p_max_attempts: 2,
      p_window_seconds: 30
    });
    assert(r2[0].allowed === true, 'Second attempt allowed under limit');
    assert(r2[0].current_count === 2, 'Second attempt count is 2');

    // Third request should be BLOCKED (limit: 2 exceeded)
    const { data: r3 } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
      p_identifier: testIdentifier,
      p_action: action,
      p_max_attempts: 2,
      p_window_seconds: 30
    });
    assert(r3[0].allowed === false, 'Third attempt BLOCKED (allowed === false)');
    assert(r3[0].retry_after_seconds > 0, `retry_after_seconds returned (${r3[0].retry_after_seconds}s)`);

    // TEST 4: Sensitive Endpoint Rate Limiting Verification (/api/jobs/create)
    console.log('\n4. Testing /api/jobs/create rate limiting & HTTP 429 response...');
    // We simulate a custom IP hitting /api/jobs/create up to its limit (15 requests/minute)
    const testIp = `203.0.113.${Math.floor(Math.random() * 200) + 10}`;
    let hit429 = false;
    let lastResponse = null;

    for (let i = 1; i <= 17; i++) {
      const res = await makeRequest({
        path: '/api/jobs/create',
        method: 'POST',
        headers: {
          'x-real-ip': testIp,
          'Authorization': 'Bearer invalid_or_missing_token'
        },
        body: { title: 'Test Job' }
      });
      lastResponse = res;
      if (res.statusCode === 429) {
        hit429 = true;
        break;
      }
    }

    assert(hit429, `IP hitting /api/jobs/create was blocked with HTTP 429 (After 15 attempts)`);
    assert(lastResponse && lastResponse.body.success === false, 'HTTP 429 response has success: false');
    assert(lastResponse && typeof lastResponse.body.retryAfter === 'number', `HTTP 429 body includes retryAfter (${lastResponse?.body?.retryAfter}s)`);
    assert(lastResponse && Boolean(lastResponse.headers['retry-after']), `HTTP 429 headers include Retry-After (${lastResponse?.headers['retry-after']}s)`);

    // TEST 5: Verify /api/otp/verify IP rate limiting
    console.log('\n5. Testing /api/otp/verify rate limiting...');
    const verifyIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    let verifyHit429 = false;
    let verifyLastRes = null;

    for (let i = 1; i <= 17; i++) {
      const res = await makeRequest({
        path: '/api/otp/verify',
        method: 'POST',
        headers: { 'x-real-ip': verifyIp },
        body: {
          challengeId: '00000000-0000-0000-0000-000000000000',
          mobile: '9876543210',
          otp: '123456',
          role: 'candidate'
        }
      });
      verifyLastRes = res;
      if (res.statusCode === 429) {
        verifyHit429 = true;
        break;
      }
    }

    assert(verifyHit429, 'IP hitting /api/otp/verify was blocked with HTTP 429');
    assert(verifyLastRes && Boolean(verifyLastRes.headers['retry-after']), `Retry-After header present on verify 429 (${verifyLastRes?.headers['retry-after']}s)`);

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
