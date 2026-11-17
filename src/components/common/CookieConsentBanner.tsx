'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check, Settings, ChevronRight } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  preferences: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'mahajobs_cookie_consent_v1';

export const CookieConsentBanner: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [prefEnabled, setPrefEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show banner after 800ms delay for non-intrusive appearance
        const t = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignored
    }
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      preferences: true,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      preferences: false,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      essential: true,
      analytics: analyticsEnabled,
      preferences: prefEnabled,
      updatedAt: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0 mt-0.5 border border-blue-500/30">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Your Privacy & Cookie Choices</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                No Ad Trackers
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              We use strictly essential cookies for secure login and account protection. We do not use third-party advertising tracking or session recording scripts. Under India’s DPDP Act 2023 and GDPR, you have the right to choose your cookie preferences.
            </p>
            {showSettings && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Essential Cookies (Always Active)</div>
                    <div className="text-slate-400 text-[11px]">Necessary for authentication, session security, and anti-CSRF protection.</div>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">Required</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                  <div>
                    <div className="font-semibold text-white">Functional Preferences</div>
                    <div className="text-slate-400 text-[11px]">Remembers your language (English/मराठी) and district filter choices.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefEnabled}
                    onChange={e => setPrefEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-600"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('cookie-policy')}
                className="hover:text-blue-400 underline underline-offset-2"
              >
                Cookie Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('privacy-policy')}
                className="hover:text-blue-400 underline underline-offset-2"
              >
                Privacy Notice
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            {showSettings ? 'Hide Details' : 'Preferences'}
          </button>
          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={showSettings ? handleSaveCustom : handleAcceptAll}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            {showSettings ? 'Save My Choices' : 'Accept All'}
          </button>
        </div>
      </div>
    </div>
  );
};
