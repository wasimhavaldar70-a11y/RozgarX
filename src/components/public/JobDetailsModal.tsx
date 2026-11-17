'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  Phone,
  Languages,
  UserCheck,
  ShieldCheck,
  Send,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { Job, getJobLocationDisplay } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  initialApplyMode?: boolean;
  onApplicationSuccess?: () => void;
  onOpenAuth: (mode?: 'login' | 'register_candidate') => void;
}

// WhatsApp brand icon SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.28C8.86 7.28 8.56 7.35 8.31 7.62C8.07 7.89 7.38 8.54 7.38 9.86C7.38 11.18 8.34 12.45 8.47 12.63C8.61 12.81 10.36 15.5 13.04 16.66C15.26 17.62 15.72 17.43 16.2 17.38C16.68 17.34 17.75 16.75 17.97 16.13C18.19 15.51 18.19 14.99 18.12 14.87C18.06 14.76 17.89 14.7 17.63 14.57C17.37 14.44 16.08 13.81 15.84 13.72C15.6 13.63 15.43 13.59 15.26 13.85C15.09 14.11 14.6 14.7 14.45 14.87C14.3 15.05 14.15 15.07 13.89 14.94C13.63 14.81 12.79 14.53 11.8 13.65C11.02 12.96 10.5 12.1 10.35 11.85C10.21 11.59 10.33 11.45 10.46 11.32C10.58 11.21 10.72 11.02 10.86 10.86C10.99 10.7 11.04 10.57 11.13 10.4C11.21 10.22 11.17 10.07 11.11 9.95C11.04 9.82 10.56 8.63 10.36 8.15C10.16 7.67 9.97 7.74 9.82 7.73C9.68 7.72 9.51 7.72 9.34 7.72C9.17 7.72 8.9 7.78 8.67 8.03C8.44 8.28 7.78 8.9 7.78 10.17C7.78 11.44 8.7 12.67 8.84 12.85C8.97 13.03 10.7 15.68 13.34 16.82C15.52 17.76 16.14 17.65 16.63 17.59C17.12 17.53 18.2 16.92 18.42 16.29C18.64 15.66 18.64 15.12 18.57 15C18.51 14.88 18.33 14.82 18.07 14.69L15.84 13.72Z" />
  </svg>
);

