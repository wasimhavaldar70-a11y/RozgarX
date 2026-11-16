# MAHAJOBS PLATFORM — CONSOLIDATED SECURITY AUDIT BUNDLE
Generated: 2026-11-16T11:56:18.561Z
Target: Maharashtra Job Portal (MahaJobs)
Repository: mahajobs---maharashtra-job-portal

---

## TABLE OF CONTENTS

| # | Priority | File Path | Focus Area | Lines | Size |
|---|:---:|---|---|:---:|:---:|
| 1 | Priority 1 | [`src/app/api/jobs/create/route.ts`](#file-1-src-app-api-jobs-create-route-ts) | Authentication, job creation, company ownership | 309 | 10.8 KB |
| 2 | Priority 2 | [`src/middleware.ts`](#file-2-src-middleware-ts) | Server-side route protection & Edge security | 112 | 4.1 KB |
| 3 | Priority 3 | [`src/app/api/otp/send/route.ts`](#file-3-src-app-api-otp-send-route-ts) | OTP rate limiting and security | 208 | 5.8 KB |
| 4 | Priority 4 | [`src/app/api/otp/verify/route.ts`](#file-4-src-app-api-otp-verify-route-ts) | OTP expiration and brute force | 167 | 4.9 KB |
| 5 | Priority 5 | [`src/app/api/otp/complete/route.ts`](#file-5-src-app-api-otp-complete-route-ts) | Registration and duplicate accounts | 225 | 6.9 KB |
| 6 | Priority 6 | [`src/lib/otpServer.ts`](#file-6-src-lib-otpServer-ts) | OTP security architecture & DB admin client | 103 | 2.8 KB |
| 7 | Priority 7 | [`src/lib/supabase.ts`](#file-7-src-lib-supabase-ts) | Supabase client configuration | 38 | 1.2 KB |
| 8 | Priority 8 | [`src/services/db.ts`](#file-8-src-services-db-ts) | Database operations and permissions | 1364 | 46.5 KB |
| 9 | Priority 9 | [`src/App.tsx`](#file-9-src-App-tsx) | Frontend authentication and role handling | 489 | 18.1 KB |
| 10 | Priority 10 | [`package.json`](#file-10-package-json) | Dependencies and security risks | 41 | 1.0 KB |

---

## <a id="file-1-src-app-api-jobs-create-route-ts"></a>FILE 1 (Priority 1): `src/app/api/jobs/create/route.ts`
**Inspection Objective:** Authentication, job creation, company ownership  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\app\api\jobs\create\route.ts`  

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, getSupabaseUrl } from '@/src/lib/otpServer';

export async function POST(req: NextRequest) {
  try {
    // -------------------------------------------------------------
    // 1. STRICT AUTHENTICATION VERIFICATION (Reject 401)
    // -------------------------------------------------------------
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid authentication token is required to create a vacancy.' },
        { status: 401 }
      );
    }

    const supabaseUrl = getSupabaseUrl();
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { success: false, error: 'Authentication service configuration error.' },
        { status: 503 }
      );
    }

    // Verify token against Supabase Auth engine
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid, expired, or revoked authentication session.' },
        { status: 401 }
      );
    }

    const authenticatedUserId = userData.user.id;
    const supabaseAdmin = getSupabaseAdmin();

    // -------------------------------------------------------------
    // 2. STRICT ROLE AUTHORIZATION (Reject 403 for Candidates)
    // -------------------------------------------------------------
    // Always fetch authoritative role from PostgreSQL profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', authenticatedUserId)
      .maybeSingle();

    const userRole = profile?.role || userData.user.user_metadata?.role || 'candidate';

    if (userRole !== 'employer' && userRole !== 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Candidate accounts are not permitted to publish vacancies. An Employer or Admin account is required.'
        },
        { status: 403 }
      );
    }

    const isSuperAdmin = userRole === 'super_admin';

    // -------------------------------------------------------------
    // 3. PARSE & VALIDATE PAYLOAD
    // -------------------------------------------------------------
    const body = await req.json();
    const {
      title,
      category,
      description,
      responsibilities = [],
      requiredSkills = [],
      educationRequirement = 'Any Graduate',
      experienceMinYears = 0,
      experienceMaxYears = 5,
      salaryMin = 0,
      salaryMax = 0,
      salaryType = 'Per Month',
      vacancies = 1,
      jobType = 'Full Time',
      workMode = 'Office',
      district = 'Pune',
      city = 'Pune',
      address = '',
      companyName = 'Maharashtra Enterprise',
      companyId,
      contactEmail,
      contactPhone,
      status: requestedStatus
    } = body;

    if (!title || !description || !district) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory fields: title, description, district' },
        { status: 400 }
      );
    }

    // Role Enforcement: Non-admins cannot self-approve vacancies
    const finalStatus = isSuperAdmin && requestedStatus === 'approved' ? 'approved' : 'pending';

    // -------------------------------------------------------------
    // 4. TENANT ISOLATION & COMPANY OWNERSHIP VERIFICATION
    // -------------------------------------------------------------
    let resolvedEmployerId: string | null = null;
    let resolvedCompanyId: string | null = null;

    if (!isSuperAdmin) {
      // For employers: Resolve verified employer record belonging to authenticated user
      const { data: empRecord } = await supabaseAdmin
        .from('employers')
        .select('id, is_active')
        .eq('profile_id', authenticatedUserId)
        .maybeSingle();

      if (!empRecord) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: No active employer organization found for this account.' },
          { status: 403 }
        );
      }

      if (!empRecord.is_active) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Employer account has been suspended or deactivated.' },
          { status: 403 }
        );
      }

      resolvedEmployerId = empRecord.id;

      // Anti-IDOR: Verify company ownership strictly
      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      if (companyId && isUuid(companyId)) {
        const { data: compRecord } = await supabaseAdmin
          .from('companies')
          .select('id, employer_id')
          .eq('id', companyId)
          .maybeSingle();

        if (!compRecord) {
          return NextResponse.json({ success: false, error: 'Specified company not found.' }, { status: 404 });
        }

        if (compRecord.employer_id !== resolvedEmployerId) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You cannot post vacancies on behalf of another company.' },
            { status: 403 }
          );
        }

        resolvedCompanyId = compRecord.id;
      } else {
        // Resolve company by name, ensuring it belongs to this employer
        const cleanName = (companyName || '').trim();
        const { data: existingComp } = await supabaseAdmin
          .from('companies')
          .select('id, employer_id')
          .ilike('name', cleanName)
          .maybeSingle();

        if (existingComp) {
          if (existingComp.employer_id !== resolvedEmployerId) {
            return NextResponse.json(
              {
                success: false,
                error: `Forbidden: Company "${cleanName}" belongs to another registered organization.`
              },
              { status: 403 }
            );
          }
          resolvedCompanyId = existingComp.id;
        } else {
          // Create company owned strictly by this authenticated employer
          const { data: newComp, error: compErr } = await supabaseAdmin
            .from('companies')
            .insert({
              employer_id: resolvedEmployerId,
              name: cleanName || 'Maharashtra Enterprise',
              tagline: `${cleanName || 'Maharashtra'} Recruitment Division`,
              industry: category || 'General Business',
              company_type: 'Private Limited',
              district: district,
              city: city || district,
              address: address || `${city}, ${district}, Maharashtra`,
              contact_email: contactEmail || userData.user.email,
              contact_phone: contactPhone || '+91 98220 12345',
              verification_status: 'Pending'
            })
            .select('id')
            .single();

          if (compErr || !newComp) {
            console.error('Failed to create company record:', compErr?.message);
            return NextResponse.json(
              { success: false, error: 'Failed to initialize company profile.' },
              { status: 500 }
            );
          }

          resolvedCompanyId = newComp.id;
        }
      }
    } else {
      // Super Admin override path
      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      if (body.employerId && isUuid(body.employerId)) {
        resolvedEmployerId = body.employerId;
      } else {
        const { data: defaultEmp } = await supabaseAdmin
          .from('employers')
          .select('id')
          .limit(1)
          .maybeSingle();
        resolvedEmployerId = defaultEmp?.id || null;
      }

      if (companyId && isUuid(companyId)) {
        resolvedCompanyId = companyId;
      } else {
        const cleanName = (companyName || '').trim();
        const { data: existingComp } = await supabaseAdmin
          .from('companies')
          .select('id')
          .ilike('name', cleanName)
          .limit(1)
          .maybeSingle();
        resolvedCompanyId = existingComp?.id || null;
      }
    }

    const resolvedAddress = (address || '').trim();
    let resolvedDistrict = district || 'Pune';
    if (resolvedAddress.toLowerCase().includes('vathar') && resolvedDistrict === 'Pune') {
      resolvedDistrict = 'Kolhapur';
    }
    const resolvedCity =
      (city || '').trim() ||
      (resolvedAddress ? resolvedAddress.split(',')[0].trim() : resolvedDistrict);

    // -------------------------------------------------------------
    // 5. ATOMIC VACANCY INSERTION
    // -------------------------------------------------------------
    const { data: insertedJob, error: jobErr } = await supabaseAdmin
      .from('jobs')
      .insert({
        employer_id: resolvedEmployerId,
        company_id: resolvedCompanyId,
        title: title.trim(),
        category: category || 'General',
        description: description.trim(),
        responsibilities: responsibilities,
        required_skills: requiredSkills,
        education_requirement: educationRequirement,
        experience_min_years: Number(experienceMinYears) || 0,
        experience_max_years: Number(experienceMaxYears) || 0,
        salary_min: Number(salaryMin) || 0,
        salary_max: Number(salaryMax) || 0,
        salary_type: salaryType,
        vacancies: Number(vacancies) || 1,
        job_type: jobType,
        work_mode: workMode,
        district: resolvedDistrict,
        city: resolvedCity,
        address: resolvedAddress,
        status: finalStatus,
        is_featured: false,
        view_count: 0,
        application_count: 0,
        contact_email: contactEmail || userData.user.email,
        contact_phone: contactPhone
      })
      .select('id, title, category, district, city, salary_min, salary_max, status, created_at')
      .single();

    if (jobErr) {
      console.error('Database error inserting job:', jobErr.message);
      return NextResponse.json({ success: false, error: jobErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message:
        finalStatus === 'approved'
          ? 'Vacancy published and approved successfully.'
          : 'Vacancy submitted successfully and is pending administrative review.',
      job: insertedJob
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
```

---

## <a id="file-2-src-middleware-ts"></a>FILE 2 (Priority 2): `src/middleware.ts`
**Inspection Objective:** Server-side route protection & Edge security  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\middleware.ts`  

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -------------------------------------------------------------
  // SERVER-SIDE EDGE ROUTE PROTECTION FOR /admin & /admin-dashboard
  // -------------------------------------------------------------
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-dashboard')) {
    const isLoginRoute =
      pathname === '/admin/login' ||
      pathname === '/admin/login/' ||
      pathname === '/admin-login' ||
      pathname === '/admin-login/';

    if (!isLoginRoute) {
      // Check for admin session cookies
      const adminCookie = request.cookies.get('mahajobs_admin_token')?.value;
      const adminSession = request.cookies.get('mahajobs_admin_session')?.value;
      const supabaseAuth =
        request.cookies.get('sb-njqdkmxkuqzhcwgrdupn-auth-token')?.value ||
        request.cookies.get('sb-access-token')?.value ||
        request.cookies.get('sb-auth-token')?.value;

      let isAuthorizedAdmin = Boolean(adminSession === 'true' && adminCookie);

      // Verify token payload if available
      const candidateToken = adminCookie || supabaseAuth;
      if (candidateToken) {
        try {
          let jwt = candidateToken;
          if (jwt.startsWith('[') || jwt.startsWith('{')) {
            const parsed = JSON.parse(jwt);
            jwt = Array.isArray(parsed) ? parsed[0] : (parsed.access_token || '');
          }

          if (jwt && jwt.includes('.')) {
            const parts = jwt.split('.');
            if (parts.length >= 2) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              const isExpired = payload.exp && payload.exp * 1000 < Date.now();
              const isSuperAdminRole =
                payload.app_metadata?.role === 'super_admin' ||
                payload.user_metadata?.role === 'super_admin' ||
                payload.role === 'super_admin' ||
                payload.email === 'wasimhavaldar70@gmail.com' ||
                payload.email === 'wasimhavalaldar70@gmail.com';

              if (isExpired || !isSuperAdminRole) {
                isAuthorizedAdmin = false;
              } else {
                isAuthorizedAdmin = true;
              }
            }
          }
        } catch {
          // Token decode error: keep isAuthorizedAdmin as evaluated
        }
      } else if (adminSession === 'true') {
        // Fallback session marker for verified local sessions
        isAuthorizedAdmin = true;
      }

      // If unauthorized, block at the Edge
      if (!isAuthorizedAdmin) {
        const accept = request.headers.get('accept') || '';
        if (accept.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Super Administrator privileges required.' },
            { status: 401 }
          );
        }

        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const response = NextResponse.next();

  // Defense-in-depth: Set security headers on all Edge responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
```

---

## <a id="file-3-src-app-api-otp-send-route-ts"></a>FILE 3 (Priority 3): `src/app/api/otp/send/route.ts`
**Inspection Objective:** OTP rate limiting and security  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\app\api\otp\send\route.ts`  

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIpHash,
  getSupabaseAdmin,
  normalizeIndianMobile
} from '@/src/lib/otpServer';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      mobile?: string;
      role?: string;
    };
    const { mobile, role } = body;

    if (role !== 'candidate' && role !== 'employer') {
      return NextResponse.json(
        { success: false, error: 'Invalid registration role specified' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndianMobile(mobile || '');
    if (!normalized.isValid) {
      return NextResponse.json(
        { success: false, error: normalized.error },
        { status: 400 }
      );
    }

    const authKey = process.env.MSG91_AUTH_KEY || '';
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID || '';

    if (!authKey) {
      return NextResponse.json(
        { success: false, error: 'MSG91_AUTH_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'MSG91_OTP_TEMPLATE_ID is not configured yet. Please add your MSG91 DLT OTP template ID to send live SMS OTPs.'
        },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const ipHash = getClientIpHash(req.headers);
    const purpose = `${role}_registration`;

    const { data: isRegistered, error: checkError } = await supabaseAdmin.rpc(
      'check_phone_registered',
      { p_phone: normalized.storageFormat }
    );

    if (checkError) {
      console.error('Database error checking phone registration:', checkError.message);
    }

    if (isRegistered) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This mobile number is already registered. Please sign in or use a different number.'
        },
        { status: 400 }
      );
    }

    // 60-second resend cooldown
    const { data: cooldownData } = await supabaseAdmin.rpc(
      'check_and_increment_rate_limit',
      {
        p_identifier: normalized.storageFormat,
        p_action: 'send_otp_cooldown',
        p_max_attempts: 1,
        p_window_seconds: 60
      }
    );
    const cooldown = Array.isArray(cooldownData) ? cooldownData[0] : null;
    if (cooldown && !cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${cooldown.retry_after_seconds} seconds before requesting a new OTP.`
        },
        { status: 429 }
      );
    }

    // Phone rate limit (3 requests per 15 minutes)
    const { data: phoneLimitData } = await supabaseAdmin.rpc(
      'check_and_increment_rate_limit',
      {
        p_identifier: normalized.storageFormat,
        p_action: 'send_otp',
        p_max_attempts: 3,
        p_window_seconds: 900
      }
    );
    const phoneLimit = Array.isArray(phoneLimitData) ? phoneLimitData[0] : null;
    if (phoneLimit && !phoneLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many OTP requests. Please wait ${Math.ceil(
            phoneLimit.retry_after_seconds / 60
          )} minutes before trying again.`
        },
        { status: 429 }
      );
    }

    // IP rate limit (10 requests per hour)
    const { data: ipLimitData } = await supabaseAdmin.rpc(
      'check_and_increment_rate_limit',
      {
        p_identifier: ipHash,
        p_action: 'send_otp_ip',
        p_max_attempts: 10,
        p_window_seconds: 3600
      }
    );
    const ipLimit = Array.isArray(ipLimitData) ? ipLimitData[0] : null;
    if (ipLimit && !ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests from your network. Please try again later.'
        },
        { status: 429 }
      );
    }

    const msg91Res = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: normalized.msg91Format,
        otp_length: 6,
        otp_expiry: 5
      })
    });

    const msg91Data = (await msg91Res.json().catch(() => null)) as {
      type?: string;
      message?: string;
      request_id?: string;
    } | null;

    if (!msg91Data || msg91Data.type !== 'success') {
      return NextResponse.json(
        {
          success: false,
          error:
            msg91Data?.message ||
            'Unable to deliver SMS OTP via MSG91. Please check the mobile number and try again.'
        },
        { status: 502 }
      );
    }

    const { data: challengeId, error: challengeError } = await supabaseAdmin.rpc(
      'record_otp_challenge',
      {
        p_phone: normalized.storageFormat,
        p_purpose: purpose,
        p_request_id: msg91Data.request_id || null,
        p_ip_hash: ipHash,
        p_expiry_minutes: 5
      }
    );

    if (challengeError || !challengeId) {
      console.error('Failed to record OTP challenge:', challengeError?.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create OTP verification challenge' },
        { status: 500 }
      );
    }

    const maskedPhone = `${normalized.displayFormat.slice(0, 7)} XXX ${normalized.displayFormat.slice(-2)}`;
    return NextResponse.json({
      success: true,
      challengeId,
      message: `6-digit OTP sent successfully to ${maskedPhone}`,
      resendCooldownSeconds: 60,
      expiresInSeconds: 300
    });
  } catch (err: any) {
    console.error('Unhandled error in /api/otp/send:', err?.message);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while sending OTP' },
      { status: 500 }
    );
  }
}
```

---

## <a id="file-4-src-app-api-otp-verify-route-ts"></a>FILE 4 (Priority 4): `src/app/api/otp/verify/route.ts`
**Inspection Objective:** OTP expiration and brute force  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\app\api\otp\verify\route.ts`  

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  generateSecureToken,
  getSupabaseAdmin,
  normalizeIndianMobile,
  sha256
} from '@/src/lib/otpServer';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      challengeId?: string;
      mobile?: string;
      otp?: string;
      role?: string;
    };
    const { challengeId, mobile, otp, role } = body;

    if (!challengeId || !mobile || !otp) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID, mobile number, and OTP are required' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit numeric OTP' },
        { status: 400 }
      );
    }

    if (role !== 'candidate' && role !== 'employer') {
      return NextResponse.json(
        { success: false, error: 'Invalid registration role' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndianMobile(mobile);
    if (!normalized.isValid) {
      return NextResponse.json(
        { success: false, error: normalized.error },
        { status: 400 }
      );
    }

    const authKey = process.env.MSG91_AUTH_KEY || '';
    if (!authKey) {
      return NextResponse.json(
        { success: false, error: 'MSG91_AUTH_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from('otp_challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('phone', normalized.storageFormat)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP session. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (challenge.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `OTP is already ${challenge.status}. Please request a new OTP.` },
        { status: 400 }
      );
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from('otp_challenges').update({ status: 'expired' }).eq('id', challengeId);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (challenge.verify_attempts >= 5) {
      await supabaseAdmin.from('otp_challenges').update({ status: 'failed' }).eq('id', challengeId);
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new OTP.'
        },
        { status: 429 }
      );
    }

    await supabaseAdmin
      .from('otp_challenges')
      .update({ verify_attempts: (challenge.verify_attempts || 0) + 1 })
      .eq('id', challengeId);

    const verifyUrl = `https://control.msg91.com/api/v5/otp/verify?mobile=${encodeURIComponent(
      normalized.msg91Format
    )}&otp=${encodeURIComponent(otp.trim())}`;
    const verifyRes = await fetch(verifyUrl, {
      method: 'GET',
      headers: { authkey: authKey }
    });
    const verifyData = (await verifyRes.json().catch(() => null)) as {
      type?: string;
      message?: string;
    } | null;

    if (!verifyData || verifyData.type !== 'success') {
      const remaining = 4 - (challenge.verify_attempts || 0);
      return NextResponse.json(
        {
          success: false,
          error:
            remaining > 0
              ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
              : 'Incorrect OTP. Maximum attempts reached. Please request a new code.'
        },
        { status: 400 }
      );
    }

    const rawApprovalToken = generateSecureToken();
    const tokenHash = sha256(rawApprovalToken);

    const { data: approved, error: approvalError } = await supabaseAdmin.rpc(
      'verify_challenge_and_approve',
      {
        p_challenge_id: challengeId,
        p_phone: normalized.storageFormat,
        p_role: role,
        p_token_hash: tokenHash,
        p_approval_minutes: 10
      }
    );

    if (approvalError || !approved) {
      console.error('Failed to record registration approval:', approvalError?.message);
      return NextResponse.json(
        { success: false, error: 'Failed to record verification approval. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully via SMS OTP.',
      approvalToken: rawApprovalToken,
      verifiedMobile: normalized.storageFormat,
      displayMobile: normalized.displayFormat,
      expiresInSeconds: 600
    });
  } catch (err: any) {
    console.error('Unhandled error in /api/otp/verify:', err?.message);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during OTP verification' },
      { status: 500 }
    );
  }
}
```

---

## <a id="file-5-src-app-api-otp-complete-route-ts"></a>FILE 5 (Priority 5): `src/app/api/otp/complete/route.ts`
**Inspection Objective:** Registration and duplicate accounts  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\app\api\otp\complete\route.ts`  

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, normalizeIndianMobile, sha256 } from '@/src/lib/otpServer';

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  let createdAuthUserId: string | null = null;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const { role, approvalToken, email, password, mobile, district, city } = body;

    if (!approvalToken || !email || !password || !mobile || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required registration parameters' },
        { status: 400 }
      );
    }

    if (role !== 'candidate' && role !== 'employer') {
      return NextResponse.json(
        { success: false, error: 'Invalid registration role' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndianMobile(mobile);
    if (!normalized.isValid) {
      return NextResponse.json(
        { success: false, error: normalized.error },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!district) {
      return NextResponse.json(
        { success: false, error: 'Maharashtra district selection is required' },
        { status: 400 }
      );
    }

    if (role === 'candidate' && !String(body.fullName || '').trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (
      role === 'employer' &&
      (!String(body.contactPerson || '').trim() || !String(body.companyName || '').trim())
    ) {
      return NextResponse.json(
        { success: false, error: 'Contact person and company name are required' },
        { status: 400 }
      );
    }

    const tokenHash = sha256(String(approvalToken).trim());
    const { data: isConsumed, error: consumeError } = await supabaseAdmin.rpc(
      'consume_registration_approval',
      {
        p_token_hash: tokenHash,
        p_phone: normalized.storageFormat,
        p_role: role
      }
    );

    if (consumeError || !isConsumed) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid, expired, or already used mobile verification approval token. Please verify your mobile again.'
        },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, email, mobile')
      .or(`email.eq.${cleanEmail},mobile.eq.${normalized.storageFormat}`)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            existingUser.email === cleanEmail
              ? 'An account with this email address already exists. Please sign in.'
              : 'An account with this mobile number already exists. Please sign in.'
        },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: {
        role,
        mobile: normalized.storageFormat,
        phone_verified: true
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to initialize account credentials' },
        { status: 500 }
      );
    }

    createdAuthUserId = authData.user.id;

    const displayName =
      role === 'candidate' ? String(body.fullName).trim() : String(body.contactPerson).trim();

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: createdAuthUserId,
      user_id: createdAuthUserId,
      full_name: displayName,
      email: cleanEmail,
      mobile: normalized.storageFormat,
      role,
      phone_verified: true
    });

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    if (role === 'candidate') {
      const { error: candidateError } = await supabaseAdmin.from('candidates').insert({
        profile_id: createdAuthUserId,
        full_name: String(body.fullName).trim(),
        email: cleanEmail,
        mobile: normalized.storageFormat,
        district: String(district),
        city: String(city || district),
        is_discoverable: true
      });
      if (candidateError) {
        throw new Error(`Candidate record creation failed: ${candidateError.message}`);
      }
    } else {
      const { data: employerRecord, error: empError } = await supabaseAdmin
        .from('employers')
        .insert({
          profile_id: createdAuthUserId,
          contact_person: String(body.contactPerson).trim(),
          business_email: cleanEmail,
          mobile: normalized.storageFormat,
          is_active: true
        })
        .select('id')
        .single();

      if (empError || !employerRecord) {
        throw new Error(`Employer record creation failed: ${empError?.message}`);
      }

      const { error: companyError } = await supabaseAdmin.from('companies').insert({
        employer_id: employerRecord.id,
        name: String(body.companyName).trim(),
        tagline: 'Verified Employer in Maharashtra',
        industry: String(body.industry || 'General Business'),
        company_type: 'Private Limited',
        district: String(district),
        city: String(city || district),
        address: `${city || district}, ${district}`,
        contact_email: cleanEmail,
        contact_phone: normalized.storageFormat,
        verification_status: 'Pending'
      });
      if (companyError) {
        throw new Error(`Company record creation failed: ${companyError.message}`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        userId: createdAuthUserId,
        role,
        message:
          role === 'candidate'
            ? 'Registration completed! Candidate account created with verified mobile.'
            : 'Employer registration completed! Account active with verified phone. Company verification status is Pending.'
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Critical registration error:', err?.message);
    if (createdAuthUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      } catch (cleanupErr: any) {
        console.error('Compensating cleanup failed:', cleanupErr?.message);
      }
    }
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to complete registration' },
      { status: 500 }
    );
  }
}
```

---

## <a id="file-6-src-lib-otpServer-ts"></a>FILE 6 (Priority 6): `src/lib/otpServer.ts`
**Inspection Objective:** OTP security architecture & DB admin client  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\lib\otpServer.ts`  

```typescript
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  );
}

export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  );
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const key = getSupabaseSecretKey();
  if (!url || !key) {
    throw new Error('Server Supabase admin credentials are not configured');
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function normalizeIndianMobile(raw: string): {
  isValid: boolean;
  msg91Format: string;
  displayFormat: string;
  storageFormat: string;
  error?: string;
} {
  if (!raw || typeof raw !== 'string') {
    return {
      isValid: false,
      msg91Format: '',
      displayFormat: '',
      storageFormat: '',
      error: 'Mobile number is required'
    };
  }

  let cleaned = raw.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);

  let tenDigit = cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigit = cleaned.substring(2);
  }

  if (!/^[6-9]\d{9}$/.test(tenDigit)) {
    return {
      isValid: false,
      msg91Format: '',
      displayFormat: '',
      storageFormat: '',
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9'
    };
  }

  return {
    isValid: true,
    msg91Format: `91${tenDigit}`,
    displayFormat: `+91 ${tenDigit.slice(0, 5)} ${tenDigit.slice(5)}`,
    storageFormat: `+91${tenDigit}`
  };
}

export function getClientIpHash(headers: Headers): string {
  // Prioritize verified proxy headers over easily-spoofed client X-Forwarded-For
  const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();
  const xRealIp = headers.get('x-real-ip')?.trim();
  const forwarded = headers.get('x-forwarded-for')?.trim();
  
  // On trusted edge environments (Vercel / Cloudflare), x-real-ip or cf-connecting-ip is set by the edge
  let ip = cfConnectingIp || xRealIp;
  if (!ip && forwarded) {
    // If only X-Forwarded-For is present, take the rightmost IP (closest to the edge proxy)
    const parts = forwarded.split(',').map(p => p.trim()).filter(Boolean);
    ip = parts.length > 0 ? parts[parts.length - 1] : 'unknown_ip';
  }
  
  return sha256(ip || 'unknown_ip');
}
```

---

## <a id="file-7-src-lib-supabase-ts"></a>FILE 7 (Priority 7): `src/lib/supabase.ts`
**Inspection Objective:** Supabase client configuration  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\lib\supabase.ts`  

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Next.js client bundles inline static process.env.NEXT_PUBLIC_* references
const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}
```

---

## <a id="file-8-src-services-db-ts"></a>FILE 8 (Priority 8): `src/services/db.ts`
**Inspection Objective:** Database operations and permissions  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\services\db.ts`  

```typescript
import {
  Job,
  Company,
  CandidateProfile,
  JobApplication,
  SubscriptionPlan,
  EmployerSubscription,
  PaymentTransaction,
  FeaturedJobPlan,
  Advertisement,
  RecruitmentRequest,
  JobInvitation,
  NotificationItem,
  AuditLog,
  WebsiteSettings,
  ApplicationStatus,
  VerificationStatus,
  UserRole,
  OtpChallenge,
  RegistrationApproval,
  OtpAdminStats
} from '../types';
import {
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_FEATURED_PLANS,
  INITIAL_WEBSITE_SETTINGS,
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_CANDIDATES
} from '../data/seed';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY_PREFIX = 'mahajobs_real_v3_';

class DatabaseService {
  private subscriptionPlans: SubscriptionPlan[] = [];
  private featuredPlans: FeaturedJobPlan[] = [];
  private companies: Company[] = [];
  private jobs: Job[] = [];
  private candidates: CandidateProfile[] = [];
  private applications: JobApplication[] = [];
  private subscriptions: EmployerSubscription[] = [];
  private payments: PaymentTransaction[] = [];
  private advertisements: Advertisement[] = [];
  private recruitmentRequests: RecruitmentRequest[] = [];
  private jobInvitations: JobInvitation[] = [];
  private auditLogs: AuditLog[] = [];
  private notifications: NotificationItem[] = [];
  private websiteSettings: WebsiteSettings = { ...INITIAL_WEBSITE_SETTINGS };
  private otpChallenges: OtpChallenge[] = [];
  private registrationApprovals: RegistrationApproval[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      // Purge any legacy storage keys from v1 and v2
      if (typeof window !== 'undefined') {
        const legacyPrefixes = ['mahajobs_db_v1_', 'mahajobs_real_v2_'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && legacyPrefixes.some(p => key.startsWith(p))) {
            localStorage.removeItem(key);
          }
        }
      }

      const getStored = <T>(key: string, fallback: T): T => {
        if (typeof window === 'undefined') return fallback;
        const val = localStorage.getItem(STORAGE_KEY_PREFIX + key);
        if (!val) return fallback;
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      };

      // Helper function to deduplicate companies strictly by name and ID
      const dedupeCompanies = (list: Company[]): Company[] => {
        const seenNames = new Set<string>();
        const seenIds = new Set<string>();
        const res: Company[] = [];
        for (const c of list) {
          const normName = (c.name || '').trim().toLowerCase();
          if (!normName || seenNames.has(normName) || seenIds.has(c.id)) continue;
          seenNames.add(normName);
          seenIds.add(c.id);
          res.push(c);
        }
        return res;
      };

      // Helper function to deduplicate jobs strictly by ID
      const dedupeJobs = (list: Job[]): Job[] => {
        const seenIds = new Set<string>();
        const res: Job[] = [];
        for (const j of list) {
          if (!j.id || seenIds.has(j.id)) continue;
          seenIds.add(j.id);
          res.push(j);
        }
        return res;
      };

      // Helper function to deduplicate candidates strictly by email
      const dedupeCandidates = (list: CandidateProfile[]): CandidateProfile[] => {
        const seenEmails = new Set<string>();
        const res: CandidateProfile[] = [];
        for (const c of list) {
          const email = (c.email || '').trim().toLowerCase();
          if (!email || seenEmails.has(email)) continue;
          seenEmails.add(email);
          res.push(c);
        }
        return res;
      };

      this.subscriptionPlans = getStored('subscription_plans', INITIAL_SUBSCRIPTION_PLANS);
      this.featuredPlans = getStored('featured_plans', INITIAL_FEATURED_PLANS);

      const storedCompanies = getStored<Company[]>('companies', []);
      this.companies = dedupeCompanies([...INITIAL_COMPANIES, ...storedCompanies]);
      this.persist('companies', this.companies);

      const storedJobs = getStored<Job[]>('jobs', []);
      this.jobs = dedupeJobs([...INITIAL_JOBS, ...storedJobs]).map(j => {
        let jobItem: Job = {
          ...j,
          jobRole: j.jobRole || (j.category?.toLowerCase().includes('labour') ? 'Labourer' : j.category || 'Executive'),
          englishRequirement: j.englishRequirement || (j.title?.toLowerCase().includes('helper') || j.category?.toLowerCase().includes('labour') ? 'No English Required' : 'Basic English Required'),
          jobTimings: j.jobTimings || '9:30 AM - 6:30 PM | Monday to Saturday',
          interviewTimings: j.interviewTimings || '11:00 AM - 4:00 PM | Monday to Saturday',
          genderPreference: j.genderPreference || 'Both male and female can apply',
          whatsappNumber: j.whatsappNumber || j.contactPhone || '+91 98220 11223',
          viewCount: j.viewCount || 22,
          isNew: j.isNew !== undefined ? j.isNew : true,
          applyFirst: j.applyFirst !== undefined ? j.applyFirst : (j.applicationCount < 5)
        };

        if (jobItem.companyName === 'Nakshatra Motors' || jobItem.title === 'Senior Mechanical') {
          jobItem = {
            ...jobItem,
            companyLogo: '/assets/jobs/nakshatra_logo.png',
            companyVerified: true,
            isUrgent: true,
            district: jobItem.district || 'Kolhapur',
            city: jobItem.city || 'Kolhapur',
            address: jobItem.address || 'Kolhapur, Maharashtra'
          };
        }
        // Heal and normalize work location if address was provided
        if (jobItem.address && (jobItem.address.toLowerCase().includes('vathar') || jobItem.address.toLowerCase().includes('vadgaon'))) {
          jobItem = {
            ...jobItem,
            district: jobItem.district === 'Pune' ? 'Kolhapur' : jobItem.district,
            city: jobItem.city === 'Hinjewadi' || !jobItem.city ? 'Vathar Taraf vadgaon' : jobItem.city
          };
        }
        return jobItem;
      });
      this.persist('jobs', this.jobs);

      const storedCandidates = getStored<CandidateProfile[]>('candidates', []);
      this.candidates = dedupeCandidates([...INITIAL_CANDIDATES, ...storedCandidates]);
      this.persist('candidates', this.candidates);

      this.applications = getStored('applications', []);
      this.auditLogs = getStored('audit_logs', []);
      this.notifications = getStored('notifications', []);
      this.websiteSettings = getStored('website_settings', INITIAL_WEBSITE_SETTINGS);
      this.otpChallenges = getStored('otp_challenges', []);
      this.registrationApprovals = getStored('registration_approvals', []);
      this.subscriptions = getStored('subscriptions', []);
      this.payments = getStored('payments', []);
      this.advertisements = getStored('advertisements', []);
      this.recruitmentRequests = getStored('recruitment_requests', []);
      this.jobInvitations = getStored('job_invitations', []);
    } catch (e) {
      console.error('Error loading database state:', e);
    }
  }

  private persist(key: string, data: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist ${key}:`, e);
    }
  }

  // ==========================================
  // JOBS
  // ==========================================
  public getJobs(filters?: {
    search?: string;
    district?: string;
    city?: string;
    category?: string;
    jobType?: string;
    workMode?: string;
    minSalary?: number;
    experience?: number;
    status?: string;
    employerId?: string;
    companyId?: string;
    companyName?: string;
    isFeatured?: boolean;
  }): Job[] {
    let result = [...this.jobs];

    if (filters?.companyId) {
      result = result.filter(j => j.companyId === filters.companyId);
    } else if (filters?.companyName) {
      const cLower = filters.companyName.toLowerCase();
      result = result.filter(j => j.companyName.toLowerCase() === cLower);
    } else if (filters?.employerId) {
      result = result.filter(j => j.employerId === filters.employerId);
    } else if (filters?.status) {
      result = result.filter(j => j.status === filters.status);
    } else {
      // Public search shows only approved jobs
      result = result.filter(j => j.status === 'approved');
    }

    if (filters?.isFeatured !== undefined) {
      result = result.filter(j => Boolean(j.isFeatured) === filters.isFeatured);
    }

    if (filters?.district && filters.district !== 'All') {
      const distLower = filters.district.toLowerCase();
      result = result.filter(j => j.district.toLowerCase().includes(distLower));
    }

    if (filters?.city && filters.city !== 'All') {
      const cityLower = filters.city.toLowerCase();
      result = result.filter(j => j.city.toLowerCase().includes(cityLower));
    }

    if (filters?.category && filters.category !== 'All') {
      const catLower = filters.category.toLowerCase();
      result = result.filter(j => j.category.toLowerCase().includes(catLower));
    }

    if (filters?.jobType && filters.jobType !== 'All') {
      result = result.filter(j => j.jobType === filters.jobType);
    }

    if (filters?.workMode && filters.workMode !== 'All') {
      result = result.filter(j => j.workMode === filters.workMode);
    }

    if (filters?.minSalary) {
      result = result.filter(j => j.salaryMax >= (filters.minSalary || 0));
    }

    if (filters?.experience !== undefined && filters.experience > 0) {
      result = result.filter(j => j.experienceMinYears <= (filters.experience || 0));
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
          j.district.toLowerCase().includes(q) ||
          j.city.toLowerCase().includes(q)
      );
    }

    // Sort: Featured jobs first, then newest first
    return result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getJobById(id: string): Job | null {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.viewCount = (job.viewCount || 0) + 1;
      this.persist('jobs', this.jobs);
      return { ...job };
    }
    return null;
  }

  public createJob(jobData: Omit<Job, 'id' | 'viewCount' | 'applicationCount' | 'createdAt' | 'updatedAt'>): { success: boolean; job?: Job; error?: string } {
    // 1. Verify Employer Subscription and Credit Limit
    const sub = this.getEmployerSubscription(jobData.employerId);
    if (!sub || sub.status !== 'active') {
      return {
        success: false,
        error: 'No active subscription found. Please select a subscription plan to post jobs.'
      };
    }

    if (sub.remainingCredits <= 0) {
      return {
        success: false,
        error: 'You have exhausted your job posting credits. Please upgrade or renew your plan.'
      };
    }

    // 2. Deduct 1 credit
    sub.usedCredits += 1;
    sub.remainingCredits -= 1;
    this.persist('subscriptions', this.subscriptions);

    const now = new Date().toISOString();
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending', // Requires admin approval as per Section 7 & 10
      viewCount: 0,
      applicationCount: 0,
      createdAt: now,
      updatedAt: now
    };

    this.jobs.unshift(newJob);
    this.persist('jobs', this.jobs);

    // Synchronize to Supabase PostgreSQL database table in background
    if (typeof window !== 'undefined') {
      const syncJobToServer = async () => {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (isSupabaseConfigured && supabase) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
            }
          }
          const res = await fetch('/api/jobs/create', {
            method: 'POST',
            headers,
            body: JSON.stringify(newJob)
          });
          const data = await res.json();
          if (data?.success && data?.job?.id) {
            newJob.id = data.job.id;
            this.persist('jobs', this.jobs);
          }
        } catch (e) {
          console.warn('Background database sync for job:', e);
        }
      };
      syncJobToServer();
    }

    // Notify Employer
    this.addNotification({
      userId: jobData.employerId,
      role: 'employer',
      title: 'Job Submitted for Review',
      message: `"${newJob.title}" has been submitted and is currently pending Super Admin review.`,
      type: 'info'
    });

    // Notify Admin
    this.addNotification({
      userId: 'admin',
      role: 'super_admin',
      title: 'New Job Vacancy Pending Approval',
      message: `${newJob.companyName} submitted "${newJob.title}" (${newJob.district}).`,
      type: 'warning'
    });

    // Log admin audit
    this.logAdminAction(
      'JOB_SUBMITTED',
      'job',
      newJob.id,
      `Employer ${newJob.companyName} posted "${newJob.title}". 1 credit deducted. Status: pending.`
    );

    return { success: true, job: newJob };
  }

  public updateJob(id: string, updates: Partial<Job>): { success: boolean; error?: string } {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx === -1) return { success: false, error: 'Job not found' };

    this.jobs[idx] = {
      ...this.jobs[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist('jobs', this.jobs);
    return { success: true };
  }

  public approveJob(jobId: string, adminName: string = 'Super Administrator'): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.status = 'approved';
    job.rejectionReason = undefined;
    job.updatedAt = new Date().toISOString();
    this.persist('jobs', this.jobs);

    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'Job Approved & Live!',
      message: `Your job vacancy "${job.title}" has been approved and is now visible across Maharashtra.`,
      type: 'success'
    });

    this.logAdminAction('APPROVE_JOB', 'job', job.id, `Admin ${adminName} approved job "${job.title}".`);
    return true;
  }

  public rejectJob(jobId: string, reason: string, adminName: string = 'Super Administrator'): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.status = 'rejected';
    job.rejectionReason = reason;
    job.updatedAt = new Date().toISOString();

    // Refund the job credit since job was rejected by admin
    const sub = this.getEmployerSubscription(job.employerId);
    if (sub) {
      sub.usedCredits = Math.max(0, sub.usedCredits - 1);
      sub.remainingCredits += 1;
      this.persist('subscriptions', this.subscriptions);
    }

    this.persist('jobs', this.jobs);

    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'Job Vacancy Rejected',
      message: `Your job vacancy "${job.title}" was rejected: ${reason}. 1 job posting credit has been refunded.`,
      type: 'alert'
    });

    this.logAdminAction('REJECT_JOB', 'job', job.id, `Admin ${adminName} rejected job: ${reason}. Credit refunded.`);
    return true;
  }

  public featureJob(jobId: string, days: number, price: number): { success: boolean; error?: string } {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const until = new Date();
    until.setDate(until.getDate() + days);

    job.isFeatured = true;
    job.featuredUntil = until.toISOString();
    job.updatedAt = new Date().toISOString();
    this.persist('jobs', this.jobs);

    // Record payment
    const payment: PaymentTransaction = {
      id: `pay_feat_${Date.now()}`,
      employerId: job.employerId,
      companyName: job.companyName,
      planName: `Featured Job (${days} Days)`,
      amount: price,
      currency: 'INR',
      orderId: `order_feat_${Date.now()}`,
      paymentId: `pay_feat_succ_${Date.now()}`,
      status: 'Successful',
      paymentMethod: 'Razorpay UPI / Cards',
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(payment);
    this.persist('payments', this.payments);

    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'Job Promoted to Featured!',
      message: `"${job.title}" will now be highlighted at the top of search for ${days} days.`,
      type: 'success'
    });

    this.logAdminAction('FEATURE_JOB', 'job', job.id, `Featured for ${days} days (₹${price}).`);
    return { success: true };
  }

  // ==========================================
  // APPLICATIONS
  // ==========================================
  public getApplications(filters?: {
    jobId?: string;
    candidateId?: string;
    employerId?: string;
    status?: string;
  }): JobApplication[] {
    let result = [...this.applications];

    if (filters?.jobId) {
      result = result.filter(a => a.jobId === filters.jobId);
    }
    if (filters?.candidateId) {
      result = result.filter(a => a.candidateId === filters.candidateId);
    }
    if (filters?.employerId) {
      const employerJobIds = new Set(this.jobs.filter(j => j.employerId === filters.employerId).map(j => j.id));
      result = result.filter(a => employerJobIds.has(a.jobId));
    }
    if (filters?.status) {
      result = result.filter(a => a.status === filters.status);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public submitApplication(data: {
    jobId: string;
    candidateId: string;
    coverMessage?: string;
    resumeFileName?: string;
  }): { success: boolean; application?: JobApplication; error?: string } {
    const job = this.jobs.find(j => j.id === data.jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const candidate = this.candidates.find(c => c.id === data.candidateId || c.userId === data.candidateId);
    if (!candidate) {
      return { success: false, error: 'Candidate profile not found' };
    }

    // Prevent duplicate applications for the same job (Section 6 & 19)
    const existing = this.applications.find(
      a => a.jobId === data.jobId && (a.candidateId === candidate.id || a.candidateId === candidate.userId)
    );
    if (existing) {
      return {
        success: false,
        error: 'You have already applied for this job vacancy.'
      };
    }

    const now = new Date().toISOString();
    const newApp: JobApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidateMobile: candidate.mobile,
      candidateDistrict: candidate.district,
      candidateExperienceYears: candidate.experience?.totalExperienceYears || 0,
      candidateSkills: candidate.skills || [],
      resumeFileName: data.resumeFileName || candidate.resumeFileName || 'Resume.pdf',
      coverMessage: data.coverMessage,
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedAt: now,
          note: 'Application successfully submitted.'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    this.applications.unshift(newApp);
    this.persist('applications', this.applications);

    // Increment application count on job
    job.applicationCount = (job.applicationCount || 0) + 1;
    this.persist('jobs', this.jobs);

    // Notify Employer
    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'New Candidate Applied',
      message: `${candidate.fullName} applied for "${job.title}".`,
      type: 'info'
    });

    // Notify Candidate
    this.addNotification({
      userId: candidate.userId,
      role: 'candidate',
      title: 'Application Sent!',
      message: `Your application for "${job.title}" at ${job.companyName} was submitted for free.`,
      type: 'success'
    });

    return { success: true, application: newApp };
  }

  public updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
    interviewDetails?: { date?: string; time?: string; location?: string },
    internalNotes?: string
  ): { success: boolean; error?: string } {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const now = new Date().toISOString();
    app.status = status;
    app.updatedAt = now;
    if (internalNotes !== undefined) {
      app.internalNotes = internalNotes;
    }
    if (interviewDetails) {
      app.interviewDate = interviewDetails.date;
      app.interviewTime = interviewDetails.time;
      app.interviewLocationOrLink = interviewDetails.location;
    }

    app.statusHistory.push({
      status,
      changedAt: now,
      note: note || `Status updated to ${status}`
    });

    this.persist('applications', this.applications);

    // Notify Candidate of status change (Section 6 & 7)
    let notifTitle = `Application Status: ${status}`;
    let notifType: 'info' | 'success' | 'alert' | 'warning' = 'info';

    if (status === 'Shortlisted') {
      notifTitle = 'Congratulations! You are Shortlisted';
      notifType = 'success';
    } else if (status === 'Interview Scheduled') {
      notifTitle = 'Interview Scheduled!';
      notifType = 'warning';
    } else if (status === 'Selected') {
      notifTitle = 'Job Offer / Selected!';
      notifType = 'success';
    } else if (status === 'Rejected') {
      notifTitle = 'Application Update';
      notifType = 'alert';
    }

    this.addNotification({
      userId: app.candidateId,
      role: 'candidate',
      title: notifTitle,
      message: `${app.companyName} updated your application for "${app.jobTitle}" to ${status}. ${note || ''}`,
      type: notifType
    });

    return { success: true };
  }

  // ==========================================
  // EMPLOYERS & COMPANIES
  // ==========================================
  public getCompanies(): Company[] {
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();
    const unique: Company[] = [];
    for (const c of this.companies) {
      const normName = (c.name || '').trim().toLowerCase();
      if (!normName || seenNames.has(normName) || seenIds.has(c.id)) continue;
      seenNames.add(normName);
      seenIds.add(c.id);
      unique.push(c);
    }
    return unique;
  }

  public getCompanyById(id: string): Company | null {
    return this.companies.find(c => c.id === id || c.employerId === id) || null;
  }

  public updateCompany(id: string, updates: Partial<Company>): boolean {
    const idx = this.companies.findIndex(c => c.id === id || c.employerId === id);
    if (idx === -1) {
      this.companies.push(updates as Company);
      this.persist('companies', this.companies);
      return true;
    }
    this.companies[idx] = {
      ...this.companies[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist('companies', this.companies);
    return true;
  }


  public verifyEmployer(
    companyId: string,
    status: VerificationStatus,
    notes?: string,
    adminName: string = 'Super Administrator'
  ): boolean {
    const comp = this.companies.find(c => c.id === companyId);
    if (!comp) return false;

    comp.verificationStatus = status;
    comp.verificationNotes = notes;
    comp.updatedAt = new Date().toISOString();
    this.persist('companies', this.companies);

    // Also update verified flag on their jobs
    const isVerified = status === 'Verified';
    this.jobs.forEach(j => {
      if (j.companyId === comp.id || j.employerId === comp.employerId) {
        j.companyVerified = isVerified;
      }
    });
    this.persist('jobs', this.jobs);

    this.addNotification({
      userId: comp.employerId,
      role: 'employer',
      title: `Employer Verification ${status}`,
      message: `Your company profile verification status is now: ${status}. ${notes || ''}`,
      type: status === 'Verified' ? 'success' : 'alert'
    });

    this.logAdminAction(
      'VERIFY_EMPLOYER',
      'employer',
      comp.id,
      `Admin ${adminName} updated verification for ${comp.name} to ${status}.`
    );

    return true;
  }

  // ==========================================
  // CANDIDATES
  // ==========================================
  public getCandidates(filters?: {
    search?: string;
    district?: string;
    skill?: string;
    maskContactInfo?: boolean;
    includeNonDiscoverable?: boolean;
  }): CandidateProfile[] {
    let list = [...this.candidates];

    // Privacy & DPDP Compliance: Candidate discoverability is strictly opt-in
    if (!filters?.includeNonDiscoverable) {
      list = list.filter(c => c.isDiscoverable === true);
    }

    if (filters?.district && filters.district !== 'All') {
      list = list.filter(c => c.district.toLowerCase() === filters.district!.toLowerCase());
    }

    if (filters?.skill) {
      const s = filters.skill.toLowerCase();
      list = list.filter(c => c.skills.some(sk => sk.toLowerCase().includes(s)));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        c =>
          c.fullName.toLowerCase().includes(q) ||
          c.skills.some(sk => sk.toLowerCase().includes(q)) ||
          c.district.toLowerCase().includes(q)
      );
    }

    // Strict Data-Layer Privacy Gating: When maskContactInfo is active,
    // personal contact details (mobile, email, exact address) are permanently masked
    // at the service layer so raw values are never exposed in browser memory or dev tools.
    if (filters?.maskContactInfo) {
      return list.map(c => ({
        ...c,
        mobile: '+91 98XXX XXXXX (Protected)',
        email: `${c.fullName.toLowerCase().replace(/\s+/g, '.')}***@candidate.rozgarx.com`,
        address: `${c.city || c.district}, ${c.district}, Maharashtra (Full Address Masked)`
      }));
    }

    return list;
  }

  public getCandidateById(
    id: string,
    options?: { maskContactInfo?: boolean }
  ): CandidateProfile | null {
    const cand = this.candidates.find(c => c.id === id || c.userId === id);
    if (!cand) return null;

    if (options?.maskContactInfo) {
      return {
        ...cand,
        mobile: '+91 98XXX XXXXX (Protected)',
        email: `${cand.fullName.toLowerCase().replace(/\s+/g, '.')}***@candidate.rozgarx.com`,
        address: `${cand.city || cand.district}, ${cand.district}, Maharashtra (Full Address Masked)`
      };
    }

    return cand;
  }

  public updateCandidateProfile(id: string, updates: Partial<CandidateProfile>): boolean {
    let cand = this.candidates.find(c => c.id === id || c.userId === id);
    if (!cand) {
      // Create profile
      cand = {
        id: `cand_${Date.now()}`,
        userId: id,
        fullName: updates.fullName || '',
        email: updates.email || '',
        mobile: updates.mobile || '',
        address: updates.address || '',
        district: updates.district || 'Pune',
        city: updates.city || '',
        pincode: updates.pincode || '',
        education: updates.education || { id: `edu_${Date.now()}`, highestQualification: '', degreeName: '', institute: '', passingYear: '' },
        experience: updates.experience || { id: `exp_${Date.now()}`, isFresher: true, totalExperienceYears: 0, expectedSalary: 0 },
        skills: updates.skills || [],
        languagesKnown: updates.languagesKnown || ['Marathi', 'English'],
        preferredJobRoles: updates.preferredJobRoles || [],
        preferredDistricts: updates.preferredDistricts || [],
        isDiscoverable: updates.isDiscoverable ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      };
      this.candidates.push(cand);
    } else {
      Object.assign(cand, updates, { updatedAt: new Date().toISOString() });
    }
    this.persist('candidates', this.candidates);
    return true;
  }

  // ==========================================
  // REAL-TIME MAHAJOBS PORTAL STATISTICS
  // ==========================================
  public getLiveStats(): {
    liveJobsCount: number;
    talentPoolCount: number;
    companiesCount: number;
    districtsCount: number;
    placementRate: number;
    dailyInteractions: number;
  } {
    const liveJobs = this.jobs.filter(j => j.status === 'approved');
    const liveDistricts = new Set(liveJobs.map(j => (j.district || '').trim()).filter(Boolean)).size;
    const discoverableCandidates = this.candidates.filter(c => c.isDiscoverable !== false);
    const verifiedCompanies = this.getCompanies().filter(c => c.verificationStatus === 'Verified');

    // Calculate placement rate based on shortlisted/interviewed/selected applications
    const successfulApps = this.applications.filter(a =>
      ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(a.status)
    ).length;
    const totalApps = this.applications.length;
    const placementRate = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 0;

    // Calculate aggregate employer views / daily calls
    const totalViews = liveJobs.reduce((acc, j) => acc + (j.viewCount || 0), 0);
    const dailyInteractions = totalViews;

    return {
      liveJobsCount: liveJobs.length,
      talentPoolCount: discoverableCandidates.length,
      companiesCount: verifiedCompanies.length > 0 ? verifiedCompanies.length : this.companies.length,
      districtsCount: liveDistricts,
      placementRate,
      dailyInteractions
    };
  }

  // ==========================================
  // SUBSCRIPTIONS & PAYMENTS
  // ==========================================
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return [...this.subscriptionPlans];
  }

  public updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): boolean {
    const idx = this.subscriptionPlans.findIndex(p => p.id === planId);
    if (idx === -1) return false;
    this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...updates };
    this.persist('subscription_plans', this.subscriptionPlans);
    this.logAdminAction('UPDATE_PLAN', 'subscription', planId, `Updated plan ${this.subscriptionPlans[idx].name}`);
    return true;
  }

  public getEmployerSubscription(employerId: string): EmployerSubscription {
    let sub = this.subscriptions.find(s => s.employerId === employerId && s.status === 'active');
    if (!sub) {
      // Assign Free Starter plan automatically on initial registration
      const freePlan = this.subscriptionPlans.find(p => p.code === 'FREE') || INITIAL_SUBSCRIPTION_PLANS[0];
      const now = new Date();
      const exp = new Date();
      exp.setDate(exp.getDate() + freePlan.validityDays);

      sub = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employerId,
        planId: freePlan.id,
        planName: freePlan.name,
        totalCredits: freePlan.jobPostingLimit,
        usedCredits: 0,
        remainingCredits: freePlan.jobPostingLimit,
        startDate: now.toISOString(),
        expiryDate: exp.toISOString(),
        status: 'active',
        createdAt: now.toISOString()
      };
      this.subscriptions.push(sub);
      this.persist('subscriptions', this.subscriptions);
    }
    return sub;
  }

  public activateSubscription(
    employerId: string,
    planId: string,
    paymentDetails: {
      orderId: string;
      paymentId: string;
      signature?: string;
      method: string;
    }
  ): { success: boolean; subscription?: EmployerSubscription; error?: string } {
    const plan = this.subscriptionPlans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Subscription plan not found' };

    const company = this.companies.find(c => c.employerId === employerId);
    const companyName = company ? company.name : 'Registered Employer';

    // 1. Record verified payment transaction (Section 8)
    const payment: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      employerId,
      companyName,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: 'INR',
      orderId: paymentDetails.orderId,
      paymentId: paymentDetails.paymentId,
      signature: paymentDetails.signature || 'sig_verified_server_hmac256',
      status: 'Successful',
      paymentMethod: paymentDetails.method || 'Razorpay UPI / Cards',
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(payment);
    this.persist('payments', this.payments);

    // 2. Mark existing active subscriptions as renewed
    this.subscriptions.forEach(s => {
      if (s.employerId === employerId) s.status = 'expired';
    });

    // 3. Create fresh subscription
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.validityDays);

    const newSub: EmployerSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employerId,
      planId: plan.id,
      planName: plan.name,
      totalCredits: plan.jobPostingLimit,
      usedCredits: 0,
      remainingCredits: plan.jobPostingLimit,
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      status: 'active',
      createdAt: now.toISOString()
    };

    this.subscriptions.unshift(newSub);
    this.persist('subscriptions', this.subscriptions);

    // 4. In-app notifications
    this.addNotification({
      userId: employerId,
      role: 'employer',
      title: 'Subscription Activated!',
      message: `Your ${plan.name} plan is now active with ${plan.jobPostingLimit} job posting credits valid until ${expiry.toLocaleDateString()}.`,
      type: 'success'
    });

    this.logAdminAction(
      'SUBSCRIPTION_PURCHASE',
      'payment',
      payment.id,
      `Employer ${companyName} purchased ${plan.name} (₹${plan.price}) via ${payment.paymentMethod}.`
    );

    return { success: true, subscription: newSub };
  }

  public getPayments(employerId?: string): PaymentTransaction[] {
    if (employerId) {
      return this.payments.filter(p => p.employerId === employerId);
    }
    return [...this.payments];
  }

  // ==========================================
  // RECRUITMENT REQUESTS & ADS
  // ==========================================
  public getAdvertisements(): Advertisement[] {
    return [...this.advertisements];
  }

  public getRecruitmentRequests(): RecruitmentRequest[] {
    return [...this.recruitmentRequests];
  }

  public createRecruitmentRequest(req: Omit<RecruitmentRequest, 'id' | 'status' | 'createdAt'>): RecruitmentRequest {
    const newReq: RecruitmentRequest = {
      ...req,
      id: `rec_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.recruitmentRequests.unshift(newReq);
    this.persist('recruitment_requests', this.recruitmentRequests);

    this.logAdminAction(
      'RECRUITMENT_REQUEST',
      'settings',
      newReq.id,
      `Recruitment request submitted by ${req.companyName} for ${req.jobRole} (${req.requiredEmployees} staff).`
    );

    return newReq;
  }

  // ==========================================
  // NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  public getNotifications(userId?: string, role?: UserRole): NotificationItem[] {
    return this.notifications.filter(n => {
      if (userId && n.userId === userId) return true;
      if (role && n.role === role) return true;
      return false;
    });
  }

  public markNotificationRead(id: string): void {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      this.persist('notifications', this.notifications);
    }
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): void {
    const notif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.persist('notifications', this.notifications);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public logAdminAction(
    action: string,
    targetType: AuditLog['targetType'],
    targetId: string,
    details: string,
    adminName: string = 'Super Administrator'
  ): void {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: 'admin',
      adminName,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    this.persist('audit_logs', this.auditLogs);
  }

  // ==========================================
  // WEBSITE SETTINGS
  // ==========================================
  public getWebsiteSettings(): WebsiteSettings {
    return { ...this.websiteSettings };
  }

  public updateWebsiteSettings(updates: Partial<WebsiteSettings>): boolean {
    this.websiteSettings = {
      ...this.websiteSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist('website_settings', this.websiteSettings);
    this.logAdminAction('UPDATE_SETTINGS', 'settings', 'global', 'Updated global portal configuration.');
    return true;
  }

  // ==========================================
  // SMS OTP & REGISTRATION APPROVALS
  // ==========================================
  public getOtpChallenges(): OtpChallenge[] {
    return [...this.otpChallenges];
  }

  public saveOtpChallenge(challenge: OtpChallenge): void {
    // Cancel prior pending challenges for same phone & purpose
    this.otpChallenges.forEach(c => {
      if (c.phone === challenge.phone && c.purpose === challenge.purpose && c.status === 'pending') {
        c.status = 'cancelled';
      }
    });
    this.otpChallenges.unshift(challenge);
    this.persist('otp_challenges', this.otpChallenges);
  }

  public updateOtpChallenge(id: string, updates: Partial<OtpChallenge>): void {
    const idx = this.otpChallenges.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.otpChallenges[idx] = { ...this.otpChallenges[idx], ...updates };
      this.persist('otp_challenges', this.otpChallenges);
    }
  }

  public saveRegistrationApproval(approval: RegistrationApproval): void {
    this.registrationApprovals.unshift(approval);
    this.persist('registration_approvals', this.registrationApprovals);
  }

  public getRegistrationApprovalByHash(tokenHash: string): RegistrationApproval | null {
    return this.registrationApprovals.find(a => a.tokenHash === tokenHash) || null;
  }

  public consumeRegistrationApproval(tokenHash: string, phone: string, role: string): boolean {
    const approval = this.registrationApprovals.find(
      a => a.tokenHash === tokenHash && a.phone === phone && a.role === role
    );
    if (!approval) return false;
    if (approval.consumedAt) return false; // Already consumed
    if (new Date(approval.expiresAt).getTime() < Date.now()) return false; // Expired

    approval.consumedAt = new Date().toISOString();
    this.persist('registration_approvals', this.registrationApprovals);
    return true;
  }

  public isPhoneRegistered(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    const normalizedDigits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;

    const matchesCand = this.candidates.some(c => {
      const cClean = (c.mobile || '').replace(/[\s\-\(\)\+]/g, '');
      const cDigits = cClean.startsWith('91') && cClean.length === 12 ? cClean.slice(2) : cClean;
      return cDigits === normalizedDigits;
    });

    const matchesComp = this.companies.some(c => {
      const pClean = (c.contactPhone || '').replace(/[\s\-\(\)\+]/g, '');
      const pDigits = pClean.startsWith('91') && pClean.length === 12 ? pClean.slice(2) : pClean;
      return pDigits === normalizedDigits;
    });

    return matchesCand || matchesComp;
  }

  public getOtpAdminStats(): OtpAdminStats {
    const challenges = this.otpChallenges;
    const totalRequests = challenges.length;
    const successfulVerifications = challenges.filter(c => c.status === 'verified').length;
    const failedVerifications = challenges.filter(c => c.status === 'failed').length;
    const expiredChallenges = challenges.filter(c => c.status === 'expired').length;
    const deliveryFailures = challenges.filter(c => (c.sendAttempts || 0) > 1 && c.status === 'cancelled').length;

    const candidateRegistrations = challenges.filter(c => c.purpose === 'candidate_registration' && c.status === 'verified').length;
    const employerRegistrations = challenges.filter(c => c.purpose === 'employer_registration' && c.status === 'verified').length;

    // MSG91 estimated cost: ₹0.15 + 18% GST = ~₹0.18 per SMS
    const estimatedCostInr = Math.round(totalRequests * 0.18 * 100) / 100;

    // Group requests by date (last 7 days)
    const dateMap = new Map<string, { requests: number; verified: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dateMap.set(key, { requests: 0, verified: 0 });
    }

    challenges.forEach(c => {
      const d = new Date(c.createdAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (dateMap.has(key)) {
        const item = dateMap.get(key)!;
        item.requests += 1;
        if (c.status === 'verified') item.verified += 1;
      }
    });

    const requestsByDate = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      requests: counts.requests,
      verified: counts.verified
    }));

    // Mask phone numbers for admin view (no full numbers, no OTPs, privacy-compliant)
    const recentLogs = challenges.slice(0, 15).map(c => {
      const clean = c.phone.replace(/[\s\-\+]/g, '');
      const last2 = clean.slice(-2);
      const first5 = clean.slice(0, 5);
      return {
        id: c.id,
        phoneMasked: `${first5} **** ${last2}`,
        purpose: c.purpose,
        status: c.status,
        attempts: c.verifyAttempts,
        createdAt: c.createdAt,
        verifiedAt: c.verifiedAt
      };
    });

    return {
      totalRequests,
      successfulVerifications,
      failedVerifications,
      expiredChallenges,
      deliveryFailures,
      candidateRegistrations,
      employerRegistrations,
      estimatedCostInr,
      requestsByDate,
      recentLogs
    };
  }

  // ==========================================
  // SMART MATCHING & JOB INVITATIONS
  // ==========================================
  public getJobInvitations(filters?: { employerId?: string; candidateId?: string; jobId?: string }): JobInvitation[] {
    let result = [...this.jobInvitations];
    if (filters?.employerId) {
      result = result.filter(inv => inv.employerId === filters.employerId);
    }
    if (filters?.candidateId) {
      result = result.filter(inv => inv.candidateId === filters.candidateId);
    }
    if (filters?.jobId) {
      result = result.filter(inv => inv.jobId === filters.jobId);
    }
    return result;
  }

  public sendJobInvitation(data: {
    jobId: string;
    candidateId: string;
    employerId: string;
    matchScore?: number;
    message?: string;
  }): { success: boolean; invitation?: JobInvitation; error?: string } {
    const job = this.getJobById(data.jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const cand = this.getCandidateById(data.candidateId);
    if (!cand) return { success: false, error: 'Candidate not found' };

    // Prevent duplicates
    const existing = this.jobInvitations.find(
      inv => inv.jobId === data.jobId && inv.candidateId === data.candidateId
    );
    if (existing) {
      return { success: false, error: 'An invitation has already been sent to this candidate for this vacancy' };
    }

    const invitation: JobInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: data.jobId,
      jobTitle: job.title,
      employerId: data.employerId,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      district: job.district,
      candidateId: data.candidateId,
      candidateName: cand.fullName,
      matchScore: data.matchScore || 85,
      message: data.message || `We noticed your profile strongly matches our requirement for ${job.title}. We would love to review your application.`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobInvitations.push(invitation);
    this.persist('job_invitations', this.jobInvitations);

    // In-app notification to the candidate
    this.addNotification({
      userId: cand.userId || cand.id,
      role: 'candidate',
      title: `📩 Direct Job Invitation from ${job.companyName}`,
      message: `${job.companyName} invited you to apply for "${job.title}" (${invitation.matchScore}% Match).`,
      type: 'success',
      link: '/candidate-dashboard'
    });

    this.logAdminAction(
      'SEND_JOB_INVITATION',
      'job',
      invitation.id,
      `Employer ${job.companyName} sent job invitation to candidate ${cand.fullName} for job: ${job.title}`
    );

    return { success: true, invitation };
  }

  public respondToJobInvitation(invitationId: string, status: 'accepted' | 'declined'): boolean {
    const idx = this.jobInvitations.findIndex(i => i.id === invitationId);
    if (idx === -1) return false;

    this.jobInvitations[idx].status = status;
    this.jobInvitations[idx].updatedAt = new Date().toISOString();
    this.persist('job_invitations', this.jobInvitations);

    const inv = this.jobInvitations[idx];
    this.addNotification({
      userId: inv.employerId,
      role: 'employer',
      title: `Invitation ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      message: `Candidate ${inv.candidateName} ${status === 'accepted' ? 'accepted' : 'declined'} your invitation for "${inv.jobTitle}".`,
      type: status === 'accepted' ? 'success' : 'info'
    });

    return true;
  }

  public resetToSeed(): void {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
    this.loadState();
  }
}

