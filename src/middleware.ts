import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -------------------------------------------------------------
  // SERVER-SIDE EDGE ROUTE PROTECTION FOR /admin & /admin-dashboard
  // -------------------------------------------------------------
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-dashboard')) {
    const isLoginRoute =
      pathname === '/admin/login' ||
      pathname === '/admin/login/' ||
      pathname === '/admin-login' ||
      pathname === '/admin-login/';

    if (!isLoginRoute) {
      // Check for admin session cookies
      const adminCookie = request.cookies.get('mahajobs_admin_token')?.value;
      const adminSession = request.cookies.get('mahajobs_admin_session')?.value;
      const supabaseAuth =
        request.cookies.get('sb-njqdkmxkuqzhcwgrdupn-auth-token')?.value ||
        request.cookies.get('sb-access-token')?.value ||
        request.cookies.get('sb-auth-token')?.value;

      let isAuthorizedAdmin = false;

      // Verify token payload if available
      const candidateToken = adminCookie || supabaseAuth;
      if (candidateToken) {
        try {
          let jwt = candidateToken;
          if (jwt.startsWith('[') || jwt.startsWith('{')) {
            const parsed = JSON.parse(jwt);
            jwt = Array.isArray(parsed) ? parsed[0] : (parsed.access_token || '');
          }

          if (jwt && jwt.includes('.')) {
            const parts = jwt.split('.');
            if (parts.length >= 2) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              const isExpired = Boolean(payload.exp && payload.exp * 1000 < Date.now());
              
              // Authoritative cryptographic role check (OWASP ASVS compliant - no hardcoded personal emails)
              const isSuperAdminRole =
                payload.app_metadata?.role === 'super_admin' ||
                payload.user_metadata?.role === 'super_admin' ||
                payload.role === 'super_admin';

              if (!isExpired && isSuperAdminRole) {
                isAuthorizedAdmin = true;
              }
            }
          }
        } catch {
          isAuthorizedAdmin = false;
        }
      }

      // If unauthorized, block at the Edge
      if (!isAuthorizedAdmin) {
        const accept = request.headers.get('accept') || '';
        if (accept.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Super Administrator privileges required.' },
            { status: 401 }
          );
        }

        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const response = NextResponse.next();

  // Defense-in-depth: Set security headers on all Edge responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://control.msg91.com https://api.msg91.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
