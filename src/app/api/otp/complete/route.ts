import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, normalizeIndianMobile, sha256 } from '@/src/lib/otpServer';
import { checkRateLimit } from '@/src/lib/rateLimit';
import { CompleteRegistrationSchema, validatePayload } from '@/src/lib/validation';

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  let createdAuthUserId: string | null = null;

  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid or empty JSON request body' },
        { status: 400 }
      );
    }

    const validation = validatePayload(CompleteRegistrationSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const validatedData = validation.data;
    const { role, approvalToken, email, password, mobile, district, city } = validatedData;

    const normalized = normalizeIndianMobile(mobile);
    if (!normalized.isValid) {
      return NextResponse.json(
        { success: false, error: normalized.error },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase();

    // -------------------------------------------------------------
    // RATE LIMITING: Prevent automated bulk account creation
    // -------------------------------------------------------------
    const ipLimit = await checkRateLimit(req, {
      action: 'complete_registration_ip',
      maxAttempts: 10,
      windowSeconds: 3600
    });
    if (!ipLimit.allowed && ipLimit.response) {
      return ipLimit.response;
    }

    const phoneLimit = await checkRateLimit(req, {
      action: 'complete_registration_phone',
      identifier: normalized.storageFormat,
      maxAttempts: 3,
      windowSeconds: 900
    });
    if (!phoneLimit.allowed && phoneLimit.response) {
      return phoneLimit.response;
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
      // Neutralize user enumeration (OWASP ASVS v4.0.3 Chapter 2)
      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to complete registration with the provided credentials. If you already have an account, please proceed to Sign In.'
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
      role === 'candidate'
        ? String(validatedData.fullName || '').trim()
        : String(validatedData.contactPerson || '').trim();

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
        full_name: String(validatedData.fullName || '').trim(),
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
          contact_person: String(validatedData.contactPerson || '').trim(),
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
        name: String(validatedData.companyName || '').trim(),
        tagline: 'Verified Employer in Maharashtra',
        industry: String(validatedData.industry || 'General Business'),
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
