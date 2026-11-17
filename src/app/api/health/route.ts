import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSecretKey, getSupabaseUrl } from '@/src/lib/otpServer';
import { checkRateLimit, withRateLimitHeaders } from '@/src/lib/rateLimit';

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req, {
    action: 'health_check_ip',
    maxAttempts: 120,
    windowSeconds: 60,
    failOpenOnDbError: true
  });

  if (!rateLimit.allowed && rateLimit.response) {
    return rateLimit.response;
  }

  const response = NextResponse.json({
    ok: true,
    framework: 'nextjs',
    supabaseConfigured: Boolean(getSupabaseUrl() && getSupabaseSecretKey()),
    msg91AuthConfigured: Boolean(process.env.MSG91_AUTH_KEY),
    msg91TemplateConfigured: Boolean(process.env.MSG91_OTP_TEMPLATE_ID)
  });

  return withRateLimitHeaders(response, rateLimit);
}
