/**
 * MAHAJOBS: Centralized Multi-Instance API Rate Limiting Engine
 * Enforces per-IP and per-User rate limits across serverless instances using
 * atomic PostgreSQL row locks via check_and_increment_rate_limit RPC.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIpHash, getSupabaseAdmin } from './otpServer';

export interface RateLimitOptions {
  action: string;
  maxAttempts: number;
  windowSeconds: number;
  identifier?: string; // Custom identifier (e.g. user ID, phone, email); if not provided, IP hash is used
  failOpenOnDbError?: boolean;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfter: number;
  currentCount: number;
  limit: number;
  remaining: number;
  response?: NextResponse; // Pre-configured HTTP 429 response
}

/**
 * Checks and increments the rate limit counter for a given action and identifier.
 * Returns allowed status and an optional pre-formatted HTTP 429 response.
 */
export async function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitCheckResult> {
  const { action, maxAttempts, windowSeconds, failOpenOnDbError = false } = options;
  const ipHash = getClientIpHash(req.headers);
  const identifier = options.identifier || ipHash;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc('check_and_increment_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds
    });

    if (error) {
      console.error(`[RateLimiter] Database error for action '${action}':`, error.message);
      return {
        allowed: true,
        retryAfter: 0,
        currentCount: 1,
        limit: maxAttempts,
        remaining: maxAttempts - 1
      };
    }

    const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const allowed = row ? Boolean(row.allowed) : true;
    const retryAfter = row ? Math.max(0, Number(row.retry_after_seconds) || 0) : 0;
    const currentCount = row ? Number(row.current_count) || 0 : 0;
    const remaining = Math.max(0, maxAttempts - currentCount);

    if (!allowed) {
      console.warn(
        JSON.stringify({
          level: 'WARN',
          event: 'RATE_LIMIT_EXCEEDED',
          action,
          identifier: identifier.length > 32 ? `${identifier.substring(0, 8)}...` : identifier,
          ipHash,
          retryAfter,
          currentCount,
          maxAttempts,
          timestamp: new Date().toISOString()
        })
      );

      const safeRetryAfter = retryAfter || 60;
      const response = NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${safeRetryAfter} seconds.`,
          retryAfter: safeRetryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(safeRetryAfter),
            'X-RateLimit-Limit': String(maxAttempts),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + safeRetryAfter)
          }
        }
      );

      return {
        allowed: false,
        retryAfter: safeRetryAfter,
        currentCount,
        limit: maxAttempts,
        remaining: 0,
        response
      };
    }

    return {
      allowed: true,
      retryAfter: 0,
      currentCount,
      limit: maxAttempts,
      remaining
    };
  } catch (err: any) {
    console.error(`[RateLimiter] Unexpected error for action '${action}':`, err?.message || err);
    return {
      allowed: true,
      retryAfter: 0,
      currentCount: 1,
      limit: maxAttempts,
      remaining: maxAttempts - 1
    };
  }
}

/**
 * Attaches standard rate limit headers to a successful NextResponse
 */
export function withRateLimitHeaders(
  response: NextResponse,
  result: RateLimitCheckResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
}