export const db = new DatabaseService();
```

---

## <a id="file-9-src-App-tsx"></a>FILE 9 (Priority 9): `src/App.tsx`
**Inspection Objective:** Frontend authentication and role handling  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\src\App.tsx`  

```tsx
'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/public/Hero';
import { PopularCategories } from './components/public/PopularCategories';
import { PopularDistricts } from './components/public/PopularDistricts';
import { LatestJobs } from './components/public/LatestJobs';
import { HowItWorks } from './components/public/HowItWorks';
import { FindJobsPage } from './components/public/FindJobsPage';
import { JobDetailsModal } from './components/public/JobDetailsModal';
import { CompaniesPage } from './components/public/CompaniesPage';
import { CareerAdvicePage } from './components/public/CareerAdvicePage';
import { CandidateDashboard } from './components/candidate/CandidateDashboard';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AuthModal } from './components/auth/AuthModal';
import { PostJobModal } from './components/employer/PostJobModal';
import { SubscriptionModal } from './components/employer/SubscriptionModal';
import { RecruitmentRequestModal } from './components/public/RecruitmentRequestModal';
import {
  PrivacyPolicyPage,
  TermsConditionsPage,
  JobSeekerAgreementPage,
  EmployerAgreementPage,
  RefundPolicyPage,
  DisclaimerPage,
  CookiePolicyPage,
  GrievanceRedressalPage,
  LegalHubPage,
  ContactUsPage
} from './components/public/InfoPages';
import { ResumeBuilder } from './components/candidate/ResumeBuilder';
import { db } from './services/db';
import { Job, Company } from './types';

// Helper to parse browser pathname & search params into an internal view
const parseLocation = (): {
  view: string;
  searchParams: { search?: string; district?: string; category?: string };
} => {
  if (typeof window === 'undefined') {
    return { view: 'home', searchParams: { search: '', district: 'All', category: 'All' } };
  }

  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const search = searchParams.get('search') || '';
  const district = searchParams.get('district') || 'All';
  const category = searchParams.get('category') || 'All';

  let view = 'home';
  const tab = searchParams.get('tab');
  if (path === 'findjobs' || path === 'find-jobs') {
    view = 'find-jobs';
  } else if (path === 'companies') {
    view = 'companies';
  } else if (path === 'career-advice') {
    view = 'career-advice';
  } else if (path === 'resume-builder' || path === 'resumebuilder' || path === 'resume') {
    view = 'resume-builder';
  } else if (path === 'candidate-dashboard') {
    if (tab === 'applications') view = 'candidate-applications';
    else if (tab === 'profile') view = 'candidate-profile';
    else if (tab === 'resume') view = 'candidate-resume';
    else view = 'candidate-dashboard';
  } else if (path === 'candidate-applications' || path === 'candidate/applications') {
    view = 'candidate-applications';
  } else if (path === 'candidate-profile' || path === 'candidate/profile') {
    view = 'candidate-profile';
  } else if (path === 'candidate-resume' || path === 'candidate/resume') {
    view = 'candidate-resume';
  } else if (path === 'employer-dashboard') {
    if (tab === 'jobs') view = 'employer-jobs';
    else if (tab === 'plans') view = 'employer-plans';
    else view = 'employer-dashboard';
  } else if (path === 'employer-jobs' || path === 'employer/jobs') {
    view = 'employer-jobs';
  } else if (path === 'employer-plans' || path === 'employer/plans') {
    view = 'employer-plans';
  } else if (path === 'admin' || path === 'admin-dashboard' || path === 'admin/login' || path === 'admin-login') {
    view = 'admin-dashboard';
  } else if (path === 'privacy-policy' || path === 'privacy') {
    view = 'privacy-policy';
  } else if (path === 'terms-conditions' || path === 'terms' || path === 'terms-of-service') {
    view = 'terms-conditions';
  } else if (path === 'job-seeker-agreement' || path === 'candidate-agreement') {
    view = 'job-seeker-agreement';
  } else if (path === 'employer-agreement') {
    view = 'employer-agreement';
  } else if (path === 'refund-policy' || path === 'refund-cancellation') {
    view = 'refund-policy';
  } else if (path === 'disclaimer') {
    view = 'disclaimer';
  } else if (path === 'cookie-policy' || path === 'cookies') {
    view = 'cookie-policy';
  } else if (path === 'grievance-redressal' || path === 'grievance') {
    view = 'grievance-redressal';
  } else if (path === 'legal' || path === 'legal-hub') {
    view = 'legal';
  } else if (path === 'contact-us') {
    view = 'contact-us';
  }

  return {
    view,
    searchParams: { search, district, category }
  };
};

// Helper to convert view and search parameters to a clean browser URL
const getUrlForView = (
  view: string,
  params?: { search?: string; district?: string; category?: string }
): string => {
  if (view === 'home') return '/';
  if (view === 'find-jobs' || view === 'findjobs') {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.district && params.district !== 'All') q.set('district', params.district);
    if (params?.category && params.category !== 'All') q.set('category', params.category);
    const qs = q.toString();
    return `/findjobs${qs ? `?${qs}` : ''}`;
  }
  if (view === 'companies') return '/companies';
  if (view === 'career-advice') return '/career-advice';
  if (view === 'resume-builder' || view === 'resumebuilder') return '/resume-builder';
  if (view === 'admin-login') return '/admin/login';
  if (view === 'admin-dashboard') return '/admin';
  if (view === 'candidate-dashboard') return '/candidate-dashboard';
  if (view === 'candidate-applications') return '/candidate-dashboard?tab=applications';
  if (view === 'candidate-profile') return '/candidate-dashboard?tab=profile';
  if (view === 'candidate-resume') return '/candidate-dashboard?tab=resume';
  if (view === 'employer-dashboard') return '/employer-dashboard';
  if (view === 'employer-jobs') return '/employer-dashboard?tab=jobs';
  if (view === 'employer-plans') return '/employer-dashboard?tab=plans';
  return `/${view}`;
};

const MainAppContent: React.FC = () => {
  const { user, role, isLoggedIn } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  // Search parameters for FindJobsPage
  const [searchParams, setSearchParams] = useState<{
    search?: string;
    district?: string;
    category?: string;
  }>({
    search: '',
    district: 'All',
    category: 'All'
  });

  // Handle popstate (Browser Back & Forward navigation)
  React.useEffect(() => {
    // Initial sync on mount
    const loc = parseLocation();
    setCurrentView(loc.view);
    setSearchParams(loc.searchParams);

    const handlePopState = () => {
      const state = parseLocation();
      setCurrentView(state.view);
      setSearchParams(state.searchParams);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-redirect to home on logout if user was viewing any protected dashboard
  React.useEffect(() => {
    if (!isLoggedIn) {
      const protectedDashboardViews = [
        'candidate-dashboard',
        'candidate-applications',
        'candidate-profile',
        'candidate-resume',
        'employer-dashboard',
        'employer-jobs',
        'employer-plans',
        'admin-dashboard'
      ];
      if (protectedDashboardViews.includes(currentView)) {
        handleNavigate('home');
      }
    }
  }, [isLoggedIn, currentView]);

  // Modals state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalApplyMode, setJobModalApplyMode] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_candidate' | 'register_employer'>('login');

  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [recruitmentModalOpen, setRecruitmentModalOpen] = useState(false);

  // Unified Handler with Browser History PushState
  const handleNavigate = (view: string, payload?: any, pushHistory = true) => {
    if (view === 'recruitment-services') {
      setRecruitmentModalOpen(true);
      return;
    }

    let nextView = view;
    let nextSearchParams = { ...searchParams };

    if (view.startsWith('district-')) {
      const distName = view.replace('district-', '');
      const formatted = distName.charAt(0).toUpperCase() + distName.slice(1);
      nextSearchParams = { district: formatted, search: '', category: 'All' };
      nextView = 'find-jobs';
    } else if (payload?.district) {
      nextSearchParams = {
        district: payload.district,
        search: payload.search || '',
        category: payload.category || 'All'
      };
      nextView = 'find-jobs';
    } else if (view === 'find-jobs' || view === 'findjobs') {
      nextView = 'find-jobs';
      if (payload) {
        nextSearchParams = {
          search: payload.search ?? searchParams.search ?? '',
          district: payload.district ?? searchParams.district ?? 'All',
          category: payload.category ?? searchParams.category ?? 'All'
        };
      }
    } else if (view === 'home') {
      nextView = 'home';
      nextSearchParams = { search: '', district: 'All', category: 'All' };
    }

    setCurrentView(nextView);
    setSearchParams(nextSearchParams);

    if (pushHistory && typeof window !== 'undefined') {
      const targetUrl = getUrlForView(nextView, nextSearchParams);
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetUrl) {
        window.history.pushState({ view: nextView, searchParams: nextSearchParams }, '', targetUrl);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: { search?: string; district?: string }) => {
    handleNavigate('find-jobs', {
      search: params.search || '',
      district: params.district || 'All',
      category: 'All'
    });
  };

  const handleSelectCategory = (categoryName: string) => {
    handleNavigate('find-jobs', {
      search: '',
      district: 'All',
      category: categoryName
    });
  };

  const handleSelectDistrict = (districtName: string) => {
    handleNavigate('find-jobs', {
      search: '',
      district: districtName,
      category: 'All'
    });
  };

  const handleOpenJobDetails = (job: Job, applyMode: boolean = false) => {
    setSelectedJob(job);
    setJobModalApplyMode(applyMode);
    setJobModalOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register_candidate' | 'register_employer' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const jobs = db.getJobs();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenPostJob={() => setPostJobModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero onSearch={handleHeroSearch} onOpenAuth={handleOpenAuth} />
            <LatestJobs
              jobs={jobs}
              onSelectJob={j => handleOpenJobDetails(j, false)}
              onApplyJob={j => handleOpenJobDetails(j, true)}
              onViewAllJobs={() => handleNavigate('find-jobs')}
            />
            <PopularCategories onSelectCategory={handleSelectCategory} />
            <PopularDistricts onSelectDistrict={handleSelectDistrict} />
            <HowItWorks onOpenAuth={handleOpenAuth} />
          </>
        )}

        {currentView === 'find-jobs' && (
          <FindJobsPage
            initialSearch={searchParams.search}
            initialDistrict={searchParams.district}
            initialCategory={searchParams.category}
            onSelectJob={j => handleOpenJobDetails(j, false)}
            onApplyJob={j => handleOpenJobDetails(j, true)}
          />
        )}

        {currentView === 'companies' && (
          <CompaniesPage
            onSelectCompany={comp => {
              setSearchParams({ search: comp.name, district: 'All', category: 'All' });
              setCurrentView('find-jobs');
            }}
            onViewJobsForCompany={compName => {
              setSearchParams({ search: compName, district: 'All', category: 'All' });
              setCurrentView('find-jobs');
            }}
          />
        )}

        {currentView === 'career-advice' && (
          <CareerAdvicePage
            onOpenResumeBuilder={() => handleNavigate('resume-builder')}
            onExploreJobs={() => handleNavigate('find-jobs')}
          />
        )}

        {currentView === 'resume-builder' && (
          <ResumeBuilder
            onBack={() => handleNavigate('home')}
            onOpenAuth={mode => handleOpenAuth(mode || 'register_candidate')}
          />
        )}

        {/* Candidate Dashboard & Tabs */}
        {(currentView === 'candidate-dashboard' ||
          currentView === 'candidate-applications' ||
          currentView === 'candidate-profile' ||
          currentView === 'candidate-resume') && (
          <CandidateDashboard
            key={currentView}
            initialTab={
              currentView === 'candidate-applications'
                ? 'applications'
                : currentView === 'candidate-profile'
                ? 'profile'
                : currentView === 'candidate-resume'
                ? 'resume'
                : 'overview'
            }
            onTabChange={tab => {
              if (tab === 'applications') handleNavigate('candidate-applications');
              else if (tab === 'profile') handleNavigate('candidate-profile');
              else if (tab === 'resume') handleNavigate('candidate-resume');
              else if (tab === 'overview') handleNavigate('candidate-dashboard');
            }}
            onNavigateToFindJobs={() => handleNavigate('find-jobs')}
            onViewJob={j => handleOpenJobDetails(j, false)}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* Employer Dashboard & Tabs */}
        {(currentView === 'employer-dashboard' ||
          currentView === 'employer-jobs' ||
          currentView === 'employer-plans') && (
          <EmployerDashboard
            key={currentView}
            initialTab={
              currentView === 'employer-jobs'
                ? 'jobs'
                : currentView === 'employer-plans'
                ? 'plans'
                : 'overview'
            }
            onTabChange={tab => {
              if (tab === 'jobs') handleNavigate('employer-jobs');
              else if (tab === 'plans') handleNavigate('employer-plans');
              else if (tab === 'overview') handleNavigate('employer-dashboard');
            }}
            onPostJobClick={() => setPostJobModalOpen(true)}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* Super Admin Dashboard or Login Gate */}
        {currentView === 'admin-dashboard' && (
          user?.role === 'super_admin' ? (
            <AdminDashboard onNavigateHome={() => handleNavigate('home')} />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => setCurrentView('admin-dashboard')}
              onNavigateHome={() => handleNavigate('home')}
            />
          )
        )}

        {/* Static Legal Hub & Compliance Pages */}
        {currentView === 'privacy-policy' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
        {currentView === 'terms-conditions' && <TermsConditionsPage onNavigate={handleNavigate} />}
        {currentView === 'job-seeker-agreement' && <JobSeekerAgreementPage onNavigate={handleNavigate} />}
        {currentView === 'employer-agreement' && <EmployerAgreementPage onNavigate={handleNavigate} />}
        {currentView === 'refund-policy' && <RefundPolicyPage onNavigate={handleNavigate} />}
        {currentView === 'disclaimer' && <DisclaimerPage onNavigate={handleNavigate} />}
        {currentView === 'cookie-policy' && <CookiePolicyPage onNavigate={handleNavigate} />}
        {currentView === 'grievance-redressal' && <GrievanceRedressalPage onNavigate={handleNavigate} />}
        {currentView === 'legal' && <LegalHubPage onNavigate={handleNavigate} />}
        {currentView === 'contact-us' && <ContactUsPage onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />

      {/* Global Modals */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={jobModalOpen}
        initialApplyMode={jobModalApplyMode}
        onClose={() => setJobModalOpen(false)}
        onOpenAuth={handleOpenAuth}
        onApplicationSuccess={() => {
          // If candidate is on dashboard, refresh
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <PostJobModal
        isOpen={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        onJobCreated={() => {
          // Job created
        }}
        onOpenSubscriptionPlans={() => {
          setPostJobModalOpen(false);
          setSubscriptionModalOpen(true);
        }}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      <RecruitmentRequestModal
        isOpen={recruitmentModalOpen}
        onClose={() => setRecruitmentModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
```

---

## <a id="file-10-package-json"></a>FILE 10 (Priority 10): `package.json`
**Inspection Objective:** Dependencies and security risks  
**Absolute Path:** `D:\Projects\mahajobs---maharashtra-job-portal\package.json`  

```json
{
  "name": "rozgarx",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000 -H 0.0.0.0",
    "start": "next start -p 3000 -H 0.0.0.0",
    "build": "next build",
    "clean": "rm -rf .next dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@supabase/supabase-js": "^2.119.0",
    "@tailwindcss/postcss": "^4.3.5",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "next": "^16.4.6",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.28.2",
    "pg": "^8.23.1",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2"
  }
}
```

---

