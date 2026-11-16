import { NextResponse } from 'next/server';
import { getSupabaseSecretKey, getSupabaseUrl } from '@/src/lib/otpServer';

export async function GET() {
  return NextResponse.json({
    ok: true,
    framework: 'nextjs',
    supabaseConfigured: Boolean(getSupabaseUrl() && getSupabaseSecretKey()),
    msg91AuthConfigured: Boolean(process.env.MSG91_AUTH_KEY),
    msg91TemplateConfigured: Boolean(process.env.MSG91_OTP_TEMPLATE_ID)
  });
}
