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

    if (String(password).length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long for security' },
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
