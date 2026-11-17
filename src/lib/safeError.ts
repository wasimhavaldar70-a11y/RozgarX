/**
 * MAHAJOBS: Enterprise Safe Error & Sanitized Logging Engine
 * Prevents Information Disclosure (OWASP ASVS Chapter 13):
 * 1. Generates opaque, non-guessable reference IDs for all internal server errors.
 * 2. Redacts sensitive credentials, tokens, passwords, and PII from server logs.
 * 3. Never transmits raw stack traces, database error messages, or file paths to clients.
 */

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

/**
 * Generates an opaque error reference ID (e.g. ref_a8f9c2d1)
 */
export function generateReferenceId(): string {
  return `ref_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Redacts passwords, authorization tokens, API keys, and sensitive data from strings and objects
 */
export function sanitizeLogData(data: unknown): unknown {
  if (!data) return data;

  if (typeof data === 'string') {
    return data
      .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED_TOKEN]')
      .replace(/eyJhbGciOi[a-zA-Z0-9_\-\.]+/g, '[REDACTED_JWT]')
      .replace(/([Pp]assword|[Ss]ecret|[Tt]oken|[Aa]uthKey)\s*[:=]\s*['"][^'"]+['"]/gi, '$1="[REDACTED]"')
      .replace(/postgres(ql)?:\/\/[^@]+@/gi, 'postgresql://[REDACTED_CREDENTIALS]@')
      .replace(/(\+91|0)?[6-9]\d{9}/g, (match) => `${match.slice(0, 3)}****${match.slice(-2)}`);
  }

  if (typeof data === 'object') {
    try {
      const copy = JSON.parse(JSON.stringify(data));
      const sensitiveKeys = ['password', 'secret', 'token', 'authKey', 'authkey', 'service_role_key', 'accessToken'];

      const scrub = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
          if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            scrub(obj[key]);
          } else if (typeof obj[key] === 'string') {
            obj[key] = sanitizeLogData(obj[key]);
          }
        }
      };

      scrub(copy);
      return copy;
    } catch {
      return '[Unserializable Object]';
    }
  }

  return data;
}

export interface SafeErrorOptions {
  userMessage?: string;
  status?: number;
  internalError?: unknown;
  context?: string;
}

/**
 * Logs the full error securely on the server with sanitized metadata and
 * returns an opaque HTTP response safe for client delivery.
 */
export function safeErrorResponse(options: SafeErrorOptions): NextResponse {
  const {
    userMessage = 'An unexpected error occurred while processing your request. Please try again or contact support.',
    status = 500,
    internalError,
    context = 'General'
  } = options;

  const referenceId = generateReferenceId();

  // Extract raw message and stack for server logging
  const rawMessage = internalError instanceof Error ? internalError.message : String(internalError || 'Unknown Error');
  const stack = internalError instanceof Error ? internalError.stack : undefined;

  // Structured server log with redaction
  console.error(
    JSON.stringify({
      level: 'ERROR',
      event: 'INTERNAL_SERVER_ERROR',
      referenceId,
      context,
      message: sanitizeLogData(rawMessage),
      stack: stack ? sanitizeLogData(stack) : undefined,
      timestamp: new Date().toISOString()
    })
  );

  return NextResponse.json(
    {
      success: false,
      error: userMessage,
      referenceId
    },
    { status }
  );
}

