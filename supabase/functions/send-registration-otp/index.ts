// Supabase Edge Function: send-registration-otp
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizeIndianMobile, sendMsg91Otp } from '../_shared/msg91.ts';
import { getSupabaseAdmin, sha256 } from '../_shared/supabaseServer.ts';

interface SendOtpRequest {
  mobile: string;
  role: 'candidate' | 'employer';
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: SendOtpRequest = await req.json().catch(() => ({ mobile: '', role: 'candidate' as const }));
    const { mobile, role } = body;

    // 1. Role verification
    if (role !== 'candidate' && role !== 'employer') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid registration role specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validate and normalize mobile number
    const normalized = normalizeIndianMobile(mobile);
    if (!normalized.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: normalized.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const purpose = `${role}_registration` as 'candidate_registration' | 'employer_registration';

    // 3. Client IP hashing for privacy-compliant rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown_ip';
    const ipHash = await sha256(clientIp);

    // Initialize Supabase Admin client
    const supabaseAdmin = getSupabaseAdmin();

    // 4. Check if phone number is already registered
    const { data: isRegistered, error: checkError } = await supabaseAdmin.rpc('check_phone_registered', {
      p_phone: normalized.storageFormat
    });

    if (checkError) {
      console.error('Database error checking phone registration:', checkError.message);
    }

    if (isRegistered) {
      // Safe generic message that does not expose account data
      return new Response(
        JSON.stringify({
          success: false,
          error: 'This mobile number is already registered. Please sign in or use a different number.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Rate limiting: Phone limit (3 attempts per 15 minutes)
    const { data: phoneLimitData } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
      p_identifier: normalized.storageFormat,
      p_action: 'send_otp',
      p_max_attempts: 3,
      p_window_seconds: 900 // 15 mins
    });

    const phoneLimit = phoneLimitData?.[0];
    if (phoneLimit && !phoneLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Too many OTP requests. Please wait ${Math.ceil(phoneLimit.retry_after_seconds / 60)} minutes before trying again.`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Rate limiting: IP limit (10 attempts per hour)
    const { data: ipLimitData } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
      p_identifier: ipHash,
      p_action: 'send_otp_ip',
      p_max_attempts: 10,
      p_window_seconds: 3600 // 1 hour
    });

    const ipLimit = ipLimitData?.[0];
    if (ipLimit && !ipLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests from your network. Please try again later.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Dispatch OTP via MSG91
    const authKey = Deno.env.get('MSG91_AUTH_KEY') || '';
    const templateId = Deno.env.get('MSG91_OTP_TEMPLATE_ID') || '';

    const msg91Result = await sendMsg91Otp({
      mobileMsg91: normalized.msg91Format,
      authKey,
      templateId,
      otpExpiryMinutes: 5,
      otpLength: 6
    });

    if (msg91Result.type !== 'success') {
      return new Response(
        JSON.stringify({
          success: false,
          error: msg91Result.message || 'Unable to deliver SMS OTP. Please check the mobile number and try again.'
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Record challenge metadata in database
    const { data: challengeId, error: challengeError } = await supabaseAdmin.rpc('record_otp_challenge', {
      p_phone: normalized.storageFormat,
      p_purpose: purpose,
      p_request_id: msg91Result.requestId || null,
      p_ip_hash: ipHash,
      p_expiry_minutes: 5
    });

    if (challengeError) {
      console.error('Failed to record OTP challenge:', challengeError.message);
    }

    // 9. Return safe response without internal secrets
    const maskedPhone = `${normalized.displayFormat.slice(0, 7)} XXX ${normalized.displayFormat.slice(-2)}`;

    return new Response(
      JSON.stringify({
        success: true,
        challengeId,
        message: `6-digit OTP sent successfully to ${maskedPhone}`,
        resendCooldownSeconds: 60,
        expiresInSeconds: 300
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Unhandled error in send-registration-otp:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred while sending OTP' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
