'use client';

import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  IndianRupee,
  Briefcase,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap
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

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  initialApplyMode = false,
  onApplicationSuccess,
  onOpenAuth
}) => {
  const { user, isLoggedIn, candidateProfile } = useAuth();
  const isCandidateUnlocked = isLoggedIn && (user?.role === 'candidate' || user?.role === 'super_admin');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* JSON-LD Schema.org JobPosting for Google Search */}
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
            })
          }}
        />
        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug line-clamp-2">
                  {job.title}
                </h2>
                {job.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px] sm:max-w-none">
                  {job.companyName}
                </span>
                {job.companyVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 truncate">{getJobLocationDisplay(job)}, Maharashtra</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-sm">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Monthly Salary</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-0.5 mt-0.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                ₹{job.salaryMin.toLocaleString('en-IN')} - ₹{job.salaryMax.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Job Type & Mode</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {job.jobType} ({job.workMode})
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Required Experience</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {job.experienceMinYears === 0
                  ? 'Fresher Eligible'
                  : `${job.experienceMinYears}–${job.experienceMaxYears} Years`}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Vacancies</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {job.vacancies} Openings
              </span>
            </div>
          </div>

          {/* APPLICATION FORM SUB-SECTION */}
          {isApplying ? (
            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Submit Job Application (100% FREE)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your candidate profile information will be forwarded directly to the employer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  View Job Description
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
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
                    onClick={() => onOpenAuth('login')}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg"
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
                      placeholder="Highlight your relevant experience, notice period, or why you're a good fit..."
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
          ) : null}

          {/* Job Description */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Job Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Key Responsibilities</h3>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-5">
                {job.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CANDIDATE CAPABILITY & ELIGIBILITY CRITERIA */}
          <div className="bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Candidate Capability & Eligibility Criteria
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify that your profile, education, and skills match this role before applying
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Role Requirements
              </span>
            </div>

            {/* Quick Eligibility Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Education Requirement */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>Required Qualification / Degree</span>
                </div>
                <p className="text-xs font-bold text-slate-900 pl-6">
                  {job.educationRequirement || 'Any Graduate / Diploma / 12th Pass'}
                </p>
                <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                  Candidates with equivalent certifications or educational background are eligible to apply.
                </p>
              </div>

              {/* Experience Requirement */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Experience Level</span>
                </div>
                <p className="text-xs font-bold text-slate-900 pl-6">
                  {job.experienceMinYears === 0
                    ? 'Fresher Eligible (0 Years)'
                    : `${job.experienceMinYears} – ${job.experienceMaxYears} Years of Relevant Experience`}
                </p>
                <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                  {job.experienceMinYears === 0
                    ? 'Beginners and recent graduates with basic domain familiarity are encouraged to apply.'
                    : 'Hands-on practical industry knowledge is expected for this position.'}
                </p>
              </div>
            </div>

            {/* Required Skills & Competencies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Required Skills & Practical Capabilities</span>
                </h4>
                <span className="text-[10px] text-slate-500">
                  {job.requiredSkills.length} core competencies
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-900 shadow-2xs hover:border-blue-400 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Who Should Apply Checklist */}
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                ✓ Who is capable for this role?
              </span>
              <p className="text-[11px] leading-relaxed">
                Candidates who possess the skills listed above, meet the {job.educationRequirement ? job.educationRequirement : 'required qualification'}, can work at <strong>{getJobLocationDisplay(job)}</strong> in <strong>{job.workMode}</strong> mode, and are available for {job.jobType.toLowerCase()} engagement.
              </p>
            </div>
          </div>

          {/* Work Location & Address */}
          <div className="pt-1">
            <h4 className="font-semibold text-slate-800 text-xs mb-1">Work Location & Address</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {job.address && job.address.trim() ? (
                <>
                  <span className="font-semibold text-slate-900 block">{job.address}</span>
                  <span className="text-slate-500 text-[11px]">
                    {job.city && job.city.trim() && !job.address.toLowerCase().includes(job.city.toLowerCase()) ? `${job.city}, ` : ''}
                    {job.district}, Maharashtra
                  </span>
                </>
              ) : (
                <span>{job.city ? `${job.city}, ` : ''}{job.district}, Maharashtra</span>
              )}
            </p>
          </div>

          {/* Direct Recruiter Contact Gating */}
          {isCandidateUnlocked ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Direct Recruiter Contact (Verified Candidate Unlocked)</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Candidate Access
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {job.contactPhone && (
                  <div className="flex items-center gap-2 text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-500 font-medium">HR Phone:</span>
                    <a href={`tel:${job.contactPhone}`} className="text-blue-600 font-bold hover:underline">
                      {job.contactPhone}
                    </a>
                  </div>
                )}
                {job.contactEmail && (
                  <div className="flex items-center gap-2 text-slate-800 bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-500 font-medium">HR Email:</span>
                    <a href={`mailto:${job.contactEmail}`} className="text-blue-600 font-bold hover:underline truncate">
                      {job.contactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Direct Recruiter Phone, Email & Address Protected</span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Members Only
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Sign in or create a free candidate account to unlock HR phone, direct email, and factory address.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Sign In to Unlock (Free)
              </button>
            </div>
          )}

          {/* Application Deadline */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Application Deadline: <strong>{job.applicationDeadline}</strong></span>
            </span>
            <span className="text-[11px] text-amber-700">No application fee required</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {isCandidateUnlocked ? (
              <span>HR Direct: <strong>{job.contactPhone || job.contactEmail}</strong></span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Recruiter contact locked for guests</span>
              </span>
            )}
          </div>

          {!isApplying && (
            <button
              onClick={() => setIsApplying(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Apply for FREE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
