'use client';

import React from 'react';
import { Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { Job } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { JobCard } from '../common/JobCard';

interface LatestJobsProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  onViewAllJobs: () => void;
}

export const LatestJobs: React.FC<LatestJobsProps> = ({
  jobs,
  onSelectJob,
  onApplyJob,
  onViewAllJobs
}) => {
  const { t } = useLanguage();

  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Verified & Active Vacancies</span>
            </div>
            <h2 className="font-sans-modern text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Latest <span className="text-blue-600 font-extrabold italic px-1 inline-block">verified</span> job vacancies
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct employer postings with verified salaries. 100% free for candidates to apply.
            </p>
          </div>
          <button
            onClick={onViewAllJobs}
            className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Jobs List / Cards */}
        {jobs.length === 0 ? (
          <div className="py-14 px-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No active job vacancies at the moment
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Employers can register and post verified openings across all 36 Maharashtra districts. Fresh vacancies will appear here once approved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {jobs.slice(0, 6).map(job => (
              <JobCard
                key={job.id}
                job={job}
                onSelectJob={onSelectJob}
                onApplyJob={onApplyJob}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
