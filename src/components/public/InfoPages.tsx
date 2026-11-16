'use client';

import React from 'react';
import { Mail, Phone, MapPin, Shield, Scale, Clock } from 'lucide-react';
import { LegalHubPage, LegalDocId } from './LegalHubPage';

export { LegalHubPage };

export const TermsConditionsPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="terms" onNavigate={onNavigate} />
);

export const PrivacyPolicyPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="privacy" onNavigate={onNavigate} />
);

export const JobSeekerAgreementPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="job-seeker" onNavigate={onNavigate} />
);

export const EmployerAgreementPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="employer" onNavigate={onNavigate} />
);

export const RefundPolicyPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="refund" onNavigate={onNavigate} />
);

export const DisclaimerPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="disclaimer" onNavigate={onNavigate} />
);

export const CookiePolicyPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="cookies" onNavigate={onNavigate} />
);

export const GrievanceRedressalPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <LegalHubPage initialDoc="grievance" onNavigate={onNavigate} />
);

export const ContactUsPage: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => (
  <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6">
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xs space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Contact RozgarX Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Assistance for job seekers, verified employers, district recruitment officers, and institutional partners across India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <Phone className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Toll-Free Helpline</h3>
          <p className="text-slate-700 font-semibold text-sm">1800 220 555</p>
          <p className="text-slate-500 text-[11px]">Mon–Sat, 9:00 AM – 6:00 PM IST</p>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <Mail className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
          <p className="text-blue-600 font-mono text-xs">support@rozgarx.com</p>
          <p className="text-slate-500 text-[11px]">Priority resolution in 24–48 hours</p>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Business Operations</h3>
          <p className="text-slate-700 font-medium">RozgarX Platform Office</p>
          <p className="text-slate-500 text-[11px]">
            Main Road, Peth Vadgaon, Kolhapur District, Maharashtra 416112, India
          </p>
        </div>
      </div>

      {/* Grievance Officer Quick Banner */}
      <div className="p-5 bg-purple-50/70 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-purple-700 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-purple-950">Statutory Grievance Redressal (7-Day SLA)</h4>
            <p className="text-xs text-purple-800">
              Appointed Officer: Wasim Havaldar • Email: grievance@rozgarx.com • Peth Vadgaon, Kolhapur
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate ? onNavigate('grievance-redressal') : (window.location.href = '/grievance-redressal')}
          className="shrink-0 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          View Grievance Policy →
        </button>
      </div>
    </div>
  </div>
);
