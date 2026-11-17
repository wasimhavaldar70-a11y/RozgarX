'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const referenceCode = error?.digest || 'GLOBAL-FATAL-ERR';

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
              ⚠️
            </div>

            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
              System Temporarily Unavailable
            </h1>

            <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 1.5rem', lineHeight: '1.5' }}>
              MahaJobs encountered a fatal system error. We apologize for the inconvenience. Please try refreshing.
            </p>

            <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reference ID / संदर्भ कोड:</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: '#1e293b', marginTop: '0.25rem' }}>
                {referenceCode}
              </div>
            </div>

            <button
              onClick={() => reset()}
              style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '0.75rem' }}
            >
              Reload Application
            </button>

            <a
              href="/"
              style={{ display: 'block', width: '100%', padding: '0.75rem 1rem', backgroundColor: '#f1f5f9', color: '#334155', textDecoration: 'none', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', boxSizing: 'border-box' }}
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
