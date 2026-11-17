import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIpHash,
  getSupabaseAdmin,
  normalizeIndianMobile
} from '@/src/lib/otpServer';
import { checkRateLimit } from '@/src/lib/rateLimit';

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
      // Neutralize user enumeration (OWASP ASVS v4.0.3 Chapter 2)
      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to process registration with the provided details. If you already have an account, please proceed to Sign In.'
        },
        { status: 400 }
      );
    }

    // 60-second resend cooldown
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

    // IP rate limit (10 requests per hour)
    const ipLimit = await checkRateLimit(req, {
      action: 'send_otp_ip',
      maxAttempts: 10,
      windowSeconds: 3600
    });
    if (!ipLimit.allowed && ipLimit.response) {
      return ipLimit.response;
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
