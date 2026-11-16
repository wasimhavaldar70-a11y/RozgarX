'use client';

import React from 'react';
import {
  MapPin,
  Building,
  Building2,
  Clock,
  Briefcase,
  Check,
  Bookmark,
  ArrowRight,
  Send,
  Calendar,
  GraduationCap,
  Layers,
  BarChart3,
  Car,
  Laptop,
  Factory,
  Stethoscope,
  ShoppingBag
} from 'lucide-react';
import { Job, getJobLocationDisplay } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface JobCardProps {
  job: Job;
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

// Helper to pick an appropriate industry icon based on category
const getIndustryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('auto') || cat.includes('vehicle') || cat.includes('motor') || cat.includes('mechanic')) {
    return <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  if (cat.includes('it') || cat.includes('software') || cat.includes('tech')) {
    return <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  if (cat.includes('manufactur') || cat.includes('industrial') || cat.includes('midc') || cat.includes('cnc')) {
    return <Factory className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  if (cat.includes('health') || cat.includes('pharma') || cat.includes('medic')) {
    return <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  if (cat.includes('retail') || cat.includes('sales') || cat.includes('store')) {
    return <ShoppingBag className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
  return <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
};

// Format date helper (e.g. "16 Nov 2026")
const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr) return '30 Nov 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// Calculate relative time string (e.g. "2 days ago")
const getRelativeTimeString = (dateStr?: string) => {
  if (!dateStr) return '2 days ago';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '2 days ago';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 30) return `${diffDays} days ago`;
    return 'Recently';
  } catch {
    return '2 days ago';
  }
};

// Resolve company logo
const getCompanyLogo = (job: Job): string | undefined => {
  if (job.companyLogo) return job.companyLogo;
  if (job.companyName?.toLowerCase().includes('nakshatra')) {
    return '/assets/jobs/nakshatra_logo.png';
  }
  return undefined;
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelectJob,
  onApplyJob
}) => {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const saved = isJobSaved(job.id);

  const locationDisplay = getJobLocationDisplay(job);
  const postedDate = formatDisplayDate(job.createdAt || '2026-11-14');
  const deadlineDate = formatDisplayDate(job.applicationDeadline || '2026-11-30');
  const relativeTime = getRelativeTimeString(job.createdAt || '2026-11-14');
  const logoUrl = getCompanyLogo(job);

  // Default skills if none specified
  const displaySkills =
    job.requiredSkills && job.requiredSkills.length > 0
      ? job.requiredSkills
      : ['Problem Solving', 'Communication', 'Customer Handling'];

  return (
    <div
      onClick={() => onSelectJob(job)}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-4 sm:p-6 cursor-pointer relative group flex flex-col justify-between"
    >
      <div>
        {/* TOP ROW: Company Logo + Title + Industry/Location + Urgent Badge + Bookmark */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Company Logo Squircle */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-1.5 sm:p-2 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-102 transition-transform">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={job.companyName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-xl">
                  {job.companyName ? job.companyName.charAt(0).toUpperCase() : <Building className="w-7 h-7 text-slate-400" />}
                </div>
              )}
            </div>

            {/* Title, Company Name, Industry & Location */}
            <div className="flex-1 min-w-0 pr-1 sm:pr-2">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                {job.title}
              </h3>

              {/* Company & Verification Check */}
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {job.companyName}
                </span>
                {job.companyVerified && (
                  <span
                    className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs"
                    title="Verified Employer"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Category & Location Sub-Row */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
                <span className="flex items-center gap-1">
                  {getIndustryIcon(job.category)}
                  <span>{job.category || 'Automotive'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className="flex items-center gap-1 text-slate-600 truncate max-w-[200px] sm:max-w-[260px]"
                  title={locationDisplay}
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{locationDisplay}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Urgent Badge & Bookmark Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Urgent Hiring Badge */}
            {(job.isUrgent || job.isUrgent === undefined) && (
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-rose-700 text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-2xs whitespace-nowrap">
                <span className="text-xs">🔥</span>
                <span className="hidden xs:inline">Urgent Hiring</span>
                <span className="xs:hidden">Urgent</span>
              </span>
            )}

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                toggleSaveJob(job.id);
              }}
              className={`p-1.5 sm:p-2.5 rounded-xl border transition-colors ${
                saved
                  ? 'bg-blue-50 border-blue-200 text-blue-600 fill-blue-600'
                  : 'border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-slate-50'
              }`}
              title={saved ? 'Remove Bookmark' : 'Save Vacancy'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* ROW 2: KEY DETAILS PILL STRIP (Salary, Job Type, Work Mode, Experience) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-4 sm:mt-5 text-xs">
          {/* Salary Pill with Circular Rupee Badge */}
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold flex items-center gap-1.5 text-xs sm:text-sm shadow-2xs whitespace-nowrap">
            <span className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shadow-2xs shrink-0">
              ₹
            </span>
            <span>
              ₹{job.salaryMin.toLocaleString('en-IN')} – ₹{job.salaryMax.toLocaleString('en-IN')}{' '}
              <span className="text-[11px] font-normal text-emerald-700">
                /{job.salaryType === 'Per Month' ? 'month' : 'year'}
              </span>
            </span>
          </span>

          {/* Job Type Pill */}
          <span className="px-3 py-1.5 rounded-xl bg-blue-50/80 text-blue-700 border border-blue-200/70 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{job.jobType}</span>
          </span>

          {/* Work Mode Pill */}
          <span className="px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-700 border border-slate-200/70 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{job.workMode}</span>
          </span>

          {/* Experience Pill */}
          <span className="px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-700 border border-slate-200/70 font-semibold flex items-center gap-1.5 text-xs whitespace-nowrap">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {job.experienceMinYears === 0
                ? 'Fresher Eligible'
                : `${job.experienceMinYears} – ${job.experienceMaxYears} Years`}
            </span>
          </span>
        </div>

        {/* ROW 3: EDUCATION REQUIREMENT PILL */}
        <div className="mt-2.5 sm:mt-3 flex items-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/70 text-xs font-bold shadow-2xs">
            <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
            <span>{job.educationRequirement || 'B.E. / B.Tech (Engineering)'}</span>
          </span>
        </div>

        {/* ROW 4: REQUIRED SKILLS & ELIGIBILITY */}
        <div className="mt-4 pt-3.5 border-t border-slate-100/90">
          <div className="flex items-center gap-2 mb-2.5">
            <Layers className="w-4 h-4 text-blue-600 shrink-0" />
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
              Required Skills & Eligibility
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {displaySkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50/90 text-blue-800 border border-blue-200/70 text-xs font-semibold flex items-center gap-1.5 shadow-2xs max-w-full"
              >
                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5] shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-none">{skill}</span>
              </span>
            ))}
            {displaySkills.length > 4 && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/50">
                +{displaySkills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ROW 5: CARD FOOTER (Apply Before | Posted Date & Relative Time === View Details & Apply Now) */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white">
        {/* Left Metadata: Deadline & Posted Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap sm:flex-nowrap">
          {/* Apply Before Box */}
          <div className="px-3 py-1.5 rounded-xl bg-rose-50/90 border border-rose-200/60 flex items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="leading-tight">
              <span className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                Apply Before
              </span>
              <span className="block text-xs font-black text-rose-950">
                {deadlineDate}
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-block w-px h-6 bg-slate-200 shrink-0" />

          {/* Posted Date & Relative Time */}
          <div className="flex items-center gap-2 text-slate-600 shrink-0">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="leading-tight">
              <span className="block text-xs font-bold text-slate-800">
                Posted {postedDate}
              </span>
              <span className="block text-[11px] text-slate-500 font-medium">
                {relativeTime}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          {/* View Details Button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onSelectJob(job);
            }}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Apply Now Primary Button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onApplyJob(job);
            }}
            className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span>Apply Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
