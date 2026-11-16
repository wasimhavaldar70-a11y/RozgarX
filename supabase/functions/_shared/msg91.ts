/**
 * MSG91 SMS OTP API Client & Phone Normalizer
 * Production-ready integration for MahaJobs
 */

export interface Msg91SendResponse {
  type: 'success' | 'error';
  message: string;
  requestId?: string;
}

export interface Msg91VerifyResponse {
  type: 'success' | 'error';
  message: string;
}

/**
 * Normalizes Indian mobile number to E.164 and MSG91 formats
 * Validates 10-digit Indian mobile format (starting with 6-9)
 */
export function normalizeIndianMobile(raw: string): {
  isValid: boolean;
  msg91Format: string;     // e.g. "919822012345"
  displayFormat: string;   // e.g. "+91 98220 12345"
  storageFormat: string;   // e.g. "+919822012345"
  error?: string;
} {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, msg91Format: '', displayFormat: '', storageFormat: '', error: 'Mobile number is required' };
  }

  // Remove spaces, dashes, parentheses
  let cleaned = raw.trim().replace(/[\s\-\(\)]/g, '');

  // Strip leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Strip leading 0 if present (e.g., 09822012345)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 91 and has 12 digits, strip 91 for 10-digit validation
  let tenDigit = cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigit = cleaned.substring(2);
  }

  // Validate exactly 10 digits starting with 6, 7, 8, 9 (standard Indian mobile numbers)
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(tenDigit)) {
    return {
      isValid: false,
      msg91Format: '',
      displayFormat: '',
      storageFormat: '',
      error: 'Please enter a valid 10-digit Indian mobile number (e.g. 98220 12345)'
    };
  }

  const msg91Format = `91${tenDigit}`;
  const displayFormat = `+91 ${tenDigit.slice(0, 5)} ${tenDigit.slice(5)}`;
  const storageFormat = `+91${tenDigit}`;

  return {
    isValid: true,
    msg91Format,
    displayFormat,
    storageFormat
  };
}

/**
 * Calls MSG91 Send OTP endpoint: POST https://control.msg91.com/api/v5/otp
 */
export async function sendMsg91Otp(params: {
  mobileMsg91: string;
  authKey: string;
  templateId: string;
  otpExpiryMinutes?: number;
  otpLength?: number;
}): Promise<Msg91SendResponse> {
  const { mobileMsg91, authKey, templateId, otpExpiryMinutes = 5, otpLength = 6 } = params;

  if (!authKey) {
    throw new Error('MSG91_AUTH_KEY is not configured');
  }
  if (!templateId) {
    throw new Error('MSG91_OTP_TEMPLATE_ID is not configured');
  }

  const url = 'https://control.msg91.com/api/v5/otp';
  const body = {
    template_id: templateId,
    mobile: mobileMsg91,
    otp_length: otpLength,
    otp_expiry: otpExpiryMinutes
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => null);

  // MSG91 returns { message: "...", type: "success" | "error", request_id: "..." }
  if (data && data.type === 'success') {
    return {
      type: 'success',
      message: data.message || 'OTP sent successfully',
      requestId: data.request_id
    };
  }

  return {
    type: 'error',
    message: data?.message || 'Failed to dispatch SMS OTP via gateway',
    requestId: data?.request_id
  };
}

/**
 * Calls MSG91 Verify OTP endpoint: GET https://control.msg91.com/api/v5/otp/verify
 * CRITICAL RULE: MSG91 may return HTTP 200 even when verification fails.
 * Always check response.type === "success".
 */
export async function verifyMsg91Otp(params: {
  mobileMsg91: string;
  otp: string;
  authKey: string;
}): Promise<Msg91VerifyResponse> {
  const { mobileMsg91, otp, authKey } = params;

  if (!authKey) {
    throw new Error('MSG91_AUTH_KEY is not configured');
  }

  // Validate OTP format before calling gateway
  if (!/^\d{6}$/.test(otp)) {
    return {
      type: 'error',
      message: 'OTP must be exactly 6 numeric digits'
    };
  }

  const url = `https://control.msg91.com/api/v5/otp/verify?mobile=${encodeURIComponent(mobileMsg91)}&otp=${encodeURIComponent(otp)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      authkey: authKey
    }
  });

  const data = await response.json().catch(() => null);

  // Must strictly evaluate response.type === 'success'
  if (data && data.type === 'success') {
    return {
      type: 'success',
      message: data.message || 'OTP verified successfully'
    };
  }

  return {
    type: 'error',
    message: data?.message || 'Invalid or expired OTP'
  };
}

/**
 * Calls MSG91 Resend OTP endpoint: GET https://control.msg91.com/api/v5/otp/retry
 */
export async function resendMsg91Otp(params: {
  mobileMsg91: string;
  authKey: string;
  retryType?: 'text' | 'voice';
}): Promise<Msg91SendResponse> {
  const { mobileMsg91, authKey, retryType = 'text' } = params;

  if (!authKey) {
    throw new Error('MSG91_AUTH_KEY is not configured');
  }

  const url = `https://control.msg91.com/api/v5/otp/retry?mobile=${encodeURIComponent(mobileMsg91)}&retrytype=${retryType}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      authkey: authKey
    }
  });

  const data = await response.json().catch(() => null);

  if (data && data.type === 'success') {
    return {
      type: 'success',
      message: data.message || 'OTP resent successfully',
      requestId: data.request_id
    };
  }

  return {
    type: 'error',
    message: data?.message || 'Failed to resend OTP',
    requestId: data?.request_id
  };
}
