// Supabase Edge Function: complete-registration
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizeIndianMobile } from '../_shared/msg91.ts';
import { getSupabaseAdmin, sha256 } from '../_shared/supabaseServer.ts';

interface CompleteCandidateRequest {
  role: 'candidate';
  approvalToken: string;
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  district: string;
  city?: string;
}

interface CompleteEmployerRequest {
  role: 'employer';
  approvalToken: string;
  contactPerson: string;
  companyName: string;
  email: string;
  password: string;
  mobile: string;
  district: string;
  city?: string;
  industry?: string;
}

type CompleteRegistrationRequest = CompleteCandidateRequest | CompleteEmployerRequest;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabaseAdmin = getSupabaseAdmin();
  let createdAuthUserId: string | null = null;

  try {
    const body: CompleteRegistrationRequest = await req.json().catch(() => null);

    if (!body || !body.approvalToken || !body.email || !body.password || !body.mobile || !body.role) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required registration parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { role, approvalToken, email, password, mobile, district } = body;

    // 1. Validate role (never allow elevation to super_admin from public endpoint)
    if (role !== 'candidate' && role !== 'employer') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid registration role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validate mobile normalization
    const normalized = normalizeIndianMobile(mobile);
    if (!normalized.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: normalized.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Email & Password format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!district) {
      return new Response(
        JSON.stringify({ success: false, error: 'Maharashtra district selection is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate and hash the approval token
    const tokenHash = await sha256(approvalToken.trim());

    // 5. Atomically verify and consume the approval token
    const { data: isConsumed, error: consumeError } = await supabaseAdmin.rpc('consume_registration_approval', {
      p_token_hash: tokenHash,
      p_phone: normalized.storageFormat,
      p_role: role
    });

    if (consumeError || !isConsumed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid, expired, or already used mobile verification approval token. Please verify your mobile again.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Check if email or phone is already in use
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, email, mobile')
      .or(`email.eq.${email.trim().toLowerCase()},mobile.eq.${normalized.storageFormat}`)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: existingUser.email === email.trim().toLowerCase() 
            ? 'An account with this email address already exists. Please sign in.'
            : 'An account with this mobile number already exists. Please sign in.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Create Supabase Auth user via Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Mark confirmed since phone is OTP-verified
      user_metadata: {
        role,
        mobile: normalized.storageFormat,
        phone_verified: true
      }
    });

    if (authError || !authData.user) {
      console.error('Supabase auth.admin.createUser failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: authError?.message || 'Failed to initialize account credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    createdAuthUserId = authData.user.id;

    // 8. Insert into profiles with phone_verified = true
    const displayName = role === 'candidate' 
      ? (body as CompleteCandidateRequest).fullName.trim()
      : (body as CompleteEmployerRequest).contactPerson.trim();

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: createdAuthUserId,
      user_id: createdAuthUserId,
      full_name: displayName,
      email: email.trim().toLowerCase(),
      mobile: normalized.storageFormat,
      role,
      phone_verified: true
    });

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    // 9. Role-specific profile initialization
    if (role === 'candidate') {
      const candBody = body as CompleteCandidateRequest;
      const { error: candidateError } = await supabaseAdmin.from('candidates').insert({
        profile_id: createdAuthUserId,
        full_name: candBody.fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: normalized.storageFormat,
        district: candBody.district,
        city: candBody.city || candBody.district,
        is_discoverable: true
      });

      if (candidateError) {
        throw new Error(`Candidate record creation failed: ${candidateError.message}`);
      }
    } else {
      const empBody = body as CompleteEmployerRequest;
      // Create Employer record
      const { data: employerRecord, error: empError } = await supabaseAdmin.from('employers').insert({
        profile_id: createdAuthUserId,
        contact_person: empBody.contactPerson.trim(),
        business_email: email.trim().toLowerCase(),
        mobile: normalized.storageFormat,
        is_active: true
      }).select('id').single();

      if (empError || !employerRecord) {
        throw new Error(`Employer record creation failed: ${empError?.message}`);
      }

      // Create Company record with verification_status = 'Pending'
      // CRITICAL: Phone verification is separate from company verification
      const { error: companyError } = await supabaseAdmin.from('companies').insert({
        employer_id: employerRecord.id,
        name: empBody.companyName.trim(),
        tagline: 'Verified Employer in Maharashtra',
        industry: empBody.industry || 'General Business',
        company_type: 'Private Limited',
        district: empBody.district,
        city: empBody.city || empBody.district,
        address: `${empBody.city || empBody.district}, ${empBody.district}`,
        contact_email: email.trim().toLowerCase(),
        contact_phone: normalized.storageFormat,
        verification_status: 'Pending'
      });

      if (companyError) {
        throw new Error(`Company record creation failed: ${companyError.message}`);
      }
    }

    // 10. Success response
    return new Response(
      JSON.stringify({
        success: true,
        userId: createdAuthUserId,
        role,
        message: role === 'candidate'
          ? 'Registration completed! Candidate account created with verified mobile.'
          : 'Employer registration completed! Account active with verified phone. Company verification status is Pending.'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Critical registration error:', err.message);

    // Compensating transaction: Clean up created Auth user to avoid orphan record
    if (createdAuthUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
        console.info(`Cleaned up orphaned auth user ${createdAuthUserId}`);
      } catch (cleanupErr: any) {
        console.error('Compensating cleanup failed:', cleanupErr.message);
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to complete registration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
