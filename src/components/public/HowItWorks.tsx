'use client';

import React from 'react';
import {
  UserCheck,
  FileCheck2,
  Search,
  Send,
  Building,
  FilePlus,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface HowItWorksProps {
  onOpenAuth: (mode?: 'login' | 'register_candidate' | 'register_employer') => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenAuth }) => {
  const { t } = useLanguage();

  const seekerSteps = [
    {
      num: '01',
      icon: UserCheck,
      title: '1. Create Account',
      desc: 'Free sign up with mobile & district. Takes under 1 minute.'
    },
    {
      num: '02',
      icon: FileCheck2,
      title: '2. Complete Profile',
      desc: 'Add education, skills, work experience, and upload your resume.'
    },
    {
      num: '03',
      icon: Search,
      title: '3. Find Jobs',
      desc: 'Filter by Maharashtra district, category, job type, and salary.'
    },
    {
      num: '04',
      icon: Send,
      title: '4. Apply for Free',
      desc: 'Direct applications to verified employers. No candidate fees ever.'
    }
  ];

  const employerSteps = [
    {
      num: '01',
      icon: Building,
      title: '1. Register Company',
      desc: 'Create business profile and submit verification documents.'
    },
    {
      num: '02',
      icon: FilePlus,
      title: '2. Post Vacancy',
      desc: 'Select subscription plan or claim 1 Free job vacancy post.'
    },
    {
      num: '03',
      icon: Users,
      title: '3. Receive Applications',
      desc: 'Access candidates, view resumes, and filter matching skills.'
    },
    {
      num: '04',
      icon: Award,
      title: '4. Hire Employees',
      desc: 'Shortlist, schedule interviews, and hire Maharashtra talent.'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-sans-modern text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            How <span className="text-blue-600 font-extrabold italic px-1 inline-block">RozgarX</span> works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            A transparent and structured platform for both candidates and employers in Maharashtra.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candidates Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Candidates
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {t.forJobSeekers}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  100% Free Always
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {seekerSteps.map(step => {
                  const Icon = step.icon;
                  return (
                    <div key={step.num} className="relative pl-3 border-l-2 border-blue-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Ready to start your job hunt?</span>
              <button
                onClick={() => onOpenAuth('register_candidate')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                <span>Register as Candidate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Employers Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Businesses & MSMEs
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {t.forEmployers}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                  Affordable Plans
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {employerSteps.map(step => {
                  const Icon = step.icon;
                  return (
                    <div key={step.num} className="relative pl-3 border-l-2 border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-slate-800" />
                        <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need to fill vacancies quickly?</span>
              <button
                onClick={() => onOpenAuth('register_employer')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                <span>Post Vacancy as Employer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
