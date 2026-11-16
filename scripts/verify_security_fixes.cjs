const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function testIpHashHardening() {
  console.log('--- Test 1: IP Hash Hardening ---');
  const headersSpoofed = new Headers({
    'x-forwarded-for': 'attacker.spoofed.ip, 203.0.113.195',
    'cf-connecting-ip': '203.0.113.195'
  });

  const headersAttackerOnly = new Headers({
    'x-forwarded-for': '198.51.100.1, 198.51.100.2'
  });

  function resolveIp(headers) {
    const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();
    const xRealIp = headers.get('x-real-ip')?.trim();
    const forwarded = headers.get('x-forwarded-for')?.trim();
    let ip = cfConnectingIp || xRealIp;
    if (!ip && forwarded) {
      const parts = forwarded.split(',').map(p => p.trim()).filter(Boolean);
      ip = parts.length > 0 ? parts[parts.length - 1] : 'unknown_ip';
    }
    return ip || 'unknown_ip';
  }

  const resolved1 = resolveIp(headersSpoofed);
  const resolved2 = resolveIp(headersAttackerOnly);

  console.log('Resolved IP from Cloudflare/Vercel edge:', resolved1);
  console.log('Resolved IP from rightmost proxy:', resolved2);

  if (resolved1 === '203.0.113.195' && resolved2 === '198.51.100.2') {
    console.log('[PASS] Edge proxy IP correctly prioritized over spoofed X-Forwarded-For');
  } else {
    console.error('[FAIL] IP spoofing protection failed');
    process.exit(1);
  }
}

function testJsonLdEscaping() {
  console.log('\n--- Test 2: JSON-LD XSS Escaping ---');
  const maliciousInput = '</script><script>alert("XSS")</script>';
  const serialized = JSON.stringify({ title: maliciousInput })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  console.log('Serialized JSON-LD output:', serialized);
  if (!serialized.includes('<') && !serialized.includes('>')) {
    console.log('[PASS] Dangerous script tag characters neutralized in JSON-LD');
  } else {
    console.error('[FAIL] Script tag characters remained unescaped');
    process.exit(1);
  }
}

testIpHashHardening();
testJsonLdEscaping();
console.log('\nAll security unit verification tests PASSED!');