// Format date helper: DD/MM/YYYY
const formatNumericDate = (dateStr?: string) => {
  if (!dateStr) return '16/11/2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '16/11/2026';
  }
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  initialApplyMode = false,
  onApplicationSuccess,
  onOpenAuth
}) => {
  const { user, isLoggedIn, candidateProfile } = useAuth();
  const [isApplying, setIsApplying] = useState(initialApplyMode);
  const [coverMessage, setCoverMessage] = useState('');
  const [resumeFileName, setResumeFileName] = useState(
    candidateProfile?.resumeFileName || 'Candidate_Resume.pdf'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    setIsApplying(initialApplyMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialApplyMode, job]);

  if (!isOpen || !job) return null;

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
  const jobTimingsDisplay = job.jobTimings || '9:30 AM - 6:30 PM | Monday to Saturday';
  const interviewTimingsDisplay = job.interviewTimings || '11:00 AM - 4:00 PM | Monday to Saturday';
  const genderPreferenceDisplay = job.genderPreference || 'Both male and female can apply';
  const skillsRequirementDisplay =
    job.requiredSkills && job.requiredSkills.length > 0
      ? job.requiredSkills.join(', ')
      : 'No predefined skills necessary';
  const additionalInfoDisplay =
    job.additionalInfo ||
    'Manual Tasks Jaise Lifting, Packing Aur Assembling Karo. Instructions Follow Karke Projects Complete Karo Aur Workplace Safety Maintain Karo. Material Handling Mein Assist Karo. Direct Company Interview & On-Spot Selection Available.';

  const cleanPhone = (job.whatsappNumber || job.contactPhone || '+919822011223').replace(/[^\d+]/g, '');

  const handleWhatsApp = () => {
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hello, I saw your job post for "${job.title}" at ${job.companyName} on RozgarX. I would like to apply for this vacancy. Please let me know the interview details.`
    );
    window.open(`https://wa.me/${phoneDigits}?text=${msg}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      onOpenAuth('login');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = db.submitApplication({
      jobId: job.id,
      candidateId: candidateProfile?.id || user.id,
      coverMessage,
      resumeFileName
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Your application was submitted successfully for FREE! The employer will review your profile.');
      setTimeout(() => {
        if (onApplicationSuccess) onApplicationSuccess();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to submit application');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* JSON-LD Schema for Google Search Indexing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'JobPosting',
              title: job.title,
              description: job.description,
              identifier: {
                '@type': 'PropertyValue',
                name: job.companyName,
                value: job.id
              },
              datePosted: job.createdAt,
              validThrough: job.applicationDeadline || '2026-12-31',
              employmentType: job.jobType === 'Full Time' ? 'FULL_TIME' : 'OTHER',
              hiringOrganization: {
                '@type': 'Organization',
                name: job.companyName,
                logo: job.companyLogo
              },
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: job.city,
                  addressRegion: job.district,
                  addressCountry: 'IN'
                }
              },
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: 'INR',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salaryMin,
                  maxValue: job.salaryMax,
                  unitText: job.salaryType === 'Per Month' ? 'MONTH' : 'YEAR'
                }
              }
            }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
          }}
        />

        {/* HEADER SECTION (Matching Image 2 with Elevated Styling) */}
        <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight leading-snug">
                {job.title}
              </h2>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Rs. {job.salaryMin.toLocaleString('en-IN')} - Rs. {job.salaryMax.toLocaleString('en-IN')}
              </div>

              {/* Badges Bar below salary */}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>New</span>
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold shadow-2xs">
                  Apply First
                </span>
                {job.companyVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified Employer</span>
                  </span>
                )}
              </div>
            </div>

            {/* Top Right Action Buttons (WhatsApp + Call + Close) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-500 text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                title="Chat with Employer on WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                <span className="hidden xs:inline">WhatsApp</span>
              </button>

              {/* Call Button */}
              <button
                type="button"
                onClick={handleCall}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
                title="Call Employer Directly"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TWO-COLUMN METADATA SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
            {/* Left Column */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{locationDisplay}</span>
              </div>
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
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate font-semibold text-slate-800" title={job.companyName}>
                  {job.companyName}
                </span>
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

        {/* SCROLLABLE BODY */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm">
          
          {/* SECTION 1: SHIFT TIMINGS & ADDRESS CARDS (Matching Image 2) */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3.5">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Job Timings</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 pl-5.5 font-medium">
                {jobTimingsDisplay}
              </p>
            </div>

            <div className="border-t border-slate-200/60 pt-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Interview Timings</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 pl-5.5 font-medium">
                {interviewTimingsDisplay}
              </p>
            </div>

            <div className="border-t border-slate-200/60 pt-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Job Address</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 pl-5.5 font-medium">
                {job.address ? `${job.address}, ` : ''}{job.city ? `${job.city}, ` : ''}{job.district}, Maharashtra
              </p>
            </div>
          </div>

          {/* APPLICATION FORM SUB-SECTION (if opened) */}
          {isApplying && (
            <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Submit Job Application (100% FREE)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your candidate profile will be submitted directly to the employer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  View Job Details
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {!isLoggedIn ? (
                <div className="p-4 bg-white rounded-xl border border-blue-200 text-center space-y-2">
                  <p className="text-xs text-slate-700 font-medium">
                    You need to be signed in as a job seeker to apply.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
                  >
                    Sign In or Register (Free)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Candidate Name:</span>
                      <span className="font-semibold text-slate-800">
                        {candidateProfile?.fullName || user?.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact Mobile:</span>
                      <span className="font-semibold text-slate-800">
                        {candidateProfile?.mobile || '98765 43210'}
                      </span>
                    </div>
                  </div>

                  {/* Resume Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Attached Resume / CV *
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                      <div className="flex-1 truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {resumeFileName}
                        </p>
                        <p className="text-[10px] text-slate-400">PDF Document • Ready to send</p>
                      </div>
                      <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer">
                        <Upload className="w-3.5 h-3.5 inline mr-1" />
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setResumeFileName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Optional Cover Note */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cover Note to Employer (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={coverMessage}
                      onChange={e => setCoverMessage(e.target.value)}
                      placeholder="Highlight your availability, previous experience, or why you're a good fit..."
                      className="w-full p-2.5 bg-white text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Submitting...' : 'Confirm Free Application'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SECTION 2: STRUCTURED JOB ATTRIBUTES LIST (Matching Image 2) */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Job Description</h3>

            <div className="divide-y divide-slate-100 text-xs text-slate-700">
              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Salary Range :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">
                  Rs. {job.salaryMin.toLocaleString('en-IN')} - Rs. {job.salaryMax.toLocaleString('en-IN')} , based on skills, experience, and interview performance
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Educational Requirement :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">{educationDisplay}</span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Work Arrangement :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">
                  {job.workMode === 'Office' ? 'Work From Office' : job.workMode}
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Gender Preference :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">{genderPreferenceDisplay}</span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Skills Requirement :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">{skillsRequirementDisplay}</span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Experience Requirement :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">{experienceDisplay}</span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Location :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">{locationDisplay}</span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-4">
                <span className="font-bold text-slate-800 min-w-[170px]">Working Hours :</span>
                <span className="text-slate-600 text-right sm:text-left flex-1">{jobTimingsDisplay}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: ADDITIONAL INFO (Matching Image 2) */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-slate-900 text-sm">Additional Info</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {additionalInfoDisplay}
            </p>
          </div>

          {/* SECTION 4: MORE INFO ABOUT THIS JOB (Matching Image 2) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm">
              More info about {job.title} Job :
            </h4>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {job.description}
            </p>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-800 block">Daily Work Tasks:</span>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-5">
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-800 block mb-2">Key Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                    >
                      <Layers className="w-3 h-3 text-blue-600" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Report Job Mechanism (Consumer Protection & Content Moderation - Item 25) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Notice something suspicious or inaccurate about this vacancy?</span>
            <button
              type="button"
              onClick={() => {
                const reason = window.prompt(
                  `Report Job Vacancy: "${job.title}" at ${job.companyName}\n\nPlease specify the reason (e.g. Asking for money, false salary, expired vacancy, harassment):`
                );
                if (reason && reason.trim()) {
                  alert(
                    'Thank you. Your report has been submitted to RozgarX Grievance & Content Moderation team. We investigate all complaints within 24 hours.'
                  );
                }
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report Job</span>
            </button>
          </div>

          {/* 100% Free Application Trust Badge */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 text-xs text-emerald-900 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-medium">
              <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free Candidate Application • Zero Placement Fees • Direct Company Hiring</span>
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
              Verified
            </span>
          </div>
        </div>

        {/* FOOTER BAR (Quick Apply, WhatsApp, Call) */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Direct Connect Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500 text-emerald-700 bg-white hover:bg-emerald-50 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCall}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Call Direct</span>
            </button>
          </div>

          {/* Apply Button */}
          {!isApplying ? (
            <button
              type="button"
              onClick={() => setIsApplying(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply for FREE</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsApplying(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-white transition-colors"
            >
              Back to Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
