'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error summary on client without leaking stack traces to UI
    console.error('Application Error captured by Root Boundary:', {
      message: error?.message,
      digest: error?.digest
    });
  }, [error]);

  const referenceCode = error?.digest || 'REF-APP-ERR';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Heading (Bilingual English & Marathi) */}
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Something went wrong / काहीतरी चूक झाली
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          We encountered an unexpected issue while loading this page. Please try again. If the issue continues, contact our support team.
        </p>

        {/* Reference ID Pill */}
        <div className="bg-slate-100 rounded-lg p-3 mb-6 border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Error Reference ID / संदर्भ कोड:</p>
          <p className="font-mono text-xs font-bold text-slate-800 tracking-wider mt-0.5 select-all">
            {referenceCode}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again / पुन्हा प्रयत्न करा
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home / मुख्यपृष्ठावर जा
          </Link>

          <a
            href={`mailto:support@rozgarx.com?subject=Error Report: ${encodeURIComponent(referenceCode)}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 pt-2 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Report this to Support
          </a>
        </div>
      </div>
    </div>
  );
}
