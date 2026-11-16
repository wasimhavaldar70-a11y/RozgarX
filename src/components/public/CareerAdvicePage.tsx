'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface CareerAdvicePageProps {
  onOpenResumeBuilder: () => void;
  onExploreJobs: () => void;
}

export const CareerAdvicePage: React.FC<CareerAdvicePageProps> = ({
  onOpenResumeBuilder,
  onExploreJobs
}) => {
  const articles = [
    {
      title: 'How to Build a High-Impact Resume for Maharashtra IT & MIDC Employers',
      category: 'Resume Building',
      readTime: '4 min read',
      excerpt:
        'Key formatting tips, essential technical skills formatting, and how to structure your projects so recruiters in Pune, Hinjewadi, and Rabale notice you immediately.'
    },
    {
      title: 'Top 10 Interview Questions Asked in Maharashtra Manufacturing & Engineering Units',
      category: 'Interview Preparation',
      readTime: '6 min read',
      excerpt:
        'A comprehensive guide for CNC machinists, quality inspectors, tool room specialists, and maintenance engineers entering Kolhapur, Chakan, and Waluj MIDCs.'
    },
    {
      title: 'Cracking the Accounts & GST Executive Interview: Tally Prime & GSTR Rules',
      category: 'Finance & Accounts',
      readTime: '5 min read',
      excerpt:
        'Real-world test scenarios on GST reconciliation, 3B filings, TDS deductions, and practical questions frequently asked by cooperative banks and SMEs.'
    },
    {
      title: 'Freshers Guide: Finding Your First Full-Time Job in Maharashtra Without Experience',
      category: 'Career Starter',
      readTime: '5 min read',
      excerpt:
        'How to convert college projects, ITI diplomas, and freelance assignments into proven work experience that employers value.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Career Advancement Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Guidance & Interview Preparation
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Expert guidance tailored to the job market in Maharashtra to help candidates get hired faster.
          </p>
        </div>

        {/* Free Resume Builder Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-2xl shadow-md mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/60 text-xs font-semibold">
              Built-in Tool
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Create Your Professional Resume Online
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Don’t have a formatted PDF resume? Use our free candidate profile resume builder to
              instantly generate and download a clean, ATS-compliant CV.
            </p>
          </div>
          <button
            onClick={onOpenResumeBuilder}
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Open Resume Builder
          </button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-blue-600">{art.category}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Maharashtra Youth Employment Advisory</span>
                <button
                  onClick={onExploreJobs}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Find Matching Jobs
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
