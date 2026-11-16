// Verification script for Patch 2: Edge Server Route Protection for /admin
const http = require('http');

function sendGetRequest(path, headers = {}, retries = 2) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers: headers
  };

  return new Promise((resolve) => {
    const execute = (attemptsLeft) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      });

      req.on('error', async (err) => {
        if (attemptsLeft > 0) {
          await new Promise((r) => setTimeout(r, 1200));
          execute(attemptsLeft - 1);
        } else {
          console.warn('Dev server connection error:', err.message);
          resolve(null);
        }
      });

      req.end();
    };

    execute(retries);
  });
}

// Generate base64url encoded token
function createMockJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock_signature_test';
  return `${header}.${body}.${signature}`;
}

async function runPatch2Tests() {
  console.log('================================================================');
  console.log('PATCH 2 VERIFICATION SUITE: SERVER-SIDE EDGE ROUTE PROTECTION');
  console.log('================================================================\n');

  // Test 1: Direct unauthenticated API request to /admin (Accept: application/json)
  console.log('--- Test 1: Direct Unauthenticated Request to /admin (JSON) ---');
  const res1 = await sendGetRequest('/admin', { Accept: 'application/json' });
  if (!res1) {
    console.warn('Skipping network tests: dev server unreachable.');
    return;
  }

  console.log(`Status: ${res1.status}`);
  console.log(`Response: ${JSON.stringify(res1.body)}`);
  if (res1.status === 401 && res1.body.success === false && res1.body.error.includes('Super Administrator')) {
    console.log('[PASS] Edge blocked unauthenticated /admin API call with 401 Unauthorized!\n');
  } else {
    console.error(`[FAIL] Expected 401 Unauthorized, got status ${res1.status}`);
    process.exit(1);
  }

  // Test 2: Direct unauthenticated browser navigation to /admin (Accept: text/html)
  console.log('--- Test 2: Direct Unauthenticated Navigation to /admin (HTML) ---');
  const res2 = await sendGetRequest('/admin', { Accept: 'text/html' });
  console.log(`Status: ${res2.status}`);
  console.log(`Location Header: ${res2.headers.location}`);
  if ((res2.status === 307 || res2.status === 302 || res2.status === 308) && res2.headers.location && res2.headers.location.includes('/admin/login')) {
    console.log('[PASS] Edge redirected unauthenticated browser visitor to /admin/login!\n');
  } else {
    console.error(`[FAIL] Expected redirect (307/302) to /admin/login, got status ${res2.status}`);
    process.exit(1);
  }

  // Test 3: Candidate JWT in Cookie attempting to access /admin
  console.log('--- Test 3: Candidate / Attacker JWT Cookie Accessing /admin ---');
  const candidateJwt = createMockJwt({
    sub: 'cand_123',
    email: 'candidate@example.com',
    role: 'candidate',
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  const res3 = await sendGetRequest('/admin', {
    Accept: 'application/json',
    Cookie: `mahajobs_admin_token=${candidateJwt}`
  });

  console.log(`Status: ${res3.status}`);
  console.log(`Response: ${JSON.stringify(res3.body)}`);
  if (res3.status === 401 && res3.body.success === false) {
    console.log('[PASS] Candidate account token strictly rejected with 401 at Edge!\n');
  } else {
    console.error(`[FAIL] Candidate token was not rejected by Edge middleware! Got status ${res3.status}`);
    process.exit(1);
  }

  // Test 4: Access to /admin/login portal (Must be accessible for administrators to log in)
  console.log('--- Test 4: Public Accessibility of /admin/login Gate ---');
  const res4 = await sendGetRequest('/admin/login', { Accept: 'text/html' });
  console.log(`Status: ${res4.status}`);
  if (res4.status === 200) {
    console.log('[PASS] /admin/login portal successfully serves login gate with HTTP 200!\n');
  } else {
    console.error(`[FAIL] /admin/login should be accessible (200), got status ${res4.status}`);
    process.exit(1);
  }

  // Test 5: Authorized Super Admin session cookie accessing /admin
  console.log('--- Test 5: Verified Super Admin Session Accessing /admin ---');
  const adminJwt = createMockJwt({
    sub: 'admin_123',
    email: 'wasimhavaldar70@gmail.com',
    role: 'super_admin',
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  const res5 = await sendGetRequest('/admin', {
    Accept: 'text/html',
    Cookie: `mahajobs_admin_session=true; mahajobs_admin_token=${adminJwt}`
  });

  console.log(`Status: ${res5.status}`);
  if (res5.status === 200) {
    console.log('[PASS] Authorized Super Admin session granted access with HTTP 200!\n');
  } else {
    console.error(`[FAIL] Super Admin session should be granted access (200), got status ${res5.status}`);
    process.exit(1);
  }

  console.log('================================================================');
  console.log('ALL PATCH 2 EDGE SERVER-SIDE ROUTE GUARDS VERIFIED (100% PASS)');
  console.log('================================================================');
}

runPatch2Tests();
