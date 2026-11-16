import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, normalizeIndianMobile } from '@/src/lib/otpServer';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      mobile?: string;
      role?: string;
      challengeId?: string;
    };
    const { mobile, role, challengeId } = body;

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
    if (!authKey) {
      return NextResponse.json(
        { success: false, error: 'MSG91_AUTH_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

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
          error: `Please wait ${cooldown.retry_after_seconds} seconds before resending OTP.`
        },
        { status: 429 }
      );
    }

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
