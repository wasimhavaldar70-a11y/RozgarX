'use client';

import React from 'react';
import { Briefcase, MapPin, Mail, Phone, ShieldCheck, Heart } from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';

interface FooterProps {
  onNavigate: (view: string, payload?: unknown) => void;
  onOpenAuth: (mode?: 'login' | 'register_candidate' | 'register_employer') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  const popularDistricts = MAHARASHTRA_DISTRICTS.slice(0, 12);

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Col 1: Brand & Gov Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-base text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Rozgar<span className="text-blue-500">X</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              RozgarX is Maharashtra’s premier employment and recruitment gateway, connecting job seekers
              with trusted, verified employers across all 36 districts from Mumbai and Pune to
              Kolhapur, Nagpur, and Chandrapur.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Maharashtra Industrial Development Corporation (MIDC) & Corporate Hubs</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@rozgarx.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Toll-Free Helpline: 1800 220 555 (Mon–Sat 9AM–6PM)</span>
              </div>
            </div>
          </div>

          {/* Col 2: For Candidates */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Job Seekers</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('find-jobs')}
                  className="hover:text-white transition-colors"
                >
                  Browse Maharashtra Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('register_candidate')}
                  className="hover:text-white transition-colors text-blue-400 font-medium"
                >
                  Create Free Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('resume-builder')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Online ATS Resume Builder</span>
                  <span className="text-[10px] bg-blue-600/80 text-blue-100 px-1.5 py-0.5 rounded font-bold">Free</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('companies')}
                  className="hover:text-white transition-colors"
                >
                  Verified Maharashtra Companies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Employers */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Employers & MSMEs</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenAuth('register_employer')}
                  className="hover:text-white transition-colors text-blue-400 font-medium"
                >
                  Post a Job (1 Free Post)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('employer-plans')}
                  className="hover:text-white transition-colors"
                >
                  Subscription Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('recruitment-services')}
                  className="hover:text-white transition-colors"
                >
                  Recruitment Assistance
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Districts */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Jobs by District</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {popularDistricts.map(d => (
                <button
                  key={d.id}
                  onClick={() => onNavigate('find-jobs', { district: d.name })}
                  className="text-left hover:text-white truncate transition-colors"
                  title={`${d.name} (${d.marathiName})`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} RozgarX. All rights reserved. Peth Vadgaon, Kolhapur, Maharashtra. Your Career. Your Opportunity.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <button
              onClick={() => onNavigate('privacy-policy')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('terms-conditions')}
              className="hover:text-slate-300 transition-colors"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('job-seeker-agreement')}
              className="hover:text-slate-300 transition-colors"
            >
              Candidate Rules
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('employer-agreement')}
              className="hover:text-slate-300 transition-colors"
            >
              Employer Agreement
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('refund-policy')}
              className="hover:text-slate-300 transition-colors"
            >
              Refund Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('disclaimer')}
              className="hover:text-slate-300 transition-colors"
            >
              Disclaimer
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('cookie-policy')}
              className="hover:text-slate-300 transition-colors"
            >
              Cookie Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('grievance-redressal')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Grievance Redressal
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('contact-us')}
              className="hover:text-slate-300 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
