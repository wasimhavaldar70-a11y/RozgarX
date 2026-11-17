import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, normalizeIndianMobile } from '@/src/lib/otpServer';
import { checkRateLimit } from '@/src/lib/rateLimit';
import { ResendOtpSchema, validatePayload } from '@/src/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid or empty JSON request body' },
        { status: 400 }
      );
    }

    const validation = validatePayload(ResendOtpSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const { mobile, role, challengeId } = validation.data;
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

    // IP rate limit (5 resend requests per 15 minutes)
    const ipLimit = await checkRateLimit(req, {
      action: 'resend_otp_ip',
      maxAttempts: 5,
      windowSeconds: 900
    });
    if (!ipLimit.allowed && ipLimit.response) {
      return ipLimit.response;
    }

    // Cooldown rate limit (1 request per 60 seconds)
    const cooldown = await checkRateLimit(req, {
      action: 'send_otp_cooldown',
      identifier: normalized.storageFormat,
      maxAttempts: 1,
      windowSeconds: 60
    });
    if (!cooldown.allowed && cooldown.response) {
      return cooldown.response;
    }

    // Phone rate limit (3 requests per 15 minutes)
    const phoneLimit = await checkRateLimit(req, {
      action: 'send_otp',
      identifier: normalized.storageFormat,
      maxAttempts: 3,
      windowSeconds: 900
    });
    if (!phoneLimit.allowed && phoneLimit.response) {
      return phoneLimit.response;
    }

    const retryUrl = `https://control.msg91.com/api/v5/otp/retry?mobile=${encodeURIComponent(
      normalized.msg91Format
    )}&retrytype=text`;
    const retryRes = await fetch(retryUrl, {
      method: 'GET',
      headers: { authkey: authKey }
    });
    const retryData = (await retryRes.json().catch(() => null)) as {
      type?: string;
      message?: string;
    } | null;

    if (!retryData || retryData.type !== 'success') {
      return NextResponse.json(
        {
          success: false,
          error: retryData?.message || 'Unable to resend OTP via MSG91'
        },
        { status: 502 }
      );
    }

    if (challengeId) {
      const { data: existing } = await supabaseAdmin
        .from('otp_challenges')
        .select('send_attempts')
        .eq('id', challengeId)
        .eq('phone', normalized.storageFormat)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('otp_challenges')
          .update({
            send_attempts: (existing.send_attempts || 1) + 1,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          })
          .eq('id', challengeId);
      }
    }

    return NextResponse.json({
      success: true,
      challengeId,
      message: `Fresh 6-digit OTP resent to ${normalized.displayFormat}`,
      resendCooldownSeconds: 60
    });
  } catch (err: any) {
    console.error('Unhandled error in /api/otp/resend:', err?.message);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while resending OTP' },
      { status: 500 }
    );
  }
}
