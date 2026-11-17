import React from 'react';
import Link from 'next/link';
import { Search, Building2, Home, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />

        {/* 404 Visual badge */}
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner font-extrabold text-2xl tracking-tighter">
          404
        </div>

        {/* Main Header */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
          पृष्ठ आढळले नाही
        </p>

        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          The page or job vacancy you are looking for may have expired, been removed, or moved to another link.
        </p>

        {/* Helpful Navigation Shortcuts */}
        <div className="space-y-2.5 mb-6 text-left">
          <Link
            href="/jobs"
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Browse Maharashtra Jobs</p>
                <p className="text-[11px] text-slate-500">Explore vacancies across 36 districts</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/companies"
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Verified Companies</p>
                <p className="text-[11px] text-slate-500">View registered Maharashtra employers</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          Return to Homepage / मुख्यपृष्ठ
        </Link>
      </div>
    </div>
  );
}

