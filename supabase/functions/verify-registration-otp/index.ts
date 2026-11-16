// Supabase Edge Function: verify-registration-otp
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizeIndianMobile, verifyMsg91Otp } from '../_shared/msg91.ts';
import { getSupabaseAdmin, sha256, generateSecureToken } from '../_shared/supabaseServer.ts';

interface VerifyOtpRequest {
  challengeId: string;
  mobile: string;
  otp: string;
  role: 'candidate' | 'employer';
}

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

  try {
    const body: VerifyOtpRequest = await req.json().catch(() => ({ challengeId: '', mobile: '', otp: '', role: 'candidate' as const }));
    const { challengeId, mobile, otp, role } = body;

    // 1. Basic input validation
    if (!challengeId || !mobile || !otp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Challenge ID, mobile number, and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid 6-digit numeric OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (role !== 'candidate' && role !== 'employer') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid registration role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalized = normalizeIndianMobile(mobile);
    if (!normalized.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: normalized.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Fetch challenge record from database
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from('otp_challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('phone', normalized.storageFormat)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired OTP session. Please request a new OTP.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify challenge status and expiry
    if (challenge.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, error: `OTP is already ${challenge.status}. Please request a new OTP.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from('otp_challenges').update({ status: 'expired' }).eq('id', challengeId);
      return new Response(
        JSON.stringify({ success: false, error: 'OTP has expired. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verification attempts limit (max 5 per challenge)
    if (challenge.verify_attempts >= 5) {
      await supabaseAdmin.from('otp_challenges').update({ status: 'failed' }).eq('id', challengeId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new OTP.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment verify_attempts counter
    await supabaseAdmin
      .from('otp_challenges')
      .update({ verify_attempts: (challenge.verify_attempts || 0) + 1 })
      .eq('id', challengeId);

    // 5. Call MSG91 VerifyOTP API
    const authKey = Deno.env.get('MSG91_AUTH_KEY') || '';
    const verifyResult = await verifyMsg91Otp({
      mobileMsg91: normalized.msg91Format,
      otp: otp.trim(),
      authKey
    });

    // Check response.type === 'success'
    if (verifyResult.type !== 'success') {
      const remainingAttempts = 4 - challenge.verify_attempts;
      const errorDetail = remainingAttempts > 0 
        ? `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`
        : 'Incorrect OTP. Maximum attempts reached. Please request a new code.';

      return new Response(
        JSON.stringify({ success: false, error: errorDetail }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Generate cryptographically secure registration approval token
    const rawApprovalToken = generateSecureToken();
    const tokenHash = await sha256(rawApprovalToken);

    // 7. Store SHA-256 hash in registration_approvals table via atomic RPC
    const { data: approved, error: approvalError } = await supabaseAdmin.rpc('verify_challenge_and_approve', {
      p_challenge_id: challengeId,
      p_phone: normalized.storageFormat,
      p_role: role,
      p_token_hash: tokenHash,
      p_approval_minutes: 10
    });

    if (approvalError || !approved) {
      console.error('Failed to create registration approval:', approvalError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record verification approval. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Return approval token once to frontend
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mobile number verified successfully via SMS OTP.',
        approvalToken: rawApprovalToken, // Given only once to frontend
        verifiedMobile: normalized.storageFormat,
        displayMobile: normalized.displayFormat,
        expiresInSeconds: 600
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Unhandled error in verify-registration-otp:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred during OTP verification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
