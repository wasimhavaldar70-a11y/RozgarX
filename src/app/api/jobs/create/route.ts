import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, getSupabaseUrl } from '@/src/lib/otpServer';
import { checkRateLimit, withRateLimitHeaders } from '@/src/lib/rateLimit';
import { CreateJobSchema, validatePayload } from '@/src/lib/validation';
import { safeErrorResponse } from '@/src/lib/safeError';

export async function POST(req: NextRequest) {
  try {
    // -------------------------------------------------------------
    // 0. IP BURST RATE LIMITING (15 requests / 60 seconds)
    // -------------------------------------------------------------
    const ipLimit = await checkRateLimit(req, {
      action: 'jobs_create_ip',
      maxAttempts: 15,
      windowSeconds: 60
    });
    if (!ipLimit.allowed && ipLimit.response) {
      return ipLimit.response;
    }

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
    // 2.1 USER RATE LIMITING (20 job postings / 1 hour for employers)
    // -------------------------------------------------------------
    let userRateResult = null;
    if (!isSuperAdmin) {
      userRateResult = await checkRateLimit(req, {
        action: 'jobs_create_user',
        identifier: authenticatedUserId,
        maxAttempts: 20,
        windowSeconds: 3600
      });
      if (!userRateResult.allowed && userRateResult.response) {
        return userRateResult.response;
      }
    }

    // -------------------------------------------------------------
    // 3. PARSE & STRICT SCHEMA VALIDATION (Zod with .strict())
    // -------------------------------------------------------------
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid or empty JSON request body' },
        { status: 400 }
      );
    }

    const validation = validatePayload(CreateJobSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const validatedJob = validation.data;
    const {
      title,
      category,
      description,
      responsibilities,
      requiredSkills,
      educationRequirement,
      experienceMinYears,
      experienceMaxYears,
      salaryMin,
      salaryMax,
      salaryType,
      vacancies,
      jobType,
      workMode,
      district,
      city,
      address,
      companyName,
      companyId,
      employerId,
      contactEmail,
      contactPhone,
      status: requestedStatus
    } = validatedJob;

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
            return safeErrorResponse({
              context: 'jobs_create_auto_company',
              internalError: compErr,
              userMessage: 'Unable to initialize employer company profile. Please try again.',
              status: 500
            });
          }

          resolvedCompanyId = newComp.id;
        }
      }
    } else {
      // Super Admin override path
      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      if (employerId && isUuid(employerId)) {
        resolvedEmployerId = employerId;
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
      return safeErrorResponse({
        context: 'jobs_create_insert',
        internalError: jobErr,
        userMessage: 'Unable to publish vacancy due to an internal database error. Please try again.',
        status: 500
      });
    }

    const successRes = NextResponse.json({
      success: true,
      message:
        finalStatus === 'approved'
          ? 'Vacancy published and approved successfully.'
          : 'Vacancy submitted successfully and is pending administrative review.',
      job: insertedJob
    });

    if (userRateResult) {
      return withRateLimitHeaders(successRes, userRateResult);
    }
    return withRateLimitHeaders(successRes, ipLimit);
  } catch (err: unknown) {
    return safeErrorResponse({
      context: 'jobs_create_unhandled',
      internalError: err,
      userMessage: 'An unexpected error occurred while processing your vacancy. Please try again.',
      status: 500
    });
  }
}
