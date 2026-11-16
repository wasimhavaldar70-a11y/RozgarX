import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  );
}

export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  );
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const key = getSupabaseSecretKey();
  if (!url || !key) {
    throw new Error('Server Supabase admin credentials are not configured');
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function normalizeIndianMobile(raw: string): {
  isValid: boolean;
  msg91Format: string;
  displayFormat: string;
  storageFormat: string;
  error?: string;
} {
  if (!raw || typeof raw !== 'string') {
    return {
      isValid: false,
      msg91Format: '',
      displayFormat: '',
      storageFormat: '',
      error: 'Mobile number is required'
    };
  }

  let cleaned = raw.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);

  let tenDigit = cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigit = cleaned.substring(2);
  }

  if (!/^[6-9]\d{9}$/.test(tenDigit)) {
    return {
      isValid: false,
      msg91Format: '',
      displayFormat: '',
      storageFormat: '',
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9'
    };
  }

  return {
    isValid: true,
    msg91Format: `91${tenDigit}`,
    displayFormat: `+91 ${tenDigit.slice(0, 5)} ${tenDigit.slice(5)}`,
    storageFormat: `+91${tenDigit}`
  };
}

export function getClientIpHash(headers: Headers): string {
  // Prioritize verified proxy headers over easily-spoofed client X-Forwarded-For
  const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();
  const xRealIp = headers.get('x-real-ip')?.trim();
  const forwarded = headers.get('x-forwarded-for')?.trim();
  
  // On trusted edge environments (Vercel / Cloudflare), x-real-ip or cf-connecting-ip is set by the edge
  let ip = cfConnectingIp || xRealIp;
  if (!ip && forwarded) {
    // If only X-Forwarded-For is present, take the rightmost IP (closest to the edge proxy)
    const parts = forwarded.split(',').map(p => p.trim()).filter(Boolean);
    ip = parts.length > 0 ? parts[parts.length - 1] : 'unknown_ip';
  }
  
  return sha256(ip || 'unknown_ip');
}
