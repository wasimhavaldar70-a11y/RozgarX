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
