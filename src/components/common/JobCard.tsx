'use client';

import React from 'react';
import {
  MapPin,
  Building2,
  Clock,
  Briefcase,
  GraduationCap,
  Bookmark,
  Eye,
  Phone,
  Sparkles,
  ShieldCheck,
  Languages,
  UserCheck
} from 'lucide-react';
import { Job, getJobLocationDisplay } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface JobCardProps {
  job: Job;
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

// WhatsApp brand icon SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.28C8.86 7.28 8.56 7.35 8.31 7.62C8.07 7.89 7.38 8.54 7.38 9.86C7.38 11.18 8.34 12.45 8.47 12.63C8.61 12.81 10.36 15.5 13.04 16.66C15.26 17.62 15.72 17.43 16.2 17.38C16.68 17.34 17.75 16.75 17.97 16.13C18.19 15.51 18.19 14.99 18.12 14.87C18.06 14.76 17.89 14.7 17.63 14.57C17.37 14.44 16.08 13.81 15.84 13.72C15.6 13.63 15.43 13.59 15.26 13.85C15.09 14.11 14.6 14.7 14.45 14.87C14.3 15.05 14.15 15.07 13.89 14.94C13.63 14.81 12.79 14.53 11.8 13.65C11.02 12.96 10.5 12.1 10.35 11.85C10.21 11.59 10.33 11.45 10.46 11.32C10.58 11.21 10.72 11.02 10.86 10.86C10.99 10.7 11.04 10.57 11.13 10.4C11.21 10.22 11.17 10.07 11.11 9.95C11.04 9.82 10.56 8.63 10.36 8.15C10.16 7.67 9.97 7.74 9.82 7.73C9.68 7.72 9.51 7.72 9.34 7.72C9.17 7.72 8.9 7.78 8.67 8.03C8.44 8.28 7.78 8.9 7.78 10.17C7.78 11.44 8.7 12.67 8.84 12.85C8.97 13.03 10.7 15.68 13.34 16.82C15.52 17.76 16.14 17.65 16.63 17.59C17.12 17.53 18.2 16.92 18.42 16.29C18.64 15.66 18.64 15.12 18.57 15C18.51 14.88 18.33 14.82 18.07 14.69L15.84 13.72Z" />
  </svg>
);

// Format date helper: MM/DD/YYYY or DD/MM/YYYY
const formatNumericDate = (dateStr?: string) => {
  if (!dateStr) return '11/16/2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch {
    return '11/16/2026';
  }
};

export const JobCard: React.FC<JobCardProps> = ({ job, onSelectJob }) => {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const saved = isJobSaved(job.id);

  const locationDisplay = getJobLocationDisplay(job);
  const postedDate = formatNumericDate(job.createdAt || '2026-11-16');

  // Derive smart attributes matching user screenshot
  const roleDisplay = job.jobRole || (job.category.toLowerCase().includes('labour') ? 'Labourer' : job.category || 'Executive');
  const experienceDisplay =
    job.experienceMinYears === 0
      ? 'Fresher'
      : `${job.experienceMinYears}–${job.experienceMaxYears} Years`;
  const englishDisplay = job.englishRequirement || (job.category.toLowerCase().includes('labour') || job.title.toLowerCase().includes('helper') ? 'No English Required' : 'Basic English Required');
  const educationDisplay = job.educationRequirement || 'Tenth Pass';
  const cleanPhone = (job.whatsappNumber || job.contactPhone || '+919822011223').replace(/[^\d+]/g, '');

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hello, I saw your job post for "${job.title}" at ${job.companyName} on RozgarX. I would like to apply for this vacancy. Please let me know the interview details.`
    );
    window.open(`https://wa.me/${phoneDigits}?text=${msg}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${cleanPhone}`, '_self');
  };

  return (
    <div
      onClick={() => onSelectJob(job)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 cursor-pointer relative group flex flex-col justify-between"
    >
      <div>
        {/* ROW 1: Title, Salary & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors line-clamp-1 tracking-tight">
              {job.title}
            </h3>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Rs. {job.salaryMin.toLocaleString('en-IN')} - Rs. {job.salaryMax.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              toggleSaveJob(job.id);
            }}
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              saved
                ? 'bg-blue-50 border-blue-200 text-blue-600 fill-blue-600'
                : 'border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-slate-50'
            }`}
            title={saved ? 'Remove Bookmark' : 'Save Job'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* ROW 2: Location */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium mt-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{locationDisplay}</span>
        </div>

        {/* ROW 3: Two-Column Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3.5 text-xs text-slate-600 font-medium">
          {/* Left Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{roleDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{experienceDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{englishDisplay}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-semibold text-slate-700" title={job.companyName}>
                {job.companyName}
              </span>
              {job.companyVerified && (
                <span title="Verified Employer" className="inline-flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{educationDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Posted on: {postedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: Bottom Action & Badges Bar */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        {/* Badges on Left */}
        <div className="flex items-center gap-2">
          {/* New Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>New</span>
          </span>

          {/* Apply First Badge */}
          {(job.applyFirst || job.applicationCount < 5) && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold shadow-2xs">
              Apply First
            </span>
          )}

          {/* Views Count */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.viewCount || 22} Views</span>
          </span>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-2">
          {/* WhatsApp Button */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          {/* Call Button */}
          <button
            type="button"
            onClick={handleCall}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
